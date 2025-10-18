export interface TelemetryEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

type TelemetryHandler = ((event: TelemetryEvent) => void) | null;

let telemetryHandler: TelemetryHandler = null;

export const setTelemetryHandler = (handler: TelemetryHandler) => {
  telemetryHandler = handler;
};

export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number,
) => {
  telemetryHandler?.({ category, action, label, value });
};
