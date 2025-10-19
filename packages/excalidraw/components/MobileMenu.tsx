import React from "react";

import type { NonDeletedExcalidrawElement } from "ex-excalidraw-element/types";

import { useTunnels } from "../context/tunnels";
import { t } from "../i18n";
import { calculateScrollCenter } from "../scene";
import { SCROLLBAR_WIDTH, SCROLLBAR_MARGIN } from "../scene/scrollbars";

import { MobileShapeActions } from "./Actions";
import { MobileToolBar } from "./MobileToolBar";
import { FixedSideContainer } from "./FixedSideContainer";

import { Island } from "./Island";

import type { ActionManager } from "../actions/manager";
import type {
  AppClassProperties,
  AppProps,
  AppState,
  UIAppState,
  ToolbarRenderer,
  ToolbarRenderContext,
  ToolbarConfig,
  MobileTopToolbarItem,
  MobileBottomToolbarItem,
} from "../types";
import type { JSX } from "react";

type MobileMenuProps = {
  appState: UIAppState;
  actionManager: ActionManager;
  renderJSONExportDialog: () => React.ReactNode;
  renderImageExportDialog: () => React.ReactNode;
  setAppState: React.Component<any, AppState>["setState"];
  elements: readonly NonDeletedExcalidrawElement[];
  onHandToolToggle: () => void;
  onPenModeToggle: AppClassProperties["togglePenMode"];
  renderTopRightUI?: (
    isMobile: boolean,
    appState: UIAppState,
  ) => JSX.Element | null;
  renderTopLeftUI?: (
    isMobile: boolean,
    appState: UIAppState,
  ) => JSX.Element | null;
  renderSidebars: () => JSX.Element | null;
  renderWelcomeScreen: boolean;
  UIOptions: AppProps["UIOptions"];
  app: AppClassProperties;
  renderTopToolbar?: ToolbarRenderer;
  renderBottomToolbar?: ToolbarRenderer;
  toolbarContext: Omit<ToolbarRenderContext, "defaultUI" | "location">;
  toolbarTopConfig?: ToolbarConfig["mobileTop"];
  toolbarBottomConfig?: ToolbarConfig["mobileBottom"];
};

