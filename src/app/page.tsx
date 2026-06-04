"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Shield, Globe, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Resumeii
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/sign-in" className="hidden xs:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/sign-up" className="resumeii-button text-[10px] md:text-xs py-2 px-3 md:px-5">
              Get Started
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 space-y-6 animate-in slide-in-from-top-5">
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-600">
              <Link href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-slate-900">Features</Link>
              <Link href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="hover:text-slate-900">How it works</Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="hover:text-slate-900">Dashboard</Link>
              <div className="pt-4 border-t border-slate-50">
                <Link href="/sign-in" className="block py-2">Log in</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-700 text-[11px] font-bold uppercase tracking-wider mx-auto">
            <Sparkles className="w-3 h-3" />
            AI-Powered Resume Tailoring
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1]">
            Landing your dream job just got <span className="text-emerald-500 underline decoration-emerald-200 underline-offset-8">easier</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Upload your resume, paste a job description, and let our AI rewrite it to perfectly match the role. Optimize for ATS and impress recruiters in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sign-up" className="resumeii-button text-base px-8 py-4 flex items-center gap-2">
              Start Tailoring Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#how-it-works" className="resumeii-button-secondary text-base px-8 py-4">
              See How it Works
            </Link>
          </div>
        </section>

        {/* Features Preview */}
        <section id="features" className="px-6 py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Instant Optimization"
              description="Tailor your resume in less than 30 seconds with our advanced AI engine."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-emerald-500" />}
              title="ATS Friendly"
              description="Designed to pass through Applicant Tracking Systems by using relevant keywords."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-blue-500" />}
              title="Multi-Industry"
              description="Whether you're in Tech, Finance, or Creative, we've got you covered."
            />
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="px-6 py-32 max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">How it works</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Three simple steps to a perfectly tailored resume.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
               <Step number="01" title="Upload your base resume" description="Start with your main resume file. We support PDF and Docx formats." />
               <Step number="02" title="Paste the job description" description="Give us the details of the job you're applying for." />
               <Step number="03" title="Generate and Download" description="Review the AI-optimized version and download it instantly." />
            </div>
            <div className="resumeii-card p-4 bg-slate-100/50 border-dashed border-2 relative min-h-[400px] flex items-center justify-center">
               <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6 w-full max-w-sm">
                  <div className="h-4 w-1/3 bg-slate-100 rounded-full" />
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-50 rounded-full" />
                    <div className="h-3 w-5/6 bg-slate-50 rounded-full" />
                    <div className="h-3 w-4/6 bg-emerald-50 rounded-full" />
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase mb-2">AI Optimization Suggestion</p>
                    <p className="text-xs text-emerald-600 leading-relaxed font-medium">Changed "Management experience" to "Cross-functional team leadership" to match job description keyword.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Resumeii
            </span>
          </div>
          <p className="text-sm text-slate-400 font-medium">© 2026 Resumeii AI Resume Tailor. Built by Antigravity.</p>
          <div className="flex gap-6 text-sm font-semibold text-slate-500">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="resumeii-card p-8 space-y-4">
      <div className="p-3 bg-white w-fit rounded-xl shadow-sm border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: any) {
  return (
    <div className="flex gap-6">
      <div className="text-4xl font-extrabold text-slate-100 tracking-tight">{number}</div>
      <div className="space-y-1">
        <h4 className="text-xl font-bold text-slate-900">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
