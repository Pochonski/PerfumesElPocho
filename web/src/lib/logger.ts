type Scope = string;

export function warn(scope: Scope, err: unknown): void {
  if (typeof console !== "undefined") {
    console.warn("[perfumeselpocho]", scope, err);
  }
}

export function info(scope: Scope, payload?: unknown): void {
  if (typeof console !== "undefined") {
    console.info("[perfumeselpocho]", scope, payload);
  }
}
