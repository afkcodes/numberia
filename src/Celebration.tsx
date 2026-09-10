import { useEffect, useRef } from 'react';

export default function Celebration() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    let frame = 0;
    const tokens = getComputedStyle(document.documentElement);
    const colors = [
      '--color-toy-yellow',
      '--color-orange',
      '--color-dragon',
      '--color-lilac-ink',
      '--color-coral',
      '--color-blue-ink',
    ].map((t) => tokens.getPropertyValue(t).trim());
    const w = window.innerWidth,
      h = window.innerHeight;
    const dpr = Math.min(devicePixelRatio, 2);
    el.width = w * dpr;
    el.height = h * dpr;
    ctx.scale(dpr, dpr);
    const particles = Array.from({ length: 145 }, (_, i) => ({
      x: i % 2 ? -20 : w + 20,
      y: h * 0.65,
      vx: (i % 2 ? 1 : -1) * (4 + Math.random() * 13),
      vy: -8 - Math.random() * 13,
      rotation: Math.random() * 6,
      spin: (Math.random() - 0.5) * 0.2,
      color: colors[i % colors.length],
      size: 5 + Math.random() * 6,
      delay: Math.random() * 35,
      age: 0,
    }));
    let last = performance.now();
    let elapsed = 0;
    const animate = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;
      elapsed += dt;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.age += dt;
        if (p.age < p.delay) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.25 * dt;
        p.vx *= 0.996;
        p.rotation += p.spin * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, (330 - elapsed) / 60);
        if (p.size > 8) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.8);
        ctx.restore();
      }
      if (elapsed < 330) frame = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, w, h);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas className="celebration-confetti" ref={canvas} aria-hidden="true" />;
}
