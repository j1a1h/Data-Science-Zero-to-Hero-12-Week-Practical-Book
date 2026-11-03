import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

function Card({ title, icon, children, hint }: { title: string; icon: string; children: ReactNode; hint?: string }) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 shadow-xl shadow-cyan-900/10">
      <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-5 py-3">
        <span className="anim-float text-2xl">{icon}</span>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">Interactive lab</div>
          <div className="font-semibold text-white">{title}</div>
        </div>
      </div>
      <div className="p-5">{children}</div>
      {hint && <div className="border-t border-slate-800 bg-slate-950/50 px-5 py-2.5 text-xs text-slate-400">💬 {hint}</div>}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <label className="block text-sm text-slate-300">
      <div className="mb-1 flex justify-between"><span>{label}</span><span className="font-mono text-cyan-300">{fmt ? fmt(value) : value}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full accent-cyan-400" />
    </label>
  );
}

const Btn = ({ onClick, children, tone = 'cyan' }: { onClick: () => void; children: ReactNode; tone?: 'cyan' | 'slate' }) => (
  <button onClick={onClick} className={'rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-95 ' + (tone === 'cyan' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110' : 'border border-slate-600 text-slate-200 hover:border-cyan-400')}>{children}</button>
);

// seeded random
function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
}

/* ---------------- Gradient descent ---------------- */
function Gradient() {
  const [lr, setLr] = useState(0.15);
  const [start, setStart] = useState(9);
  const [path, setPath] = useState<number[]>([9]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setPath((p) => {
        const w = p[p.length - 1];
        const nw = w - lr * 2 * (w - 3);
        if (p.length > 40 || Math.abs(nw) > 60) { setRunning(false); return p; }
        return [...p, nw];
      });
    }, 350);
    return () => clearInterval(id);
  }, [running, lr]);

  const W = 520, H = 220, x0 = -3, x1 = 11;
  const sx = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const f = (x: number) => (x - 3) ** 2;
  const sy = (y: number) => H - 20 - Math.min(y, 80) * 2.2;
  const curve = Array.from({ length: 80 }, (_, i) => { const x = x0 + (i / 79) * (x1 - x0); return `${i ? 'L' : 'M'}${sx(x)},${sy(f(x))}`; }).join(' ');
  const w = path[path.length - 1];
  const diverged = Math.abs(w - 3) > 12;

  return (
    <Card icon="🎯" title="Gradient Descent: the ball rolls downhill" hint="Try lr = 0.05 (slow), 0.5 (perfect jump), 1.05 (explodes).">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-slate-950/70">
        <path d={curve} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        <line x1={sx(3)} x2={sx(3)} y1="0" y2={H} stroke="#34d399" strokeDasharray="4 4" opacity=".5" />
        <text x={sx(3) + 5} y="14" fill="#34d399" fontSize="11">minimum w = 3</text>
        {path.map((pw, i) => i > 0 && (
          <line key={'l' + i} x1={sx(path[i - 1])} y1={sy(f(path[i - 1]))} x2={sx(pw)} y2={sy(f(pw))} stroke="#f472b6" strokeWidth="1.5" opacity=".7" />
        ))}
        {path.map((pw, i) => <circle key={i} cx={sx(pw)} cy={sy(f(pw))} r={i === path.length - 1 ? 7 : 3} fill={i === path.length - 1 ? '#fbbf24' : '#f472b6'} style={{ transition: 'all .3s' }} />)}
      </svg>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Learning rate" value={lr} min={0.01} max={1.1} step={0.01} onChange={setLr} />
        <Slider label="Start w" value={start} min={-2} max={10} step={0.5} onChange={(v) => { setStart(v); setPath([v]); setRunning(false); }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn onClick={() => { setPath([start]); setRunning(true); }}>▶ Run</Btn>
        <Btn tone="slate" onClick={() => { setRunning(false); setPath([start]); }}>Reset</Btn>
        <div className="ml-auto font-mono text-sm text-slate-300">step {path.length - 1} · w = <span className="text-amber-300">{w.toFixed(3)}</span> · loss = {f(w).toFixed(3)}</div>
      </div>
      {diverged && <div className="anim-shake mt-3 rounded-lg bg-rose-500/15 p-3 text-sm text-rose-200">💥 Learning rate too high! The steps overshoot and the loss grows.</div>}
    </Card>
  );
}

