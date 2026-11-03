import { useState } from 'react';
import { weeks } from '../data';
import { Blocks } from '../components/Blocks';
import { Exam } from '../components/Exam';
import { PASS, useProgress } from '../store';
import { weekStats } from '../utils/progress';

type Tab = 'lessons' | 'practice' | 'project' | 'exam';

function Check({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ' + (on ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-900/60 hover:border-cyan-400/60')}>
      <span className={'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm font-black transition ' + (on ? 'anim-pop border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-500')}>{on ? '✓' : ''}</span>
      <span className={'leading-7 ' + (on ? 'text-slate-400 line-through decoration-emerald-500/50' : 'text-slate-200')}>{children}</span>
    </button>
  );
}

export default function WeekPage({ n, go, initialTab }: { n: number; go: (h: string) => void; initialTab?: string }) {
  const w = weeks[n - 1];
  const { progress, toggle, toggleProject } = useProgress();
  const [tab, setTab] = useState<Tab>((initialTab as Tab) || 'lessons');
  const [li, setLi] = useState(0);
  const s = weekStats(w, progress);
  const lesson = w.lessons[Math.min(li, w.lessons.length - 1)];
  const done = progress.lessons.includes(lesson.id);

  const finishLesson = () => {
    if (!done) toggle('lessons', lesson.id);
    if (li < w.lessons.length - 1) { setLi(li + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else setTab('practice');
  };

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: 'lessons', label: '📚 Lessons', badge: `${s.lessonsDone}/${w.lessons.length}` },
    { id: 'practice', label: '✍️ Exercises', badge: `${s.exDone}/${w.exercises.length}` },
    { id: 'project', label: '🛠 Project & Checklist', badge: `${s.proj + s.chDone}/${w.checklist.length + 1}` },
    { id: 'exam', label: s.unlocked ? '📝 Exam' : '🔒 Exam', badge: s.score ? `${s.score.best}%` : undefined },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* week chips */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {weeks.map((x) => {
          const st = weekStats(x, progress);
          return (
            <button key={x.n} onClick={() => { go(`/week/${x.n}`); setTab('lessons'); setLi(0); }} className={'relative shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ' + (x.n === n ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200' : 'border-slate-700 text-slate-400 hover:border-slate-500')}>
              W{x.n} {st.passed && '✅'}
            </button>
          );
        })}
      </div>

      {/* header */}
      <header className="anim-fade-up relative overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[10rem] opacity-10">{w.emoji}</div>
        <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">{w.month}</div>
        <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl"><span className="mr-2">{w.emoji}</span>Week {w.n}: {w.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-300"><b className="text-white">Goal:</b> {w.goal}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {w.daily.map((d, i) => <span key={i} className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-300">{d}</span>)}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-700" style={{ width: `${s.pct}%` }} /></div>
          <span className="text-sm font-bold text-white">{s.pct}%</span>
        </div>
      </header>

      {/* tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-800 pb-px">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={'shrink-0 whitespace-nowrap rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition ' + (tab === t.id ? 'border-cyan-400 bg-slate-900 text-white' : 'border-transparent text-slate-400 hover:text-slate-200')}>
            {t.label} {t.badge && <span className="ml-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-cyan-300">{t.badge}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'lessons' && (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="space-y-1.5">
                {w.lessons.map((l, i) => {
                  const d = progress.lessons.includes(l.id);
                  return (
                    <button key={l.id} onClick={() => { setLi(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ' + (i === li ? 'border-cyan-400/60 bg-cyan-400/10 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600')}>
                      <span className={'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ' + (d ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400')}>{d ? '✓' : i + 1}</span>
                      <span className="leading-snug">{l.title}</span>
                    </button>
                  );
                })}
              </div>
            </aside>
            <article key={lesson.id} className="anim-fade-up min-w-0 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Lesson {li + 1} of {w.lessons.length}</div>
              <h2 className="mb-4 mt-1 text-2xl font-black text-white">{lesson.title}</h2>
              <Blocks blocks={lesson.blocks} />
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
                <button disabled={li === 0} onClick={() => { setLi(li - 1); window.scrollTo({ top: 0 }); }} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition enabled:hover:border-slate-400 disabled:opacity-30">← Previous</button>
                <button onClick={finishLesson} className={'rounded-xl px-6 py-2.5 font-bold transition hover:scale-105 active:scale-95 ' + (done ? 'border border-emerald-400/50 text-emerald-300' : 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20')}>
                  {done ? '✓ Completed · ' : '✔ Mark complete & '}{li < w.lessons.length - 1 ? 'next lesson →' : 'go to exercises →'}
                </button>
              </div>
            </article>
          </div>
        )}

        {tab === 'practice' && (
          <div className="mx-auto max-w-3xl anim-fade-up">
            <h2 className="mb-1 text-2xl font-black text-white">Week {w.n} Exercises</h2>
            <p className="mb-5 text-slate-400">Do not skip these. Type the code, break it on purpose, fix it. Tick each one when finished.</p>
            <div className="space-y-3">
              {w.exercises.map((e, i) => {
                const id = `w${w.n}-e${i}`;
                return <Check key={id} on={progress.exercises.includes(id)} onClick={() => toggle('exercises', id)}><b className="mr-2 text-cyan-300">#{i + 1}</b>{e}</Check>;
              })}
            </div>
            <div className="mt-6 text-right"><button onClick={() => setTab('project')} className="rounded-xl bg-slate-800 px-5 py-2.5 font-semibold text-white hover:bg-slate-700">Next: mini project →</button></div>
          </div>
        )}

        {tab === 'project' && (
          <div className="mx-auto max-w-3xl anim-fade-up space-y-8">
            <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-slate-900 p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">🛠 Mini Project</div>
              <h2 className="mt-1 text-2xl font-black text-white">{w.project.title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{w.project.desc}</p>
              {w.project.skills && <p className="mt-2 text-sm text-slate-400"><b className="text-slate-200">Skills used:</b> {w.project.skills}</p>}
              <div className="mt-5">
                <Check on={progress.projects.includes(w.n)} onClick={() => toggleProject(w.n)}>I finished this project and pushed it to GitHub (+40 XP)</Check>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xl font-black text-white">✅ Week {w.n} Checklist</h2>
              <div className="space-y-2.5">
                {w.checklist.map((c, i) => {
                  const id = `w${w.n}-c${i}`;
                  return <Check key={id} on={progress.checklist.includes(id)} onClick={() => toggle('checklist', id)}>{c}</Check>;
                })}
              </div>
            </div>
            <div className="text-right"><button onClick={() => setTab('exam')} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 font-bold text-white hover:scale-105">Go to exam →</button></div>
          </div>
        )}

        {tab === 'exam' && (
          s.unlocked ? (
            <Exam
              key={w.n}
              id={`w${w.n}`}
              title={`Week ${w.n} Exam`}
              questions={w.quiz}
              onExit={() => setTab('lessons')}
              nextLabel={w.n < 12 ? `Week ${w.n + 1}` : 'Final exam'}
              onNext={() => { if (w.n < 12) { go(`/week/${w.n + 1}`); setTab('lessons'); setLi(0); } else go('/exams'); }}
            />
          ) : (
            <div className="anim-pop mx-auto max-w-lg rounded-3xl border border-slate-700 bg-slate-900/70 p-8 text-center">
              <div className="text-6xl">🔒</div>
              <h2 className="mt-3 text-2xl font-black text-white">Exam locked</h2>
              <p className="mt-2 text-slate-300">Complete all {w.lessons.length} lessons of this week to unlock the exam ({PASS}% to pass).</p>
              <div className="mx-auto mt-5 h-2.5 w-64 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all" style={{ width: `${(s.lessonsDone / w.lessons.length) * 100}%` }} /></div>
              <p className="mt-2 text-sm text-slate-400">{s.lessonsDone} of {w.lessons.length} lessons completed</p>
              <button onClick={() => setTab('lessons')} className="mt-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 font-bold text-slate-950">Back to lessons</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
