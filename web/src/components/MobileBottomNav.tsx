'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, History, Zap, User, Lock } from 'lucide-react';

interface MobileBottomNavProps {
  user: any | null;
  onOpenAuth: () => void;
  onOpenPackages: () => void;
}

export function MobileBottomNav({ user, onOpenAuth, onOpenPackages }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isHistory = pathname === '/history';
  const isAdmin = pathname === '/admin';
  const isPartner = pathname === '/partner';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg shadow-slate-900/10">
      {/* 1. Tekshirish */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 rounded-xl transition ${
          isHome ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Search className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] mt-0.5">Tekshirish</span>
      </Link>

      {/* 2. Tarix */}
      <Link
        href="/history"
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 rounded-xl transition ${
          isHistory ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <History className={`w-5 h-5 ${isHistory ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] mt-0.5">Tarix</span>
      </Link>

      {/* 3. Tariflar */}
      <button
        type="button"
        onClick={onOpenPackages}
        className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 rounded-xl text-slate-500 hover:text-slate-900 transition"
      >
        <Zap className="w-5 h-5 stroke-2 text-amber-500" />
        <span className="text-[10px] mt-0.5">Tariflar</span>
      </button>

      {/* 4. Profil / Admin / Partner */}
      {user?.role === 'ADMIN' || user?.role === 'OWNER' ? (
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 rounded-xl transition ${
            isAdmin ? 'text-purple-700 font-bold' : 'text-purple-600'
          }`}
        >
          <Lock className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5">Admin</span>
        </Link>
      ) : user?.role === 'PARTNER' ? (
        <Link
          href="/partner"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 rounded-xl transition ${
            isPartner ? 'text-emerald-700 font-bold' : 'text-emerald-600'
          }`}
        >
          <User className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5">Kabinet</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 rounded-xl text-slate-500 hover:text-slate-900 transition"
        >
          <User className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5">{user ? 'Profil' : 'Kirish'}</span>
        </button>
      )}
    </nav>
  );
}
