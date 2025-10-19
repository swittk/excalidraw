import React, { useEffect } from "react";

import { DEFAULT_UI_OPTIONS, isShallowEqual } from "ex-excalidraw-common";

import App from "./components/App";
import { InitializeApp } from "./components/InitializeApp";
import Footer from "./components/footer/FooterCenter";
import LiveCollaborationTrigger from "./components/live-collaboration/LiveCollaborationTrigger";
import MainMenu from "./components/main-menu/MainMenu";
import WelcomeScreen from "./components/welcome-screen/WelcomeScreen";
import { defaultLang } from "./i18n";
import { EditorJotaiProvider, editorJotaiStore } from "./editor-jotai";
import polyfill from "./polyfill";
import { BrandingProvider } from "./context/BrandingContext";
import { RemoteConfigProvider } from "./context/RemoteConfigContext";
import { setTelemetryHandler } from "./analytics";
import { ExcalidrawFontFace } from "./fonts/ExcalidrawFontFace";
import { setLibraryUrlValidator } from "./data/library";

import "./css/app.scss";
import "./css/styles.scss";
import "./fonts/fonts.css";

import type { AppProps, ExcalidrawProps } from "./types";

polyfill();

const ExcalidrawBase = (props: ExcalidrawProps) => {
  const {
    onChange,
    onIncrement,
    initialData,
    excalidrawAPI,
    isCollaborating = false,
    onPointerUpdate,
    renderTopLeftUI,
    renderTopRightUI,
    langCode = defaultLang.code,
    viewModeEnabled,
    zenModeEnabled,
    gridModeEnabled,
    libraryReturnUrl,
    theme,
    name,
    renderCustomStats,
    onPaste,
    detectScroll = true,
    handleKeyboardGlobally = false,
    onLibraryChange,
    autoFocus = false,
    generateIdForFile,
    onLinkOpen,
    generateLinkForSelection,
    onPointerDown,
    onPointerUp,
    onScrollChange,
    onDuplicate,
    children,
    validateEmbeddable,
    renderEmbeddable,
    aiEnabled,
    showDeprecatedFonts,
    renderScrollbars,
    branding,
    remoteConfig,
    onTelemetryEvent,
    renderTopToolbar,
    renderBottomToolbar,
    renderMainMenu,
    renderMainMenuItems,
    toolbar,
    mainMenu,
  } = props;

  const canvasActions = props.UIOptions?.canvasActions;

  // FIXME normalize/set defaults in parent component so that the memo resolver
  // compares the same values
  const UIOptions: AppProps["UIOptions"] = {
    ...props.UIOptions,
    canvasActions: {
      ...DEFAULT_UI_OPTIONS.canvasActions,
      ...canvasActions,
    },
    tools: {
      image: props.UIOptions?.tools?.image ?? true,
    },
  };

  if (canvasActions?.export) {
    UIOptions.canvasActions.export.saveFileToDisk =
      canvasActions.export?.saveFileToDisk ??
      DEFAULT_UI_OPTIONS.canvasActions.export.saveFileToDisk;
  }

  if (
    UIOptions.canvasActions.toggleTheme === null &&
    typeof theme === "undefined"
  ) {
    UIOptions.canvasActions.toggleTheme = true;
  }

  useEffect(() => {
    const importPolyfill = async () => {
      //@ts-ignore
      await import("canvas-roundrect-polyfill");
    };

    importPolyfill();

    // Block pinch-zooming on iOS outside of the content area
    const handleTouchMove = (event: TouchEvent) => {
      // @ts-ignore
      if (typeof event.scale === "number" && event.scale !== 1) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    setTelemetryHandler(onTelemetryEvent ?? null);
    return () => {
      setTelemetryHandler(null);
    };
  }, [onTelemetryEvent]);

  useEffect(() => {
    ExcalidrawFontFace.setAssetsFallbackUrl(remoteConfig?.assetFallbackUrl);

    const libraryValidator = remoteConfig?.libraryUrlValidator
      ? remoteConfig.libraryUrlValidator
      : remoteConfig?.libraryUrl
        ? (() => {
            try {
              const url = new URL(remoteConfig.libraryUrl);
              const pathname = url.pathname.replace(/\/+$/, "");
              return [`${url.hostname}${pathname ? `${pathname}` : ""}`];
            } catch {
              return undefined;
            }
          })()
        : undefined;

    setLibraryUrlValidator(libraryValidator);

    return () => {
      ExcalidrawFontFace.setAssetsFallbackUrl(undefined);
      setLibraryUrlValidator(undefined);
    };
  }, [
    remoteConfig?.assetFallbackUrl,
    remoteConfig?.libraryUrlValidator,
    remoteConfig?.libraryUrl,
  ]);

  return (
    <EditorJotaiProvider store={editorJotaiStore}>
      <BrandingProvider value={branding}>
        <RemoteConfigProvider value={remoteConfig}>
          <InitializeApp langCode={langCode} theme={theme}>
            <App
              onChange={onChange}
              onIncrement={onIncrement}
              initialData={initialData}
              excalidrawAPI={excalidrawAPI}
              isCollaborating={isCollaborating}
              onPointerUpdate={onPointerUpdate}
              renderTopLeftUI={renderTopLeftUI}
              renderTopRightUI={renderTopRightUI}
              langCode={langCode}
              viewModeEnabled={viewModeEnabled}
              zenModeEnabled={zenModeEnabled}
              gridModeEnabled={gridModeEnabled}
              libraryReturnUrl={libraryReturnUrl}
              theme={theme}
              name={name}
              renderCustomStats={renderCustomStats}
              UIOptions={UIOptions}
              onPaste={onPaste}
              detectScroll={detectScroll}
              handleKeyboardGlobally={handleKeyboardGlobally}
              onLibraryChange={onLibraryChange}
              autoFocus={autoFocus}
              generateIdForFile={generateIdForFile}
              onLinkOpen={onLinkOpen}
              generateLinkForSelection={generateLinkForSelection}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onScrollChange={onScrollChange}
              onDuplicate={onDuplicate}
              validateEmbeddable={validateEmbeddable}
              renderEmbeddable={renderEmbeddable}
              aiEnabled={aiEnabled !== false}
              showDeprecatedFonts={showDeprecatedFonts}
              renderScrollbars={renderScrollbars}
              renderTopToolbar={renderTopToolbar}
              renderBottomToolbar={renderBottomToolbar}
              renderMainMenu={renderMainMenu}
              renderMainMenuItems={renderMainMenuItems}
              toolbar={toolbar}
              mainMenu={mainMenu}
            >
              {children}
            </App>
          </InitializeApp>
        </RemoteConfigProvider>
      </BrandingProvider>
    </EditorJotaiProvider>
  );
};

const areEqual = (prevProps: ExcalidrawProps, nextProps: ExcalidrawProps) => {
  // short-circuit early
  if (prevProps.children !== nextProps.children) {
    return false;
  }

  const {
    initialData: prevInitialData,
    UIOptions: prevUIOptions = {},
    ...prev
  } = prevProps;
  const {
    initialData: nextInitialData,
    UIOptions: nextUIOptions = {},
    ...next
  } = nextProps;

  // comparing UIOptions
  const prevUIOptionsKeys = Object.keys(prevUIOptions) as (keyof Partial<
    typeof DEFAULT_UI_OPTIONS
  >)[];
  const nextUIOptionsKeys = Object.keys(nextUIOptions) as (keyof Partial<
    typeof DEFAULT_UI_OPTIONS
  >)[];

  if (prevUIOptionsKeys.length !== nextUIOptionsKeys.length) {
    return false;
  }

  const isUIOptionsSame = prevUIOptionsKeys.every((key) => {
    if (key === "canvasActions") {
      const canvasOptionKeys = Object.keys(
        prevUIOptions.canvasActions!,
      ) as (keyof Partial<typeof DEFAULT_UI_OPTIONS.canvasActions>)[];
      return canvasOptionKeys.every((key) => {
        if (
          key === "export" &&
          prevUIOptions?.canvasActions?.export &&
          nextUIOptions?.canvasActions?.export
        ) {
          return (
            prevUIOptions.canvasActions.export.saveFileToDisk ===
            nextUIOptions.canvasActions.export.saveFileToDisk
          );
        }
        return (
          prevUIOptions?.canvasActions?.[key] ===
          nextUIOptions?.canvasActions?.[key]
        );
      });
    }
    return prevUIOptions[key] === nextUIOptions[key];
  });

  return isUIOptionsSame && isShallowEqual(prev, next);
};

export const Excalidraw = React.memo(ExcalidrawBase, areEqual);
Excalidraw.displayName = "Excalidraw";

export {
  getSceneVersion,
  hashElementsVersion,
  hashString,
  getNonDeletedElements,
} from "ex-excalidraw-element";

export { getTextFromElements } from "ex-excalidraw-element";
export { isInvisiblySmallElement } from "ex-excalidraw-element";

export { defaultLang, useI18n, languages } from "./i18n";
export {
  restore,
  restoreAppState,
  restoreElement,
  restoreElements,
  restoreLibraryItems,
} from "./data/restore";

export { reconcileElements } from "./data/reconcile";

export {
  exportToCanvas,
  exportToBlob,
  exportToSvg,
  exportToClipboard,
} from "ex-excalidraw-utils/export";

export { serializeAsJSON, serializeLibraryAsJSON } from "./data/json";
export {
  loadFromBlob,
  loadSceneOrLibraryFromBlob,
  loadLibraryFromBlob,
} from "./data/blob";
export { getFreeDrawSvgPath } from "ex-excalidraw-element";
export { mergeLibraryItems, getLibraryItemsHash } from "./data/library";
export { isLinearElement } from "ex-excalidraw-element";

export {
  FONT_FAMILY,
  THEME,
  MIME_TYPES,
  ROUNDNESS,
  DEFAULT_LASER_COLOR,
  UserIdleState,
  normalizeLink,
} from "ex-excalidraw-common";

export {
  mutateElement,
  newElementWith,
  bumpVersion,
} from "ex-excalidraw-element";

export { CaptureUpdateAction } from "ex-excalidraw-element";

export { parseLibraryTokensFromUrl, useHandleLibrary } from "./data/library";

export {
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
} from "ex-excalidraw-common";

export { Sidebar } from "./components/Sidebar/Sidebar";
export { Button } from "./components/Button";
export { Footer };
export { MainMenu };
export { Ellipsify } from "./components/Ellipsify";
export { useDevice } from "./components/App";
export { WelcomeScreen };
export { LiveCollaborationTrigger };
export { Stats } from "./components/Stats";

export { DefaultSidebar } from "./components/DefaultSidebar";
export { TTDDialog } from "./components/TTDDialog/TTDDialog";
export { TTDDialogTrigger } from "./components/TTDDialog/TTDDialogTrigger";

export { zoomToFitBounds } from "./actions/actionCanvas";
export { convertToExcalidrawElements } from "./data/transform";
export { getCommonBounds, getVisibleSceneBounds } from "ex-excalidraw-element";

export {
  elementsOverlappingBBox,
  isElementInsideBBox,
  elementPartiallyOverlapsWithOrContainsBBox,
} from "ex-excalidraw-utils/withinBounds";

export { DiagramToCodePlugin } from "./components/DiagramToCodePlugin/DiagramToCodePlugin";
export { getDataURL } from "./data/blob";
export { isElementLink } from "ex-excalidraw-element";

export { setCustomTextMetricsProvider } from "ex-excalidraw-element";

export type {
  ExcalidrawProps,
  ToolbarRenderer,
  ToolbarRenderContext,
  MainMenuRenderer,
  MainMenuItemsRenderer,
  BrandingConfig,
  RemoteConfig,
  LinkCollection,
} from "./types";
