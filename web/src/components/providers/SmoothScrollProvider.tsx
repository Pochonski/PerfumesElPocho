"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

const isSafari = typeof window !== "undefined"
  ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  : false;

const options = isSafari
  ? {
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
    }
  : {
      lerp: 0.075,
      duration: 1.5,
      smoothWheel: true,
      syncTouch: true,
    };

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
