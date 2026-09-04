'use client';

import React from 'react';

interface StatusDonutChartProps {
  clearCount: number;
  activeCount: number;
  unavailableCount: number;
}

export function StatusDonutChart({
  clearCount,
  activeCount,
  unavailableCount,
}: StatusDonutChartProps) {
  const total = clearCount + activeCount + unavailableCount;

  if (total === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-400">
        Ma’lumotlar mavjud emas
      </div>
    );
  }

  const clearPercent = Math.round((clearCount / total) * 100);
  const activePercent = Math.round((activeCount / total) * 100);
  const unavailPercent = 100 - clearPercent - activePercent;

  // Circumference for r=40 is 2 * PI * 40 = 251.3
  const C = 251.32;
  const clearOffset = 0;
  const activeOffset = (clearPercent / 100) * C;
  const unavailOffset = ((clearPercent + activePercent) / 100) * C;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 self-start">
        Natijalar Nisbati
      </h4>

      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-100 dark:text-slate-800"
          />

          {/* Clear arc (Emerald) */}
          {clearCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray={`${(clearPercent / 100) * C} ${C}`}
              strokeDashoffset={-clearOffset}
              className="transition-all duration-500"
            />
          )}

          {/* Active arc (Rose) */}
          {activeCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="12"
              strokeDasharray={`${(activePercent / 100) * C} ${C}`}
              strokeDashoffset={-activeOffset}
              className="transition-all duration-500"
            />
          )}

          {/* Unavailable arc (Amber) */}
          {unavailableCount > 0 && (
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeDasharray={`${(unavailPercent / 100) * C} ${C}`}
              strokeDashoffset={-unavailOffset}
              className="transition-all duration-500"
            />
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-900 dark:text-white">{total}</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Jami so‘rov</span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center text-xs">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
          <div className="font-extrabold text-emerald-700 dark:text-emerald-400">{clearPercent}%</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-300">Toza ({clearCount})</div>
        </div>

        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40">
          <div className="font-extrabold text-rose-700 dark:text-rose-400">{activePercent}%</div>
          <div className="text-[10px] text-rose-600 dark:text-rose-300">Faol ({activeCount})</div>
        </div>

        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
          <div className="font-extrabold text-amber-700 dark:text-amber-400">{unavailPercent}%</div>
          <div className="text-[10px] text-amber-600 dark:text-amber-300">Xato ({unavailableCount})</div>
        </div>
      </div>
    </div>
  );
}
