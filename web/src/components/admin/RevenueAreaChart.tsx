'use client';

import React, { useState } from 'react';

interface RevenueDataPoint {
  date: string;
  amount: number;
}

interface RevenueAreaChartProps {
  data: RevenueDataPoint[];
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-400">
        Ma’lumotlar yetarli emas
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padding = 30;

  const maxAmount = Math.max(...data.map((d) => d.amount), 50000);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1 || 1)) * chartWidth;
    const y = height - padding - (d.amount / maxAmount) * chartHeight;
    return { x, y, ...d };
  });

  // Build SVG path
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Tushum Dinamikasi (so‘m)
        </h4>
        {hoveredIdx !== null && (
          <div className="text-xs font-bold text-brand-600 dark:text-brand-400">
            {points[hoveredIdx].date}: {points[hoveredIdx].amount.toLocaleString('uz-UZ')} so‘m
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-48 overflow-visible select-none"
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="#94a3b8"
          strokeOpacity="0.15"
          strokeDasharray="4 4"
        />
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="#94a3b8"
          strokeOpacity="0.15"
          strokeDasharray="4 4"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#94a3b8"
          strokeOpacity="0.25"
        />

        {/* Area fill */}
        <path d={areaD} fill="url(#revGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, idx) => (
          <g
            key={idx}
            className="cursor-pointer transition-all"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 6 : 4}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all"
            />
          </g>
        ))}
      </svg>

      {/* Date labels */}
      <div className="flex justify-between px-6 text-[10px] text-slate-400">
        {data.map((d, i) => (
          <span key={i}>{d.date}</span>
        ))}
      </div>
    </div>
  );
}
