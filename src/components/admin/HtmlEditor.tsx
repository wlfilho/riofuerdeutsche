'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

type SnippetKey = 'H2' | 'H3' | 'P' | 'IMG' | 'YT' | 'TABLE' | 'UL' | 'BLOCKQUOTE';

const SNIPPETS: Record<SnippetKey, string> = {
  H2: '<h2>Überschrift</h2>\n',
  H3: '<h3>Unterüberschrift</h3>\n',
  P: '<p>Absatz</p>\n',
  IMG: '<img src="" alt="" />\n',
  YT: '<iframe width="100%" style="aspect-ratio:16/9" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>\n',
  TABLE: `<table>
  <thead>
    <tr><th>Spalte 1</th><th>Spalte 2</th><th>Spalte 3</th></tr>
  </thead>
  <tbody>
    <tr><td>Zeile 1</td><td>Daten</td><td>Daten</td></tr>
    <tr><td>Zeile 2</td><td>Daten</td><td>Daten</td></tr>
  </tbody>
</table>\n`,
  UL: '<ul>\n  <li>Punkt 1</li>\n  <li>Punkt 2</li>\n</ul>\n',
  BLOCKQUOTE: '<blockquote>Zitat oder Tipp</blockquote>\n',
};

const TOOLBAR_BUTTONS: { key: SnippetKey; label: string; title: string }[] = [
  { key: 'H2', label: 'H2', title: 'Überschrift 2 einfügen' },
  { key: 'H3', label: 'H3', title: 'Überschrift 3 einfügen' },
  { key: 'P', label: 'P', title: 'Absatz einfügen' },
  { key: 'UL', label: 'UL', title: 'Liste einfügen' },
  { key: 'BLOCKQUOTE', label: '❝', title: 'Blockzitat einfügen' },
  { key: 'TABLE', label: 'Tabelle', title: 'Tabelle einfügen' },
  { key: 'IMG', label: 'IMG', title: 'Bild einfügen' },
  { key: 'YT', label: 'YT', title: 'YouTube-Embed einfügen' },
];

export default function HtmlEditor({ value, onChange }: HtmlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const newValue = before + snippet + after;

    onChange(newValue);

    // Restore focus + move cursor after inserted snippet
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + snippet.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-lg">
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            type="button"
            title={btn.title}
            onClick={() => insertSnippet(SNIPPETS[btn.key])}
            className="px-2.5 py-1 text-xs font-mono font-semibold bg-white border border-gray-200 rounded hover:bg-gray-100 hover:border-gray-300 transition-colors text-gray-700 cursor-pointer"
          >
            {btn.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer"
        >
          👁 Vorschau
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-full font-mono text-sm text-gray-800 bg-white border border-gray-200 border-t-0 rounded-b-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
        style={{ minHeight: '520px', lineHeight: '1.6' }}
        placeholder="<!-- HTML-Inhalt der Seite -->"
      />

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative h-full overflow-y-auto bg-white shadow-2xl"
            style={{ width: 'min(680px, 100vw)', padding: '32px 40px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={18} className="text-gray-500" />
            </button>

            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Vorschau — guide-content</p>

            {value.trim() ? (
              <div
                className="guide-content"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <p className="text-gray-400 italic">Noch kein Inhalt.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
