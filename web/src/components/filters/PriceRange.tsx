"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";

interface PriceRangeProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;

  step?: number;
}

const DEFAULT_STEP = 1000;

export function PriceRange({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  step = DEFAULT_STEP,
}: PriceRangeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);
  const localMinRef = useRef(localMin);
  const localMaxRef = useRef(localMax);
  const onChangeRef = useRef(onChange);

  localMinRef.current = localMin;
  localMaxRef.current = localMax;
  onChangeRef.current = onChange;

  useEffect(() => setLocalMin(valueMin), [valueMin]);
  useEffect(() => setLocalMax(valueMax), [valueMax]);

  const range = max - min;
  const minPct = range > 0 ? ((localMin - min) / range) * 100 : 0;
  const maxPct = range > 0 ? ((localMax - min) / range) * 100 : 100;

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const raw = min + ratio * range;
      const snapped = Math.round(raw / step) * step;
      if (dragging === "min") {
        const next = Math.min(snapped, localMaxRef.current - step);
        localMinRef.current = next;
        setLocalMin(next);
      } else {
        const next = Math.max(snapped, localMinRef.current + step);
        localMaxRef.current = next;
        setLocalMax(next);
      }
    };
    const onUp = () => {
      setDragging(null);
      onChangeRef.current(localMinRef.current, localMaxRef.current);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, [dragging, min, range, step]);

  const handleKey = useCallback(
    (which: "min" | "max") => (e: React.KeyboardEvent) => {
      const big = step * 10;
      let nextMin = localMin;
      let nextMax = localMax;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        if (which === "min") nextMin = Math.min(localMax - step, localMin + step);
        else nextMax = Math.max(localMin + step, localMax + step);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        if (which === "min") nextMin = Math.max(min, localMin - step);
        else nextMax = Math.max(localMin + step, localMax - step);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        if (which === "min") nextMin = Math.min(localMax - step, localMin + big);
        else nextMax = Math.min(max, localMax + big);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        if (which === "min") nextMin = Math.max(min, localMin - big);
        else nextMax = Math.max(localMin + step, localMax - big);
      } else if (e.key === "Home") {
        e.preventDefault();
        if (which === "min") nextMin = min;
        else nextMax = localMin + step;
      } else if (e.key === "End") {
        e.preventDefault();
        if (which === "min") nextMin = localMax - step;
        else nextMax = max;
      } else {
        return;
      }
      setLocalMin(nextMin);
      setLocalMax(nextMax);
      onChange(nextMin, nextMax);
    },
    [localMin, localMax, min, max, step, onChange]
  );

  const isAtMin = localMin === min;
  const isAtMax = localMax === max;

  return (
    <div className="px-1 pt-2">
      <div
        ref={trackRef}
        className="relative h-2 cursor-pointer rounded-full bg-foreground/5"
        onPointerDown={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const mid = rect.width / 2;
          const which = x < mid ? "min" : "max";
          setDragging(which);
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const raw = min + ratio * range;
          const snapped = Math.round(raw / step) * step;
          if (which === "min") {
            const next = Math.min(snapped, localMax - step);
            localMinRef.current = next;
            setLocalMin(next);
          } else {
            const next = Math.max(snapped, localMin + step);
            localMaxRef.current = next;
            setLocalMax(next);
          }
        }}
      >
        <div
          className="absolute top-0 h-2 rounded-full bg-accent"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <button
          type="button"
          role="slider"
          aria-label="Precio mínimo"
          aria-valuemin={min}
          aria-valuemax={localMax - step}
          aria-valuenow={localMin}
          aria-valuetext={formatPrice(localMin)}
          onKeyDown={handleKey("min")}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDragging("min");
          }}
          className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-accent bg-card-bg shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
            dragging === "min" ? "scale-125 cursor-grabbing" : "hover:scale-110"
          } ${isAtMin ? "opacity-50" : ""}`}
          style={{ left: `${minPct}%` }}
        />
        <button
          type="button"
          role="slider"
          aria-label="Precio máximo"
          aria-valuemin={localMin + step}
          aria-valuemax={max}
          aria-valuenow={localMax}
          aria-valuetext={formatPrice(localMax)}
          onKeyDown={handleKey("max")}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDragging("max");
          }}
          className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-accent bg-card-bg shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
            dragging === "max" ? "scale-125 cursor-grabbing" : "hover:scale-110"
          } ${isAtMax ? "opacity-50" : ""}`}
          style={{ left: `${maxPct}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-xs tabular-nums text-muted-foreground">
        <span>{formatPrice(localMin)}</span>
        <span>{formatPrice(localMax)}</span>
      </div>
    </div>
  );
}
