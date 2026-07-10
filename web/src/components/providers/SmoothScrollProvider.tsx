"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

const DEFAULT_OPTIONS = {
  lerp: 0.075,
  duration: 1.5,
  smoothWheel: true,
  syncTouch: true,
};

const SAFARI_OPTIONS = {
  lerp: 0.1,
  duration: 1.2,
  smoothWheel: true,
  syncTouch: false,
};

type LenisOptions = typeof DEFAULT_OPTIONS;

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<LenisOptions>(DEFAULT_OPTIONS);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setOptions(isSafari ? SAFARI_OPTIONS : DEFAULT_OPTIONS);
  }, []);

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
