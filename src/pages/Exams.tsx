import { useState } from 'react';
import { weeks } from '../data';
import { Exam } from '../components/Exam';
import { PASS, useProgress } from '../store';
import { weekStats } from '../utils/progress';
import { Question } from '../data/types';

const pool: Question[] = weeks.flatMap((w) => w.quiz);

function pick(n: number): Question[] {
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

export default function Exams({ go }: { go: (h: string) => void }) {
  const { progress } = useProgress();
  const [final, setFinal] = useState<Question[] | null>(null);
  const passedCount = weeks.filter((w) => weekStats(w, progress).passed).length;
  const allPassed = passedCount === weeks.length;
  const fs = progress.scores['final'];

  if (final) {
    return (
      <div className="px-4 py-10">
        <Exam id="final" title="Final Exam" questions={final} mix onExit={() => setFinal(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="anim-fade-up text-center">
        <div className="anim-float text-6xl">🎓</div>
        <h1 className="mt-2 text-4xl font-black text-white">Exam Center</h1>
        <p className="mt-2 text-slate-400">Finish a week's lessons, then pass its exam ({PASS}%). Pass all 12 to unlock the Final Exam.</p>
        <div className="mx-auto mt-5 h-3 max-w-md overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-1000" style={{ width: `${(passedCount / 12) * 100}%` }} />
        </div>
        <div className="mt-1 text-sm text-slate-400">{passedCount} / 12 topic exams passed</div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {weeks.map((w, i) => {
          const s = weekStats(w, progress);
          return (
            <button key={w.n} onClick={() => go(`/week/${w.n}/exam`)} className="anim-fade-up group rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 text-left transition hover:-translate-y-1 hover:border-violet-400/60" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Week {w.n}</span>
                <span className="text-2xl">{s.passed ? '✅' : s.unlocked ? w.emoji : '🔒'}</span>
              </div>
              <div className="mt-1 font-bold text-white">{w.title}</div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">{w.quiz.length} questions</span>
                {s.score ? <span className={'rounded-full px-2.5 py-1 font-bold ' + (s.passed ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300')}>best {s.score.best}%</span> : <span className="text-slate-500">{s.unlocked ? 'Ready — take it' : `${s.lessonsDone}/${w.lessons.length} lessons`}</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className={'relative mt-10 overflow-hidden rounded-3xl border p-8 text-center ' + (allPassed ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/15 to-rose-500/10' : 'border-slate-700 bg-slate-900/60')}>
        <div className="text-6xl">{allPassed ? '🏆' : '🔒'}</div>
        <h2 className="mt-2 text-3xl font-black text-white">Final Exam</h2>
        <p className="mx-auto mt-2 max-w-lg text-slate-300">20 random questions from every week of the book. Shuffled each time. Pass it to complete your journey from zero to hero.</p>
        {fs && <p className="mt-2 text-amber-300">Best score: <b>{fs.best}%</b> · attempts {fs.attempts}</p>}
        <button disabled={!allPassed} onClick={() => setFinal(pick(20))} className="mt-5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 px-8 py-3 font-bold text-slate-950 transition enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40">
          {allPassed ? 'Start final exam →' : `Locked — ${12 - passedCount} topic exam${12 - passedCount === 1 ? '' : 's'} to go`}
        </button>
      </div>
    </div>
  );
}
