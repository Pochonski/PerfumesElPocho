"use client";

import { useEffect } from "react";

export default function HeaderHeightSync() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header[data-fixed-header]");
    if (!header) return;

    const update = () => {
      const rect = header.getBoundingClientRect();
      const h = Math.ceil(rect.height);
      document.documentElement.style.setProperty("--real-header-h", `${h}px`);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(header);

    const onScroll = () => {
      if (header.getBoundingClientRect().top !== 0) return;
      update();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return null;
}
