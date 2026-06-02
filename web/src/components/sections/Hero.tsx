"use client";

import { useEffect, useRef, useCallback } from "react";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import Button from "@/components/ui/Button";

const PARTICLE_COUNT = 120;

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacityDir: number;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const initializedRef = useRef(false);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5 - 0.3, // bias upward
        opacity: Math.random() * 0.6 + 0.1,
        opacityDir: Math.random() > 0.5 ? 0.003 : -0.003,
      });
    }
    particlesRef.current = particles;
    initializedRef.current = true;
  }, []);

  const draw = useCallback((canvas: HTMLCanvasElement, progress: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Resize internal canvas for DPR
    if (canvas.width !== window.innerWidth * dpr) {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      initializedRef.current = false;
    }

    ctx.scale(dpr, dpr);

    if (!initializedRef.current) {
      initParticles(window.innerWidth, window.innerHeight);
    }

    // Dark background with subtle radial glow
    const glowX = w * 0.5;
    const glowY = h * 0.4;
    const glowRadius = 350 + progress * 200;

    const bgGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
    bgGrad.addColorStop(0, `rgba(200, 168, 78, ${0.08 + progress * 0.12})`);
    bgGrad.addColorStop(0.5, `rgba(200, 168, 78, ${0.03 + progress * 0.05})`);
    bgGrad.addColorStop(1, "rgba(8, 8, 8, 1)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Particles
    const particles = particlesRef.current;
    for (const p of particles) {
      // Move
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += p.opacityDir;

      // Wrap
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
      if (p.opacity > 0.7) p.opacityDir = -0.003;
      if (p.opacity < 0.05) p.opacityDir = 0.003;

      // Draw
      const alpha = p.opacity * (0.6 + progress * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 168, 78, ${alpha})`;
      ctx.fill();

      // Glow for larger particles
      if (p.size > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 168, 78, ${alpha * 0.15})`;
        ctx.fill();
      }
    }

    // Central glow orb
    const orbAlpha = 0.03 + progress * 0.08;
    const orbGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, 180 + progress * 80);
    orbGrad.addColorStop(0, `rgba(200, 168, 78, ${orbAlpha * 2})`);
    orbGrad.addColorStop(0.5, `rgba(200, 168, 78, ${orbAlpha})`);
    orbGrad.addColorStop(1, "rgba(200, 168, 78, 0)");
    ctx.fillStyle = orbGrad;
    ctx.fillRect(0, 0, w, h);

    // Light rays (rotating subtly with progress)
    ctx.save();
    ctx.translate(w * 0.5, h * 0.4);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + progress * 0.3;
      const rayLen = 180 + Math.sin(progress * Math.PI * 2 + i) * 60;
      const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
      rayGrad.addColorStop(0, `rgba(200, 168, 78, ${0.04 + progress * 0.04})`);
      rayGrad.addColorStop(1, "rgba(200, 168, 78, 0)");
      ctx.strokeStyle = rayGrad;
      ctx.lineWidth = 40 + Math.sin(progress * Math.PI + i) * 20;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
      ctx.stroke();
    }
    ctx.restore();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / (sectionHeight - viewportHeight)));
        draw(canvas, progress);
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [draw]);

  return (
    <>
      <div ref={sectionRef} className="scroll-section relative">
        <div className="scroll-sticky">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />

          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="max-w-[900px]">
              <EyebrowBadge>Fragancias Premium</EyebrowBadge>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tighter text-white md:text-6xl lg:text-7xl">
                Descubre{" "}
                <span className="gold-gradient">fragancias</span>
                <br />
                que dejan huella
              </h1>

              <p className="mx-auto mt-6 max-w-[48ch] text-base text-zinc-400 md:text-lg">
                Perfumes originales, árabes y de diseñador. Envíos a todo Costa Rica.
                La esencia que define tu estilo.
              </p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <Button href="#productos" showArrow>
                  Ver Catálogo
                </Button>
                <Button href="#contacto" variant="secondary">
                  Contáctanos
                </Button>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
              <span className="text-[11px] uppercase tracking-[0.2em]">Desliza</span>
              <div className="h-10 w-[1px] bg-gradient-to-b from-zinc-600 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading screen (hidden on mount) */}
      <div id="loading-screen">
        <div className="flex flex-col items-center gap-4">
          <span className="text-2xl font-bold tracking-tighter gold-gradient">
            Perfumes El Pocho
          </span>
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-zinc-800">
            <div
              id="loading-bar"
              className="h-full gold-gradient-bg transition-all duration-300"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Simple preloader
            (function() {
              var bar = document.getElementById('loading-bar');
              if (!bar) return;
              var w = 0;
              var t = setInterval(function() {
                w += Math.random() * 15;
                if (w > 90) w = 90;
                bar.style.width = w + '%';
              }, 150);
              window.addEventListener('load', function() {
                bar.style.width = '100%';
                setTimeout(function() {
                  var screen = document.getElementById('loading-screen');
                  if (screen) screen.classList.add('hidden');
                }, 400);
                clearInterval(t);
              });
            })();
          `,
        }}
      />
    </>
  );
}
