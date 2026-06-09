'use client';

export type LeadsView = 'table' | 'kanban';

type Props = {
  view: LeadsView;
  onChange: (v: LeadsView) => void;
};

export default function LeadViewToggle({ view, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => onChange('table')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
          view === 'table'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
        }`}
      >
        {/* list icon */}
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        Tabela
      </button>
      <button
        onClick={() => onChange('kanban')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-200 transition-colors ${
          view === 'kanban'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
        }`}
      >
        {/* columns icon */}
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 4a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        Kanban
      </button>
    </div>
  );
}
