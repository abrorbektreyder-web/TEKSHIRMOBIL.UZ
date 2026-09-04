'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { AuthModal } from '../../components/AuthModal';
import { PackagePurchaseModal } from '../../components/PackagePurchaseModal';
import { api, getSavedUser, clearToken } from '../../lib/api';
import Link from 'next/link';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Hash,
  Sparkles,
} from 'lucide-react';

export default function HistoryPage() {
  const [user, setUser] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);

  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
      api.verification
        .getHistory()
        .then((items) => setHistory(items))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <>
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPackages={() => setIsPackagesOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Asosiy sahifaga qaytish
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-7 h-7 text-brand-600" /> Tekshiruvlar tarixi
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Siz amalga oshirgan barcha IMEI tekshiruvlari ro‘yxati
            </p>
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Yangi tekshiruv
          </Link>
        </div>

        {/* Content */}
        {!user ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Tizimga kiring</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              O‘z tekshiruvlaringiz tarixini ko‘rish uchun telefon raqamingiz orqali tizimga kiring.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
            >
              Kirish / Ro‘yxatdan o‘tish
            </button>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Tarix yuklanmoqda...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Hozircha tekshiruvlar mavjud emas
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Siz hali hech qanday qurilma tekshirmadingiz.
            </p>
            <Link
              href="/"
              className="inline-flex py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
            >
              Birinchi telefonni tekshirish
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const isAlert = item.status === 'ACTIVE_INSTALLMENT';
              const isClear = item.status === 'CLEAR';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-300"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAlert
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : isClear
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {isAlert && <ShieldAlert className="w-5 h-5" />}
                      {isClear && <ShieldCheck className="w-5 h-5" />}
                      {!isAlert && !isClear && <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {item.maskedImei}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            isAlert
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isClear
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isAlert ? 'Muddatli to‘lov faol' : isClear ? 'Toza' : 'Provayder xatosi'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(item.createdAt).toLocaleString('uz-UZ')}
                        </span>
                        {item.matchedPartnerName && (
                          <span className="font-semibold text-slate-700">
                            Do‘kon: {item.matchedPartnerName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      ID: {item.requestId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      <PackagePurchaseModal
        isOpen={isPackagesOpen}
        onClose={() => setIsPackagesOpen(false)}
        onSuccess={(newCredits) =>
          setUser((prev: any) => (prev ? { ...prev, credits: newCredits } : null))
        }
        onRequireAuth={() => {
          setIsPackagesOpen(false);
          setIsAuthOpen(true);
        }}
        isLoggedIn={!!user}
      />

      <MobileBottomNav
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPackages={() => setIsPackagesOpen(true)}
      />
    </>
  );
}
