import React, { createContext, useContext } from "react";

export type BrandingRenderer =
  | React.ReactNode
  | ((defaultNode: React.ReactNode) => React.ReactNode)
  | null
  | false
  | undefined;

export interface BrandingConfig {
  welcomeScreenLogo?: BrandingRenderer;
  mainMenuGroup?: BrandingRenderer;
}

interface BrandingContextValue {
  renderWelcomeScreenLogo: (defaultNode: React.ReactNode) => React.ReactNode | null;
  renderMainMenuGroup: (defaultNode: React.ReactNode) => React.ReactNode | null;
}

const resolveRenderer = (
  renderer: BrandingRenderer,
  defaultNode: React.ReactNode,
): React.ReactNode | null => {
  if (renderer === false || renderer === null) {
    return null;
  }
  if (renderer === undefined) {
    return null;
  }
  if (typeof renderer === "function") {
    return renderer(defaultNode);
  }
  return renderer ?? defaultNode;
};

const defaultBrandingContextValue: BrandingContextValue = {
  renderWelcomeScreenLogo: () => null,
  renderMainMenuGroup: () => null,
};

const BrandingContext = createContext<BrandingContextValue>(
  defaultBrandingContextValue,
);
BrandingContext.displayName = "BrandingContext";

export const BrandingProvider = ({
  value,
  children,
}: {
  value: BrandingConfig | boolean | undefined;
  children: React.ReactNode;
}) => {
  const config = typeof value === "boolean" ? undefined : value;

  const contextValue: BrandingContextValue = {
    renderWelcomeScreenLogo: (defaultNode) => {
      if (value === true) {
        return defaultNode;
      }
      return resolveRenderer(config?.welcomeScreenLogo, defaultNode);
    },
    renderMainMenuGroup: (defaultNode) => {
      if (value === true) {
        return defaultNode;
      }
      return resolveRenderer(config?.mainMenuGroup, defaultNode);
    },
  };

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
