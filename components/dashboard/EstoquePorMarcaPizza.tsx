"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { MarcaCount } from "@/lib/dashboard-aggregations";

const COLORS = ["#c8102e", "#2c3e52", "#8a8f98", "#3d5470", "#a13246", "#c9ccd1", "#5c1420", "#14161a"];

export default function EstoquePorMarcaPizza({ dados }: { dados: MarcaCount[] }) {
  if (dados.length === 0) {
    return <p className="text-dash-muted text-sm">Nenhum veículo em estoque.</p>;
  }

  const total = dados.reduce((sum, d) => sum + d.quantidade, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={dados}
            dataKey="quantidade"
            nameKey="marca"
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={1}
            isAnimationActive={false}
          >
            {dados.map((entry, index) => (
              <Cell key={entry.marca} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -translate-y-3">
        <p
          className="text-3xl font-medium text-dash-ink tabular-nums"
          style={{ fontFamily: "var(--font-dash-numeric)" }}
        >
          {total}
        </p>
        <p className="text-xs text-dash-muted">em estoque</p>
      </div>
    </div>
  );
}
