"use client";

import { useState } from "react";
import { X, Loader2, Sparkles, Building2, MapPin, DollarSign, Link2 } from "lucide-react";
import { createJobApplication } from "@/app/actions/tracker";

interface AddJobModalProps {
  resumes: { id: string, fileName: string | null }[];
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    title?: string;
    company?: string;
    matchScore?: number;
    resumeId?: string;
    analysisId?: string;
  };
}

export default function AddJobModal({ resumes, onClose, onSuccess, initialData }: AddJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    company: initialData?.company || "",
    url: "",
    location: "",
    salary: "",
    status: "SAVED",
    appliedDate: new Date().toISOString().split("T")[0],
    resumeId: initialData?.resumeId || resumes[0]?.id || "",
    matchScore: initialData?.matchScore || 0,
    analysisId: initialData?.analysisId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createJobApplication({
        ...formData,
        appliedDate: new Date(formData.appliedDate),
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to add job:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/50">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary" /> Add New Application
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Tracker</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Job Title</label>
               <div className="relative group">
                 <input 
                   required
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                   placeholder="Software Engineer"
                   className="w-full bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[1.25rem] px-6 py-4 text-sm font-semibold transition-all"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Company</label>
               <div className="relative group">
                 <input 
                   required
                   value={formData.company}
                   onChange={e => setFormData({...formData, company: e.target.value})}
                   placeholder="Tech Corp"
                   className="w-full bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[1.25rem] px-6 py-4 text-sm font-semibold transition-all"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Status</label>
               <select 
                 value={formData.status}
                 onChange={e => setFormData({...formData, status: e.target.value})}
                 className="w-full bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[1.25rem] px-6 py-4 text-sm font-semibold transition-all appearance-none"
                >
                  <option value="SAVED">Saved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
               </select>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Applied Date</label>
               <input 
                 type="date"
                 value={formData.appliedDate}
                 onChange={e => setFormData({...formData, appliedDate: e.target.value})}
                 className="w-full bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[1.25rem] px-6 py-4 text-sm font-semibold transition-all"
               />
             </div>

             <div className="space-y-2 md:col-span-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Job Posting URL</label>
               <input 
                 value={formData.url}
                 onChange={e => setFormData({...formData, url: e.target.value})}
                 placeholder="https://company.com/jobs/..."
                 className="w-full bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[1.25rem] px-6 py-4 text-sm font-semibold transition-all"
               />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Location</label>
               <input 
                 value={formData.location}
                 onChange={e => setFormData({...formData, location: e.target.value})}
                 placeholder="Remote / NYC"
                 className="w-full bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[1.25rem] px-6 py-4 text-sm font-semibold transition-all"
               />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Salary Range</label>
               <input 
                 value={formData.salary}
                 onChange={e => setFormData({...formData, salary: e.target.value})}
                 placeholder="$120k - $150k"
                 className="w-full bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[1.25rem] px-6 py-4 text-sm font-semibold transition-all"
               />
             </div>

             <div className="space-y-2 md:col-span-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Resume Used</label>
               <select 
                 value={formData.resumeId}
                 onChange={e => setFormData({...formData, resumeId: e.target.value})}
                 className="w-full bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[1.25rem] px-6 py-4 text-sm font-semibold transition-all appearance-none"
                >
                  <option value="">No Resume Linked</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.fileName || "Unnamed Resume"}</option>
                  ))}
               </select>
             </div>
          </div>
        </form>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30">
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="kuubiik-button w-full h-auto py-5 text-sm flex items-center justify-center gap-3 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Adding application..." : "Add to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
