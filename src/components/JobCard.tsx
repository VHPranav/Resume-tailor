"use client";

import { cn } from "@/lib/utils";
import { Clock, MapPin, Building2, ExternalLink, Target, MoreVertical, Briefcase } from "lucide-react";
import Link from "next/link";

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
  return (
    <Link 
      href={`/jobs/${id}`}
      className="block group"
    >
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
              <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
            </div>
            {matchScore && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Match</span>
                <span className="text-sm font-black text-emerald-600 leading-none">{matchScore}%</span>
              </div>
            )}
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
