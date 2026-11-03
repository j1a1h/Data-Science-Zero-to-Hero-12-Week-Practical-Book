import { useState } from 'react';
import { appendix, guide, weeks } from '../data';
import { Blocks } from '../components/Blocks';
import { Labs } from '../components/Labs';
import { useProgress } from '../store';
import { weekStats } from '../utils/progress';

export function Tabbed({ title, subtitle, icon, sections }: { title: string; subtitle: string; icon: string; sections: typeof guide }) {
  const [id, setId] = useState(sections[0].id);
  const s = sections.find((x) => x.id === id)!;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="anim-fade-up text-center">
        <div className="anim-float text-6xl">{icon}</div>
        <h1 className="mt-2 text-4xl font-black text-white">{title}</h1>
        <p className="mt-2 text-slate-400">{subtitle}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {sections.map((x) => (
          <button key={x.id} onClick={() => setId(x.id)} className={'rounded-full border px-4 py-2 text-sm font-semibold transition ' + (id === x.id ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200' : 'border-slate-700 text-slate-400 hover:border-slate-500')}>{x.icon} {x.title}</button>
        ))}
      </div>
      <div key={id} className="anim-fade-up mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-8">
        <h2 className="mb-3 text-2xl font-black text-white">{s.icon} {s.title}</h2>
        <Blocks blocks={s.blocks} />
      </div>
    </div>
  );
}

export function Guide() {
  return <Tabbed icon="📖" title="Start Here" subtitle="How to use the book, set up your computer, and the workflow you will repeat in every project." sections={guide} />;
}

export function Reference() {
  return <Tabbed icon="🗂️" title="Appendix & Cheat Sheets" subtitle="Quick references, glossary, common mistakes, and free resources." sections={appendix} />;
}

export function LabsPage() {
  const ids = [['gradient', 'Week 5'], ['overfit', 'Week 5'], ['threshold', 'Week 6'], ['kmeans', 'Week 8'], ['bayes', 'Week 4'], ['clt', 'Week 3']] as const;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="anim-fade-up text-center">
        <div className="anim-float text-6xl">🧪</div>
        <h1 className="mt-2 text-4xl font-black text-white">Interactive Labs</h1>
        <p className="mt-2 text-slate-400">See the ideas move. Drag sliders, press play, break things.</p>
      </div>
      {ids.map(([id, wk]) => (
        <div key={id}>
          <div className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-500">{wk}</div>
          <Labs id={id} />
        </div>
      ))}
    </div>
  );
}

export function Dashboard({ go }: { go: (h: string) => void }) {
  const { progress, xp, level, levelPct, reset } = useProgress();
  const passed = weeks.filter((w) => weekStats(w, progress).passed).length;
  const rank = ['Beginner', 'Learner', 'Analyst', 'Modeler', 'Engineer', 'Hero'][Math.min(5, Math.floor((level - 1) / 2))];
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="anim-fade-up rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/70 p-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-4xl font-black text-slate-950 anim-ring">{level}</div>
          <div className="min-w-[220px] flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">Level {level} · {rank}</div>
            <div className="text-3xl font-black text-white">{xp} XP</div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-1000" style={{ width: `${levelPct}%` }} /></div>
            <div className="mt-1 text-xs text-slate-400">{Math.round(150 - (xp % 150))} XP to next level</div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[['📚', progress.lessons.length, 'lessons'], ['✍️', progress.exercises.length, 'exercises'], ['🛠', progress.projects.length, 'projects'], ['🏅', passed, 'exams passed']].map(([e, n, l]) => (
            <div key={l as string} className="rounded-xl bg-slate-950/60 p-4 text-center"><div className="text-2xl">{e}</div><div className="text-2xl font-black text-white">{n}</div><div className="text-xs text-slate-400">{l}</div></div>
          ))}
        </div>
      </div>

      <h2 className="mb-3 mt-10 text-xl font-black text-white">Weekly tracker</h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-cyan-300">
            <tr><th className="px-4 py-3">Week</th><th className="px-4 py-3">Topic</th><th className="px-4 py-3">Lessons</th><th className="px-4 py-3">Mini project</th><th className="px-4 py-3">Exam</th><th className="px-4 py-3">Progress</th></tr>
          </thead>
          <tbody>
            {weeks.map((w) => {
              const s = weekStats(w, progress);
              return (
                <tr key={w.n} onClick={() => go(`/week/${w.n}`)} className="cursor-pointer border-t border-slate-800 transition hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-bold text-white">{w.emoji} {w.n}</td>
                  <td className="px-4 py-3 text-slate-300">{w.title}</td>
                  <td className="px-4 py-3 text-slate-300">{s.lessonsDone}/{w.lessons.length}</td>
                  <td className="px-4 py-3">{s.proj ? '✅' : '—'}</td>
                  <td className="px-4 py-3">{s.score ? <span className={s.passed ? 'text-emerald-300' : 'text-rose-300'}>{s.score.best}%</span> : '—'}</td>
                  <td className="px-4 py-3"><div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${s.pct}%` }} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate-400"><b className="text-slate-200">If you fall behind:</b> do not skip the practicals. Cut the optional parts (t-SNE, recommender, SHAP) and extend by one week. Quality beats speed.</p>
      <button onClick={() => { if (confirm('Reset all progress?')) reset(); }} className="mt-6 rounded-lg border border-rose-500/40 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10">Reset progress</button>
    </div>
  );
}
