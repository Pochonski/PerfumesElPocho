"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

const DEFAULT_OPTIONS = {
  lerp: 0.075,
  duration: 1.5,
  smoothWheel: true,
  syncTouch: false,
  syncTouchLerp: 0.075,
};

type LenisOptions = typeof DEFAULT_OPTIONS;

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={DEFAULT_OPTIONS}>
      {children}
    </ReactLenis>
  );
}
