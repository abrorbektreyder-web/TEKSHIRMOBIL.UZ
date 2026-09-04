'use client';

import React, { useMemo } from 'react';
import { cleanImei, isValidImei, formatImeiDisplay } from '@tekshir/shared';
import { CheckCircle2, AlertCircle, Sparkles, X, Clipboard } from 'lucide-react';

interface ImeiInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function ImeiInput({ value, onChange, onSubmit, loading }: ImeiInputProps) {
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 md:p-8 transition-all">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Telefon IMEI raqamini kiriting:
        </label>
        <p className="text-xs text-slate-500 mb-4">
          Qurilma IMEI kodini bilish uchun telefoningizda <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-800 font-semibold">*#06#</code> tering.
        </p>

        {/* Input box */}
        <div className="relative flex items-center">
          <input
            type="text"
            inputMode="numeric"
            value={formatImeiDisplay(cleaned)}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="3560 0000 0000 000"
            disabled={loading}
            className={`w-full text-xl sm:text-2xl font-mono tracking-wider px-4 py-4 rounded-xl border-2 transition-all outline-none pr-28 ${
              validationState === 'VALID'
                ? 'border-emerald-500 bg-emerald-50/20 text-emerald-950 focus:ring-4 focus:ring-emerald-500/20'
                : validationState === 'INVALID_LUHN'
                ? 'border-rose-500 bg-rose-50/20 text-rose-950 focus:ring-4 focus:ring-rose-500/20'
                : 'border-slate-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10'
            }`}
          />

          {/* Action buttons inside input */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {cleaned.length > 0 ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Tozalash"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                title="Qo‘yish (Paste)"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            )}

            <div className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {cleaned.length}/15
            </div>
          </div>
        </div>

        {/* Validation hint pill */}
        <div className="mt-3 flex items-center justify-between text-xs min-h-[22px]">
          {validationState === 'VALID' && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>15 xonali IMEI to‘g‘ri (Luhn tekshiruvidan o‘tdi)</span>
            </div>
          )}
          {validationState === 'INVALID_LUHN' && (
            <div className="flex items-center gap-1.5 text-rose-700 font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>IMEI nazorat raqami noto‘g‘ri (Luhn algoritmi xatosi)</span>
            </div>
          )}
          {validationState === 'INCOMPLETE' && (
            <div className="text-slate-400">
              Yana {15 - cleaned.length} ta raqam kiriting
            </div>
          )}
          {validationState === 'EMPTY' && (
            <div className="text-slate-400">Faqat 15 xonali raqam qabul qilinadi</div>
          )}

          {/* Quick test sample buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange('356111111111113')}
              className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
            >
              <Sparkles className="w-3 h-3" />
              Test Faol
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => onChange('356777777777775')}
              className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5"
            >
              <Sparkles className="w-3 h-3" />
              Test Toza
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={validationState !== 'VALID' || loading}
          className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
            validationState === 'VALID' && !loading
              ? 'bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white shadow-brand-600/25 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Hamkor bazalari parallel tekshirilmoqda...</span>
            </>
          ) : (
            <span>QURILMANI TEKSHIRISH</span>
          )}
        </button>
      </div>
    </div>
  );
}
