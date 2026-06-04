"use client";

import { useEffect, useState } from "react";
import { Sparkles, Mail, X, Check } from "lucide-react";

interface LimitReachedPopupProps {
  onClose: () => void;
}

export default function LimitReachedPopup({ onClose }: LimitReachedPopupProps) {
  const [mounted, setMounted] = useState(false);
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "pranavvh778@gmail.com";

  useEffect(() => {
    setMounted(true);
    // Disable scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-resumeii shadow-2xl border border-slate-100 max-w-md w-full p-8 relative z-10 space-y-6 animate-in zoom-in-95 fade-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <Sparkles className="w-8 h-8 text-emerald-600 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Free Limit Completed!
            </h3>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest leading-none flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Resume Tailoring Successful
            </p>
          </div>

          <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">
            Congratulations! You've tailored your resume twice this month. Your free limits will reset next month. Best of luck with your job applications!
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
          <button 
            onClick={onClose}
            className="resumeii-button-secondary w-full py-3 text-xs font-bold text-center"
          >
            Awesome, got it!
          </button>
          <a 
            href={`mailto:${adminEmail}?subject=Requesting Unlimited AI Resume Tailor Access`}
            className="resumeii-button w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Request Unlimited Access
          </a>
        </div>
      </div>
    </div>
  );
}
