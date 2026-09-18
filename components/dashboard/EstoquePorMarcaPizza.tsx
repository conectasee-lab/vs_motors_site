"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { MarcaCount } from "@/lib/dashboard-aggregations";

const COLORS = ["#c8102e", "#0a0a0a", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#64748b"];

export default function EstoquePorMarcaPizza({ dados }: { dados: MarcaCount[] }) {
  if (dados.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum veículo em estoque.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={dados}
          dataKey="quantidade"
          nameKey="marca"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, value }: { name?: string | number; value: number }) => `${name} (${value})`}
          isAnimationActive={false}
        >
          {dados.map((entry, index) => (
            <Cell key={entry.marca} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
