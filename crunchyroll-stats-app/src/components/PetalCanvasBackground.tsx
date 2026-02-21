'use client';

import { useEffect, useRef } from 'react';

type Petal = {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  sway: number;
  swaySpeed: number;
  swayOffset: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  colorIndex: number;
};

const PETAL_COUNT = 60;

const LIGHT_COLORS = [
  '255, 188, 214',
  '255, 168, 199',
  '255, 133, 181',
  '255, 106, 0',
];

const DARK_COLORS = [
  '255, 177, 205',
  '255, 144, 188',
  '255, 106, 0',
  '255, 124, 36',
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createPetal(width: number, height: number, spawnAbove = false): Petal {
  return {
    x: randomBetween(0, width),
    y: spawnAbove ? randomBetween(-height, -20) : randomBetween(0, height),
    size: randomBetween(8, 16),
    speedY: randomBetween(0.45, 1.35),
    driftX: randomBetween(-0.25, 0.25),
    sway: randomBetween(8, 24),
    swaySpeed: randomBetween(0.6, 1.4),
    swayOffset: randomBetween(0, Math.PI * 2),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.02, 0.02),
    opacity: randomBetween(0.22, 0.58),
    colorIndex: Math.floor(randomBetween(0, 4)),
  };
}

export function PetalCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;
    let isDark = document.documentElement.classList.contains('dark');
    const petals: Petal[] = [];

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawPetal = (petal: Petal, timeInSeconds: number) => {
      const swayShift = Math.sin(timeInSeconds * petal.swaySpeed + petal.swayOffset) * petal.sway;
      const drawX = petal.x + swayShift;
      const drawY = petal.y;
      const color = isDark ? DARK_COLORS[petal.colorIndex] : LIGHT_COLORS[petal.colorIndex];
      const alpha = isDark ? petal.opacity * 0.85 : petal.opacity;

      context.save();
      context.translate(drawX, drawY);
      context.rotate(petal.rotation);
      context.scale(1, 0.72);

      context.beginPath();
      context.moveTo(0, -petal.size);
      context.quadraticCurveTo(petal.size * 0.9, -petal.size * 0.4, 0, petal.size);
      context.quadraticCurveTo(-petal.size * 0.9, -petal.size * 0.4, 0, -petal.size);
      context.closePath();

      context.fillStyle = `rgba(${color}, ${alpha})`;
      context.fill();
      context.restore();
    };

    const updatePetal = (petal: Petal) => {
      petal.y += petal.speedY;
      petal.x += petal.driftX;
      petal.rotation += petal.rotationSpeed;

      if (petal.y > height + petal.size * 2 || petal.x < -80 || petal.x > width + 80) {
        Object.assign(petal, createPetal(width, height, true));
      }
    };

    const animate = (time: number) => {
      const seconds = time * 0.001;
      context.clearRect(0, 0, width, height);

      for (const petal of petals) {
        drawPetal(petal, seconds);
        updatePetal(petal);
      }

      frameId = window.requestAnimationFrame(animate);
    };

    resizeCanvas();
    for (let i = 0; i < PETAL_COUNT; i += 1) {
      petals.push(createPetal(width, height));
    }

    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    frameId = window.requestAnimationFrame(animate);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-55"
    />
  );
}