export const MobileMenu = ({
  appState,
  elements,
  actionManager,
  setAppState,
  onHandToolToggle,
  renderTopLeftUI,
  renderTopRightUI,
  renderSidebars,
  renderWelcomeScreen,
  UIOptions,
  app,
  renderTopToolbar,
  renderBottomToolbar,
  toolbarContext,
  toolbarTopConfig,
  toolbarBottomConfig,
}: MobileMenuProps) => {
  const {
    WelcomeScreenCenterTunnel,
    MainMenuTunnel,
    DefaultSidebarTriggerTunnel,
  } = useTunnels();
  const topPrepend = toolbarTopConfig?.prepend ?? null;
  const topAppend = toolbarTopConfig?.append ?? null;
  const bottomPrepend = toolbarBottomConfig?.prepend ?? null;
  const bottomAppend = toolbarBottomConfig?.append ?? null;

  const isTopItemEnabled = (item: MobileTopToolbarItem) =>
    toolbarTopConfig?.items?.[item] ?? true;

  const isBottomItemEnabled = (item: MobileBottomToolbarItem) =>
    toolbarBottomConfig?.items?.[item] ?? true;
  const renderAppTopBar = () => {
    const topLeftUI = isTopItemEnabled("topLeftUI") ? (
      <div className="excalidraw-ui-top-left">
        {renderTopLeftUI?.(true, appState)}
        <MainMenuTunnel.Out />
      </div>
    ) : null;

    const topRightUI = isTopItemEnabled("topRightUI")
      ? renderTopRightUI?.(true, appState) ?? (
          <DefaultSidebarTriggerTunnel.Out />
        )
      : null;

    const composeCluster = (
      children: (React.ReactNode | null)[],
    ): React.ReactNode | null => {
      const filtered = children.filter((child) => child !== null && child !== undefined) as React.ReactNode[];
      if (!filtered.length) {
        return null;
      }
      if (filtered.length === 1) {
        return filtered[0];
      }
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {filtered.map((child, index) => (
            <React.Fragment key={index}>{child}</React.Fragment>
          ))}
        </div>
      );
    };

    const leftCluster = composeCluster([topPrepend, topLeftUI]);
    const rightCluster = composeCluster([topRightUI, topAppend]);

    const isViewOnly =
      appState.viewModeEnabled ||
      appState.openDialog?.name === "elementLinkSelector";

    const viewModeRightCluster = composeCluster([topAppend]);

    const defaultTopBar = isViewOnly ? (
      <div className="App-toolbar-content">
        {leftCluster}
        {viewModeRightCluster}
      </div>
    ) : (
      <div
        className="App-toolbar-content"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {leftCluster}
        {rightCluster}
      </div>
    );

    if (!renderTopToolbar) {
      return defaultTopBar;
    }

    const customTopBar = renderTopToolbar({
      ...toolbarContext,
      location: "mobile-top",
      defaultUI: defaultTopBar,
    });

    return customTopBar ?? defaultTopBar;
  };

  const renderToolbar = () => {
    return (
      <MobileToolBar
        app={app}
        onHandToolToggle={onHandToolToggle}
        setAppState={setAppState}
      />
    );
  };

  const renderBottomBar = () => {
    const showShapeActions = isBottomItemEnabled("shapeActions");
    const shouldRenderToolbar =
      isBottomItemEnabled("toolbar") &&
      !appState.viewModeEnabled &&
      appState.openDialog?.name !== "elementLinkSelector";
    const shouldRenderScrollBack =
      isBottomItemEnabled("scrollToContent") &&
      appState.scrolledOutside &&
      !appState.openMenu &&
      !appState.openSidebar;

    const hasToolbarContent = shouldRenderToolbar || shouldRenderScrollBack;

    if (
      bottomPrepend === null &&
      bottomAppend === null &&
      !showShapeActions &&
      !hasToolbarContent
    ) {
      return null;
    }

    const defaultBottomBar = (
      <div
        className="App-bottom-bar"
        style={{
          marginBottom: SCROLLBAR_WIDTH + SCROLLBAR_MARGIN,
        }}
      >
        {bottomPrepend}
        {showShapeActions && (
          <MobileShapeActions
            appState={appState}
            elementsMap={app.scene.getNonDeletedElementsMap()}
            renderAction={actionManager.renderAction}
            app={app}
            setAppState={setAppState}
          />
        )}

        {hasToolbarContent && (
          <Island className="App-toolbar">
            {shouldRenderToolbar && renderToolbar()}
            {shouldRenderScrollBack && (
              <button
                type="button"
                className="scroll-back-to-content"
                onClick={() => {
                  setAppState((appState) => ({
                    ...calculateScrollCenter(elements, appState),
                  }));
                }}
              >
                {t("buttons.scrollBackToContent")}
              </button>
            )}
          </Island>
        )}
        {bottomAppend}
      </div>
    );

    if (!renderBottomToolbar) {
      return defaultBottomBar;
    }

    const customBottomBar = renderBottomToolbar({
      ...toolbarContext,
      location: "mobile-bottom",
      defaultUI: defaultBottomBar,
    });

    return customBottomBar ?? defaultBottomBar;
  };

  return (
    <>
      {renderSidebars()}
      {/* welcome screen, bottom bar, and top bar all have the same z-index */}
      {/* ordered in this reverse order so that top bar is on top */}
      <div className="App-welcome-screen">
        {renderWelcomeScreen && <WelcomeScreenCenterTunnel.Out />}
      </div>

      {renderBottomBar()}

      <FixedSideContainer side="top" className="App-top-bar">
        {renderAppTopBar()}
      </FixedSideContainer>
    </>
  );
};
