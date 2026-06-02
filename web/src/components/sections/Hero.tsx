"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import Button from "@/components/ui/Button";

const PARTICLE_COUNT = 100;
const HERO_BOTTLE =
  "https://3pspglobal.s3.us-east-2.amazonaws.com/assets/images/hombre/1-million-night-elixir-hombre-100ml-perfume-paco-rabanne.png";

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
  const bottleRef = useRef<HTMLDivElement>(null);
  const tickingRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const initializedRef = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5 - 0.3,
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

    // Dark bg with radial glow
    const glowX = w * 0.5;
    const glowY = h * 0.45;
    const glowRadius = 300 + progress * 150;

    const bgGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
    bgGrad.addColorStop(0, `rgba(200, 168, 78, ${0.06 + progress * 0.1})`);
    bgGrad.addColorStop(0.5, `rgba(200, 168, 78, ${0.02 + progress * 0.04})`);
    bgGrad.addColorStop(1, "rgba(8, 8, 8, 1)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Particles
    const particles = particlesRef.current;
    for (const p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += p.opacityDir;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
      if (p.opacity > 0.7) p.opacityDir = -0.003;
      if (p.opacity < 0.05) p.opacityDir = 0.003;

      const alpha = p.opacity * (0.5 + progress * 0.5);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 168, 78, ${alpha})`;
      ctx.fill();

      if (p.size > 1.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 168, 78, ${alpha * 0.12})`;
        ctx.fill();
      }
    }

    // Central orb
    const orbAlpha = 0.03 + progress * 0.06;
    const orbGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, 160 + progress * 60);
    orbGrad.addColorStop(0, `rgba(200, 168, 78, ${orbAlpha * 2})`);
    orbGrad.addColorStop(0.5, `rgba(200, 168, 78, ${orbAlpha})`);
    orbGrad.addColorStop(1, "rgba(200, 168, 78, 0)");
    ctx.fillStyle = orbGrad;
    ctx.fillRect(0, 0, w, h);

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
        setScrollProgress(progress);
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
          {/* Canvas Background */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          />

          {/* Main Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 md:px-8">
              {/* Left: Text */}
              <div className="text-center md:text-left">
                <EyebrowBadge>Fragancias Premium</EyebrowBadge>

                <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tighter text-white md:text-5xl lg:text-6xl xl:text-7xl">
                  Descubre{" "}
                  <span className="gold-gradient">fragancias</span>
                  <br />
                  que dejan huella
                </h1>

                <p className="mx-auto mt-6 max-w-[42ch] text-base leading-relaxed text-zinc-400 md:mx-0 md:text-lg">
                  Más de 4,000 perfumes originales, árabes y de diseñador.
                  Envíos a todo Costa Rica en 24-48 horas.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  <Button href="#productos" showArrow>
                    Ver Catálogo
                  </Button>
                  <Button
                    href="https://wa.me/50664779672"
                    variant="secondary"
                  >
                    Contáctanos
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600 md:justify-start">
                  <span>🚚 Envíos 24-48h</span>
                  <span>✅ 100% Original</span>
                  <span>🇨🇷 Todo Costa Rica</span>
                </div>
              </div>

              {/* Right: Floating Bottle */}
              <div
                ref={bottleRef}
                className="relative flex items-center justify-center"
                style={{
                  transform: `translateY(${-scrollProgress * 30}px) scale(${1 + scrollProgress * 0.05})`,
                  opacity: 1 - scrollProgress * 0.5,
                  transition: "opacity 0.1s linear",
                }}
              >
                {/* Glow behind bottle */}
                <div className="absolute h-64 w-64 rounded-full bg-[#c8a84e]/10 blur-3xl animate-pulse" />

                {/* Floating animation wrapper */}
                <div className="animate-float relative h-[350px] w-[350px] md:h-[450px] md:w-[450px]">
                  <Image
                    src={HERO_BOTTLE}
                    alt="Perfume Premium"
                    fill
                    sizes="(max-width: 768px) 350px, 450px"
                    className="object-contain drop-shadow-[0_20px_40px_rgba(200,168,78,0.15)]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600"
            style={{ opacity: 1 - scrollProgress * 2 }}
          >
            <span className="text-[11px] uppercase tracking-[0.2em]">Desliza</span>
            <div className="h-10 w-[1px] bg-gradient-to-b from-zinc-600 to-transparent" />
          </div>
        </div>
      </div>

      {/* Loading Screen */}
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
