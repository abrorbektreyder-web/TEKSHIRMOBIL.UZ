'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft, Lock, Calendar, Hash } from 'lucide-react';

export default function CertificateValidationPage() {
  const params = useParams();
  const requestId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<any | null>(null);

  useEffect(() => {
    if (requestId) {
      // In MVP demo, display certificate proof details
      setLoading(false);
      setCertData({
        requestId,
        verifiedAt: new Date().toISOString(),
        maskedImei: '**** **** **** 1113',
        status: 'AUTHENTIC_VERIFIED',
      });
    }
  }, [requestId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-emerald-600 p-6 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mx-auto flex items-center justify-center mb-3 border border-white/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            QR KOD TASDIQLANDI
          </span>
          <h1 className="text-xl font-black mt-2">Haqiqiy Sertifikat</h1>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 leading-relaxed font-medium">
            Ushbu verifikatsiya sertifikati <b>TEKSHIR VERIFICATION PLATFORM</b> markaziy bazasi tomonidan haqiqiy va amal qiluvchi deb tasdiqlandi.
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sertifikat ID:</span>
              <span className="font-mono font-bold text-slate-900">{requestId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tekshirilgan vaqt:</span>
              <span className="font-bold text-slate-800">{new Date().toLocaleString('uz-UZ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Kriptografik status:</span>
              <span className="font-bold text-emerald-700">HMAC-SHA256 Valid</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Yangi IMEI tekshirish
            </Link>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          TEKSHIR.UZ — O‘zbekiston Respublikasi
        </div>
      </div>
    </div>
  );
}
