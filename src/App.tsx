import { useState } from 'react';
import { ProgressProvider, useHash, useProgress } from './store';
import Home from './pages/Home';
import WeekPage from './pages/WeekPage';
import Exams from './pages/Exams';
import { Dashboard, Guide, LabsPage, Reference } from './pages/Extras';

const links = [
  ['/', 'Home'],
  ['/guide', 'Start here'],
  ['/week/1', 'Weeks'],
  ['/labs', 'Labs'],
  ['/exams', 'Exams'],
  ['/reference', 'Cheat sheets'],
] as const;

function Shell() {
  const [hash, go] = useHash();
  const { xp, level, levelPct } = useProgress();
  const [open, setOpen] = useState(false);

  const parts = hash.split('/').filter(Boolean);
  let page;
  if (parts[0] === 'week' && +parts[1] >= 1 && +parts[1] <= 12) page = <WeekPage key={parts[1] + (parts[2] ?? '')} n={+parts[1]} go={go} initialTab={parts[2]} />;
  else if (parts[0] === 'guide') page = <Guide />;
  else if (parts[0] === 'labs') page = <LabsPage />;
  else if (parts[0] === 'exams') page = <Exams go={go} />;
  else if (parts[0] === 'reference') page = <Reference />;
  else if (parts[0] === 'me') page = <Dashboard go={go} />;
  else page = <Home go={go} />;

  const active = (p: string) => (p === '/' ? hash === '/' : p.startsWith('/week') ? hash.startsWith('/week') : hash.startsWith(p));

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-[#070b16]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <button onClick={() => go('/')} className="flex items-center gap-2 font-black text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-sm text-slate-950">DS</span>
            <span className="hidden sm:inline">Zero to Hero</span>
          </button>
          <div className="ml-4 hidden items-center gap-1 md:flex">
            {links.map(([h, l]) => (
              <button key={h} onClick={() => go(h)} className={'rounded-lg px-3 py-1.5 text-sm font-medium transition ' + (active(h) ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white')}>{l}</button>
            ))}
          </div>
          <button onClick={() => go('/me')} className="ml-auto flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 py-1 pl-1 pr-3 transition hover:border-cyan-400" title="Your progress">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-black text-slate-950">{level}</span>
            <span className="text-xs text-slate-300"><b className="text-white">{xp}</b> XP</span>
            <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-slate-800 sm:block"><span className="block h-full bg-cyan-400 transition-all" style={{ width: `${levelPct}%` }} /></span>
          </button>
          <button className="rounded-lg border border-slate-700 px-2.5 py-1 text-slate-300 md:hidden" onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
        </div>
        {open && (
          <div className="grid gap-1 border-t border-slate-800 p-3 md:hidden">
            {links.map(([h, l]) => <button key={h} onClick={() => { go(h); setOpen(false); }} className={'rounded-lg px-3 py-2 text-left text-sm ' + (active(h) ? 'bg-slate-800 text-cyan-300' : 'text-slate-300')}>{l}</button>)}
          </div>
        )}
      </nav>
      <main>{page}</main>
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        The Data Science Book: Zero to Hero in 12 Weeks · Type the code. Break it on purpose. Fix it.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <Shell />
    </ProgressProvider>
  );
}
