"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Plus, Search, LayoutGrid, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import JobCard from "@/components/JobCard";
import AddJobModal from "@/components/AddJobModal";
import { getJobApplications } from "@/app/actions/tracker";

export default function JobsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await getJobApplications();
      setApps(data);
      
      const res = await fetch("/api/resumes");
      const resumesData = await res.json();
      setResumes(resumesData);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const columns = [
    { id: "SAVED", title: "Saved", color: "bg-slate-100" },
    { id: "APPLIED", title: "Applied", color: "bg-blue-50" },
    { id: "INTERVIEW", title: "Interview", color: "bg-amber-50" },
    { id: "OFFER", title: "Offer", color: "bg-emerald-50" },
    { id: "REJECTED", title: "Rejected", color: "bg-red-50" },
  ];

  if (loading && apps.length === 0) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Applications
            </h1>
            <p className="text-slate-500 font-medium">Manage your job search pipeline</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="kuubiik-button flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Application
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Search by role or company..."
              className="w-full bg-white border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all outline-none shadow-sm"
            />
          </div>
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button className="p-2 bg-slate-50 rounded-lg text-slate-900 shadow-sm"><LayoutGrid className="w-4 h-4" /></button>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><List className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start pb-20">
          {columns.map((col) => (
            <div key={col.id} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", col.id === 'SAVED' ? 'bg-slate-400' : col.id === 'APPLIED' ? 'bg-blue-500' : col.id === 'INTERVIEW' ? 'bg-amber-500' : col.id === 'OFFER' ? 'bg-emerald-500' : 'bg-red-500')} />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{col.title}</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  {apps.filter((a: { status: string }) => a.status === col.id).length}
                </span>
              </div>
              
              <div className={cn("p-4 rounded-3xl min-h-[500px] space-y-4 border border-dashed border-slate-200/60", col.color)}>
                {apps.filter((a: { status: string }) => a.status === col.id).map((jobApp: { id: string; title: string; company: string; location?: string | null; matchScore?: number | null; status: string; appliedDate?: Date | null }) => (
                  <JobCard 
                    key={jobApp.id}
                    id={jobApp.id}
                    title={jobApp.title}
                    company={jobApp.company}
                    location={jobApp.location}
                    matchScore={jobApp.matchScore}
                    status={jobApp.status}
                    date={jobApp.appliedDate ? new Date(jobApp.appliedDate).toLocaleDateString() : null}
                  />
                ))}
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-300/40 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary/40 hover:bg-white/50 transition-all group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <AddJobModal 
          resumes={resumes}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchApps();
          }}
        />
      )}
    </DashboardShell>
  );
}
