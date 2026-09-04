'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { AuthModal } from '../../components/AuthModal';
import { api, getSavedUser, clearToken } from '../../lib/api';
import { isValidImei, cleanImei, calculateImeiCheckDigit } from '@tekshir/shared';
import {
  ShieldCheck,
  Plus,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  Upload,
} from 'lucide-react';

export default function PartnerCabinetPage() {
  const [user, setUser] = useState<any | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Single Add Form
  const [singleImei, setSingleImei] = useState('');
  const [singleStatus, setSingleStatus] = useState<'ACTIVE' | 'PAID' | 'BLOCKED'>('ACTIVE');
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleMsg, setSingleMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // CSV Import Form
  const [csvText, setCsvText] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [importReport, setImportReport] = useState<any | null>(null);

  // Auth modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const loadDevices = (q?: string) => {
    setLoading(true);
    api.partner
      .getDevices(q)
      .then((d) => setDevices(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
      loadDevices();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    setUser(null);
  };

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanImei(singleImei);

    if (cleaned.length !== 15 || !isValidImei(cleaned)) {
      setSingleMsg({
        type: 'error',
        text: 'IMEI 15 xonali bo‘lishi va Luhn tekshiruvidan o‘tishi shart',
      });
      return;
    }

    setSingleLoading(true);
    setSingleMsg(null);

    try {
      await api.partner.addDevice(cleaned, singleStatus);
      setSingleMsg({ type: 'success', text: 'Qurilma muvaffaqiyatli saqlandi!' });
      setSingleImei('');
      loadDevices(search);
    } catch (err: any) {
      setSingleMsg({ type: 'error', text: err.message || 'Xatolik yuz berdi' });
    } finally {
      setSingleLoading(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) return;

    setCsvLoading(true);
    setImportReport(null);

    try {
      const res = await api.partner.importCsv('import_' + Date.now() + '.csv', csvText);
      setImportReport(res);
      setCsvText('');
      loadDevices(search);
    } catch (err: any) {
      alert(err.message || 'CSV importda xatolik yuz berdi');
    } finally {
      setCsvLoading(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Ushbu qurilmani bazadan o‘chirishni tasdiqlaysizmi?')) return;
    try {
      await api.partner.deleteDevice(id);
      loadDevices(search);
    } catch (err: any) {
      alert(err.message || 'O‘chirishda xatolik');
    }
  };

  const insertSampleCsv = () => {
    const cd1 = calculateImeiCheckDigit('35699911111111');
    const cd2 = calculateImeiCheckDigit('35699922222222');
    const cd3 = calculateImeiCheckDigit('35699933333333');

    const sample = `imei,status
35699911111111${cd1},ACTIVE
35699922222222${cd2},ACTIVE
35699933333333${cd3},PAID
999999999999999,ACTIVE`;

    setCsvText(sample);
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
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Partner Cabinet
              </span>
              <span className="text-xs text-slate-500">Do‘kon & Hamkor Boshqaruvi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Muddatli to‘lovdagi qurilmalar bazasi
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Jami qurilmalar:</div>
              <div className="text-xl font-black text-slate-900">{devices.length} ta</div>
            </div>
          </div>
        </div>

        {!user || (user.role !== 'PARTNER' && user.role !== 'ADMIN' && user.role !== 'OWNER') ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">
              Hamkor hisobiga kiring
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Partner kabinetiga kirish uchun hamkor telefon raqami va parolidan foydalaning.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
            >
              Hamkor sifatida kirish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Forms */}
            <div className="space-y-6 lg:col-span-1">
              {/* 1. Add Single IMEI */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <h3 className="font-extrabold text-base text-slate-900 mb-1 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" /> Bitta IMEI qo‘shish
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Yangi sotilgan yoki statusi o‘zgargan telefonni kiritish
                </p>

                <form onSubmit={handleAddSingle} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      15 xonali IMEI:
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={singleImei}
                      onChange={(e) => setSingleImei(e.target.value)}
                      placeholder="356000000000000"
                      className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Holati:</label>
                    <select
                      value={singleStatus}
                      onChange={(e: any) => setSingleStatus(e.target.value)}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-none bg-white"
                    >
                      <option value="ACTIVE">ACTIVE — Muddatli to‘lov faol</option>
                      <option value="PAID">PAID — To‘liq to‘langan</option>
                      <option value="BLOCKED">BLOCKED — Do‘kon tomonidan bloklangan</option>
                    </select>
                  </div>

                  {singleMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        singleMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {singleMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={singleLoading || !singleImei}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    {singleLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Bazaga kiritish</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* 2. CSV / Excel Import */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-brand-600" /> CSV / Excel Import
                  </h3>
                  <button
                    type="button"
                    onClick={insertSampleCsv}
                    className="text-[11px] text-brand-600 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" /> Namuna
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Format: <code className="bg-slate-100 px-1 py-0.5 rounded">imei,status</code>
                </p>

                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="imei,status&#10;356111111111113,ACTIVE&#10;356222222222226,ACTIVE"
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:border-brand-600 outline-none mb-3"
                />

                {importReport && (
                  <div className="mb-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-emerald-700">Muvaffaqiyatli: {importReport.successCount} ta</span>
                      <span className="text-rose-700">Xato: {importReport.failCount} ta</span>
                    </div>
                    {importReport.errors?.length > 0 && (
                      <div className="text-[11px] text-rose-600 pt-1 border-t border-slate-200">
                        {importReport.errors[0]?.line}-qator: {importReport.errors[0]?.error}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleImportCsv}
                  disabled={csvLoading || !csvText.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {csvLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>CSV Importni boshlash</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Devices List */}
            <div className="lg:col-span-2">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <h3 className="font-extrabold text-base text-slate-900">
                    Ro‘yxatdan o‘tgan qurilmalar ({devices.length})
                  </h3>

                  {/* Search box */}
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        loadDevices(e.target.value);
                      }}
                      placeholder="IMEI bo‘yicha qidiruv..."
                      className="text-xs font-mono pl-8 pr-4 py-2 rounded-xl border border-slate-300 focus:border-brand-600 outline-none w-full sm:w-64"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Yuklanmoqda...</span>
                  </div>
                ) : devices.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    Qurilmalar topilmadi. Chap tomondagi forma orqali qo‘shing.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Qurilma IMEI</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Manba</th>
                          <th className="pb-3 font-semibold">Yangilangan</th>
                          <th className="pb-3 text-right font-semibold">Amal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {devices.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 font-mono font-bold text-slate-900">
                              {d.maskedImei}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-black uppercase text-[10px] ${
                                  d.status === 'ACTIVE'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : d.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {d.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {d.sourceType}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 text-[11px]">
                              {new Date(d.updatedAt).toLocaleDateString('uz-UZ')}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleDeleteDevice(d.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="O‘chirish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          loadDevices();
        }}
      />
    </>
  );
}
