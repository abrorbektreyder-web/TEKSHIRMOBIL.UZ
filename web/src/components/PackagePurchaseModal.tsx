'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PackageDto } from '@tekshir/shared';
import { X, Check, Zap, Sparkles, CreditCard } from 'lucide-react';

interface PackagePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCredits: number) => void;
  onRequireAuth: () => void;
  isLoggedIn: boolean;
}

export function PackagePurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  onRequireAuth,
  isLoggedIn,
}: PackagePurchaseModalProps) {
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  const [provider, setProvider] = useState<string>('PAYME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.packages
        .getActive()
        .then((pkgs) => {
          setPackages(pkgs);
          if (pkgs.length > 0 && !selectedPkgId) {
            setSelectedPkgId(pkgs[2]?.id || pkgs[0].id);
          }
        })
        .catch((e) => console.error(e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuy = async () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }

    if (!selectedPkgId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Create payment order
      const order = await api.payments.create(selectedPkgId, provider);

      // 2. Complete payment (simulation in MVP)
      const res = await api.payments.complete(order.paymentId);

      onSuccess(res.balanceAfter);
      onClose();
    } catch (e: any) {
      setError(e.message || 'To‘lovda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden animate-scaleUp transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Tekshiruv paketlari
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Nechta telefon tekshirmoqchisiz?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Package list */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {packages.map((pkg) => {
            const isSelected = pkg.id === selectedPkgId;
            const pricePerCredit = Math.round(pkg.price / pkg.credits);
            const isPopular = pkg.credits === 10;

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkgId(pkg.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative ${
                  isSelected
                    ? 'border-brand-600 dark:border-brand-500 bg-brand-50/40 dark:bg-brand-950/40 shadow-md shadow-brand-500/10'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#162036]'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> Eng ommabop
                  </span>
                )}

                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base">{pkg.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {pkg.description || `${pkg.credits} ta muvaffaqiyatli tekshiruv`}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-slate-900 dark:text-white text-lg">
                    {pkg.price.toLocaleString('uz-UZ')}{' '}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">so‘m</span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                    {pricePerCredit.toLocaleString('uz-UZ')} so‘m/dona
                  </div>
                </div>
              </div>
            );
          })}

          {/* Payment Provider Options */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              To‘lov usulini tanlang:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'PAYME', label: 'Payme', badge: 'Rasmiy API' },
                { id: 'CLICK', label: 'Click', badge: 'Rasmiy API' },
                { id: 'UZUM', label: 'Uzum Bank', badge: 'Keshbek' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`py-3 px-2 rounded-xl border-2 text-center transition flex flex-col items-center justify-center gap-1 ${
                    provider === p.id
                      ? 'border-brand-600 dark:border-brand-500 bg-brand-50/50 dark:bg-brand-950/50 text-brand-900 dark:text-brand-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#162036]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-bold">{p.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 dark:bg-[#0b0f19] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-400">Jami to‘lov:</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {selectedPkg ? selectedPkg.price.toLocaleString('uz-UZ') : 0} so‘m
            </div>
          </div>

          <button
            type="button"
            onClick={handleBuy}
            disabled={loading || !selectedPkgId}
            className="flex-1 py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>To‘lov bajarilmoqda...</span>
              </>
            ) : (
              <span>DAVOM ETISH VA TO‘LASH</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
