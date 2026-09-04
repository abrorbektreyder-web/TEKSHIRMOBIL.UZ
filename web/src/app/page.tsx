'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ImeiInput } from '../components/ImeiInput';
import { VerificationResultModal } from '../components/VerificationResultModal';
import { PackagePurchaseModal } from '../components/PackagePurchaseModal';
import { AuthModal } from '../components/AuthModal';
import { api, getSavedUser, clearToken } from '../lib/api';
import { PublicVerificationResponse } from '@tekshir/shared';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  HelpCircle,
  Coins,
  ChevronDown,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<any | null>(null);
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicVerificationResponse | null>(null);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);

  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
      // Fetch fresh profile
      api.auth
        .getMe()
        .then((fresh) => setUser(fresh))
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    setUser(null);
  };

  const handleVerify = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (user.credits <= 0) {
      setIsPackagesOpen(true);
      return;
    }

    setLoading(true);

    try {
      const res = await api.verification.verify(imei);
      setResult(res);

      // Update remaining credits in user state
      setUser((prev: any) => (prev ? { ...prev, credits: res.creditsRemaining } : null));
    } catch (e: any) {
      if (e.message?.includes('kredit') || e.message?.includes('402')) {
        setIsPackagesOpen(true);
      } else {
        alert(e.message || 'Tekshiruvda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPackages={() => setIsPackagesOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          {/* Subtle atmospheric mesh & dot grid background */}
          <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_70%_50%_at_50%_25%,#000_70%,transparent_100%)] pointer-events-none -z-10 opacity-70 dark:opacity-85" />
          
          {/* Organic floating atmospheric glow orbs */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-gradient-to-tr from-brand-600/15 via-indigo-600/20 to-cyan-500/10 dark:from-brand-600/25 dark:via-indigo-600/20 dark:to-cyan-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-ambient" />
          <div className="absolute top-28 left-1/3 -translate-x-1/2 w-[480px] h-[220px] bg-brand-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
            {/* Top Status Pill with live radar ping */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-200 text-xs font-semibold mb-6 shadow-sm hover:border-brand-500/40 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>O‘zbekistondagi do‘kon va hamkorlar bazasi</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-100/80 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50">
                LIVE 24/7
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-6">
              Ikkinchi qo‘l telefon olyapsizmi?{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
                Muddatli to‘lovini
              </span>{' '}
              tekshiring!
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Muddatli to‘lovga olinib, qarzi to‘lanmagan telefonlar tez orada do‘kon yoki provayder
              tomonidan bloklanishi mumkin. IMEI kodini kiriting va xavfsiz xarid qiling.
            </p>

            {/* Verification Input Box */}
            <ImeiInput
              value={imei}
              onChange={setImei}
              onSubmit={handleVerify}
              loading={loading}
            />

            {/* Stats / Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Parallel real-time integratsiya</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium shadow-sm">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>3–5 soniyada rasmiy javob</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium shadow-sm">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Kredit faqat aniq natijada sarflanadi</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM & SOLUTION SECTION */}
        <section className="py-20 bg-slate-50/70 dark:bg-[#070c18]/80 border-y border-slate-200/80 dark:border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2.5">
                Qanday xavf mavjud?
              </h2>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Nasiyaga olingan telefonni sotib olish oqibati
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 font-black text-base mb-5 group-hover:scale-110 transition-transform">
                  1
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Nasiyaga sotiladi</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dastlabki xaridor do‘kondan qurilmani muddatli to‘lov (nasiya) evaziga oladi.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-base mb-5 group-hover:scale-110 transition-transform">
                  2
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Qayta sotiladi</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Birinchi xaridor to‘lovni oxirigacha to‘lamasdan telefonni bozorda uchinchi shaxsga sotib yuboradi.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-rose-200 dark:border-rose-900/50 shadow-sm bg-gradient-to-b from-white dark:from-[#0f172a] to-rose-50/40 dark:to-rose-950/20 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-800/80 transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-11 h-11 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black text-base mb-5 shadow-lg shadow-rose-600/30 group-hover:scale-110 transition-transform">
                  3
                </div>
                <h4 className="font-extrabold text-rose-950 dark:text-rose-200 text-base mb-2">Qurilma bloklanadi</h4>
                <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                  Do‘kon to‘lov to‘lanmagani sabab telefonni masofadan bloklaydi. Jabrlanuvchi esa yangi xaridor bo‘lib qoladi!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING PACKAGES SECTION */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2.5">
                Qulay narxlar
              </h2>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Tekshiruv paketlari
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kreditlar muddati chegaralanmagan. Xato yoki noaniq javobda kredit yechilmaydi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { name: '1 ta tekshiruv', credits: 1, price: '5 000', desc: 'Bitta telefonni tekshirish uchun' },
                { name: '5 ta tekshiruv', credits: 5, price: '20 000', desc: '20% arzonroq (4 000 so‘m/ta)' },
                { name: '10 ta tekshiruv', credits: 10, price: '35 000', desc: '30% arzonroq — Eng mashhur', popular: true },
                { name: '20 ta tekshiruv', credits: 20, price: '60 000', desc: '40% arzonroq (3 000 so‘m/ta)' },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className={`p-7 rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                    p.popular
                      ? 'border-brand-600 dark:border-brand-500 bg-white dark:bg-[#0f172a] shadow-2xl shadow-brand-500/15 scale-105 relative'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md">
                      Tavsiya etiladi
                    </span>
                  )}

                  <div>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1">{p.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{p.desc}</p>
                    <div className="mb-6">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{p.price}</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">so‘m</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        setIsAuthOpen(true);
                      } else {
                        setIsPackagesOpen(true);
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] ${
                      p.popular
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-600/25'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>Tanlash</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-slate-50/70 dark:bg-[#070c18]/80 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white text-center mb-10 tracking-tight">
              Ko‘p beriladigan savollar
            </h3>

            <div className="space-y-4">
              {[
                {
                  q: 'Telefon IMEI raqamini qanday bilsa bo‘ladi?',
                  a: 'Har qanday telefonning qo‘ng‘iroqlar bo‘limida *#06# kodini tering. Ekranda 15 xonali IMEI raqami chiqadi.',
                },
                {
                  q: 'Kredit qachon hisobdan yechiladi?',
                  a: 'Faqatgina tekshiruv muvaffaqiyatli yakunlanib, to‘liq natija ko‘rsatilgandagina 1 ta kredit sarflanadi. Agar xato yuz bersa yoki server band bo‘lsa, kredit yechilmaydi.',
                },
                {
                  q: 'Hamkor do‘konlar qanday ma’lumotlarni ko‘radi?',
                  a: 'Hamkorlar sizning telefon raqamingiz yoki shaxsiy ma’lumotlaringizni ko‘rmaydi. Xuddi shuningdek, siz ham qaysi ichki API manzillari so‘ralganini ko‘rmaysiz — faqat yakuniy xavfsizlik natijasi taqdim etiladi.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modals */}
      <VerificationResultModal
        data={result}
        onClose={() => setResult(null)}
        onReset={() => {
          setResult(null);
          setImei('');
        }}
      />

      <PackagePurchaseModal
        isOpen={isPackagesOpen}
        onClose={() => setIsPackagesOpen(false)}
        onSuccess={(newCredits) => {
          setUser((prev: any) => (prev ? { ...prev, credits: newCredits } : null));
          alert(`Muvaffaqiyatli! Sizning hisobingizga tekshiruv kreditlari qo‘shildi.`);
        }}
        onRequireAuth={() => {
          setIsPackagesOpen(false);
          setIsAuthOpen(true);
        }}
        isLoggedIn={!!user}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      <MobileBottomNav
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPackages={() => setIsPackagesOpen(true)}
      />
    </>
  );
}
