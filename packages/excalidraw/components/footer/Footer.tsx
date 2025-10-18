import clsx from "clsx";

import { actionShortcuts } from "../../actions";
import { useTunnels } from "../../context/tunnels";
import { ExitZenModeAction, UndoRedoActions, ZoomActions } from "../Actions";
import { HelpButton } from "../HelpButton";
import { Section } from "../Section";
import Stack from "../Stack";

import type { ActionManager } from "../../actions/manager";
import type {
  UIAppState,
  ToolbarSlotConfig,
  DesktopBottomToolbarItem,
} from "../../types";

const Footer = ({
  appState,
  actionManager,
  showExitZenModeBtn,
  renderWelcomeScreen,
  config,
}: {
  appState: UIAppState;
  actionManager: ActionManager;
  showExitZenModeBtn: boolean;
  renderWelcomeScreen: boolean;
  config?: ToolbarSlotConfig<DesktopBottomToolbarItem>;
}) => {
  const { FooterCenterTunnel, WelcomeScreenHelpHintTunnel } = useTunnels();

  const isItemEnabled = (item: DesktopBottomToolbarItem) =>
    config?.items?.[item] ?? true;

  const showZoomActions = isItemEnabled("zoomActions");
  const showUndoRedoActions =
    isItemEnabled("undoRedoActions") && !appState.viewModeEnabled;
  const showHelpButton = isItemEnabled("helpButton");
  const showExitButton = isItemEnabled("exitZenMode") && showExitZenModeBtn;

  return (
    <footer
      role="contentinfo"
      className="layer-ui__wrapper__footer App-menu App-menu_bottom"
    >
      {config?.prepend}
      <div
        className={clsx("layer-ui__wrapper__footer-left zen-mode-transition", {
          "layer-ui__wrapper__footer-left--transition-left":
            appState.zenModeEnabled,
        })}
      >
        {(showZoomActions || showUndoRedoActions) && (
          <Stack.Col gap={2}>
            <Section heading="canvasActions">
              {showZoomActions && (
                <ZoomActions
                  renderAction={actionManager.renderAction}
                  zoom={appState.zoom}
                />
              )}

              {showUndoRedoActions && (
                <UndoRedoActions
                  renderAction={actionManager.renderAction}
                  className={clsx("zen-mode-transition", {
                    "layer-ui__wrapper__footer-left--transition-bottom":
                      appState.zenModeEnabled,
                  })}
                />
              )}
            </Section>
          </Stack.Col>
        )}
      </div>
      <FooterCenterTunnel.Out />
      <div
        className={clsx("layer-ui__wrapper__footer-right zen-mode-transition", {
          "transition-right": appState.zenModeEnabled,
        })}
      >
        {(renderWelcomeScreen || showHelpButton) && (
          <div style={{ position: "relative" }}>
            {renderWelcomeScreen && <WelcomeScreenHelpHintTunnel.Out />}
            {showHelpButton && (
              <HelpButton
                onClick={() => actionManager.executeAction(actionShortcuts)}
              />
            )}
          </div>
        )}
      </div>
      {config?.append}
      {showExitButton && (
        <ExitZenModeAction
          actionManager={actionManager}
          showExitZenModeBtn={showExitButton}
        />
      )}
    </footer>
  );
};

export default Footer;
Footer.displayName = "Footer";
