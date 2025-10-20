import { EVENT, MIME_TYPES, debounce } from "ex-excalidraw-common";

import { AbortError } from "../errors";

import { normalizeFile } from "./blob";

import type { FileSystemHandle } from "browser-fs-access";

type BrowserFSModule = typeof import("browser-fs-access");

type FILE_EXTENSION = Exclude<keyof typeof MIME_TYPES, "binary">;

const INPUT_CHANGE_INTERVAL_MS = 5000;

const isBrowserEnvironment = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

let browserFSModulePromise: Promise<BrowserFSModule> | null = null;

const loadBrowserFSModule = async () => {
  if (!browserFSModulePromise) {
    if (!isBrowserEnvironment()) {
      throw new AbortError();
    }
    browserFSModulePromise = import("browser-fs-access");
  }
  return browserFSModulePromise;
};

const detectNativeFileSystemSupport = () => {
  const scope =
    typeof window !== "undefined"
      ? window
      : typeof self !== "undefined"
        ? (self as typeof globalThis & { top?: Window | null })
        : undefined;

  if (!scope) {
    return false;
  }

  if ("top" in scope && scope.top && scope !== scope.top) {
    try {
      // Accessing `top` can throw for cross-origin frames.
      void scope.top;
    } catch {
      return false;
    }
  }

  return "showOpenFilePicker" in scope;
};

export const nativeFileSystemSupported = detectNativeFileSystemSupport();

export const fileOpen = async <M extends boolean | undefined = false>(opts: {
  extensions?: FILE_EXTENSION[];
  description: string;
  multiple?: M;
}): Promise<M extends false | undefined ? File : File[]> => {
  // an unsafe TS hack, alas not much we can do AFAIK
  type RetType = M extends false | undefined ? File : File[];

  const mimeTypes = opts.extensions?.reduce((mimeTypes, type) => {
    mimeTypes.push(MIME_TYPES[type]);

    return mimeTypes;
  }, [] as string[]);

  const extensions = opts.extensions?.reduce((acc, ext) => {
    if (ext === "jpg") {
      return acc.concat(".jpg", ".jpeg");
    }
    return acc.concat(`.${ext}`);
  }, [] as string[]);

  if (!isBrowserEnvironment()) {
    throw new AbortError();
  }

  const { fileOpen: fileOpenImpl } = await loadBrowserFSModule();

  const files = await (fileOpenImpl as unknown as (options: any) => Promise<any>)({
    description: opts.description,
    extensions,
    mimeTypes,
    multiple: opts.multiple ?? false,
    legacySetup: (
      resolve: (value: RetType) => void,
      reject: () => void,
      input: HTMLInputElement,
    ) => {
      const scheduleRejection = debounce(reject, INPUT_CHANGE_INTERVAL_MS);
      const focusHandler = () => {
        checkForFile();
        document.addEventListener(EVENT.KEYUP, scheduleRejection);
        document.addEventListener(EVENT.POINTER_UP, scheduleRejection);
        scheduleRejection();
      };
      const checkForFile = () => {
        // this hack might not work when expecting multiple files
        if (input.files?.length) {
          const ret = opts.multiple ? [...input.files] : input.files[0];
          resolve(ret as RetType);
        }
      };
      requestAnimationFrame(() => {
        window.addEventListener(EVENT.FOCUS, focusHandler);
      });
      const interval = window.setInterval(() => {
        checkForFile();
      }, INPUT_CHANGE_INTERVAL_MS);
      return (rejectPromise?: (reason?: any) => void) => {
        clearInterval(interval);
        scheduleRejection.cancel();
        window.removeEventListener(EVENT.FOCUS, focusHandler);
        document.removeEventListener(EVENT.KEYUP, scheduleRejection);
        document.removeEventListener(EVENT.POINTER_UP, scheduleRejection);
        if (rejectPromise) {
          // so that something is shown in console if we need to debug this
          console.warn("Opening the file was canceled (legacy-fs).");
          rejectPromise(new AbortError());
        }
      };
    },
  });

  if (Array.isArray(files)) {
    return (await Promise.all(
      files.map((file) => normalizeFile(file)),
    )) as RetType;
  }
  return (await normalizeFile(files)) as RetType;
};

export const fileSave = async (
  blob: Blob | Promise<Blob>,
  opts: {
    /** supply without the extension */
    name: string;
    /** file extension */
    extension: FILE_EXTENSION;
    mimeTypes?: string[];
    description: string;
    /** existing FileSystemHandle */
    fileHandle?: FileSystemHandle | null;
  },
) => {
  if (!isBrowserEnvironment()) {
    throw new AbortError();
  }

  const { fileSave: fileSaveImpl } = await loadBrowserFSModule();

  return fileSaveImpl(
    blob,
    {
      fileName: `${opts.name}.${opts.extension}`,
      description: opts.description,
      extensions: [`.${opts.extension}`],
      mimeTypes: opts.mimeTypes,
    },
    opts.fileHandle,
  );
};
export type { FileSystemHandle };
