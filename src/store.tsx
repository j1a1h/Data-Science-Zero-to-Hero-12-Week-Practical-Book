import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export interface Progress {
  lessons: string[];
  exercises: string[];
  checklist: string[];
  projects: number[];
  scores: Record<string, { best: number; attempts: number }>;
}

const empty: Progress = { lessons: [], exercises: [], checklist: [], projects: [], scores: {} };
const KEY = 'ds-zero-hero-progress-v1';

interface Ctx {
  progress: Progress;
  toggle: (field: 'lessons' | 'exercises' | 'checklist', id: string) => void;
  toggleProject: (n: number) => void;
  setScore: (id: string, pct: number) => void;
  reset: () => void;
  xp: number;
  level: number;
  levelPct: number;
}

const C = createContext<Ctx>(null as unknown as Ctx);
export const PASS = 70;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...empty, ...JSON.parse(raw) } : empty;
    } catch {
      return empty;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* ignore */
    }
  }, [progress]);

  const toggle = useCallback((field: 'lessons' | 'exercises' | 'checklist', id: string) => {
    setProgress((p) => ({
      ...p,
      [field]: p[field].includes(id) ? p[field].filter((x) => x !== id) : [...p[field], id],
    }));
  }, []);

  const toggleProject = useCallback((n: number) => {
    setProgress((p) => ({ ...p, projects: p.projects.includes(n) ? p.projects.filter((x) => x !== n) : [...p.projects, n] }));
  }, []);

  const setScore = useCallback((id: string, pct: number) => {
    setProgress((p) => {
      const old = p.scores[id];
      return { ...p, scores: { ...p.scores, [id]: { best: Math.max(old?.best ?? 0, pct), attempts: (old?.attempts ?? 0) + 1 } } };
    });
  }, []);

  const reset = useCallback(() => setProgress(empty), []);

  const value = useMemo<Ctx>(() => {
    const examXp = Object.values(progress.scores).reduce((a, s) => a + Math.round(s.best / 2) + (s.best >= PASS ? 30 : 0), 0);
    const xp = progress.lessons.length * 10 + progress.exercises.length * 5 + progress.checklist.length * 2 + progress.projects.length * 40 + examXp;
    return { progress, toggle, toggleProject, setScore, reset, xp, level: Math.floor(xp / 150) + 1, levelPct: ((xp % 150) / 150) * 100 };
  }, [progress, toggle, toggleProject, setScore, reset]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useProgress = () => useContext(C);

// ---- tiny hash router ----
export function useHash(): [string, (h: string) => void] {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/');
  useEffect(() => {
    const on = () => {
      setHash(window.location.hash.slice(1) || '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return [hash, (h: string) => { window.location.hash = h; }];
}
