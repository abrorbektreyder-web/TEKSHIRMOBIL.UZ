'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { AuthModal } from '../../components/AuthModal';
import { api, getSavedUser, clearToken } from '../../lib/api';
import { RevenueAreaChart } from '../../components/admin/RevenueAreaChart';
import { VerificationsBarChart } from '../../components/admin/VerificationsBarChart';
import { StatusDonutChart } from '../../components/admin/StatusDonutChart';
import { ExportCsvButton } from '../../components/admin/ExportCsvButton';
import {
  Lock,
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  History,
  Building2,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
} from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<any | null>(null);
  const [tab, setTab] = useState<'KPI' | 'USERS' | 'VERIFICATIONS' | 'PARTNERS' | 'PAYMENTS' | 'AUDIT'>('KPI');

  const [kpis, setKpis] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [verificationsList, setVerificationsList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpi, u, v, p, pay, a] = await Promise.all([
        api.admin.getDashboard().catch(() => null),
        api.admin.getUsers().catch(() => []),
        api.admin.getVerifications().catch(() => []),
        api.admin.getPartners().catch(() => []),
        api.admin.getPayments().catch(() => []),
        api.admin.getAuditLogs().catch(() => []),
      ]);

      setKpis(kpi);
      setUsersList(u);
      setVerificationsList(v);
      setPartnersList(p);
      setPaymentsList(pay);
      setAuditLogs(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
      if (saved.role === 'ADMIN' || saved.role === 'OWNER') {
        loadData();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.admin.updateUserStatus(userId, nextStatus as any);
      setUsersList((prev) =>
        prev.map((item) => (item.id === userId ? { ...item, status: nextStatus } : item)),
      );
    } catch (err: any) {
      alert(err.message || 'Statusni yangilab bo‘lmadi');
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
  };

  // Compute 7-day trend data for interactive charts
  const analytics7Days = useMemo(() => {
    const days: { day: string; dateKey: string; clear: number; active: number; revenue: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' });
      days.push({ day: dayLabel, dateKey, clear: 0, active: 0, revenue: 0 });
    }

    verificationsList.forEach((v) => {
      const vDate = new Date(v.createdAt).toISOString().split('T')[0];
      const match = days.find((d) => d.dateKey === vDate);
      if (match) {
        if (v.status === 'CLEAR') match.clear++;
        else if (v.status === 'ACTIVE_INSTALLMENT') match.active++;
      }
    });

    paymentsList.forEach((p) => {
      if (p.status === 'PAID') {
        const pDate = new Date(p.createdAt).toISOString().split('T')[0];
        const match = days.find((d) => d.dateKey === pDate);
        if (match) {
          match.revenue += Number(p.amount) || 0;
        }
      }
    });

    return days;
  }, [verificationsList, paymentsList]);

  const revenueChartData = useMemo(() => {
    return analytics7Days.map((d) => ({
      date: d.day,
      amount: d.revenue,
    }));
  }, [analytics7Days]);

  const verificationsChartData = useMemo(() => {
    return analytics7Days.map((d) => ({
      day: d.day,
      clear: d.clear,
      active: d.active,
    }));
  }, [analytics7Days]);

  const donutData = useMemo(() => {
    const clear = kpis?.verifications?.clear ?? verificationsList.filter((v) => v.status === 'CLEAR').length;
    const active = kpis?.verifications?.activeInstallment ?? verificationsList.filter((v) => v.status === 'ACTIVE_INSTALLMENT').length;
    const unavailable = verificationsList.filter((v) => v.status === 'PROVIDER_UNAVAILABLE').length;
    return {
      clearCount: clear || 1,
      activeCount: active || 1,
      unavailableCount: unavailable,
    };
  }, [kpis, verificationsList]);

  return (
    <>
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPackages={() => {}}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Admin Dashboard
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Tizim holati va metrikalar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Boshqaruv Paneli
            </h1>
          </div>
        </div>

        {!user || (user.role !== 'ADMIN' && user.role !== 'OWNER') ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto">
            <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2">Administrator huquqi kerak</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Admin paneliga kirish uchun administrator telefon raqami va paroli orqali tizimga kiring.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-bold text-xs shadow-md transition"
            >
              Admin sifatida kirish
            </button>
          </div>
        ) : (
          <div>
            {/* KPI Cards */}
            {kpis && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* 1. Users */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold mb-3">
                    <span>Foydalanuvchilar</span>
                    <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {kpis.users?.total ?? 0}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    Bugun: +{kpis.users?.today ?? 0} yangi
                  </div>
                </div>

                {/* 2. Verifications */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold mb-3">
                    <span>IMEI Tekshiruvlar</span>
                    <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {kpis.verifications?.total ?? 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">🟢 {kpis.verifications?.clear ?? 0}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">🔴 {kpis.verifications?.activeInstallment ?? 0}</span>
                  </div>
                </div>

                {/* 3. Revenue */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold mb-3">
                    <span>Tushum (Daromad)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {(kpis.revenue?.total ?? 0).toLocaleString('uz-UZ')}{' '}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">so‘m</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Sotilgan paketlar: {kpis.revenue?.packagesSold ?? 0} ta
                  </div>
                </div>

                {/* 4. Partners */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold mb-3">
                    <span>Faol Hamkorlar</span>
                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    {kpis.partners?.activeCount ?? 0} ta
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Parallel ulanish faol
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
              {[
                { id: 'KPI', label: 'Umumiy & Analitika' },
                { id: 'USERS', label: `Foydalanuvchilar (${usersList.length})` },
                { id: 'VERIFICATIONS', label: `Tekshiruvlar (${verificationsList.length})` },
                { id: 'PARTNERS', label: `Hamkorlar (${partnersList.length})` },
                { id: 'PAYMENTS', label: `To‘lovlar (${paymentsList.length})` },
                { id: 'AUDIT', label: 'Audit Log' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    tab === t.id
                      ? 'bg-slate-900 text-white dark:bg-brand-600 dark:text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {tab === 'KPI' && (
              <div className="space-y-6">
                {/* Visual Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Trend SVG Area Chart */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <RevenueAreaChart data={revenueChartData} />
                  </div>

                  {/* Verifications Trend SVG Bar Chart */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <VerificationsBarChart data={verificationsChartData} />
                  </div>
                </div>

                {/* Donut Chart & System Health */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                    <StatusDonutChart
                      clearCount={donutData.clearCount}
                      activeCount={donutData.activeCount}
                      unavailableCount={donutData.unavailableCount}
                    />
                  </div>

                  <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="font-black text-slate-900 dark:text-white text-base">
                          Tizim holati: Barcha modullar normal ishlamoqda
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Backend Modular Monolith arxitekturasi, Payme JSON-RPC 2.0 va Click rasmiy protokollari,
                        parallel hamkor adapterlari va xavfsizlik HMAC indekslash mexanizmlari to‘liq faol.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <div className="text-[11px] text-slate-400">Payme Protokol:</div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">FAOL (RPC 2.0)</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <div className="text-[11px] text-slate-400">Click Protokol:</div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">FAOL (Prep/Comp)</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <div className="text-[11px] text-slate-400">Parallel Adapterlar:</div>
                          <div className="text-xs font-bold text-brand-600 dark:text-brand-400">3 xil (API/Cab/CSV)</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setTab('VERIFICATIONS')}
                        className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition"
                      >
                        Jonli tekshiruvlar ro‘yxati
                      </button>
                      <button
                        onClick={() => setTab('PAYMENTS')}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                      >
                        Barcha to‘lovlar tarixi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'USERS' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase">
                        <th className="pb-3 font-semibold">Ism / Telefon</th>
                        <th className="pb-3 font-semibold">Rol</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Tekshiruvlar</th>
                        <th className="pb-3 font-semibold">Ro‘yxatdan o‘tgan</th>
                        <th className="pb-3 text-right font-semibold">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{u.name || 'Noma’lum'}</div>
                            <div className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{u.phone}</div>
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                            {u._count?.verifications ?? 0} ta
                          </td>
                          <td className="py-3 text-slate-400 dark:text-slate-500 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                u.status === 'ACTIVE'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'Bloklash' : 'Faollashtirish'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'VERIFICATIONS' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    IMEI Tekshiruvlar ro‘yxati ({verificationsList.length})
                  </h3>
                  <ExportCsvButton data={verificationsList} filename="tekshiruvlar_royxati" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase">
                        <th className="pb-3 font-semibold">Qurilma IMEI</th>
                        <th className="pb-3 font-semibold">Natija</th>
                        <th className="pb-3 font-semibold">Hamkor</th>
                        <th className="pb-3 font-semibold">Tezlik</th>
                        <th className="pb-3 font-semibold">Sana</th>
                        <th className="pb-3 text-right font-semibold">So‘rov ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {verificationsList.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">
                            {v.maskedImei}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-black uppercase text-[10px] ${
                                v.status === 'ACTIVE_INSTALLMENT'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : v.status === 'CLEAR'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">
                            {v.matchedPartnerName || '—'}
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {v.latencyMs ?? 0} ms
                          </td>
                          <td className="py-3 text-slate-400 dark:text-slate-500 text-[11px]">
                            {new Date(v.createdAt).toLocaleString('uz-UZ')}
                          </td>
                          <td className="py-3 text-right font-mono text-[10px] text-slate-400 dark:text-slate-500">
                            {v.requestId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'PARTNERS' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase">
                        <th className="pb-3 font-semibold">Hamkor nomi</th>
                        <th className="pb-3 font-semibold">Integratsiya turi</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Bazadagi qurilmalar</th>
                        <th className="pb-3 font-semibold">Qo‘shilgan sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {partnersList.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="py-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                          <td className="py-3">
                            <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                              {p.integrationType}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                            {p._count?.devices ?? 0} ta
                          </td>
                          <td className="py-3 text-slate-400 dark:text-slate-500 text-[11px]">
                            {new Date(p.createdAt).toLocaleDateString('uz-UZ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'PAYMENTS' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Barcha to‘lovlar ({paymentsList.length})
                  </h3>
                  <ExportCsvButton data={paymentsList} filename="tolovlar_royxati" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase">
                        <th className="pb-3 font-semibold">Foydalanuvchi</th>
                        <th className="pb-3 font-semibold">Paket</th>
                        <th className="pb-3 font-semibold">Summa</th>
                        <th className="pb-3 font-semibold">Provayder</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paymentsList.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{pay.user?.name || 'Mijoz'}</div>
                            <div className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">{pay.user?.phone}</div>
                          </td>
                          <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{pay.package?.name}</td>
                          <td className="py-3 font-bold text-slate-900 dark:text-white">
                            {pay.amount.toLocaleString('uz-UZ')} so‘m
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {pay.provider}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                pay.status === 'PAID'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {pay.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 dark:text-slate-500 text-[11px]">
                            {new Date(pay.createdAt).toLocaleString('uz-UZ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'AUDIT' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="space-y-3">
                  {auditLogs.length === 0 ? (
                    <div className="text-center text-slate-400 dark:text-slate-500 text-xs py-8">
                      Audit jurnali bo‘sh
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white mr-2">{log.action}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            Actor: {log.actorType} ({log.user?.phone || log.actorId})
                          </span>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 text-[11px]">
                          {new Date(log.createdAt).toLocaleString('uz-UZ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          loadData();
        }}
      />
    </>
  );
}
