'use client';

/**
 * Os dois gráficos de /admin/analytics. Client component porque recharts
 * monta em SVG no browser e mede o container; o resto da página é server.
 *
 * As cores vêm de @/lib/analyticsColors — não redefinir aqui: a página server
 * usa as mesmas nos cartões de legenda e não consegue importar de um arquivo
 * 'use client'.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmtNumber } from '@/lib/adminFormat';
import { LEADS_COLOR, SERIES_COLORS } from '@/lib/analyticsColors';

const AXIS_TICK = { fill: '#9ca3af', fontSize: 11 };
const GRID_STROKE = '#f3f4f6';

/** 'YYYY-MM-DD' → '14/09', sem passar por Date (que desloca o dia em UTC). */
function shortDay(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

type TooltipEntry = { name?: string; value?: number; color?: string };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{shortDay(String(label ?? ''))}</p>
      {payload.map(entry => (
        <p key={entry.name} className="flex items-center gap-2 text-gray-600">
          <span
            className="w-2 h-2 rounded-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span>{entry.name}</span>
          <span className="ml-auto font-semibold text-gray-900 tabular-nums">
            {fmtNumber(entry.value ?? 0)}
          </span>
        </p>
      ))}
    </div>
  );
}

export type OverviewPoint = {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
};

export function OverviewChart({
  data,
  labels,
}: {
  data: OverviewPoint[];
  labels: { sessions: string; users: string; pageViews: string };
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          interval="preserveStartEnd"
          minTickGap={48}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: GRID_STROKE }}
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={36}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="pageViews"
          name={labels.pageViews}
          stroke={SERIES_COLORS.pageViews}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
        />
        <Line
          type="monotone"
          dataKey="sessions"
          name={labels.sessions}
          stroke={SERIES_COLORS.sessions}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
        />
        <Line
          type="monotone"
          dataKey="users"
          name={labels.users}
          stroke={SERIES_COLORS.users}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export type LeadsPoint = { date: string; leads: number };

export function LeadsChart({ data, label }: { data: LeadsPoint[]; label: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          interval="preserveStartEnd"
          minTickGap={48}
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: GRID_STROKE }}
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
        <Bar dataKey="leads" name={label} fill={LEADS_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
