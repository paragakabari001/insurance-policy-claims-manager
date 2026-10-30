import React from 'react';

interface MarkdownMessageProps {
  content: string;
}

/**
 * Lightweight, zero-dependency, safe Markdown renderer for AI chat messages.
 * Formats bold, italics, lists, headers, code, and highlight pills for currency/IDs.
 */
export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  if (!content) return null;

  // Split into lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = (key: number) => {
    if (!currentList) return null;
    const isUl = currentList.type === 'ul';
    const listElement = isUl ? (
      <ul key={`list-${key}`} className="my-1.5 ml-3.5 list-disc space-y-1 text-slate-800">
        {currentList.items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </ul>
    ) : (
      <ol key={`list-${key}`} className="my-1.5 ml-4 list-decimal space-y-1 text-slate-800">
        {currentList.items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </ol>
    );
    currentList = null;
    return listElement;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line: flush list and add break
    if (!trimmed) {
      if (currentList) {
        elements.push(flushList(index));
      }
      elements.push(<div key={`br-${index}`} className="h-1.5" />);
      return;
    }

    // Headings: ### or ## or #
    if (trimmed.startsWith('### ')) {
      if (currentList) elements.push(flushList(index));
      elements.push(
        <h5 key={`h3-${index}`} className="font-bold text-slate-900 text-xs mt-2 mb-1">
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
        </h5>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      if (currentList) elements.push(flushList(index));
      elements.push(
        <h4 key={`h2-${index}`} className="font-extrabold text-slate-900 text-xs mt-2.5 mb-1 text-emerald-950">
          {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
        </h4>
      );
      return;
    }

    // Bullet list item: "- " or "* " or "• "
    if (/^[-*•]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        if (currentList) elements.push(flushList(index));
        currentList = { type: 'ul', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    // Numbered list item: "1. ", "2. ", etc.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const itemText = numMatch[2];
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) elements.push(flushList(index));
        currentList = { type: 'ol', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    // Regular line / paragraph
    if (currentList) {
      elements.push(flushList(index));
    }

    elements.push(
      <p key={`p-${index}`} className="my-0.5 leading-relaxed">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  if (currentList) {
    elements.push(flushList(lines.length));
  }

  return <div className="space-y-0.5 text-xs text-slate-800">{elements}</div>;
};

/**
 * Formats inline bold (**text**), inline code (`code`), and currency/ID badges.
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Regex splitting by: **bold**, `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="font-extrabold text-slate-900">
          {inner}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold border border-emerald-200/60"
        >
          {inner}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
