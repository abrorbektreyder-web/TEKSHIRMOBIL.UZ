'use client';

import React, { useState } from 'react';
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
  QrCode,
  FileCheck,
} from 'lucide-react';
import { VerificationCertificate } from './VerificationCertificate';

interface VerificationResultModalProps {
  data: PublicVerificationResponse | null;
  onClose: () => void;
  onReset: () => void;
}

export function VerificationResultModal({ data, onClose, onReset }: VerificationResultModalProps) {
  const [copied, setCopied] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-scaleUp transition-colors">
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
                ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40 text-rose-950 dark:text-rose-200 font-medium'
                : isClear
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 font-medium'
                : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 text-amber-950 dark:text-amber-200 font-medium'
            }`}
          >
            {data.message}
            {isAlert && (
              <p className="mt-2 text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-900/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/60">
                ⚠️ Tavsiya: Ushbu telefon to‘liq to‘lanmagan. Agar sotib olsangiz, qarz yopilmagani sababli do‘kon tomonidan bloklanishi mumkin!
              </p>
            )}
          </div>

          {/* Details Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> IMEI raqami:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {data.maskedImei}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tekshiruv vaqti:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {new Date(data.verifiedAt).toLocaleString('uz-UZ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Coins className="w-3.5 h-3.5 text-slate-400" /> Qolgan kreditlar:
              </span>
              <span className="font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                {data.creditsRemaining} ta
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400">Tekshiruv ID:</span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {data.requestId}
              </span>
            </div>
          </div>

          {/* Certificate Banner / Action */}
          <button
            type="button"
            onClick={() => setIsCertOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/50 dark:to-indigo-950/50 border border-brand-200 dark:border-brand-800/50 hover:border-brand-300 text-brand-900 dark:text-brand-300 font-bold text-xs flex items-center justify-between shadow-sm transition"
          >
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Rasmiy Verifikatsiya Sertifikati (PDF & QR)</span>
            </span>
            <QrCode className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </button>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
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
              onClick={() => setIsCertOpen(true)}
              className="w-full sm:w-auto py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
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

      {/* Certificate Modal */}
      <VerificationCertificate
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        data={data}
      />
    </div>
  );
}
