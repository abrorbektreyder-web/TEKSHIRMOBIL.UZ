'use client';

import React, { useState } from 'react';
import { api, setToken, setSavedUser } from '../lib/api';
import { X, Smartphone, KeyRound, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [step, setStep] = useState<'PHONE' | 'CODE'>('PHONE');

  // Phone + OTP form
  const [phone, setPhone] = useState('+998907778899');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  // Password login form
  const [adminPhone, setAdminPhone] = useState('+998901234567');
  const [password, setPassword] = useState('admin12345');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.auth.sendOtp(phone);
      setStep('CODE');
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.verifyOtp(phone, code, name);
      setToken(res.accessToken);
      setSavedUser(res.user);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Tasdiqlash kodi noto‘g‘ri');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.adminLogin(adminPhone, password);
      setToken(res.accessToken);
      setSavedUser(res.user);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Telefon yoki parol noto‘g‘ri');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scaleUp">
        {/* Header with Tabs */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Tizimga kirish</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('OTP');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                tab === 'OTP'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Foydalanuvchi (SMS)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('PASSWORD');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                tab === 'PASSWORD'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Admin / Hamkor
            </button>
          </div>
        </div>

        {/* Tab 1: Phone + OTP */}
        {tab === 'OTP' && (
          <div className="p-6 pt-0">
            {step === 'PHONE' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Telefon raqamingiz:
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full text-base font-semibold px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Kodni tasdiqlash uchun SMS yuboriladi
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>SMS kod yuborish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Tasdiqlash kodi:</label>
                    <button
                      type="button"
                      onClick={() => setStep('PHONE')}
                      className="text-[11px] text-brand-600 hover:underline"
                    >
                      Raqamni o‘zgartirish
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="7777"
                    className="w-full text-center tracking-widest text-2xl font-mono font-bold px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Sinov kodi:</span>
                    <button
                      type="button"
                      onClick={() => setCode('7777')}
                      className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200"
                    >
                      7777 ni qo‘yish
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ismingiz (ixtiyoriy):
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Azizbek"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-none"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Tasdiqlash va Kirish</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Password Login */}
        {tab === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Telefon raqam:
              </label>
              <input
                type="tel"
                required
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Parol:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-none"
              />
            </div>

            {/* Quick pre-fill demo buttons */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
              <span className="font-bold text-slate-700 block">Tezkor demo loginlar:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminPhone('+998901234567');
                    setPassword('admin12345');
                  }}
                  className="text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-200"
                >
                  Admin (+998901234567)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminPhone('+998902223344');
                    setPassword('partner123');
                  }}
                  className="text-emerald-700 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
                >
                  Hamkor (+998902223344)
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Tizimga kirish</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
