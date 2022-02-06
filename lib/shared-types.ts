type AsyncServiceStateValue =
  | "stopped"
  | "starting"
  | "started"
  | "stopping"
  | "error";

export type AsyncServiceState =
  | {
      value: Exclude<AsyncServiceStateValue, "error">;
    }
  | {
      value: "error";
      error: Error;
    };
