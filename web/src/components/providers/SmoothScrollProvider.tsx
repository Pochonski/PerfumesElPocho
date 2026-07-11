"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

const LENIS_OPTIONS = {
  lerp: 0.075,
  duration: 1.5,
  smoothWheel: true,
  syncTouch: false,
  syncTouchLerp: 0.075,
  allowNestedScroll: true,
};

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
