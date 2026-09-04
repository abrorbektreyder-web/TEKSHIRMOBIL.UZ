'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">TEKSHIR PLATFORMASI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ikkilamchi bozorda telefon sotib olishdan oldin qurilmaning muddatli to‘lov (nasiya/kredit) holatini IMEI orqali tekshirishga xizmat qiluvchi xavfsiz verification tizimi.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Xavfsizlik va Maxfiylik
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-600" />
                <span>HMAC-SHA256 kriptografik indekslash</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>15 xonali xalqaro GSM Luhn algoritmi</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hamkor ma’lumotlar bazasi to‘liq himoyalangan</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Huquqiy Eslatma
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Platforma taqdim etadigan ma’lumotlar rasmiy hamkor tashkilotlarning tekshiruv vaqtidagi ma’lumotlariga asoslanadi. Foydalanuvchi doimo xarid oldidan qurilmani to‘liq ko‘zdan kechirishi tavsiya etiladi.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TEKSHIR Verification Platform. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <span>Versiya: MVP v1.0</span>
            <span>•</span>
            <span>O‘zbekiston Respublikasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
