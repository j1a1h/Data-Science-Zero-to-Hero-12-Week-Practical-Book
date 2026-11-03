import { useEffect, useMemo, useRef } from 'react';

export function Confetti() {
  const items = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      dur: 2.5 + Math.random() * 2.5,
      size: 6 + Math.random() * 8,
      color: ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa'][i % 6],
      round: i % 3 === 0,
    })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {items.map((c, i) => (
        <span key={i} style={{ left: `${c.left}%`, width: c.size, height: c.size * (c.round ? 1 : 0.5), background: c.color, borderRadius: c.round ? '50%' : 2, animation: `fall ${c.dur}s ${c.delay}s linear both`, position: 'absolute', top: 0 }} />
      ))}
    </div>
  );
}

/** Animated neural-network / data-points particle background */
export function NetworkBg({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let w = 0, h = 0, raf = 0;
    const mouse = { x: -999, y: -999 };
    const resize = () => { const r = cv.getBoundingClientRect(); w = cv.width = r.width * devicePixelRatio; h = cv.height = r.height * devicePixelRatio; };
    resize();
    const N = 70;
    const pts = Array.from({ length: N }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, c: Math.random() }));
    const onMove = (e: MouseEvent) => { const r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * devicePixelRatio; mouse.y = (e.clientY - r.top) * devicePixelRatio; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', resize);
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      const D = 150 * devicePixelRatio;
      for (const p of pts) {
        p.x += p.vx * devicePixelRatio; p.y += p.vy * devicePixelRatio;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < D) { ctx.strokeStyle = `rgba(103,232,249,${(1 - d / D) * 0.35})`; ctx.lineWidth = devicePixelRatio; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
        }
        const dm = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
        if (dm < D * 1.3) { ctx.strokeStyle = `rgba(244,114,182,${(1 - dm / (D * 1.3)) * 0.6})`; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
      for (const p of pts) { ctx.fillStyle = p.c > 0.66 ? '#a78bfa' : p.c > 0.33 ? '#22d3ee' : '#f472b6'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.5 * devicePixelRatio, 0, 7); ctx.fill(); }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className={'h-full w-full ' + className} />;
}

/** Typing animation cycling through code lines */
export function Typewriter({ lines }: { lines: string[] }) {
  const [state, setState] = useTypewriter(lines);
  void setState;
  return <span className="cursor">{state}</span>;
}

import { useState } from 'react';
function useTypewriter(lines: string[]): [string, () => void] {
  const [txt, setTxt] = useState('');
  useEffect(() => {
    let li = 0, ci = 0, del = false, t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const line = lines[li];
      if (!del) { ci++; setTxt(line.slice(0, ci)); if (ci === line.length) { del = true; t = setTimeout(tick, 1500); return; } }
      else { ci -= 2; if (ci <= 0) { ci = 0; del = false; li = (li + 1) % lines.length; } setTxt(line.slice(0, Math.max(ci, 0))); }
      t = setTimeout(tick, del ? 18 : 55);
    };
    t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, [lines]);
  return [txt, () => undefined];
}

/** Count-up number */
export function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const f = (t: number) => { const k = Math.min(1, (t - t0) / 1200); setV(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v}{suffix}</>;
}
