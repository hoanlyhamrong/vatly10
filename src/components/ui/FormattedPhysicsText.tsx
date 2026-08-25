import React from 'react';
import katex from 'katex';

interface FormattedPhysicsTextProps {
  content?: string;
  text?: string;
  className?: string;
  isAi?: boolean;
  inline?: boolean;
}

// Auto format plain physics variables (e.g. t1 -> $t_1$, v0 -> $v_0$, F1 -> $F_1$, Wt2 -> $W_{t2}$)
export function autoFormatPhysicsVariables(text: string): string {
  if (!text) return '';
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$(?:\\.|[^\$\n])+?\$)/g);
  return parts
    .map((part, i) => {
      // If inside math block, preserve exactly
      if (i % 2 === 1) return part;

      const regex =
        /(?<![\\$a-zA-Z_])(?:(Delta|delta)\s*([tvdshxFmphaklAsv])|W([tđd])([0-9])|W([tđd])|F(mst|ht|dh|đh|ms)|(vtb)|([tvdshxFmphaklA])([0-9n]))(?![a-zA-Z0-9_])/g;

      return part.replace(
        regex,
        (match, deltaWord, deltaVar, wtNumSub, wtNum, wtSub, fSub, vtb, vLetter, vNum) => {
          if (deltaWord && deltaVar) {
            const symbol = deltaWord.startsWith('D') ? '\\Delta' : '\\delta';
            return `$${symbol} ${deltaVar}$`;
          }
          if (wtNumSub && wtNum) {
            const s = wtNumSub === 'd' || wtNumSub === 'đ' ? '\\text{đ}' : 't';
            return `$W_{${s}${wtNum}}$`;
          }
          if (wtSub) {
            const s = wtSub === 'd' || wtSub === 'đ' ? '\\text{đ}' : 't';
            return `$W_${s}$`;
          }
          if (fSub) {
            return `$F_{${fSub}}$`;
          }
          if (vtb) {
            return `$v_{tb}$`;
          }
          if (vLetter && vNum) {
            return `$${vLetter}_${vNum}$`;
          }
          return match;
        }
      );
    })
    .join('');
}

