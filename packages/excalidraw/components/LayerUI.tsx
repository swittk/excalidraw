import clsx from "clsx";
import React from "react";

import {
  CLASSES,
  DEFAULT_SIDEBAR,
  MQ_MIN_WIDTH_DESKTOP,
  TOOL_TYPE,
  arrayToMap,
  capitalizeString,
  isShallowEqual,
} from "@excalidraw/common";

import { mutateElement } from "@excalidraw/element";

import { showSelectedShapeActions } from "@excalidraw/element";

import { ShapeCache } from "@excalidraw/element";

import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

import { actionToggleStats } from "../actions";
import { trackEvent } from "../analytics";
import { isHandToolActive } from "../appState";
import { TunnelsContext, useInitializeTunnels } from "../context/tunnels";
import { UIAppStateContext } from "../context/ui-appState";
import { useAtom, useAtomValue } from "../editor-jotai";

import { t } from "../i18n";
import { calculateScrollCenter } from "../scene";

import {
  SelectedShapeActions,
  ShapesSwitcher,
  CompactShapeActions,
} from "./Actions";
import { LoadingMessage } from "./LoadingMessage";
import { LockButton } from "./LockButton";
import { MobileMenu } from "./MobileMenu";
import { PasteChartDialog } from "./PasteChartDialog";
import { Section } from "./Section";
import Stack from "./Stack";
import { UserList } from "./UserList";
import { PenModeButton } from "./PenModeButton";
import Footer from "./footer/Footer";
import { isSidebarDockedAtom } from "./Sidebar/Sidebar";
import MainMenu from "./main-menu/MainMenu";
import { ActiveConfirmDialog } from "./ActiveConfirmDialog";
import { useDevice } from "./App";
import { OverwriteConfirmDialog } from "./OverwriteConfirm/OverwriteConfirm";
import { LibraryIcon } from "./icons";
import { DefaultSidebar } from "./DefaultSidebar";
import { TTDDialog } from "./TTDDialog/TTDDialog";
import { Stats } from "./Stats";
import ElementLinkDialog from "./ElementLinkDialog";
import { ErrorDialog } from "./ErrorDialog";
import { EyeDropper, activeEyeDropperAtom } from "./EyeDropper";
import { FixedSideContainer } from "./FixedSideContainer";
import { HandButton } from "./HandButton";
import { HelpDialog } from "./HelpDialog";
import { HintViewer } from "./HintViewer";
import { ImageExportDialog } from "./ImageExportDialog";
import { Island } from "./Island";
import { JSONExportDialog } from "./JSONExportDialog";
import { LaserPointerButton } from "./LaserPointerButton";
import { useBranding } from "../context/BrandingContext";
import { useRemoteConfig } from "../context/RemoteConfigContext";

import "./LayerUI.scss";
import "./Toolbar.scss";

import type { ActionManager } from "../actions/manager";

import type { Language } from "../i18n";
import type {
  AppProps,
  AppState,
  ExcalidrawProps,
  BinaryFiles,
  UIAppState,
  AppClassProperties,
  ToolbarRenderContext,
  ToolbarConfig,
  DesktopTopToolbarItem,
  DesktopBottomToolbarItem,
  MainMenuDefaultItem,
} from "../types";

interface LayerUIProps {
  actionManager: ActionManager;
  appState: UIAppState;
  files: BinaryFiles;
  canvas: HTMLCanvasElement;
  setAppState: React.Component<any, AppState>["setState"];
  elements: readonly NonDeletedExcalidrawElement[];
  onLockToggle: () => void;
  onHandToolToggle: () => void;
  onPenModeToggle: AppClassProperties["togglePenMode"];
  showExitZenModeBtn: boolean;
  langCode: Language["code"];
  renderTopLeftUI?: ExcalidrawProps["renderTopLeftUI"];
  renderTopRightUI?: ExcalidrawProps["renderTopRightUI"];
  renderCustomStats?: ExcalidrawProps["renderCustomStats"];
  renderTopToolbar?: ExcalidrawProps["renderTopToolbar"];
  renderBottomToolbar?: ExcalidrawProps["renderBottomToolbar"];
  renderMainMenu?: ExcalidrawProps["renderMainMenu"];
  renderMainMenuItems?: ExcalidrawProps["renderMainMenuItems"];
  toolbar?: ToolbarConfig;
  mainMenu?: ExcalidrawProps["mainMenu"];
  UIOptions: AppProps["UIOptions"];
  onExportImage: AppClassProperties["onExportImage"];
  renderWelcomeScreen: boolean;
  children?: React.ReactNode;
  app: AppClassProperties;
  isCollaborating: boolean;
  generateLinkForSelection?: AppProps["generateLinkForSelection"];
}

