import { Fragment, ReactNode, useState } from 'react';
import { Block } from '../data/types';
import { Labs } from './Labs';

// ---------- inline markdown: **bold**, *italic*, `code` ----------
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((s, i) => {
        if (s.startsWith('**')) return <strong key={i} className="font-semibold text-white">{s.slice(2, -2)}</strong>;
        if (s.startsWith('`')) return <code key={i} className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-300">{s.slice(1, -1)}</code>;
        if (s.startsWith('*')) return <em key={i} className="text-slate-200">{s.slice(1, -1)}</em>;
        return <Fragment key={i}>{s}</Fragment>;
      })}
    </>
  );
}

// ---------- tiny syntax highlighter ----------
const KW = new Set('import from as def return if elif else for while in not and or is class with try except finally raise lambda pass break continue None True False print yield async await self'.split(' '));

function highlight(line: string, lang: string): ReactNode[] {
  if (lang === 'text') return [line];
  const out: ReactNode[] = [];
  const re = /(#.*$)|("""|'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+\.?\d*\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\()|([A-Za-z_][A-Za-z0-9_]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    if (m[1]) out.push(<span key={k++} className="tok-c">{m[1]}</span>);
    else if (m[2]) out.push(<span key={k++} className="tok-s">{m[2]}</span>);
    else if (m[3]) out.push(<span key={k++} className="tok-n">{m[3]}</span>);
    else if (m[4]) out.push(KW.has(m[4]) ? <span key={k++} className="tok-k">{m[4]}</span> : <span key={k++} className="tok-f">{m[4]}</span>);
    else if (m[5]) out.push(KW.has(m[5]) ? <span key={k++} className="tok-k">{m[5]}</span> : m[5]);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="group my-4 overflow-hidden rounded-xl border border-slate-700/60 bg-[#0a0f1e] shadow-lg shadow-black/30">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 font-mono text-xs uppercase tracking-wider text-slate-500">{lang === 'text' ? 'tree' : lang}</span>
        </div>
        <button onClick={copy} className="rounded-md border border-slate-700 px-2.5 py-1 text-xs text-slate-400 transition hover:border-cyan-400 hover:text-cyan-300">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-slate-200">
          {lines.map((l, i) => (
            <div key={i} className="flex">
              <span className="mr-4 w-6 shrink-0 select-none text-right text-slate-600">{i + 1}</span>
              <span className="whitespace-pre">{highlight(l, lang)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

const noteStyle = {
  tip: { icon: '💡', cls: 'border-emerald-500/40 bg-emerald-500/10', label: 'Tip' },
  warn: { icon: '⚠️', cls: 'border-amber-500/40 bg-amber-500/10', label: 'Careful' },
  key: { icon: '🔑', cls: 'border-cyan-500/40 bg-cyan-500/10', label: 'Key idea' },
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p':
            return <p key={i} className="my-3 leading-7 text-slate-300"><Inline text={b.text} /></p>;
          case 'h':
            return <h3 key={i} className="mb-2 mt-7 text-lg font-bold text-white"><span className="mr-2 text-cyan-400">▸</span>{b.text}</h3>;
          case 'code':
            return <CodeBlock key={i} code={b.code} lang={b.lang} />;
          case 'list':
            return (
              <ul key={i} className="my-3 space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-slate-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                    <span className="leading-7"><Inline text={it} /></span>
                  </li>
                ))}
              </ul>
            );
          case 'table':
            return (
              <div key={i} className="my-4 overflow-x-auto rounded-xl border border-slate-700/60">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-cyan-300">
                    <tr>{b.head.map((c, j) => <th key={j} className="px-4 py-2.5 font-semibold">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-t border-slate-800 transition hover:bg-slate-800/40">
                        {r.map((c, k) => <td key={k} className={'px-4 py-2.5 ' + (k === 0 ? 'font-medium text-slate-100' : 'text-slate-300')}><Inline text={c} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'note': {
            const s = noteStyle[b.kind];
            return (
              <div key={i} className={`my-4 flex gap-3 rounded-xl border p-4 ${s.cls}`}>
                <span className="text-xl">{s.icon}</span>
                <div className="leading-7 text-slate-200"><span className="mr-2 font-bold text-white">{s.label}:</span><Inline text={b.text} /></div>
              </div>
            );
          }
          case 'practice':
            return (
              <div key={i} className="my-4 rounded-xl border border-dashed border-violet-400/50 bg-violet-500/10 p-4">
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-violet-300">✍️ Practice</div>
                <div className="leading-7 text-slate-200"><Inline text={b.text} /></div>
              </div>
            );
          case 'lab':
            return <Labs key={i} id={b.id} />;
        }
      })}
    </div>
  );
}
