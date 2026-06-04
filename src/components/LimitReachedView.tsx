"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

export default function LimitReachedView({ usageCount = 2 }: { usageCount?: number }) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "pranavvh778@gmail.com";

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-16 text-center px-4 md:px-0">
      <div className="relative inline-block">
        <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto border border-amber-100/50 shadow-inner">
          <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow">
          !
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Monthly Free Limit Reached
        </h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed text-sm md:text-base">
          You've completed <span className="text-slate-900 font-bold">{usageCount}</span> AI tailoring analyses this calendar month. To ensure stable performance for everyone, free accounts are limited to 2 tailors per month.
        </p>
      </div>

      {/* Reset Notice */}
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 max-w-md mx-auto text-left space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Auto-Reset Status</p>
        </div>
        <p className="text-xs font-medium text-slate-500 leading-relaxed">
          Your free usage limit will automatically reset on the first day of next calendar month. Any resumes you have already tailored will remain accessible in your dashboard history.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <Link 
          href="/dashboard" 
          className="resumeii-button-secondary w-full sm:w-auto py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <a 
          href={`mailto:${adminEmail}?subject=Requesting Unlimited AI Resume Tailor Access`}
          className="resumeii-button w-full sm:w-auto py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <Mail className="w-4 h-4" />
          Request Unlimited Access
        </a>
      </div>

      <p className="text-xs font-bold text-slate-300 uppercase tracking-widest pt-4">
        Resumeii Premium AI
      </p>
    </div>
  );
}
