import type { Scene, Store } from "ex-excalidraw-element";
import type { ExcalidrawElement } from "ex-excalidraw-element/types";
import type App from "./components/App";
import type { History } from "./history";
import type { AppState } from "./types";

declare global {
  interface Window {
    h: {
      scene: Scene;
      elements: readonly ExcalidrawElement[];
      state: AppState;
      setState: import("react").Component<any, AppState>["setState"];
      app: App;
      history: History;
      store: Store;
    };
  }
}

export {};