// Render inline text with bold, italic, code, and inline LaTeX ($...$ or $$...$$)
export function renderInlineWithMath(text: string): React.ReactNode[] {
  if (!text) return [];

  const formattedText = autoFormatPhysicsVariables(text);
  const tokens: React.ReactNode[] = [];
  const remaining = formattedText;
  let keyIndex = 0;

  // Regex to tokenize special markdown and math patterns
  // 1. Block Math: $$...$$
  // 2. Inline Math: $...$
  // 3. Bold: **...**
  // 4. Inline code: `...`
  // 5. Italic: *...*
  const pattern = /(\$\$[\s\S]+?\$\$|\$(?:\\.|[^\$\n])+?\$|\*\*[^*]+?\*\*|`[^`]+?`|\*(?!\s)[^*]+?(?<!\s)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(remaining)) !== null) {
    // Push plain text before match
    if (match.index > lastIndex) {
      tokens.push(
        <span key={`txt-${keyIndex++}`}>
          {remaining.substring(lastIndex, match.index)}
        </span>
      );
    }

    const matchedStr = match[0];

    // Case 1: Block or Inline LaTeX ($$...$$ or $...$)
    if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      const isBlock = matchedStr.startsWith('$$') && matchedStr.endsWith('$$');
      const mathContent = isBlock
        ? matchedStr.slice(2, -2).trim()
        : matchedStr.slice(1, -1).trim();

      try {
        const html = katex.renderToString(mathContent, {
          displayMode: isBlock,
          throwOnError: false,
          strict: false,
        });
        tokens.push(
          <span
            key={`math-${keyIndex++}`}
            className={
              isBlock
                ? 'my-2.5 block overflow-x-auto rounded-xl border border-cyan-500/20 bg-black/40 p-3 text-center shadow-inner'
                : 'inline-block px-1 align-baseline'
            }
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        tokens.push(
          <span
            key={`math-fallback-${keyIndex++}`}
            className="text-cyan-300 font-mono px-0.5"
          >
            {mathContent}
          </span>
        );
      }
    }
    // Case 2: Bold (**...**)
    else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      const inner = matchedStr.slice(2, -2);
      tokens.push(
        <strong key={`b-${keyIndex++}`} className="font-bold text-white">
          {renderInlineWithMath(inner)}
        </strong>
      );
    }
    // Case 3: Inline code (`...`)
    else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      const inner = matchedStr.slice(1, -1);
      tokens.push(
        <code
          key={`code-${keyIndex++}`}
          className="rounded bg-black/50 px-2 py-0.5 font-mono text-sm sm:text-base text-[#00FFCC] border border-white/15"
        >
          {inner}
        </code>
      );
    }
    // Case 4: Italic (*...*)
    else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      const inner = matchedStr.slice(1, -1);
      tokens.push(
        <em key={`em-${keyIndex++}`} className="italic text-gray-200">
          {renderInlineWithMath(inner)}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  // Push remaining text
  if (lastIndex < remaining.length) {
    tokens.push(
      <span key={`txt-${keyIndex++}`}>{remaining.substring(lastIndex)}</span>
    );
  }

  return tokens;
}

export const InlinePhysicsText: React.FC<{ text?: string; className?: string }> = ({
  text,
  className = '',
}) => {
  if (!text) return null;
  return <span className={className}>{renderInlineWithMath(text)}</span>;
};

export const FormattedPhysicsText: React.FC<FormattedPhysicsTextProps> = ({
  content,
  text,
  className = '',
  isAi = true,
  inline = false,
}) => {
  const rawContent = content ?? text ?? '';
  if (!rawContent) return null;

  if (inline) {
    return <span className={className}>{renderInlineWithMath(rawContent)}</span>;
  }

  // Split lines into structured markdown blocks
  const lines = rawContent.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Standalone LaTeX Block: $$ ... $$ across one or multiple lines
    if (trimmed.startsWith('$$')) {
      let mathBlock = trimmed;
      if (!trimmed.endsWith('$$') || trimmed === '$$') {
        i++;
        while (i < lines.length) {
          mathBlock += '\n' + lines[i];
          if (lines[i].trim().endsWith('$$')) {
            break;
          }
          i++;
        }
      }
      const rawMath = mathBlock.trim().replace(/^(\$\$)+|(\$\$)+$/g, '').trim();
      try {
        const html = katex.renderToString(rawMath, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        elements.push(
          <div
            key={`mathblock-${blockKey++}`}
            className="my-3 overflow-x-auto rounded-xl border border-cyan-500/20 bg-black/40 p-3.5 text-center shadow-inner"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        elements.push(
          <div
            key={`mathblock-err-${blockKey++}`}
            className="my-2 p-2 bg-black/40 text-center font-mono text-cyan-300 text-xs"
          >
            {rawMath}
          </div>
        );
      }
      i++;
      continue;
    }

    // 3. Markdown Table (Starts with | and has separator line |---|)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        // Skip separator row if present
        const hasSeparator = tableLines[1].includes('---');
        const rowStartIndex = hasSeparator ? 2 : 1;

        const rows = tableLines.slice(rowStartIndex).map((row) =>
          row
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        elements.push(
          <div
            key={`table-${blockKey++}`}
            className="my-3.5 overflow-x-auto rounded-xl border border-white/10 bg-black/30 shadow-md"
          >
            <table className="w-full text-left text-sm sm:text-base border-collapse">
              <thead>
                <tr className="border-b border-white/15 bg-white/5">
                  {headers.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-4 py-3 font-bold text-[#00D4FF]"
                    >
                      {renderInlineWithMath(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {r.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-slate-100">
                        {renderInlineWithMath(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Headings (#, ##, ###, ####)
    if (trimmed.startsWith('#')) {
      if (trimmed.startsWith('####')) {
        elements.push(
          <h4
            key={`h4-${blockKey++}`}
            className="mt-3 mb-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00FFCC]"
          >
            {renderInlineWithMath(trimmed.replace(/^####\s*/, ''))}
          </h4>
        );
      } else if (trimmed.startsWith('###')) {
        elements.push(
          <h3
            key={`h3-${blockKey++}`}
            className="mt-3.5 mb-1.5 text-sm sm:text-base font-bold text-[#00D4FF] border-b border-white/10 pb-1"
          >
            {renderInlineWithMath(trimmed.replace(/^###\s*/, ''))}
          </h3>
        );
      } else if (trimmed.startsWith('##')) {
        elements.push(
          <h2
            key={`h2-${blockKey++}`}
            className="mt-4 mb-2 text-base sm:text-lg font-bold text-white"
          >
            {renderInlineWithMath(trimmed.replace(/^##\s*/, ''))}
          </h2>
        );
      } else {
        elements.push(
          <h1
            key={`h1-${blockKey++}`}
            className="mt-4 mb-2 text-lg sm:text-xl font-extrabold text-white"
          >
            {renderInlineWithMath(trimmed.replace(/^#\s*/, ''))}
          </h1>
        );
      }
      i++;
      continue;
    }

    // 5. Blockquote / Callout (> ...)
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div
          key={`quote-${blockKey++}`}
          className="my-3 border-l-4 border-[#00D4FF] bg-[#00D4FF]/10 pl-4 pr-3.5 py-2.5 text-base sm:text-lg italic text-slate-100 rounded-r-xl leading-relaxed"
        >
          {renderInlineWithMath(quoteText)}
        </div>
      );
      i++;
      continue;
    }

    // 6. Bullet lists (- or * or •)
    if (/^[-*•]\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${blockKey++}`} className="my-3 space-y-2.5 pl-0.5 text-base sm:text-lg">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 list-none">
              <span className="text-[#00D4FF] font-bold text-base mt-0.5 shrink-0">•</span>
              <span className="text-slate-100 flex-1 leading-relaxed font-normal">
                {renderInlineWithMath(item)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Numbered lists (1. 2. 3.)
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${blockKey++}`} className="my-3 space-y-3 pl-0.5 text-base sm:text-lg">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 list-none">
              <span className="flex h-6.5 w-6.5 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-[#00D4FF]/20 text-xs sm:text-sm font-bold text-[#00D4FF] mt-0.5 border border-[#00D4FF]/40 shadow-sm">
                {itemIdx + 1}
              </span>
              <span className="text-slate-100 flex-1 leading-relaxed font-normal">
                {renderInlineWithMath(item)}
              </span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Default Regular Paragraph
    elements.push(
      <p
        key={`p-${blockKey++}`}
        className={`leading-relaxed text-base sm:text-lg ${
          isAi
            ? 'text-slate-200 font-normal'
            : 'text-slate-100 font-medium'
        }`}
      >
        {renderInlineWithMath(trimmed)}
      </p>
    );
    i++;
  }

  return <div className={`space-y-3 ${className}`}>{elements}</div>;
};
