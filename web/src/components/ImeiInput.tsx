'use client';

import React, { useState, useMemo } from 'react';
import { cleanImei, isValidImei, formatImeiDisplay } from '@tekshir/shared';
import { CheckCircle2, AlertCircle, Sparkles, X, Clipboard, Camera, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { ImeiCameraScanner } from './ImeiCameraScanner';

interface ImeiInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function ImeiInput({ value, onChange, onSubmit, loading }: ImeiInputProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const cleaned = useMemo(() => cleanImei(value), [value]);

  const validationState = useMemo(() => {
    if (cleaned.length === 0) return 'EMPTY';
    if (cleaned.length < 15) return 'INCOMPLETE';
    if (cleaned.length === 15) {
      return isValidImei(cleaned) ? 'VALID' : 'INVALID_LUHN';
    }
    return 'TOO_LONG';
  }, [cleaned]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = cleanImei(raw).slice(0, 15);
    onChange(digits);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = cleanImei(text).slice(0, 15);
      onChange(digits);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validationState === 'VALID' && !loading) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-left">
      <div className="relative group">
        {/* Ambient subtle glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-600/20 via-indigo-600/25 to-purple-600/20 rounded-[28px] blur-xl opacity-60 group-hover:opacity-90 transition duration-700 pointer-events-none" />

        {/* 1px Gradient border wrapper for sleek Apple/Linear finish */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-200 via-slate-200/50 to-slate-200 dark:from-slate-700/60 dark:via-slate-800/40 dark:to-slate-900/80 shadow-2xl shadow-slate-300/40 dark:shadow-black/70 transition-all duration-300">
          <div className="bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-2xl rounded-[23px] p-6 sm:p-8 transition-colors">
            
            {/* Terminal status bar header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Qurilma xavfsizlik tekshiruvi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono font-semibold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Real-time baza
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Qurilma IMEI kodini bilish uchun telefoningiz terish maydonchasida <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold border border-slate-200 dark:border-slate-700">*#06#</code> tering.
            </p>

            {/* Input box */}
            <div className="relative flex items-center group/input">
              <input
                type="text"
                inputMode="numeric"
                value={formatImeiDisplay(cleaned)}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="3560 0000 0000 000"
                disabled={loading}
                className={`w-full text-xl sm:text-2xl font-mono tracking-widest px-4 sm:px-5 py-4 rounded-2xl border-2 transition-all outline-none pr-32 ${
                  validationState === 'VALID'
                    ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 focus:ring-4 focus:ring-emerald-500/20'
                    : validationState === 'INVALID_LUHN'
                    ? 'border-rose-500/80 bg-rose-50/20 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 focus:ring-4 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070c18]/90 text-slate-900 dark:text-white focus:border-brand-600 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:bg-white dark:focus:bg-[#0b1120]'
                }`}
              />

              {/* Action buttons inside input */}
              <div className="absolute right-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="p-2 rounded-xl text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition active:scale-95"
                  title="Kamera orqali skanerlash"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {cleaned.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition active:scale-95"
                    title="Tozalash"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition active:scale-95"
                    title="Qo‘yish (Paste)"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                )}

                <div
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                    cleaned.length === 15
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cleaned.length}/15
                </div>
              </div>
            </div>

            {/* Validation hint pill */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between text-xs min-h-[22px] gap-2">
              {validationState === 'VALID' && (
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>15 xonali IMEI to‘g‘ri (Luhn tasdiqlangan)</span>
                </div>
              )}
              {validationState === 'INVALID_LUHN' && (
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>IMEI nazorat raqami xato (Luhn algoritmi bo‘yicha noto‘g‘ri)</span>
                </div>
              )}
              {validationState === 'INCOMPLETE' && (
                <div className="text-slate-400 dark:text-slate-500 font-medium">
                  Yana {15 - cleaned.length} ta raqam kiriting
                </div>
              )}
              {validationState === 'EMPTY' && (
                <div className="text-slate-400 dark:text-slate-500 font-medium">Faqat 15 xonali raqam qabul qilinadi</div>
              )}

              {/* Quick test sample buttons styled as sleek interactive tags */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mr-1">Demo:</span>
                <button
                  type="button"
                  onClick={() => onChange('356111111111113')}
                  className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 text-[10px] font-bold transition flex items-center gap-1 active:scale-95"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Faol Nasiya
                </button>
                <button
                  type="button"
                  onClick={() => onChange('356777777777775')}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold transition flex items-center gap-1 active:scale-95"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Toza Telefon
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={validationState !== 'VALID' || loading}
              className={`relative overflow-hidden w-full mt-6 py-4 px-6 rounded-2xl font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
                validationState === 'VALID' && !loading
                  ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-500/25 active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none border border-slate-200/50 dark:border-slate-800'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Hamkor bazalari parallel tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>QURILMANI TEKSHIRISH</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ImeiCameraScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(scanned) => onChange(scanned)}
      />
    </div>
  );
}
