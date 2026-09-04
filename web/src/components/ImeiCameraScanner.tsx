'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cleanImei, isValidImei } from '@tekshir/shared';
import { Camera, X, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface ImeiCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (imei: string) => void;
}

export function ImeiCameraScanner({ isOpen, onClose, onScan }: ImeiCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannedImei, setScannedImei] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMsg(null);
    setScannedImei(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setHasCamera(false);
        setErrorMsg('Ushbu qurilmada kamera qo‘llab-quvvatlanmaydi.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setScanning(true);
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setHasCamera(false);
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Kameraga kirish ruxsati berilmadi. Iltimos, brauzer sozlamalarida kameraga ruxsat bering.'
          : 'Kamerani ishga tushirishda xatolik yuz berdi.'
      );
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  // Continuous barcode scan loop
  useEffect(() => {
    if (!scanning || !isOpen) return;

    let active = true;
    const interval = setInterval(async () => {
      if (!active || !videoRef.current || videoRef.current.readyState < 2) return;

      // Check if BarcodeDetector API is supported
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'itf', 'qr_code'],
          });

          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            for (const b of barcodes) {
              const cleaned = cleanImei(b.rawValue || '');
              if (cleaned.length === 15 && isValidImei(cleaned)) {
                active = false;
                setScannedImei(cleaned);
                if (navigator.vibrate) navigator.vibrate(100);
                setTimeout(() => {
                  onScan(cleaned);
                  onClose();
                }, 800);
                return;
              }
            }
          }
        } catch {
          // ignore detection frame errors
        }
      }
    }, 400);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [scanning, isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">IMEI Skaneri</h3>
              <p className="text-[10px] text-slate-400">Quti yoki shtrixkodni ramkaga to‘g‘rilang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Screen */}
        <div className="relative w-full h-80 bg-black flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center text-rose-400 max-w-xs">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-rose-500" />
              <p className="text-xs font-semibold leading-relaxed mb-4">{errorMsg}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Qayta urinish
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Aim Box */}
                <div className="w-64 h-32 rounded-2xl border-2 border-brand-500/80 relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  {/* Laser line animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-brand-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-brand-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-brand-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-brand-400" />
                </div>
                <p className="text-[11px] text-white/80 font-medium mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                  15 xonali shtrixkod yoki IMEI kodini ko‘rsating
                </p>
              </div>

              {/* Scanned Success Notification */}
              {scannedImei && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold">IMEI Aniqlandi!</h4>
                  <p className="font-mono text-sm tracking-wider text-emerald-300 mt-1">
                    {scannedImei}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info & demo simulation button */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Kamera orqali shtrixkod o‘qilmasa, IMEI kodini qo‘lda terishingiz mumkin.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onScan('356111111111113');
                onClose();
              }}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold bg-rose-950/50 border border-rose-800/50 px-2.5 py-1 rounded-lg flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Skaner simulyatsiyasi (Faol IMEI)
            </button>
            <button
              type="button"
              onClick={() => {
                onScan('356777777777775');
                onClose();
              }}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-lg flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Skaner simulyatsiyasi (Toza IMEI)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
