import Trans from "./Trans";
import { useRemoteConfig } from "../context/RemoteConfigContext";

const BraveMeasureTextError = () => {
  const { helpLinks, socialLinks } = useRemoteConfig();
  return (
    <div data-testid="brave-measure-text-error">
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line1"
          bold={(el) => <span style={{ fontWeight: 600 }}>{el}</span>}
        />
      </p>
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line2"
          bold={(el) => <span style={{ fontWeight: 600 }}>{el}</span>}
        />
      </p>
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line3"
          link={(el) =>
            helpLinks.documentation ? (
              <a href={helpLinks.documentation}>{el}</a>
            ) : (
              el
            )
          }
        />
      </p>
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line4"
          issueLink={(el) =>
            helpLinks.github ? <a href={helpLinks.github}>{el}</a> : el
          }
          discordLink={(el) =>
            socialLinks.discord ? <a href={socialLinks.discord}>{el}.</a> : el
          }
        />
      </p>
    </div>
  );
};

export default BraveMeasureTextError;
