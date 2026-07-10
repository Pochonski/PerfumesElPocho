"use client";

import { useEffect } from "react";
import { SITE } from "@/lib/site";
import { warn } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    warn("global-error-boundary", error);
  }, [error]);

  return (
    <html lang="es-CR">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          margin: 0,
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#080808",
          color: "#f5f5f5",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#c8a84e",
              margin: 0,
            }}
          >
            Error crítico
          </p>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: "1rem 0 0",
              lineHeight: 1.1,
            }}
          >
            Algo <span style={{ color: "#c8a84e" }}>salió muy mal</span>
          </h1>
          <p
            style={{
              marginTop: "1rem",
              color: "#a3a3a3",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            La página tuvo un problema grave. Probá recargar, o escribinos por
            WhatsApp para ayudarte.
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "0.75rem 1.25rem",
                background: "#c8a84e",
                color: "#080808",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              Reintentar
            </button>
            <a
              href={SITE.whatsappHref(
                "Hola! Tuve un problema cargando la página."
              )}
              style={{
                padding: "0.75rem 1.25rem",
                background: "transparent",
                color: "#f5f5f5",
                border: "1px solid #404040",
                borderRadius: "0.75rem",
                fontWeight: 500,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
