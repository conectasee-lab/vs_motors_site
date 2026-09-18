"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { MarcaCount } from "@/lib/dashboard-aggregations";

const COLORS = ["#c8102e", "#4f46e5", "#1b2340", "#94a3b8", "#f59e0b", "#10b981", "#a13246", "#64748b"];

const RADIAN = Math.PI / 180;

function renderSliceValue({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  value = 0,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value?: number;
}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {value}
    </text>
  );
}

export default function EstoquePorMarcaPizza({ dados }: { dados: MarcaCount[] }) {
  if (dados.length === 0) {
    return <p className="text-dash-muted text-sm">Nenhum veículo em estoque.</p>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={dados}
            dataKey="quantidade"
            nameKey="marca"
            cx="50%"
            cy="50%"
            outerRadius={92}
            isAnimationActive={false}
            label={renderSliceValue}
            labelLine={false}
          >
            {dados.map((entry, index) => (
              <Cell key={entry.marca} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <ul className={`mt-4 space-y-2 pr-1 ${dados.length > 6 ? "max-h-44 overflow-y-auto" : ""}`}>
        {dados.map((d, index) => (
          <li key={d.marca} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="flex-1 text-dash-ink">{d.marca}</span>
            <span className="text-dash-muted tabular-nums" style={{ fontFamily: "var(--font-dash-numeric)" }}>
              {d.quantidade}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
