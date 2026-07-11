"use client";

import { useEffect } from "react";

export default function ScrollLockGuard() {
  useEffect(() => {
    const reset = () => {
      const body = document.body;
      const html = document.documentElement;
      if (
        body.style.position === "fixed" ||
        body.style.overflow === "hidden" ||
        html.style.overflow === "hidden"
      ) {
        const y = parseInt(body.style.top || "0", 10) * -1;
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        body.style.overflow = "";
        html.style.overflow = "";
        if (y) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
    };

    reset();

    const onPageShow = () => reset();
    const onVisibility = () => {
      if (document.visibilityState === "visible") reset();
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}