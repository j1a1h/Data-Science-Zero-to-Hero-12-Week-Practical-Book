import { weeks, months, totalLessons } from '../data';
import { useProgress } from '../store';
import { weekStats } from '../utils/progress';
import { CountUp, NetworkBg, Typewriter } from '../components/Fx';

const lines = [
  'df.groupby("item")["revenue"].sum()',
  'model = RandomForestClassifier(n_estimators=300)',
  'cross_val_score(pipe, X, y, cv=5, scoring="roc_auc")',
  'loss.backward(); opt.step()',
  'uvicorn api:app --reload',
];

const flow = [
  ['❓', 'Ask the question'], ['📥', 'Get the data'], ['🧹', 'Clean the data'], ['🔍', 'Explore (EDA)'],
  ['🤖', 'Model'], ['📏', 'Evaluate'], ['🚀', 'Deploy'], ['📡', 'Monitor & communicate'],
];

export default function Home({ go }: { go: (h: string) => void }) {
  const { progress } = useProgress();
  const nextWeek = weeks.find((w) => weekStats(w, progress).pct < 100) ?? weeks[0];
  const started = progress.lessons.length > 0;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-70"><NetworkBg /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070b16]/40 to-[#070b16]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 text-center sm:pt-28">
          <div className="anim-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-300">
            <span className="h-2 w-2 animate-ping rounded-full bg-cyan-300" /> 12 weeks · 2 hours a day · job-ready
          </div>
          <h1 className="anim-fade-up text-5xl font-black leading-tight tracking-tight text-white sm:text-7xl" style={{ animationDelay: '.1s' }}>
            The Data Science Book<br /><span className="gradient-text">Zero to Hero</span>
          </h1>
          <p className="anim-fade-up mx-auto mt-6 max-w-2xl text-lg text-slate-300" style={{ animationDelay: '.2s' }}>
            Your single guide for the next 3 months. Read a lesson, play with an interactive lab, practise, then pass the exam to unlock the next level. Data science is learned by doing.
          </p>
          <div className="anim-fade-up mx-auto mt-8 max-w-xl rounded-xl border border-slate-700 bg-slate-950/80 px-5 py-4 text-left font-mono text-sm text-emerald-300 shadow-xl" style={{ animationDelay: '.3s' }}>
            <span className="mr-2 text-slate-500">&gt;&gt;&gt;</span><Typewriter lines={lines} />
          </div>
          <div className="anim-fade-up mt-9 flex flex-wrap justify-center gap-4" style={{ animationDelay: '.4s' }}>
            <button onClick={() => go(`/week/${nextWeek.n}`)} className="anim-ring rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:scale-105 active:scale-95">
              {started ? `Continue · Week ${nextWeek.n}` : 'Start Week 1 →'}
            </button>
            <button onClick={() => go('/guide')} className="rounded-xl border border-slate-600 bg-slate-900/60 px-8 py-3.5 text-base font-semibold text-slate-200 backdrop-blur transition hover:border-cyan-400">How this book works</button>
          </div>
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[[12, 'Weeks', ''], [totalLessons, 'Lessons', ''], [weeks.reduce((a, w) => a + w.quiz.length, 0), 'Exam questions', ''], [6, 'Interactive labs', '']].map(([n, l], i) => (
              <div key={i} className="glass rounded-2xl p-4">
                <div className="text-3xl font-black text-white"><CountUp to={n as number} /></div>
                <div className="text-xs uppercase tracking-wider text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-black text-white">How every week works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['📚', 'Learn', 'Short lessons with real code you type yourself.', 'from-cyan-500/20'],
            ['🧪', 'Play', 'Interactive labs: watch gradient descent, K-Means and Bayes live.', 'from-violet-500/20'],
            ['✍️', 'Practise', 'Exercises, a mini project, and a self-check list.', 'from-fuchsia-500/20'],
            ['📝', 'Exam', 'Finish all lessons, then pass the exam (70%) to earn XP.', 'from-amber-500/20'],
          ].map(([i, t, d, c], k) => (
            <div key={k} className={`anim-fade-up rounded-2xl border border-slate-700/70 bg-gradient-to-br ${c} to-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-400/50`} style={{ animationDelay: `${k * 0.1}s` }}>
              <div className="anim-float text-4xl" style={{ animationDelay: `${k * 0.4}s` }}>{i}</div>
              <div className="mt-3 text-xl font-bold text-white">{t}</div>
              <p className="mt-1 text-sm text-slate-300">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="text-center text-3xl font-black text-white">The 12-week map</h2>
        <p className="mt-2 text-center text-slate-400">Follow it in order. Every card shows your progress.</p>
        <div className="mt-10 space-y-12">
          {months.map((m) => (
            <div key={m.name}>
              <div className={`mb-5 inline-block rounded-full bg-gradient-to-r ${m.color} px-5 py-1.5 text-sm font-bold text-slate-950`}>{m.name}</div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {m.weeks.map((n) => {
                  const w = weeks[n - 1];
                  const s = weekStats(w, progress);
                  return (
                    <button key={n} onClick={() => go(`/week/${n}`)} className="group relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 text-left transition hover:-translate-y-1.5 hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-500/10">
                      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${m.color} opacity-20 blur-xl transition group-hover:opacity-50`} />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Week {n}</span>
                        <span className="text-3xl transition group-hover:scale-125">{w.emoji}</span>
                      </div>
                      <div className="mt-2 min-h-[3rem] font-bold leading-snug text-white">{w.title}</div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${s.pct}%`, transition: 'width 1s' }} /></div>
                      <div className="mt-2 flex justify-between text-xs text-slate-400"><span>{s.pct}% done</span><span>{s.passed ? '✅ exam passed' : s.unlocked ? '📝 exam ready' : `${s.lessonsDone}/${w.lessons.length} lessons`}</span></div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="border-y border-slate-800 bg-slate-950/60 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-3xl font-black text-white">The data science workflow</h2>
          <p className="mt-2 text-center text-slate-400">Keep this in your mind. About 60–70% of your time goes to steps 2–4. That is normal.</p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {flow.map(([e, t], i) => (
              <div key={i} className="relative rounded-xl border border-slate-700 bg-slate-900/80 p-4 text-center transition hover:scale-105 hover:border-violet-400/70">
                <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">{i + 1}</div>
                <div className="text-3xl">{e}</div>
                <div className="mt-1 text-sm font-semibold text-slate-200">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center">
        <h2 className="text-3xl font-black text-white">Ready to build, break and fix?</h2>
        <p className="mt-3 text-slate-300">Consistency is more important than talent. Two focused hours a day for 12 weeks will change your skills.</p>
        <button onClick={() => go('/week/1')} className="mt-6 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-8 py-3 font-bold text-slate-950 transition hover:scale-105">Begin Week 1 →</button>
      </section>
    </div>
  );
}
