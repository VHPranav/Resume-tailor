"use client";

import { cn } from "@/lib/utils";
import { Clock, MapPin, Building2, ExternalLink, Target, MoreVertical, Briefcase, ChevronDown, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { updateJobApplicationStatus, deleteJobApplication } from "@/app/actions/tracker";
import { useState } from "react";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  matchScore?: number | null;
  date?: string | null;
  status: string;
}

export default function JobCard({ id, title, company, location, matchScore, date, status }: JobCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateJobApplicationStatus(id, e.target.value);
      window.location.reload(); // Quick refresh to update Kanban board
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      await deleteJobApplication(id);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete job:", error);
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <Link 
      href={`/jobs/${id}`}
      className="block group"
    >
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 relative">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                 <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
               </div>
               <div className="relative group/status" onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={status}
                    onChange={handleStatusChange}
                    className="appearance-none bg-slate-50 border-none rounded-lg px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500 cursor-pointer outline-none hover:bg-slate-100 transition-colors"
                   >
                     <option value="SAVED">Saved</option>
                     <option value="APPLIED">Applied</option>
                     <option value="INTERVIEW">Interview</option>
                     <option value="OFFER">Offer</option>
                     <option value="REJECTED">Rejected</option>
                  </select>
               </div>
            </div>
            <div className="flex items-center gap-3">
              {matchScore && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Match</span>
                  <span className="text-sm font-black text-emerald-600 leading-none">{matchScore}%</span>
                </div>
              )}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirm(!showConfirm);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
                
                {showConfirm && !deleting && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 space-y-2 animate-in fade-in slide-in-from-top-1">
                    <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest text-center">Delete?</p>
                    <div className="flex gap-1">
                       <button 
                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(false); }}
                         className="flex-1 py-1 text-[8px] font-bold text-slate-500 bg-slate-50 rounded hover:bg-slate-100"
                        >
                          No
                       </button>
                       <button 
                         onClick={handleDelete}
                         className="flex-1 py-1 text-[8px] font-bold text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Yes
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 leading-tight group-hover:text-brand-primary transition-colors line-clamp-1">
              {title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{company}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center gap-3">
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {location}
                </div>
              )}
              {date && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {date}
                </div>
              )}
            </div>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </Link>
  );
}