type DefaultMainMenuEntry = {
  key: MainMenuDefaultItem;
  node: React.ReactNode | null;
  separatorBefore?: boolean;
};

const DefaultOverwriteConfirmDialog = () => {
  return (
    <OverwriteConfirmDialog __fallback>
      <OverwriteConfirmDialog.Actions.SaveToDisk />
      <OverwriteConfirmDialog.Actions.ExportToImage />
    </OverwriteConfirmDialog>
  );
};

const LayerUI = ({
  actionManager,
  appState,
  files,
  setAppState,
  elements,
  canvas,
  onLockToggle,
  onHandToolToggle,
  onPenModeToggle,
  showExitZenModeBtn,
  renderTopLeftUI,
  renderTopRightUI,
  renderCustomStats,
  renderTopToolbar,
  renderBottomToolbar,
  renderMainMenu,
  renderMainMenuItems,
  toolbar,
  mainMenu,
  UIOptions,
  onExportImage,
  renderWelcomeScreen,
  children,
  app,
  isCollaborating,
  generateLinkForSelection,
}: LayerUIProps) => {
  const device = useDevice();
  const tunnels = useInitializeTunnels();

  const toolbarConfigRef: ToolbarConfig | undefined = toolbar;
  const topToolbarConfig = toolbarConfigRef?.top;
  const bottomToolbarConfig = toolbarConfigRef?.bottom;
  const mobileTopConfig = toolbarConfigRef?.mobileTop;
  const mobileBottomConfig = toolbarConfigRef?.mobileBottom;

  const isTopToolbarItemEnabled = (item: DesktopTopToolbarItem) =>
    topToolbarConfig?.items?.[item] ?? true;

  const isBottomToolbarItemEnabled = (item: DesktopBottomToolbarItem) =>
    bottomToolbarConfig?.items?.[item] ?? true;

  const mainMenuConfig = mainMenu ?? {};
  const isMainMenuItemEnabled = (item: MainMenuDefaultItem) =>
    mainMenuConfig.items?.[item] ?? true;

  const topToolbarPrepend = topToolbarConfig?.prepend ?? null;
  const topToolbarAppend = topToolbarConfig?.append ?? null;

  const { renderMainMenuGroup } = useBranding();
  const { socialLinks } = useRemoteConfig();

  const defaultMainMenuEntries = React.useMemo<DefaultMainMenuEntry[]>(() => {
    const entries: DefaultMainMenuEntry[] = [
      {
        key: "loadScene",
        node: UIOptions.canvasActions.loadScene ? (
          <MainMenu.DefaultItems.LoadScene />
        ) : null,
      },
      {
        key: "saveToActiveFile",
        node: UIOptions.canvasActions.saveToActiveFile ? (
          <MainMenu.DefaultItems.SaveToActiveFile />
        ) : null,
      },
      {
        key: "export",
        node: UIOptions.canvasActions.export ? (
          <MainMenu.DefaultItems.Export />
        ) : null,
      },
      {
        key: "saveAsImage",
        node: UIOptions.canvasActions.saveAsImage ? (
          <MainMenu.DefaultItems.SaveAsImage />
        ) : null,
      },
      { key: "search", node: <MainMenu.DefaultItems.SearchMenu /> },
      { key: "help", node: <MainMenu.DefaultItems.Help /> },
      {
        key: "clearCanvas",
        node: UIOptions.canvasActions.clearCanvas ? (
          <MainMenu.DefaultItems.ClearCanvas />
        ) : null,
      },
    ];

    const socialItems = (
      <MainMenu.DefaultItems.Socials links={socialLinks} />
    );

    const defaultSocialGroup = socialItems ? (
      <MainMenu.Group title="Links">{socialItems}</MainMenu.Group>
    ) : null;

    const socialGroup = renderMainMenuGroup(defaultSocialGroup);

    entries.push({
      key: "links",
      node: socialGroup,
      separatorBefore: !!socialGroup,
    });

    entries.push({
      key: "toggleTheme",
      node:
        UIOptions.canvasActions.toggleTheme !== false ? (
          <MainMenu.DefaultItems.ToggleTheme />
        ) : null,
      separatorBefore: true,
    });

    entries.push({
      key: "changeCanvasBackground",
      node: <MainMenu.DefaultItems.ChangeCanvasBackground />,
    });

    return entries;
  }, [
    UIOptions.canvasActions.clearCanvas,
    UIOptions.canvasActions.export,
    UIOptions.canvasActions.loadScene,
    UIOptions.canvasActions.saveAsImage,
    UIOptions.canvasActions.saveToActiveFile,
    UIOptions.canvasActions.toggleTheme,
    renderMainMenuGroup,
    socialLinks,
  ]);

  const defaultMainMenuItemsMap = React.useMemo(
    () =>
      defaultMainMenuEntries.reduce(
        (acc, entry) => {
          acc[entry.key] = entry.node;
          return acc;
        },
        {} as Record<MainMenuDefaultItem, React.ReactNode | null>,
      ),
    [defaultMainMenuEntries],
  );

  const defaultMainMenuOrder = React.useMemo(
    () =>
      defaultMainMenuEntries.map((entry) => entry.key) as readonly MainMenuDefaultItem[],
    [defaultMainMenuEntries],
  );

  const mainMenuNodes: React.ReactNode[] = [];
  let hasRenderedMainMenuItem = false;

  const toggleThemeVisible = Boolean(
    defaultMainMenuItemsMap.toggleTheme &&
      isMainMenuItemEnabled("toggleTheme"),
  );

  for (const entry of defaultMainMenuEntries) {
    if (!entry.node) {
      continue;
    }
    if (!isMainMenuItemEnabled(entry.key)) {
      continue;
    }

    const needsSeparator =
      hasRenderedMainMenuItem &&
      (entry.separatorBefore ||
        (entry.key === "changeCanvasBackground" && !toggleThemeVisible));

    if (needsSeparator) {
      mainMenuNodes.push(
        <MainMenu.Separator key={`${entry.key}-separator`} />,
      );
    }

    mainMenuNodes.push(
      <React.Fragment key={entry.key}>{entry.node}</React.Fragment>,
    );

    hasRenderedMainMenuItem = true;
  }

  const defaultMainMenuItemsNode = (
    <>
      {mainMenuConfig.prepend}
      {mainMenuNodes}
      {mainMenuConfig.append}
    </>
  );

  const spacing =
    appState.stylesPanelMode === "compact"
      ? {
          menuTopGap: 4,
          toolbarColGap: 4,
          toolbarRowGap: 1,
          toolbarInnerRowGap: 0.5,
          islandPadding: 1,
          collabMarginLeft: 8,
        }
      : {
          menuTopGap: 6,
          toolbarColGap: 4,
          toolbarRowGap: 1,
          toolbarInnerRowGap: 1,
          islandPadding: 1,
          collabMarginLeft: 8,
        };

  const TunnelsJotaiProvider = tunnels.tunnelsJotai.Provider;

  const [eyeDropperState, setEyeDropperState] = useAtom(activeEyeDropperAtom);

  const renderJSONExportDialog = () => {
    if (!UIOptions.canvasActions.export) {
      return null;
    }

    return (
      <JSONExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        exportOpts={UIOptions.canvasActions.export}
        canvas={canvas}
        setAppState={setAppState}
      />
    );
  };

  const renderImageExportDialog = () => {
    if (
      !UIOptions.canvasActions.saveAsImage ||
      appState.openDialog?.name !== "imageExport"
    ) {
      return null;
    }

    return (
      <ImageExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        onExportImage={onExportImage}
        onCloseRequest={() => setAppState({ openDialog: null })}
        name={app.getName()}
      />
    );
  };

  const renderCanvasActions = () => {
    if (!isTopToolbarItemEnabled("canvasActions")) {
      return null;
    }

    return (
      <div style={{ position: "relative" }}>
        {/* wrapping to Fragment stops React from occasionally complaining
                about identical Keys */}
        <tunnels.MainMenuTunnel.Out />
        {renderWelcomeScreen && <tunnels.WelcomeScreenMenuHintTunnel.Out />}
      </div>
    );
  };

  const renderSelectedShapeActions = () => {
    if (!isTopToolbarItemEnabled("selectedShapeActions")) {
      return null;
    }

    const isCompactMode = appState.stylesPanelMode === "compact";

    return (
      <Section
        heading="selectedShapeActions"
        className={clsx("selected-shape-actions zen-mode-transition", {
          "transition-left": appState.zenModeEnabled,
        })}
      >
        {isCompactMode ? (
          <Island
            className={clsx("compact-shape-actions-island")}
            padding={0}
            style={{
              // we want to make sure this doesn't overflow so subtracting the
              // approximate height of hamburgerMenu + footer
              maxHeight: `${appState.height - 166}px`,
            }}
          >
            <CompactShapeActions
              appState={appState}
              elementsMap={app.scene.getNonDeletedElementsMap()}
              renderAction={actionManager.renderAction}
              app={app}
              setAppState={setAppState}
            />
          </Island>
        ) : (
          <Island
            className={CLASSES.SHAPE_ACTIONS_MENU}
            padding={2}
            style={{
              // we want to make sure this doesn't overflow so subtracting the
              // approximate height of hamburgerMenu + footer
              maxHeight: `${appState.height - 166}px`,
            }}
          >
            <SelectedShapeActions
              appState={appState}
              elementsMap={app.scene.getNonDeletedElementsMap()}
              renderAction={actionManager.renderAction}
              app={app}
            />
          </Island>
        )}
      </Section>
    );
  };

  const toolbarContextBase: Omit<
    ToolbarRenderContext,
    "defaultUI" | "location"
  > = {
    appState,
    actionManager,
    elements,
    device,
    UIOptions,
    setAppState,
    app,
    isCollaborating,
  };

  const renderFixedSideContainer = () => {
    const shouldRenderSelectedShapeActions =
      isTopToolbarItemEnabled("selectedShapeActions") &&
      showSelectedShapeActions(appState, elements);

    const shouldShowStats =
      isTopToolbarItemEnabled("stats") &&
      appState.stats.open &&
      !appState.zenModeEnabled &&
      !appState.viewModeEnabled &&
      appState.openDialog?.name !== "elementLinkSelector";

    const showHintViewer = isTopToolbarItemEnabled("hintViewer");
    const showPenModeButton = isTopToolbarItemEnabled("penModeButton");
    const showLockButton = isTopToolbarItemEnabled("lockButton");
    const showHandButton = isTopToolbarItemEnabled("handButton");
    const showShapesSwitcher = isTopToolbarItemEnabled("shapesSwitcher");
    const showLaserPointerButton = isTopToolbarItemEnabled(
      "laserPointerButton",
    );
    const showCollaboratorList = isTopToolbarItemEnabled("collaboratorList");

    const hasToolbarIslandContent =
      showHintViewer ||
      showPenModeButton ||
      showLockButton ||
      showHandButton ||
      showShapesSwitcher;

    const shouldRenderLaserIsland = isCollaborating && showLaserPointerButton;

    const shouldRenderToolbarSection =
      !appState.viewModeEnabled &&
      appState.openDialog?.name !== "elementLinkSelector" &&
      (hasToolbarIslandContent ||
        shouldRenderLaserIsland ||
        topToolbarPrepend !== null ||
        topToolbarAppend !== null);

    const defaultTopToolbar = (
      <FixedSideContainer side="top">
        <div className="App-menu App-menu_top">
          <Stack.Col
            gap={spacing.menuTopGap}
            className={clsx("App-menu_top__left")}
          >
            {renderCanvasActions()}
            <div
              className={clsx("selected-shape-actions-container", {
                "selected-shape-actions-container--compact":
                  appState.stylesPanelMode === "compact",
              })}
            >
              {shouldRenderSelectedShapeActions && renderSelectedShapeActions()}
            </div>
          </Stack.Col>
          {shouldRenderToolbarSection && (
            <Section heading="shapes" className="shapes-section">
              {(heading: React.ReactNode) => (
                <div style={{ position: "relative" }}>
                  {renderWelcomeScreen && (
                    <tunnels.WelcomeScreenToolbarHintTunnel.Out />
                  )}
                  <Stack.Col gap={spacing.toolbarColGap} align="start">
                    <Stack.Row
                      gap={spacing.toolbarRowGap}
                      className={clsx("App-toolbar-container", {
                        "zen-mode": appState.zenModeEnabled,
                      })}
                    >
                      {topToolbarPrepend}
                      {hasToolbarIslandContent && (
                        <Island
                          padding={spacing.islandPadding}
                          className={clsx("App-toolbar", {
                            "zen-mode": appState.zenModeEnabled,
                            "App-toolbar--compact":
                              appState.stylesPanelMode === "compact",
                          })}
                        >
                          {showHintViewer && (
                            <HintViewer
                              appState={appState}
                              isMobile={device.editor.isMobile}
                              device={device}
                              app={app}
                            />
                          )}
                          {(showPenModeButton ||
                            showLockButton ||
                            showHandButton ||
                            showShapesSwitcher) && heading}
                          <Stack.Row gap={spacing.toolbarInnerRowGap}>
                            {showPenModeButton && (
                              <PenModeButton
                                zenModeEnabled={appState.zenModeEnabled}
                                checked={appState.penMode}
                                onChange={() => onPenModeToggle(null)}
                                title={t("toolBar.penMode")}
                                penDetected={appState.penDetected}
                              />
                            )}
                            {showLockButton && (
                              <LockButton
                                checked={appState.activeTool.locked}
                                onChange={onLockToggle}
                                title={t("toolBar.lock")}
                              />
                            )}

                            {((showPenModeButton || showLockButton) &&
                              (showHandButton || showShapesSwitcher)) && (
                              <div className="App-toolbar__divider" />
                            )}

                            {showHandButton && (
                              <HandButton
                                checked={isHandToolActive(appState)}
                                onChange={() => onHandToolToggle()}
                                title={t("toolBar.hand")}
                                isMobile
                              />
                            )}

                            {showShapesSwitcher && (
                              <ShapesSwitcher
                                setAppState={setAppState}
                                activeTool={appState.activeTool}
                                UIOptions={UIOptions}
                                app={app}
                              />
                            )}
                          </Stack.Row>
                        </Island>
                      )}
                      {shouldRenderLaserIsland && (
                        <Island
                          style={{
                            marginLeft: spacing.collabMarginLeft,
                            alignSelf: "center",
                            height: "fit-content",
                          }}
                        >
                          <LaserPointerButton
                            title={t("toolBar.laser")}
                            checked={
                              appState.activeTool.type === TOOL_TYPE.laser
                            }
                            onChange={() =>
                              app.setActiveTool({ type: TOOL_TYPE.laser })
                            }
                            isMobile
                          />
                        </Island>
                      )}
                      {topToolbarAppend}
                    </Stack.Row>
                  </Stack.Col>
                </div>
              )}
            </Section>
          )}
          <div
            className={clsx(
              "layer-ui__wrapper__top-right zen-mode-transition",
              {
                "transition-right": appState.zenModeEnabled,
                "layer-ui__wrapper__top-right--compact":
                  appState.stylesPanelMode === "compact",
              },
            )}
          >
            {showCollaboratorList && appState.collaborators.size > 0 && (
              <UserList
                collaborators={appState.collaborators}
                userToFollow={appState.userToFollow?.socketId || null}
              />
            )}
            {renderTopRightUI?.(device.editor.isMobile, appState)}
            {!appState.viewModeEnabled &&
              appState.openDialog?.name !== "elementLinkSelector" &&
              // hide button when sidebar docked
              (!isSidebarDocked ||
                appState.openSidebar?.name !== DEFAULT_SIDEBAR.name) && (
                <tunnels.DefaultSidebarTriggerTunnel.Out />
              )}
            {shouldShowStats && (
              <Stats
                app={app}
                onClose={() => {
                  actionManager.executeAction(actionToggleStats);
                }}
                renderCustomStats={renderCustomStats}
              />
            )}
          </div>
        </div>
      </FixedSideContainer>
    );

    if (!renderTopToolbar) {
      return defaultTopToolbar;
    }

    const customTopToolbar = renderTopToolbar({
      ...toolbarContextBase,
      location: device.editor.isMobile ? "mobile-top" : "top",
      defaultUI: defaultTopToolbar,
    });

    return customTopToolbar ?? defaultTopToolbar;
  };

  const renderSidebars = () => {
    return (
      <DefaultSidebar
        __fallback
        onDock={(docked) => {
          trackEvent(
            "sidebar",
            `toggleDock (${docked ? "dock" : "undock"})`,
            `(${device.editor.isMobile ? "mobile" : "desktop"})`,
          );
        }}
      />
    );
  };

  const isSidebarDocked = useAtomValue(isSidebarDockedAtom);

  const mainMenuItemsNode =
    renderMainMenuItems?.({
      defaultItems: defaultMainMenuItemsNode,
      defaultItemOrder,
      defaultItemNodes: defaultMainMenuItemsMap,
      appState,
      actionManager,
      device,
      UIOptions,
    }) ?? defaultMainMenuItemsNode;

  const defaultMainMenuNode = <MainMenu __fallback>{mainMenuItemsNode}</MainMenu>;

  const mainMenuNode =
    renderMainMenu?.({
      defaultMenu: defaultMainMenuNode,
      appState,
      actionManager,
      device,
      UIOptions,
    }) ?? defaultMainMenuNode;

  const layerUIJSX = (
    <>
      {/* ------------------------- tunneled UI ---------------------------- */}
      {/* make sure we render host app components first so that we can detect
          them first on initial render to optimize layout shift */}
      {children}
      {/* render component fallbacks. Can be rendered anywhere as they'll be
          tunneled away. We only render tunneled components that actually
        have defaults when host do not render anything. */}
      {mainMenuNode}
      <DefaultSidebar.Trigger
        __fallback
        icon={LibraryIcon}
        title={capitalizeString(t("toolBar.library"))}
        onToggle={(open) => {
          if (open) {
            trackEvent(
              "sidebar",
              `${DEFAULT_SIDEBAR.name} (open)`,
              `button (${device.editor.isMobile ? "mobile" : "desktop"})`,
            );
          }
        }}
        tab={DEFAULT_SIDEBAR.defaultTab}
      >
        {appState.stylesPanelMode === "full" &&
          appState.width >= MQ_MIN_WIDTH_DESKTOP &&
          t("toolBar.library")}
      </DefaultSidebar.Trigger>
      <DefaultOverwriteConfirmDialog />
      {appState.openDialog?.name === "ttd" && <TTDDialog __fallback />}
      {/* ------------------------------------------------------------------ */}

      {appState.isLoading && <LoadingMessage delay={250} />}
      {appState.errorMessage && (
        <ErrorDialog onClose={() => setAppState({ errorMessage: null })}>
          {appState.errorMessage}
        </ErrorDialog>
      )}
      {eyeDropperState && !device.editor.isMobile && (
        <EyeDropper
          colorPickerType={eyeDropperState.colorPickerType}
          onCancel={() => {
            setEyeDropperState(null);
          }}
          onChange={(colorPickerType, color, selectedElements, { altKey }) => {
            if (
              colorPickerType !== "elementBackground" &&
              colorPickerType !== "elementStroke"
            ) {
              return;
            }

            if (selectedElements.length) {
              for (const element of selectedElements) {
                mutateElement(element, arrayToMap(elements), {
                  [altKey && eyeDropperState.swapPreviewOnAlt
                    ? colorPickerType === "elementBackground"
                      ? "strokeColor"
                      : "backgroundColor"
                    : colorPickerType === "elementBackground"
                    ? "backgroundColor"
                    : "strokeColor"]: color,
                });
                ShapeCache.delete(element);
              }
              app.scene.triggerUpdate();
            } else if (colorPickerType === "elementBackground") {
              setAppState({
                currentItemBackgroundColor: color,
              });
            } else {
              setAppState({ currentItemStrokeColor: color });
            }
          }}
          onSelect={(color, event) => {
            setEyeDropperState((state) => {
              return state?.keepOpenOnAlt && event.altKey ? state : null;
            });
            eyeDropperState?.onSelect?.(color, event);
          }}
        />
      )}
      {appState.openDialog?.name === "help" && (
        <HelpDialog
          onClose={() => {
            setAppState({ openDialog: null });
          }}
        />
      )}
      <ActiveConfirmDialog />
      {appState.openDialog?.name === "elementLinkSelector" && (
        <ElementLinkDialog
          sourceElementId={appState.openDialog.sourceElementId}
          onClose={() => {
            setAppState({
              openDialog: null,
            });
          }}
          scene={app.scene}
          appState={appState}
          generateLinkForSelection={generateLinkForSelection}
        />
      )}
      <tunnels.OverwriteConfirmDialogTunnel.Out />
      {renderImageExportDialog()}
      {renderJSONExportDialog()}
      {appState.pasteDialog.shown && (
        <PasteChartDialog
          setAppState={setAppState}
          appState={appState}
          onClose={() =>
            setAppState({
              pasteDialog: { shown: false, data: null },
            })
          }
        />
      )}
      {device.editor.isMobile && (
        <MobileMenu
          app={app}
          appState={appState}
          elements={elements}
          actionManager={actionManager}
          renderJSONExportDialog={renderJSONExportDialog}
          renderImageExportDialog={renderImageExportDialog}
          setAppState={setAppState}
          onHandToolToggle={onHandToolToggle}
          onPenModeToggle={onPenModeToggle}
          renderTopLeftUI={renderTopLeftUI}
          renderTopRightUI={renderTopRightUI}
          renderSidebars={renderSidebars}
          renderWelcomeScreen={renderWelcomeScreen}
          UIOptions={UIOptions}
          renderTopToolbar={renderTopToolbar}
          renderBottomToolbar={renderBottomToolbar}
          toolbarContext={toolbarContextBase}
          toolbarTopConfig={mobileTopConfig}
          toolbarBottomConfig={mobileBottomConfig}
        />
      )}
      {!device.editor.isMobile && (
        <>
          <div
            className="layer-ui__wrapper"
            style={
              appState.openSidebar &&
              isSidebarDocked &&
              device.editor.canFitSidebar
                ? { width: `calc(100% - var(--right-sidebar-width))` }
                : {}
            }
          >
            {renderWelcomeScreen && <tunnels.WelcomeScreenCenterTunnel.Out />}
            {renderFixedSideContainer()}
            {(() => {
              const defaultFooter = (
                <Footer
                  appState={appState}
                  actionManager={actionManager}
                  showExitZenModeBtn={showExitZenModeBtn}
                  renderWelcomeScreen={renderWelcomeScreen}
                  config={bottomToolbarConfig}
                />
              );

              if (!renderBottomToolbar) {
                return defaultFooter;
              }

              const customFooter = renderBottomToolbar({
                ...toolbarContextBase,
                location: "bottom",
                defaultUI: defaultFooter,
              });

              return customFooter ?? defaultFooter;
            })()}
            {appState.scrolledOutside &&
              isBottomToolbarItemEnabled("scrollToContent") && (
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
          </div>
          {renderSidebars()}
        </>
      )}
    </>
  );

  return (
    <UIAppStateContext.Provider value={appState}>
      <TunnelsJotaiProvider>
        <TunnelsContext.Provider value={tunnels}>
          {layerUIJSX}
        </TunnelsContext.Provider>
      </TunnelsJotaiProvider>
    </UIAppStateContext.Provider>
  );
};

const stripIrrelevantAppStateProps = (appState: AppState): UIAppState => {
  const {
    suggestedBindings,
    startBoundElement,
    cursorButton,
    scrollX,
    scrollY,
    ...ret
  } = appState;
  return ret;
};

const areEqual = (prevProps: LayerUIProps, nextProps: LayerUIProps) => {
  // short-circuit early
  if (prevProps.children !== nextProps.children) {
    return false;
  }

  const { canvas: _pC, appState: prevAppState, ...prev } = prevProps;
  const { canvas: _nC, appState: nextAppState, ...next } = nextProps;

  return (
    isShallowEqual(
      // asserting AppState because we're being passed the whole AppState
      // but resolve to only the UI-relevant props
      stripIrrelevantAppStateProps(prevAppState as AppState),
      stripIrrelevantAppStateProps(nextAppState as AppState),
      {
        selectedElementIds: isShallowEqual,
        selectedGroupIds: isShallowEqual,
      },
    ) && isShallowEqual(prev, next)
  );
};

export default React.memo(LayerUI, areEqual);
