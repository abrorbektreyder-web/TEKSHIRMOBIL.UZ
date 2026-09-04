'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Coins, UserCheck, LogOut, Lock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  user: any | null;
  onOpenAuth: () => void;
  onOpenPackages: () => void;
  onLogout: () => void;
}

export function Navbar({ user, onOpenAuth, onOpenPackages, onLogout }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0b0f19]/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">TEKSHIR</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800/60">
                IMEI MVP
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">Muddatli to‘lov tekshiruvi</p>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Tekshirish
          </Link>
          <Link href="/history" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Tarix
          </Link>
          <button
            onClick={onOpenPackages}
            className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1"
          >
            Tariflar
          </button>
          {user?.role === 'ADMIN' || user?.role === 'OWNER' ? (
            <Link
              href="/admin"
              className="text-sm font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800/50 flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin Panel
            </Link>
          ) : null}
          {user?.role === 'PARTNER' ? (
            <Link
              href="/partner"
              className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Partner Kabinet
            </Link>
          ) : null}
        </nav>

        {/* Right side user / theme toggle / credits */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Sun / Moon */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={theme === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {user ? (
            <>
              {/* Credits badge */}
              <button
                onClick={onOpenPackages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition shadow-sm"
                title="Kreditlarni to‘ldirish"
              >
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{user.credits ?? 0} ta</span>
                <span className="text-amber-500 font-normal">+</span>
              </button>

              {/* User Dropdown / Info */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[100px]">
                    {user.name || 'Mijoz'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{user.phone}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Chiqish"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm transition"
            >
              <UserCheck className="w-4 h-4 mr-1.5" />
              Kirish / Ro‘yxatdan o‘tish
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
