"use client";

import { useState } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import { CaretDown } from "@phosphor-icons/react";

const faqs = [
  {
    q: "¿Los perfumes son originales?",
    a: "Sí, 100% originales. Trabajamos con distribuidores autorizados. Cada perfume viene en su empaque original sellado. No trabajamos con réplicas ni imitaciones.",
  },
  {
    q: "¿Cómo realizo un pedido?",
    a: "Es muy fácil: navegá el catálogo, encontrá el perfume que te gusta, y dale al botón de WhatsApp. Ahí te atendemos personalmente, coordinamos el pago y el envío.",
  },
  {
    q: "¿Cuánto tarda el envío?",
    a: "Entregamos en 24 a 48 horas hábiles a todo Costa Rica. Una vez coordinado el pedido por WhatsApp, te damos seguimiento hasta que llegue a tu puerta.",
  },
  {
    q: "¿Cómo puedo pagar?",
    a: "Aceptamos transferencia bancaria (SINPE móvil) y depósito. Coordinamos todo por WhatsApp para tu comodidad.",
  },
  {
    q: "¿Qué pasa si el perfume que busco no está en el catálogo?",
    a: "Escribinos por WhatsApp. Si no lo tenemos en catálogo, podemos conseguirlo con nuestros distribuidores. Hacemos todo lo posible por traerte la fragancia que buscás.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-[800px]">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Preguntas Frecuentes</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] md:text-5xl">
            ¿Tenés dudas?
          </h2>
          <p className="max-w-[48ch] text-[color:var(--muted-foreground)]">
            Acá respondemos las preguntas más comunes. Si no encontrás lo que
            buscás, escribinos por WhatsApp.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="card-surface overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggle(i)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-sm font-semibold text-[color:var(--subtle-foreground)]">
                  {faq.q}
                </span>
                <CaretDown
                  size={18}
                  weight="bold"
                  className={`shrink-0 text-[color:var(--muted-foreground)] transition-transform duration-300 ${
                    openIndex === i ? "rotate-180 text-[#c8a84e]" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96 pb-5" : "max-h-0"
                }`}
              >
                <p className="px-6 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
