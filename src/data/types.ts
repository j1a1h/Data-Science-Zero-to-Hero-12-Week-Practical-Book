export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'code'; lang: string; code: string }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'note'; kind: 'tip' | 'warn' | 'key'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'practice'; text: string }
  | { t: 'lab'; id: 'gradient' | 'threshold' | 'kmeans' | 'overfit' | 'bayes' | 'clt' };

export interface Lesson {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Question {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Week {
  n: number;
  title: string;
  month: string;
  emoji: string;
  goal: string;
  daily: string[];
  lessons: Lesson[];
  exercises: string[];
  project: { title: string; desc: string; skills?: string };
  checklist: string[];
  quiz: Question[];
}

export const p = (text: string): Block => ({ t: 'p', text });
export const h = (text: string): Block => ({ t: 'h', text });
const mk = (lang: string) => (s: TemplateStringsArray): Block => ({ t: 'code', lang, code: s.raw[0].replace(/^\n/, '').replace(/\s+$/, '') });
// Tagged templates: code`...` (python), bash`...`, plain`...`
export const code = mk('python');
export const bash = mk('bash');
export const plain = mk('text');
export const table = (head: string[], rows: string[][]): Block => ({ t: 'table', head, rows });
export const tip = (text: string): Block => ({ t: 'note', kind: 'tip', text });
export const warn = (text: string): Block => ({ t: 'note', kind: 'warn', text });
export const key = (text: string): Block => ({ t: 'note', kind: 'key', text });
export const ul = (...items: string[]): Block => ({ t: 'list', items });
export const practice = (text: string): Block => ({ t: 'practice', text });
export const lab = (id: Extract<Block, { t: 'lab' }>['id']): Block => ({ t: 'lab', id });
export const q = (qs: string, options: string[], answer: number, explain: string): Question => ({ q: qs, options, answer, explain });
