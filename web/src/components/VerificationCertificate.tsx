'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { PublicVerificationResponse } from '@tekshir/shared';
import {
  ShieldCheck,
  ShieldAlert,
  Printer,
  X,
  Share2,
  CheckCircle,
  QrCode,
  Lock,
} from 'lucide-react';

interface VerificationCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  data: PublicVerificationResponse | null;
}

export function VerificationCertificate({ isOpen, onClose, data }: VerificationCertificateProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (data?.requestId) {
      const verifyUrl = `${window.location.origin}/certificate/${data.requestId}`;
      QRCode.toDataURL(verifyUrl, {
        width: 160,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const isAlert = data.result === 'ACTIVE_INSTALLMENT';
  const isClear = data.result === 'CLEAR';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col animate-scaleUp">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-black text-slate-900">Rasmiy Verifikatsiya Sertifikati</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              PDF / Chop etish
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE DOCUMENT */}
        <div
          id="printable-certificate"
          className="p-8 sm:p-10 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white flex-1 font-sans"
        >
          {/* Certificate Guilloche Border */}
          <div className="border-4 border-double border-slate-300 rounded-3xl p-6 sm:p-8 bg-white relative overflow-hidden shadow-inner">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <ShieldCheck className="w-96 h-96 text-slate-900" />
            </div>

            {/* Header */}
            <div className="text-center pb-6 border-b border-slate-200 relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/20 mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                TEKSHIR VERIFICATION PLATFORM
              </h2>
              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                Mobil Qurilma Muddatli To‘lov Xavfsizlik Sertifikati
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-400">
                Sertifikat raqami: <span className="font-bold text-slate-700">{data.requestId}</span>
              </div>
            </div>

            {/* Official Status Stamp Box */}
            <div className="py-6 text-center">
              <div
                className={`inline-block py-3 px-6 rounded-2xl border-2 shadow-sm ${
                  isAlert
                    ? 'bg-rose-50 border-rose-500 text-rose-900'
                    : isClear
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                    : 'bg-amber-50 border-amber-500 text-amber-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  {isAlert && <ShieldAlert className="w-6 h-6 text-rose-600" />}
                  {isClear && <ShieldCheck className="w-6 h-6 text-emerald-600" />}
                  <span className="text-base sm:text-lg font-black tracking-tight">
                    {data.title}
                  </span>
                </div>
                <p className="text-xs font-semibold max-w-md mx-auto">
                  {data.message}
                </p>
              </div>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-b border-slate-200 text-xs">
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block font-medium">Tekshirilgan Qurilma:</span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {data.maskedImei}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Tekshiruv Sanasi:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(data.verifiedAt).toLocaleString('uz-UZ')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Vakolatli Manbalar:</span>
                  <span className="font-bold text-slate-800">
                    Hamkor do‘konlar, API & Nasiya bazalari
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center sm:border-l sm:border-slate-200 sm:pl-6">
                {qrDataUrl ? (
                  <div className="text-center">
                    <img
                      src={qrDataUrl}
                      alt="Tekshir QR"
                      className="w-28 h-28 mx-auto rounded-xl border border-slate-200 p-1 shadow-sm"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                      Kamera orqali haqiqiyligini tekshiring
                    </span>
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <QrCode className="w-10 h-10" />
                  </div>
                )}
              </div>
            </div>

            {/* Official Legal Footer */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-4">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Lock className="w-3.5 h-3.5 text-brand-600" />
                <span>HMAC-SHA256 Kriptografik Himoya Bilan Tasdiqlangan</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-slate-700">TEKSHIR.UZ / Rasmiy Kafolat</span>
                <span>O‘zbekiston Respublikasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
