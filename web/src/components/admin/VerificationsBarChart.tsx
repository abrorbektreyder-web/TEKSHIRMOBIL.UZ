'use client';

import React, { useState } from 'react';

interface VerificationsBarPoint {
  day: string;
  clear: number;
  active: number;
}

interface VerificationsBarChartProps {
  data: VerificationsBarPoint[];
}

export function VerificationsBarChart({ data }: VerificationsBarChartProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-400">
        Ma’lumotlar mavjud emas
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.clear + d.active), 10);
  const chartHeight = 140;

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Tekshiruvlar Dinamikasi (Kunlik)
        </h4>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Toza (Clear)
          </span>
          <span className="flex items-center gap-1 text-rose-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Faol Nasiya
          </span>
        </div>
      </div>

      {/* Bars container */}
      <div className="h-44 flex items-end justify-between gap-3 pt-4 border-b border-slate-200 dark:border-slate-800">
        {data.map((d) => {
          const clearH = Math.max((d.clear / maxVal) * chartHeight, d.clear > 0 ? 6 : 0);
          const activeH = Math.max((d.active / maxVal) * chartHeight, d.active > 0 ? 6 : 0);
          const isHovered = hoveredDay === d.day;

          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
              onMouseEnter={() => setHoveredDay(d.day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="text-[10px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-1.5 py-0.5 rounded shadow absolute -top-1 animate-fadeIn">
                  {d.clear + d.active} ta
                </div>
              )}

              <div className="w-full max-w-[28px] flex flex-col justify-end gap-1">
                {/* Active bar (Rose) */}
                {d.active > 0 && (
                  <div
                    style={{ height: `${activeH}px` }}
                    className="w-full bg-rose-500 rounded-t-md transition-all group-hover:brightness-110"
                    title={`Faol nasiya: ${d.active}`}
                  />
                )}
                {/* Clear bar (Emerald) */}
                {d.clear > 0 && (
                  <div
                    style={{ height: `${clearH}px` }}
                    className={`w-full bg-emerald-500 transition-all group-hover:brightness-110 ${
                      d.active > 0 ? 'rounded-b-md' : 'rounded-md'
                    }`}
                    title={`Toza: ${d.clear}`}
                  />
                )}
                {d.clear === 0 && d.active === 0 && (
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
                )}
              </div>

              <span className="text-[10px] font-medium text-slate-400 mt-2">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
