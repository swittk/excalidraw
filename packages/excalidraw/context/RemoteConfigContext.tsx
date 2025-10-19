import React, { createContext, useContext, useMemo } from "react";

export interface LinkCollection {
  documentation?: string;
  blog?: string;
  github?: string;
  discord?: string;
  youtube?: string;
  x?: string;
}

export type LibraryUrlValidator =
  | string[]
  | ((libraryUrl: string) => boolean);

export interface RemoteConfig {
  assetFallbackUrl?: string | null;
  libraryUrl?: string;
  libraryBackendUrl?: string;
  helpLinks?: LinkCollection;
  socialLinks?: LinkCollection;
  libraryUrlValidator?: LibraryUrlValidator;
}

interface RemoteConfigContextValue {
  assetFallbackUrl: string | null;
  libraryUrl: string | undefined;
  libraryBackendUrl: string | undefined;
  helpLinks: LinkCollection;
  socialLinks: LinkCollection;
  libraryUrlValidator: LibraryUrlValidator | undefined;
}

const getEnvValue = (key: string): string | undefined => {
  try {
    return (import.meta as any)?.env?.[key];
  } catch {
    return undefined;
  }
};

const packageName = getEnvValue("PKG_NAME") || "ex-excalidraw";
const packageVersion = getEnvValue("PKG_VERSION");

const defaultAssetFallbackUrl = `https://esm.sh/${packageName}${packageVersion ? `@${packageVersion}` : ""}/dist/prod/`;

const defaultRemoteConfig: RemoteConfigContextValue = {
  assetFallbackUrl: defaultAssetFallbackUrl,
  libraryUrl: getEnvValue("VITE_APP_LIBRARY_URL"),
  libraryBackendUrl: getEnvValue("VITE_APP_LIBRARY_BACKEND"),
  helpLinks: {},
  socialLinks: {},
  libraryUrlValidator: undefined,
};

const RemoteConfigContext = createContext<RemoteConfigContextValue>(
  defaultRemoteConfig,
);
RemoteConfigContext.displayName = "RemoteConfigContext";

export const RemoteConfigProvider = ({
  value,
  children,
}: {
  value: RemoteConfig | undefined;
  children: React.ReactNode;
}) => {
  const merged = useMemo<RemoteConfigContextValue>(() => {
    return {
      assetFallbackUrl:
        value?.assetFallbackUrl === undefined
          ? defaultRemoteConfig.assetFallbackUrl
          : value.assetFallbackUrl,
      libraryUrl: value?.libraryUrl ?? defaultRemoteConfig.libraryUrl,
      libraryBackendUrl:
        value?.libraryBackendUrl ?? defaultRemoteConfig.libraryBackendUrl,
      helpLinks: { ...defaultRemoteConfig.helpLinks, ...value?.helpLinks },
      socialLinks: { ...defaultRemoteConfig.socialLinks, ...value?.socialLinks },
      libraryUrlValidator: value?.libraryUrlValidator,
    };
  }, [value]);

  return (
    <RemoteConfigContext.Provider value={merged}>
      {children}
    </RemoteConfigContext.Provider>
  );
};

export const useRemoteConfig = () => useContext(RemoteConfigContext);