/* ---------------- Threshold ---------------- */
function Threshold() {
  const [t, setT] = useState(0.5);
  const data = useMemo(() => {
    const r = mulberry(7);
    const arr: { s: number; y: number }[] = [];
    for (let i = 0; i < 300; i++) arr.push({ y: 0, s: Math.min(0.99, Math.max(0.01, 0.3 + gauss(r) * 0.17)) });
    for (let i = 0; i < 100; i++) arr.push({ y: 1, s: Math.min(0.99, Math.max(0.01, 0.68 + gauss(r) * 0.18)) });
    return arr;
  }, []);
  let tp = 0, fp = 0, fn = 0, tn = 0;
  data.forEach((d) => { const pred = d.s >= t ? 1 : 0; if (d.y && pred) tp++; else if (!d.y && pred) fp++; else if (d.y && !pred) fn++; else tn++; });
  const prec = tp + fp ? tp / (tp + fp) : 1, rec = tp / (tp + fn), f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0;
  const bins = 20;
  const h0 = Array(bins).fill(0), h1 = Array(bins).fill(0);
  data.forEach((d) => (d.y ? h1 : h0)[Math.min(bins - 1, Math.floor(d.s * bins))]++);
  const max = Math.max(...h0, ...h1);
  const bar = (label: string, v: number, c: string) => (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-300"><span>{label}</span><span className="font-mono">{(v * 100).toFixed(0)}%</span></div>
      <div className="h-2.5 rounded-full bg-slate-800"><div className={`h-full rounded-full ${c} transition-all duration-300`} style={{ width: `${v * 100}%` }} /></div>
    </div>
  );
  return (
    <Card icon="🎚️" title="Move the decision threshold" hint="Lower threshold → higher recall, lower precision. Pick by the cost of each mistake.">
      <div className="relative flex h-32 items-end gap-0.5 rounded-lg bg-slate-950/70 p-2">
        {h0.map((_, i) => (
          <div key={i} className="relative flex h-full flex-1 items-end">
            <div className="absolute bottom-0 w-full rounded-t bg-sky-400/70" style={{ height: `${(h0[i] / max) * 100}%` }} />
            <div className="absolute bottom-0 w-full rounded-t bg-rose-400/70 mix-blend-screen" style={{ height: `${(h1[i] / max) * 100}%` }} />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-amber-300 transition-all" style={{ left: `calc(0.5rem + (100% - 1rem) * ${t})` }} />
      </div>
      <div className="mt-1 flex gap-4 text-xs text-slate-400"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />Negative (300)</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-400" />Positive (100)</span></div>
      <div className="mt-4"><Slider label="Threshold" value={t} min={0.05} max={0.95} step={0.01} onChange={setT} fmt={(v) => v.toFixed(2)} /></div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="rounded-lg bg-emerald-500/20 p-3"><div className="text-xs text-emerald-300">True Positive</div><div className="text-2xl font-bold">{tp}</div></div>
          <div className="rounded-lg bg-rose-500/20 p-3"><div className="text-xs text-rose-300">False Negative</div><div className="text-2xl font-bold">{fn}</div></div>
          <div className="rounded-lg bg-amber-500/20 p-3"><div className="text-xs text-amber-300">False Positive</div><div className="text-2xl font-bold">{fp}</div></div>
          <div className="rounded-lg bg-sky-500/20 p-3"><div className="text-xs text-sky-300">True Negative</div><div className="text-2xl font-bold">{tn}</div></div>
        </div>
        <div className="space-y-3">{bar('Precision', prec, 'bg-cyan-400')}{bar('Recall', rec, 'bg-fuchsia-400')}{bar('F1', f1, 'bg-amber-400')}{bar('Accuracy', (tp + tn) / data.length, 'bg-emerald-400')}</div>
      </div>
    </Card>
  );
}

/* ---------------- K-Means ---------------- */
type Pt = { x: number; y: number };
function KMeansLab() {
  const pts = useMemo<Pt[]>(() => {
    const r = mulberry(11);
    const centers = [[0.22, 0.3], [0.7, 0.28], [0.5, 0.78]];
    const out: Pt[] = [];
    centers.forEach(([cx, cy]) => { for (let i = 0; i < 45; i++) out.push({ x: cx + gauss(r) * 0.07, y: cy + gauss(r) * 0.07 }); });
    return out;
  }, []);
  const [k, setK] = useState(3);
  const [seed, setSeed] = useState(1);
  const initCent = (kk: number, sd: number) => { const r = mulberry(sd * 97); return Array.from({ length: kk }, () => ({ ...pts[Math.floor(r() * pts.length)] })); };
  const [cent, setCent] = useState<Pt[]>(() => initCent(3, 1));
  const [labels, setLabels] = useState<number[]>(() => pts.map(() => -1));
  const [phase, setPhase] = useState<'assign' | 'update'>('assign');
  const [auto, setAuto] = useState(false);
  const [iter, setIter] = useState(0);
  const colors = ['#22d3ee', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#fb923c', '#60a5fa'];

  const reset = (kk = k, sd = seed) => { setCent(initCent(kk, sd)); setLabels(pts.map(() => -1)); setPhase('assign'); setIter(0); setAuto(false); };
  const step = () => {
    if (phase === 'assign') {
      setLabels(pts.map((p) => { let b = 0, bd = 1e9; cent.forEach((c, i) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; b = i; } }); return b; }));
      setPhase('update');
    } else {
      setCent(cent.map((c, i) => { const m = pts.filter((_, j) => labels[j] === i); return m.length ? { x: m.reduce((a, p) => a + p.x, 0) / m.length, y: m.reduce((a, p) => a + p.y, 0) / m.length } : c; }));
      setPhase('assign'); setIter((n) => n + 1);
    }
  };
  const stepRef = useRef(step); stepRef.current = step;
  useEffect(() => { if (!auto) return; const id = setInterval(() => { if (iter >= 12) setAuto(false); else stepRef.current(); }, 600); return () => clearInterval(id); }, [auto, iter]);

  return (
    <Card icon="🔵" title="K-Means: assign → move → repeat" hint="Next step: ASSIGN each point to the nearest centroid, then UPDATE the centroid to the mean of its points.">
      <svg viewBox="0 0 400 300" className="w-full rounded-lg bg-slate-950/70">
        {pts.map((p, i) => <circle key={i} cx={p.x * 400} cy={p.y * 300} r="4" fill={labels[i] >= 0 ? colors[labels[i] % 7] : '#64748b'} opacity=".85" style={{ transition: 'fill .4s' }} />)}
        {cent.map((c, i) => <g key={i} style={{ transform: `translate(${c.x * 400}px, ${c.y * 300}px)`, transition: 'transform .5s ease' }}><circle r="11" fill={colors[i % 7]} stroke="#fff" strokeWidth="2.5" /><text y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#020617">{i + 1}</text></g>)}
      </svg>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="k (clusters)" value={k} min={2} max={6} step={1} onChange={(v) => { setK(v); reset(v, seed); }} />
        <div className="flex items-end gap-2 text-sm text-slate-300">Iteration <b className="font-mono text-cyan-300">{iter}</b> · next: <b className="text-amber-300">{phase === 'assign' ? 'assign points' : 'move centroids'}</b></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Btn onClick={step}>Step ⏭</Btn>
        <Btn onClick={() => setAuto((a) => !a)} tone="slate">{auto ? '⏸ Pause' : '▶ Auto-run'}</Btn>
        <Btn tone="slate" onClick={() => { const s = seed + 1; setSeed(s); reset(k, s); }}>🎲 New start</Btn>
      </div>
    </Card>
  );
}

/* ---------------- Overfitting ---------------- */
function solve(A: number[][], b: number[]) {
  const n = b.length; const M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = i + 1; r < n; r++) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
  return x;
}
function polyfit(xs: number[], ys: number[], d: number) {
  const n = d + 1; const A = Array.from({ length: n }, () => Array(n).fill(0)); const b = Array(n).fill(0);
  xs.forEach((x, k) => { for (let i = 0; i < n; i++) { b[i] += ys[k] * x ** i; for (let j = 0; j < n; j++) A[i][j] += x ** (i + j); } });
  for (let i = 0; i < n; i++) A[i][i] += 1e-8;
  return solve(A, b);
}
const peval = (c: number[], x: number) => c.reduce((a, v, i) => a + v * x ** i, 0);

function Overfit() {
  const [deg, setDeg] = useState(1);
  const { tr, te } = useMemo(() => {
    const r = mulberry(5); const truth = (x: number) => Math.sin(2.2 * x);
    const mk = (n: number) => Array.from({ length: n }, () => { const x = r() * 2 - 1; return { x, y: truth(x) + gauss(r) * 0.2 }; });
    return { tr: mk(14), te: mk(60) };
  }, []);
  const errs = useMemo(() => Array.from({ length: 10 }, (_, i) => {
    const c = polyfit(tr.map((p) => p.x), tr.map((p) => p.y), i + 1);
    const mse = (s: { x: number; y: number }[]) => s.reduce((a, p) => a + (peval(c, p.x) - p.y) ** 2, 0) / s.length;
    return { d: i + 1, tr: mse(tr), te: mse(te) };
  }), [tr, te]);
  const c = polyfit(tr.map((p) => p.x), tr.map((p) => p.y), deg);
  const X = (x: number) => ((x + 1) / 2) * 400, Y = (y: number) => 110 - Math.max(-2.5, Math.min(2.5, y)) * 40;
  const line = Array.from({ length: 100 }, (_, i) => { const x = -1 + (i / 99) * 2; return `${i ? 'L' : 'M'}${X(x)},${Y(peval(c, x))}`; }).join(' ');
  const e = errs[deg - 1];
  const best = errs.reduce((a, b) => (b.te < a.te ? b : a)).d;
  const maxE = Math.min(0.6, Math.max(...errs.map((x) => x.te)));
  const verdict = deg < best - 1 ? ['Underfitting', 'text-sky-300'] : deg > best + 1 ? ['Overfitting', 'text-rose-300'] : ['Good fit', 'text-emerald-300'];
  return (
    <Card icon="🎢" title="Underfit → Good fit → Overfit" hint="Training error always falls with more complexity. Test error falls, then rises. That U-shape is the bias-variance trade-off.">
      <div className="grid gap-4 md:grid-cols-2">
        <svg viewBox="0 0 400 220" className="w-full rounded-lg bg-slate-950/70">
          <path d={Array.from({ length: 100 }, (_, i) => { const x = -1 + (i / 99) * 2; return `${i ? 'L' : 'M'}${X(x)},${Y(Math.sin(2.2 * x))}`; }).join(' ')} stroke="#34d399" strokeDasharray="4 4" fill="none" opacity=".6" />
          {te.map((p, i) => <circle key={'t' + i} cx={X(p.x)} cy={Y(p.y)} r="2" fill="#64748b" opacity=".6" />)}
          {tr.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r="4.5" fill="#fbbf24" />)}
          <path d={line} stroke="#f472b6" strokeWidth="3" fill="none" style={{ transition: 'd .3s' }} />
        </svg>
        <svg viewBox="0 0 400 220" className="w-full rounded-lg bg-slate-950/70">
          {(['tr', 'te'] as const).map((k2) => (
            <polyline key={k2} fill="none" strokeWidth="3" stroke={k2 === 'tr' ? '#fbbf24' : '#22d3ee'} points={errs.map((x) => `${30 + (x.d - 1) * 38},${200 - Math.min(x[k2] / maxE, 1) * 180}`).join(' ')} />
          ))}
          <circle cx={30 + (deg - 1) * 38} cy={200 - Math.min(e.te / maxE, 1) * 180} r="6" fill="#22d3ee" stroke="#fff" />
          <circle cx={30 + (deg - 1) * 38} cy={200 - Math.min(e.tr / maxE, 1) * 180} r="6" fill="#fbbf24" stroke="#fff" />
          <text x="10" y="14" fill="#fbbf24" fontSize="11">● train error</text><text x="100" y="14" fill="#22d3ee" fontSize="11">● test error</text>
          <text x="200" y="214" fill="#64748b" fontSize="10" textAnchor="middle">polynomial degree 1 → 10</text>
        </svg>
      </div>
      <div className="mt-4"><Slider label="Model complexity (polynomial degree)" value={deg} min={1} max={10} step={1} onChange={setDeg} /></div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm text-slate-300">
        <span>train MSE <b className="text-amber-300">{e.tr.toFixed(3)}</b></span><span>test MSE <b className="text-cyan-300">{e.te.toFixed(3)}</b></span><b className={verdict[1]}>{verdict[0]}</b>
      </div>
    </Card>
  );
}

/* ---------------- Bayes ---------------- */
function Bayes() {
  const [prev, setPrev] = useState(1);
  const [sens, setSens] = useState(95);
  const [spec, setSpec] = useState(90);
  const sick = prev / 100, se = sens / 100, sp = spec / 100;
  const tpR = sick * se, fpR = (1 - sick) * (1 - sp);
  const post = tpR / (tpR + fpR || 1);
  const N = 1000;
  const nSick = Math.round(N * sick), tpN = Math.round(nSick * se), fpN = Math.round((N - nSick) * (1 - sp));
  const cells = Array.from({ length: N }, (_, i) => (i < tpN ? 'tp' : i < nSick ? 'fn' : i < nSick + fpN ? 'fp' : 'tn'));
  const cl: Record<string, string> = { tp: 'bg-rose-500', fn: 'bg-rose-900', fp: 'bg-amber-400', tn: 'bg-slate-700' };
  return (
    <Card icon="🧬" title="Bayes: why a positive test may still be wrong" hint="Each square is one of 1000 people. Red = sick & positive, amber = healthy but positive (false alarm).">
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-[repeat(40,minmax(0,1fr))] gap-[2px] rounded-lg bg-slate-950/70 p-2">
          {cells.map((c, i) => <div key={i} className={`aspect-square rounded-[2px] ${cl[c]} transition-colors duration-500`} />)}
        </div>
        <div className="flex min-w-[170px] flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-slate-400">P(disease | positive)</div>
          <div className="anim-pop text-5xl font-black text-rose-400" key={post.toFixed(2)}>{(post * 100).toFixed(1)}%</div>
          <div className="mt-1 text-xs text-slate-400">{tpN} real vs {fpN} false alarms</div>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Prevalence" value={prev} min={0.5} max={50} step={0.5} onChange={setPrev} fmt={(v) => v + '%'} />
        <Slider label="Sensitivity" value={sens} min={50} max={100} step={1} onChange={setSens} fmt={(v) => v + '%'} />
        <Slider label="Specificity" value={spec} min={50} max={100} step={1} onChange={setSpec} fmt={(v) => v + '%'} />
      </div>
    </Card>
  );
}

/* ---------------- CLT ---------------- */
function CLT() {
  const [dist, setDist] = useState<'exp' | 'uniform' | 'bimodal'>('exp');
  const [n, setN] = useState(30);
  const [means, setMeans] = useState<number[]>([]);
  const [seed, setSeed] = useState(1);
  const draw = (r: () => number) => dist === 'exp' ? -Math.log(1 - r()) * 2 : dist === 'uniform' ? r() * 10 : r() < 0.5 ? 2 + gauss(r) * 0.6 : 8 + gauss(r) * 0.6;
  const run = () => {
    const r = mulberry(seed * 1337 + n); setSeed(seed + 1);
    setMeans((m) => [...m, ...Array.from({ length: 100 }, () => { let s = 0; for (let i = 0; i < n; i++) s += draw(r); return s / n; })].slice(-1500));
  };
  const [lo, hi] = [0, 10], bins = 30;
  const h = Array(bins).fill(0);
  means.forEach((m) => { const b = Math.floor(((m - lo) / (hi - lo)) * bins); if (b >= 0 && b < bins) h[b]++; });
  const mx = Math.max(1, ...h);
  const names = { exp: 'Skewed (exponential)', uniform: 'Flat (uniform)', bimodal: 'Two humps (bimodal)' };
  return (
    <Card icon="🔔" title="Central Limit Theorem: sample means turn bell-shaped" hint="Press 'Draw 100 means' several times. Increase n and the bell gets narrower.">
      <div className="flex h-40 items-end gap-[2px] rounded-lg bg-slate-950/70 p-2">
        {h.map((v, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-cyan-500 to-violet-400 transition-all duration-300" style={{ height: `${(v / mx) * 100}%` }} />)}
      </div>
      <div className="mt-1 text-xs text-slate-400">{means.length} sample means plotted (population: {names[dist]}, n = {n})</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['exp', 'uniform', 'bimodal'] as const).map((d) => (
          <button key={d} onClick={() => { setDist(d); setMeans([]); }} className={'rounded-full border px-3 py-1 text-xs transition ' + (dist === d ? 'border-cyan-400 bg-cyan-400/20 text-cyan-200' : 'border-slate-600 text-slate-400 hover:border-slate-400')}>{names[d]}</button>
        ))}
      </div>
      <div className="mt-4"><Slider label="Sample size n" value={n} min={1} max={100} step={1} onChange={(v) => { setN(v); setMeans([]); }} /></div>
      <div className="mt-4 flex gap-3"><Btn onClick={run}>🎲 Draw 100 means</Btn><Btn tone="slate" onClick={() => setMeans([])}>Clear</Btn></div>
    </Card>
  );
}

export function Labs({ id }: { id: 'gradient' | 'threshold' | 'kmeans' | 'overfit' | 'bayes' | 'clt' }) {
  switch (id) {
    case 'gradient': return <Gradient />;
    case 'threshold': return <Threshold />;
    case 'kmeans': return <KMeansLab />;
    case 'overfit': return <Overfit />;
    case 'bayes': return <Bayes />;
    case 'clt': return <CLT />;
  }
}
