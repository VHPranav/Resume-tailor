"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Briefcase, ArrowRight, Link as LinkIcon, TextQuote, Loader2, AlertCircle } from "lucide-react";
import { saveJob } from "@/app/actions/job";
import { cn } from "@/lib/utils";

export default function JobPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      await saveJob(formData);
      // Success will redirect via server action
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto space-y-10 py-10">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Job Details
          </h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight">
            Paste the job link and description to start the AI analysis.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="kuubiik-card p-8 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Job Title
                  </label>
                  <input 
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="url" className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Job URL (Optional)
                  </label>
                  <input 
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://linkedin.com/jobs/..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 font-medium"
                  />
                </div>
             </div>

             <div className="space-y-2">
               <label htmlFor="description" className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <TextQuote className="w-3 h-3" /> Job Description
               </label>
               <textarea 
                 id="description"
                 name="description"
                 placeholder="Paste the full job description here..."
                 className="w-full min-h-[300px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-slate-700 font-medium leading-relaxed"
                 required
               />
             </div>

             {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

             <button 
               type="submit"
               disabled={isSubmitting}
               className="kuubiik-button w-full py-4 text-base flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   Saving Job...
                 </>
               ) : (
                 <>
                   Analyze and Tailor Resume
                   <ArrowRight className="w-5 h-5" />
                 </>
               )}
             </button>
          </div>
          
          <p className="text-center text-sm font-bold text-slate-300">
            Powered by Gemini AI for contextual resume rewriting.
          </p>
        </form>
      </div>
    </DashboardShell>
  );
}
