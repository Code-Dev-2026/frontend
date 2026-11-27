'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from 'recharts';
import type { IncidentChartPoint } from '../../../src/features/reporting/audit-reports';

type PortalComponent<P> = (props: P) => React.ReactNode;

const ResponsiveContainer =
  RechartsResponsiveContainer as unknown as PortalComponent<
    ComponentProps<typeof RechartsResponsiveContainer>
  >;
const BarChart = RechartsBarChart as unknown as PortalComponent<
  ComponentProps<typeof RechartsBarChart>
>;
const XAxis = RechartsXAxis as unknown as PortalComponent<
  ComponentProps<typeof RechartsXAxis>
>;
const YAxis = RechartsYAxis as unknown as PortalComponent<
  ComponentProps<typeof RechartsYAxis>
>;
const Bar = RechartsBar as unknown as PortalComponent<
  ComponentProps<typeof RechartsBar>
>;

interface IncidentsChartProps {
  data: ReadonlyArray<IncidentChartPoint>;
}

export function IncidentsChart({ data }: IncidentsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-label="Cargando gráfica de incidentes por ruta"
        className="h-[240px] w-full animate-pulse rounded-[12px] bg-cs-surfaceInput"
      />
    );
  }

  return (
    <div className="h-[240px] w-full min-w-0 rounded-[12px] border border-cs-borderSoft bg-cs-surfaceInput/30 p-3">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={[...data]}
          margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
        >
          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="routeCode"
            tick={{ fill: '#334155', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '12px',
              fontSize: '13px',
            }}
          />
          <Bar
            dataKey="deviations"
            fill="#e14d58"
            name="Desvíos >300 m"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="delays"
            fill="#f59e0b"
            name="Retrasos anómalos"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="resolved"
            fill="#2563eb"
            name="Resueltos"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
