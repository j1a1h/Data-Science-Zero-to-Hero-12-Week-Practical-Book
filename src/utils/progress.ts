import { Week } from '../data/types';
import { PASS, Progress } from '../store';

export function weekStats(w: Week, p: Progress) {
  const lessonsDone = w.lessons.filter((l) => p.lessons.includes(l.id)).length;
  const exDone = w.exercises.filter((_, i) => p.exercises.includes(`w${w.n}-e${i}`)).length;
  const chDone = w.checklist.filter((_, i) => p.checklist.includes(`w${w.n}-c${i}`)).length;
  const proj = p.projects.includes(w.n) ? 1 : 0;
  const score = p.scores[`w${w.n}`];
  const passed = !!score && score.best >= PASS;
  const total = w.lessons.length + w.exercises.length + w.checklist.length + 2;
  const done = lessonsDone + exDone + chDone + proj + (passed ? 1 : 0);
  return {
    lessonsDone,
    exDone,
    chDone,
    proj,
    score,
    passed,
    unlocked: lessonsDone === w.lessons.length,
    pct: Math.round((done / total) * 100),
  };
}
