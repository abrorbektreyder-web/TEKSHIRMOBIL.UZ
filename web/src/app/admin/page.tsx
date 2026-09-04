'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { AuthModal } from '../../components/AuthModal';
import { api, getSavedUser, clearToken } from '../../lib/api';
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
              <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Admin Dashboard
              </span>
              <span className="text-xs text-slate-500">Tizim holati va metrikalar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Boshqaruv Paneli
            </h1>
          </div>
        </div>

        {!user || (user.role !== 'ADMIN' && user.role !== 'OWNER') ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto">
            <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Administrator huquqi kerak</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Admin paneliga kirish uchun administrator telefon raqami va paroli orqali tizimga kiring.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
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
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-3">
                    <span>Foydalanuvchilar</span>
                    <Users className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">
                    {kpis.users?.total ?? 0}
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold">
                    Bugun: +{kpis.users?.today ?? 0} yangi
                  </div>
                </div>

                {/* 2. Verifications */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-3">
                    <span>IMEI Tekshiruvlar</span>
                    <History className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">
                    {kpis.verifications?.total ?? 0}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="text-emerald-600 font-semibold">🟢 {kpis.verifications?.clear ?? 0}</span>
                    <span className="text-rose-600 font-semibold">🔴 {kpis.verifications?.activeInstallment ?? 0}</span>
                  </div>
                </div>

                {/* 3. Revenue */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-3">
                    <span>Tushum (Daromad)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">
                    {(kpis.revenue?.total ?? 0).toLocaleString('uz-UZ')}{' '}
                    <span className="text-xs font-semibold text-slate-500">so‘m</span>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">
                    Sotilgan paketlar: {kpis.revenue?.packagesSold ?? 0} ta
                  </div>
                </div>

                {/* 4. Partners */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-3">
                    <span>Faol Hamkorlar</span>
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">
                    {kpis.partners?.activeCount ?? 0} ta
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Parallel ulanish faol
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6">
              {[
                { id: 'KPI', label: 'Umumiy' },
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
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {tab === 'USERS' && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="pb-3">Ism / Telefon</th>
                        <th className="pb-3">Rol</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Tekshiruvlar</th>
                        <th className="pb-3">Ro‘yxatdan o‘tgan</th>
                        <th className="pb-3 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3">
                            <div className="font-bold text-slate-900">{u.name || 'Noma’lum'}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{u.phone}</div>
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-slate-700">
                            {u._count?.verifications ?? 0} ta
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                u.status === 'ACTIVE'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="pb-3">Qurilma IMEI</th>
                        <th className="pb-3">Natija</th>
                        <th className="pb-3">Hamkor</th>
                        <th className="pb-3">Tezlik</th>
                        <th className="pb-3">Sana</th>
                        <th className="pb-3 text-right">So‘rov ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {verificationsList.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 font-mono font-bold text-slate-900">
                            {v.maskedImei}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-black uppercase text-[10px] ${
                                v.status === 'ACTIVE_INSTALLMENT'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : v.status === 'CLEAR'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-700 font-medium">
                            {v.matchedPartnerName || '—'}
                          </td>
                          <td className="py-3 text-slate-500 font-mono text-[11px]">
                            {v.latencyMs ?? 0} ms
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">
                            {new Date(v.createdAt).toLocaleString('uz-UZ')}
                          </td>
                          <td className="py-3 text-right font-mono text-[10px] text-slate-400">
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
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="pb-3">Hamkor nomi</th>
                        <th className="pb-3">Integratsiya turi</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Bazadagi qurilmalar</th>
                        <th className="pb-3">Qo‘shilgan sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partnersList.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 font-bold text-slate-900">{p.name}</td>
                          <td className="py-3">
                            <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                              {p.integrationType}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-slate-700">
                            {p._count?.devices ?? 0} ta
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">
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
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="pb-3">Foydalanuvchi</th>
                        <th className="pb-3">Paket</th>
                        <th className="pb-3">Summa</th>
                        <th className="pb-3">Provayder</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentsList.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3">
                            <div className="font-bold text-slate-900">{pay.user?.name || 'Mijoz'}</div>
                            <div className="text-slate-400 text-[11px] font-mono">{pay.user?.phone}</div>
                          </td>
                          <td className="py-3 font-medium text-slate-800">{pay.package?.name}</td>
                          <td className="py-3 font-bold text-slate-900">
                            {pay.amount.toLocaleString('uz-UZ')} so‘m
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {pay.provider}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                pay.status === 'PAID'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {pay.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 text-[11px]">
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
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="space-y-3">
                  {auditLogs.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-8">
                      Audit jurnali bo‘sh
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 mr-2">{log.action}</span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            Actor: {log.actorType} ({log.user?.phone || log.actorId})
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleString('uz-UZ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'KPI' && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="max-w-md mx-auto py-6">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h3 className="font-black text-slate-900 text-lg mb-1">
                    Barcha tizimlar normal holatda ishlamoqda
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Backend Modular Monolith, parallel hamkor integratsiyasi va xavfsizlik filtrlari faol.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setTab('VERIFICATIONS')}
                      className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800 transition"
                    >
                      Jonli tekshiruvlar ro‘yxati
                    </button>
                    <button
                      onClick={() => setTab('PARTNERS')}
                      className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                    >
                      Hamkorlar ro‘yxati
                    </button>
                  </div>
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
