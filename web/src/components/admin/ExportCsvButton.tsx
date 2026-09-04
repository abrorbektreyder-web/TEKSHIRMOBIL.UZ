'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface ExportCsvButtonProps {
  data: any[];
  filename: string;
  label?: string;
}

export function ExportCsvButton({ data, filename, label = 'CSV ga yuklab olish' }: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('Yuklab olish uchun ma’lumotlar mavjud emas');
      return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Format rows
    const rows = data.map((row) =>
      headers
        .map((header) => {
          let val = row[header];
          if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val);
          }
          const str = String(val ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-sm"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
