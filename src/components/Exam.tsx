import { useMemo, useState } from 'react';
import { Question } from '../data/types';
import { PASS, useProgress } from '../store';
import { Confetti } from './Fx';
import { Inline } from './Blocks';

interface Shuffled { q: string; options: string[]; answer: number; explain: string }

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

function prepare(qs: Question[], mixQuestions: boolean): Shuffled[] {
  const base = mixQuestions ? shuffle(qs) : qs;
  return base.map((x) => {
    const idx = shuffle(x.options.map((_, i) => i));
    return { q: x.q, options: idx.map((i) => x.options[i]), answer: idx.indexOf(x.answer), explain: x.explain };
  });
}

export function Exam({ id, title, questions, mix = false, onExit, nextLabel, onNext }: { id: string; title: string; questions: Question[]; mix?: boolean; onExit: () => void; nextLabel?: string; onNext?: () => void }) {
  const { setScore, progress } = useProgress();
  const [attempt, setAttempt] = useState(0);
  const qs = useMemo(() => prepare(questions, mix), [questions, mix, attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);

  const prev = progress.scores[id];
  const cur = qs[i];

  const restart = () => { setAttempt((a) => a + 1); setI(0); setPicked(null); setAnswers([]); setDone(false); setStreak(0); setStarted(true); };

  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    setStreak((s) => (n === cur.answer ? s + 1 : 0));
  };
  const next = () => {
    const a = [...answers, picked];
    setAnswers(a);
    if (i + 1 >= qs.length) {
      const correct = a.filter((x, k) => x === qs[k].answer).length;
      setScore(id, Math.round((correct / qs.length) * 100));
      setDone(true);
    } else { setI(i + 1); setPicked(null); }
  };

  if (!started) {
    return (
      <div className="anim-pop mx-auto max-w-2xl rounded-3xl border border-violet-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/70 p-8 text-center shadow-2xl">
        <div className="anim-float mb-3 text-6xl">📝</div>
        <h2 className="text-3xl font-black text-white">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-300">{qs.length} questions · instant feedback · pass mark {PASS}%. Options are shuffled each attempt.</p>
        {prev && <p className="mt-3 text-sm text-cyan-300">Best score: <b>{prev.best}%</b> · attempts: {prev.attempts}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => setStarted(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-105 active:scale-95 anim-ring">Start exam →</button>
          <button onClick={onExit} className="rounded-xl border border-slate-600 px-5 py-3 text-slate-300 hover:border-slate-400">Back</button>
        </div>
      </div>
    );
  }

  if (done) {
    const correct = answers.filter((x, k) => x === qs[k].answer).length;
    const pct = Math.round((correct / qs.length) * 100);
    const pass = pct >= PASS;
    const R = 54, C = 2 * Math.PI * R;
    return (
      <div className="mx-auto max-w-2xl">
        {pass && <Confetti />}
        <div className="anim-pop rounded-3xl border border-slate-700 bg-slate-900/80 p-8 text-center shadow-2xl">
          <div className="relative mx-auto h-40 w-40">
            <svg viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle cx="60" cy="60" r={R} fill="none" stroke={pass ? '#34d399' : '#fb7185'} strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 1.2s ease', animation: 'none' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-black text-white">{pct}%</span><span className="text-xs text-slate-400">{correct}/{qs.length}</span></div>
          </div>
          <h2 className={'mt-4 text-3xl font-black ' + (pass ? 'text-emerald-300' : 'text-rose-300')}>{pass ? '🎉 You passed!' : 'Not yet — review and retry'}</h2>
          <p className="mt-2 text-slate-300">{pass ? 'Great work. XP awarded. Move on to the next topic or try for 100%.' : `You need ${PASS}% to pass. Re-read the lessons, then try again.`}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={restart} className="rounded-xl border border-slate-600 px-5 py-2.5 font-semibold text-slate-200 hover:border-cyan-400">↻ Retry</button>
            {pass && onNext && <button onClick={onNext} className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 font-bold text-slate-950 hover:brightness-110">{nextLabel ?? 'Next'} →</button>}
            <button onClick={onExit} className="rounded-xl border border-slate-600 px-5 py-2.5 text-slate-300 hover:border-slate-400">Back to topic</button>
          </div>
        </div>
        <h3 className="mb-3 mt-8 text-lg font-bold text-white">Review your answers</h3>
        <div className="space-y-3">
          {qs.map((x, k) => {
            const ok = answers[k] === x.answer;
            return (
              <div key={k} className={'rounded-xl border p-4 ' + (ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5')}>
                <div className="font-medium text-white">{ok ? '✅' : '❌'} <Inline text={x.q} /></div>
                {!ok && <div className="mt-1 text-sm text-rose-300">Your answer: {answers[k] !== null && answers[k] !== undefined ? x.options[answers[k] as number] : '—'}</div>}
                <div className="mt-1 text-sm text-emerald-300">Correct: {x.options[x.answer]}</div>
                <div className="mt-1 text-sm text-slate-400">{x.explain}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <span>Question <b className="text-white">{i + 1}</b> / {qs.length}</span>
        <span>{streak >= 2 && <span className="anim-pop mr-3 rounded-full bg-amber-400/20 px-3 py-1 font-bold text-amber-300">🔥 {streak} streak</span>}{title}</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 transition-all duration-500" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <div key={i} className="anim-fade-up rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
        <h2 className="text-xl font-bold leading-snug text-white"><Inline text={cur.q} /></h2>
        <div className="mt-5 space-y-3">
          {cur.options.map((o, n) => {
            const show = picked !== null;
            const right = n === cur.answer;
            const cls = !show ? 'border-slate-700 hover:border-cyan-400 hover:bg-slate-800' : right ? 'border-emerald-400 bg-emerald-500/15' : n === picked ? 'border-rose-400 bg-rose-500/15 anim-shake' : 'border-slate-800 opacity-50';
            return (
              <button key={n} onClick={() => choose(n)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${cls}`}>
                <span className={'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ' + (show && right ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-600 text-slate-400')}>{show && right ? '✓' : show && n === picked ? '✗' : 'ABCD'[n]}</span>
                <span className="text-slate-200"><Inline text={o} /></span>
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="anim-fade-up mt-5 rounded-xl bg-slate-950/70 p-4 text-sm">
            <b className={picked === cur.answer ? 'text-emerald-300' : 'text-rose-300'}>{picked === cur.answer ? 'Correct! ' : 'Not quite. '}</b>
            <span className="text-slate-300">{cur.explain}</span>
            <div className="mt-4 text-right"><button onClick={next} className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2 font-bold text-slate-950 hover:brightness-110">{i + 1 >= qs.length ? 'Finish' : 'Next'} →</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
