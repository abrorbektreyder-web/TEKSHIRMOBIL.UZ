'use client';

import React from 'react';
import { PublicVerificationResponse } from '@tekshir/shared';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  Printer,
  Calendar,
  Hash,
  Coins,
} from 'lucide-react';

interface VerificationResultModalProps {
  data: PublicVerificationResponse | null;
  onClose: () => void;
  onReset: () => void;
}

export function VerificationResultModal({ data, onClose, onReset }: VerificationResultModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  const handleCopy = () => {
    const text = `IMEI TEKSHIRUVI NATIJASI:
Holat: ${data.title}
${data.message}
Qurilma: ${data.maskedImei}
Sana: ${new Date(data.verifiedAt).toLocaleString('uz-UZ')}
Tekshiruv ID: ${data.requestId}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isAlert = data.result === 'ACTIVE_INSTALLMENT';
  const isClear = data.result === 'CLEAR';
  const isUnavailable = data.result === 'PROVIDER_UNAVAILABLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scaleUp">
        {/* Status Header Banner */}
        <div
          className={`p-6 text-center text-white relative ${
            isAlert
              ? 'bg-gradient-to-b from-rose-600 to-rose-700'
              : isClear
              ? 'bg-gradient-to-b from-emerald-600 to-emerald-700'
              : 'bg-gradient-to-b from-amber-500 to-amber-600'
          }`}
        >
          {/* Big Icon */}
          <div className="mx-auto mb-3 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/25 shadow-inner">
            {isAlert && <ShieldAlert className="w-9 h-9 text-white" />}
            {isClear && <ShieldCheck className="w-9 h-9 text-white" />}
            {isUnavailable && <AlertTriangle className="w-9 h-9 text-white" />}
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 mb-2 border border-white/20">
            {isAlert ? '🔴 DIQQAT: XAVFLI XARID' : isClear ? '🟢 MUVAFFAQIYATLI TEKSHIRILDI' : '🟡 PROVAYDER BAND'}
          </span>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">{data.title}</h3>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Message box */}
          <div
            className={`p-4 rounded-2xl text-sm leading-relaxed border ${
              isAlert
                ? 'bg-rose-50/70 border-rose-200 text-rose-950 font-medium'
                : isClear
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                : 'bg-amber-50/70 border-amber-200 text-amber-950 font-medium'
            }`}
          >
            {data.message}
            {isAlert && (
              <p className="mt-2 text-xs font-semibold text-rose-800 bg-rose-100/70 p-2.5 rounded-xl border border-rose-200">
                ⚠️ Tavsiya: Ushbu telefon to‘liq to‘lanmagan. Agar sotib olsangiz, qarz yopilmagani sababli do‘kon tomonidan bloklanishi mumkin!
              </p>
            )}
          </div>

          {/* Details Table */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> IMEI raqami:
              </span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {data.maskedImei}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tekshiruv vaqti:
              </span>
              <span className="font-medium text-slate-800">
                {new Date(data.verifiedAt).toLocaleString('uz-UZ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Coins className="w-3.5 h-3.5 text-slate-400" /> Qolgan kreditlar:
              </span>
              <span className="font-bold text-slate-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                {data.creditsRemaining} ta
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
              <span className="text-slate-400">Tekshiruv ID:</span>
              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                {data.requestId}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Nusxalandi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Nusxalash</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto py-3 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Chop etish"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onReset}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-brand-600/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yana tekshirish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
