"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { Sparkles, CheckCircle2, FileDown, ArrowLeft, MoreHorizontal, Loader2, AlertCircle, TrendingUp, Target, ListChecks, Copy, Save, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { updateAnalysis, deleteAnalysis } from "@/app/actions/analysis";
import { useRouter } from "next/navigation";

import { useSearchParams } from "next/navigation";
import AddJobModal from "@/components/AddJobModal";

interface AnalysisResult {
  id: string;
  matchScore: number;
  missingSkills: string[];
  suggestions: string[];
  rewrittenResume: string;
  resumeId?: string;
  jobTitle?: string;
  company?: string;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [editedResume, setEditedResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);

  const handleDelete = async () => {
    if (!data?.id) return;
    setDeleting(true);
    try {
      await deleteAnalysis(data.id);
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete error:", err);
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const url = id ? `/api/analyze-resume?id=${id}` : "/api/analyze-resume";
        const method = id ? "GET" : "POST";

        const response = await fetch(url, {
          method,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to analyze resume");
        }

        const result = await response.json();
        setData(result);
        setEditedResume(result.rewrittenResume);

        // Fetch resumes for the tracker modal
        const resumesRes = await fetch("/api/resumes");
        if (resumesRes.ok) {
          const resumesData = await resumesRes.json();
          setResumes(resumesData);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  const handleCopy = async () => {
    setCopying(true);
    await navigator.clipboard.writeText(editedResume);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([editedResume], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "Tailored-Resume.md";
    document.body.appendChild(element);
    element.click();
  };

  const handleSave = async () => {
    if (!data?.id) return;
    setSaving(true);
    try {
      await updateAnalysis(data.id, editedResume);
      // Optional: Show success toast
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center">
          <div className="relative">
             <div className="w-24 h-24 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
             <Sparkles className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI is analyzing your resume...</h2>
            <p className="text-slate-500 font-medium">This usually takes about 10-15 seconds.</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
         <div className="max-w-2xl mx-auto space-y-6 py-20 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
               <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-extrabold text-slate-900">Analysis Failed</h2>
               <p className="text-slate-500 font-medium">{error}</p>
            </div>
            <Link href="/upload" className="kuubiik-button-secondary inline-flex">
               Try again
            </Link>
         </div>
      </DashboardShell>
    );
  }

  return (
    <>
    <DashboardShell>
      <div className="space-y-10 py-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 mb-2 transition-colors uppercase tracking-widest">
                <ArrowLeft className="w-3 h-3" /> Back to Dashboard
             </Link>
             <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
               Analysis Results
             </h1>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsTrackerModalOpen(true)}
               className="kuubiik-button-secondary flex items-center gap-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 transition-all font-bold"
             >
               <TrendingUp className="w-4 h-4" /> Save to Tracker
             </button>
             <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner text-sm font-medium">
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 hover:bg-white hover:text-slate-900 text-slate-500 rounded-lg transition-all flex items-center gap-2"
                 >
                   .MD
                </button>
                <button 
                  onClick={async () => {
                    setCopying(true);
                    try {
                      const { generateDocx } = await import('@/lib/exportUtils');
                      const blob = await generateDocx(editedResume);
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Tailored-Resume.docx";
                      a.click();
                    } finally {
                      setCopying(false);
                    }
                  }}
                  className="px-4 py-2 hover:bg-white hover:text-blue-600 text-slate-500 rounded-lg shadow-sm bg-white transition-all flex items-center gap-2"
                 >
                   <FileDown className="w-4 h-4" /> DOCX
                </button>
                <button 
                  onClick={async () => {
                    setCopying(true);
                    try {
                      const { generatePdf } = await import('@/lib/exportUtils');
                      const blob = generatePdf(editedResume);
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Tailored-Resume.pdf";
                      a.click();
                    } finally {
                      setCopying(false);
                    }
                  }}
                  className="px-4 py-2 hover:bg-white hover:text-red-600 text-slate-500 rounded-lg transition-all flex items-center gap-2"
                 >
                   <FileDown className="w-4 h-4" /> PDF
                </button>
             </div>
             <button 
               onClick={handleSave}
               disabled={saving}
               className="kuubiik-button flex items-center gap-2 min-w-[120px] justify-center"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Edits"}
             </button>

             <div className="relative">
                <button 
                  onClick={() => setShowConfirmDelete(!showConfirmDelete)}
                  disabled={deleting}
                  className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title="Delete analysis"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>

                {showConfirmDelete && !deleting && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Are you sure?</p>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setShowConfirmDelete(false)}
                         className="flex-1 py-2 text-[10px] font-bold text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          Cancel
                       </button>
                       <button 
                         onClick={handleDelete}
                         className="flex-1 py-2 text-[10px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Delete
                       </button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Main Content: Editable Resume */}
           <div className="lg:col-span-2 space-y-8">
              <section className="kuubiik-card p-0 overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col min-h-[700px]">
                 <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Rewritten Resume</span>
                       <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-extrabold rounded uppercase tracking-tighter border border-emerald-100 italic">Editable</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={handleCopy}
                         className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                         title="Copy to clipboard"
                        >
                          {copying ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                       </button>
                    </div>
                 </div>
                 <textarea
                   value={editedResume}
                   onChange={(e) => setEditedResume(e.target.value)}
                   className="flex-1 p-12 text-slate-700 bg-white focus:outline-none resize-none font-mono text-sm leading-relaxed"
                   spellCheck="false"
                 />
              </section>
           </div>

           {/* Sidebar Info */}
           <div className="space-y-8">
              {/* Match Score Card */}
              <section className="kuubiik-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                 <Target className="w-32 h-32 text-white/5 absolute -bottom-6 -right-6 group-hover:scale-110 transition-transform duration-700" />
                 <div className="relative space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Match Score</p>
                       <div className="flex items-end gap-4">
                          <span className="text-7xl font-extrabold text-emerald-400 leading-none">{data?.matchScore}</span>
                          <span className="text-slate-500 font-bold mb-2">/100</span>
                       </div>
                    </div>
                    <div className="pt-6 border-t border-slate-800 space-y-4">
                       <div className="flex items-center gap-2">
                         <TrendingUp className="w-4 h-4 text-emerald-400" />
                         <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">AI Perspective</p>
                       </div>
                       <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                         {data?.matchScore && data.matchScore > 80 
                           ? "\"Excellent alignment with the job description. Ready to apply with minimal tweaks.\"" 
                           : "\"Good foundation, but some key experience areas need stronger emphasis.\""}
                       </p>
                    </div>
                 </div>
              </section>

              {/* Missing Skills */}
              <section className="kuubiik-card p-6 space-y-6">
                 <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Missing Skills</h3>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {data?.missingSkills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-tight">
                         {skill}
                      </span>
                    ))}
                    {(!data || data.missingSkills.length === 0) && (
                      <p className="text-xs font-medium text-slate-400">No major skills missing!</p>
                    )}
                 </div>
              </section>

              {/* AI Suggestions */}
              <section className="kuubiik-card p-6 space-y-6">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Key Improvements</h3>
                 </div>
                 <ul className="space-y-4">
                    {data?.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-3">
                         <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                         <p className="text-xs text-slate-600 font-medium leading-relaxed">{suggestion}</p>
                      </li>
                    ))}
                 </ul>
              </section>
           </div>
        </div>
      </div>
    </DashboardShell>
    {isTrackerModalOpen && (
      <AddJobModal 
        resumes={resumes}
        onClose={() => setIsTrackerModalOpen(false)}
        onSuccess={() => {
          setIsTrackerModalOpen(false);
          // Optional: Show success
        }}
        initialData={{
          title: data?.jobTitle || "",
          company: data?.company || "",
          matchScore: data?.matchScore || 0,
          resumeId: data?.resumeId,
        }}
      />
    )}
    </>
  );
}
