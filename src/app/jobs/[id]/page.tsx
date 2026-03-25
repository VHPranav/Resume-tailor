"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Plus, 
  Clock,
  CheckCircle2,
  Trash2,
  Loader2,
  Save,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { getJobApplications, addInterview, updateJobNotes, updateJobApplicationStatus, deleteJobApplication } from "@/app/actions/tracker";

export default function JobDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  
  // New interview form state
  const [interviewData, setInterviewData] = useState({
    type: "Phone Screen",
    date: new Date().toISOString().split("T")[0],
    interviewer: "",
    notes: "",
  });

  const handleDeleteJob = async () => {
    setDeleting(true);
    try {
      await deleteJobApplication(id);
      router.push("/jobs");
    } catch (error) {
      console.error("Failed to delete job:", error);
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await updateJobApplicationStatus(id, newStatus);
      fetchJob();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchJob = async () => {
    setLoading(true);
    try {
      const allApps = await getJobApplications();
      const found = allApps.find((a: any) => a.id === id);
      setApp(found);
      setNotes(found?.notes || "");
    } catch (error) {
      console.error("Failed to fetch job:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateJobNotes(id, notes);
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addInterview(id, {
        ...interviewData,
        date: new Date(interviewData.date),
      });
      setIsAddingInterview(false);
      fetchJob();
    } catch (error) {
      console.error("Failed to add interview:", error);
    }
  };

  if (loading && !app) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
        </div>
      </DashboardShell>
    );
  }

  if (!app) {
    return (
      <DashboardShell>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-900">Application not found</h2>
          <Link href="/jobs" className="text-brand-primary font-bold mt-4 inline-block">Back to Jobs</Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-10 py-6 max-w-5xl mx-auto">
        <header className="space-y-4">
          <Link href="/jobs" className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black tracking-tight text-slate-900">{app.title}</h1>
                 <div className="relative group">
                    <select 
                      disabled={updatingStatus}
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className={cn(
                        "appearance-none px-4 py-1.5 pr-10 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-all outline-none bg-no-repeat bg-[right_1rem_center]",
                        app.status === 'OFFER' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' :
                        app.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' :
                        app.status === 'INTERVIEW' ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' :
                        'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                      )}
                    >
                      <option value="SAVED">Saved</option>
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFER">Offer</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50" />
                    {updatingStatus && <Loader2 className="w-3 h-3 animate-spin absolute -right-6 top-1/2 -translate-y-1/2 text-slate-400" />}
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold">
                <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> {app.company}</div>
                {app.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {app.location}</div>}
                {app.salary && <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-400" /> {app.salary}</div>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {app.url && (
                <a href={app.url} target="_blank" rel="noreferrer" className="kuubiik-button-secondary inline-flex items-center gap-2">
                  View Posting <Clock className="w-4 h-4" />
                </a>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => setShowConfirmDelete(!showConfirmDelete)}
                  disabled={deleting}
                  className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title="Delete application"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>

                {showConfirmDelete && !deleting && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">Delete application?</p>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => setShowConfirmDelete(false)}
                         className="flex-1 py-2 text-[10px] font-bold text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          Cancel
                       </button>
                       <button 
                         onClick={handleDeleteJob}
                         className="flex-1 py-2 text-[10px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Delete
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-10">
              {/* Timeline / Interviews */}
              <section className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Interview Timeline</h3>
                    <button 
                      onClick={() => setIsAddingInterview(true)}
                      className="text-xs font-bold text-brand-primary hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Round
                    </button>
                 </div>

                 <div className="space-y-6 relative before:absolute before:left-[1.25rem] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                    {app.interviews && app.interviews.length > 0 ? (
                      app.interviews.map((int: any) => (
                        <div key={int.id} className="relative pl-12">
                           <div className="absolute left-0 top-1.5 w-10 h-10 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center z-10 shadow-sm">
                              <Calendar className="w-4 h-4 text-slate-400" />
                           </div>
                           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                              <div className="flex items-center justify-between">
                                 <h4 className="font-extrabold text-slate-900">{int.type}</h4>
                                 <span className="text-xs font-bold text-slate-400">{new Date(int.date).toLocaleDateString()}</span>
                              </div>
                              {int.interviewer && <p className="text-xs font-bold text-slate-500">Interviewer: <span className="text-slate-900">{int.interviewer}</span></p>}
                              {int.notes && <p className="text-xs text-slate-500 leading-relaxed font-medium">{int.notes}</p>}
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center space-y-4">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <Clock className="w-6 h-6 text-slate-300" />
                         </div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activities recorded</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* Notes Section */}
              <section className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Application Notes</h3>
                    <button 
                      onClick={handleSaveNotes}
                      className="text-xs font-bold text-brand-primary flex items-center gap-1"
                    >
                      {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Notes
                    </button>
                 </div>
                 <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Interview questions, research, or reminders..."
                    className="w-full min-h-[300px] bg-slate-50/50 border-transparent focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-[2rem] p-8 text-sm font-medium transition-all"
                 />
              </section>
           </div>

           <div className="space-y-10">
              {/* Linked Resume */}
              <section className="kuubiik-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/40 space-y-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resume Used</p>
                    <h3 className="text-xl font-black truncate">{app.resume?.fileName || "Unnamed Resume"}</h3>
                 </div>
                 <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                    {app.analysisId ? (
                      <Link href={`/results?id=${app.analysisId}`} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors">
                        View tailoring results <CheckCircle2 className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 italic">No analysis results linked</span>
                    )}
                 </div>
              </section>

              {/* Summary Stats */}
              <section className="kuubiik-card p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-slate-400">Match Score</span>
                       <span className="text-sm font-black text-slate-900">{app.matchScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${app.matchScore}%` }} />
                    </div>
                 </div>
                 <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Date Applied</span>
                    <span className="text-slate-900">{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "Not set"}</span>
                 </div>
              </section>
           </div>
        </div>
      </div>

      {isAddingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsAddingInterview(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-8 border border-slate-100">
             <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">Add Interview Round</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tracking Pipeline</p>
             </div>
             
             <form onSubmit={handleAddInterview} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Interview Type</label>
                      <input 
                        required
                        value={interviewData.type}
                        onChange={e => setInterviewData({...interviewData, type: e.target.value})}
                        className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm font-semibold"
                        placeholder="Technical Interview"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Date</label>
                      <input 
                        type="date"
                        required
                        value={interviewData.date}
                        onChange={e => setInterviewData({...interviewData, date: e.target.value})}
                        className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm font-semibold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Interviewer</label>
                      <input 
                        value={interviewData.interviewer}
                        onChange={e => setInterviewData({...interviewData, interviewer: e.target.value})}
                        className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm font-semibold"
                        placeholder="Name (Optional)"
                      />
                   </div>
                   <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Notes</label>
                      <textarea 
                        value={interviewData.notes}
                        onChange={e => setInterviewData({...interviewData, notes: e.target.value})}
                        className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm font-semibold min-h-[100px]"
                        placeholder="Prep details, link to zoom, etc."
                      />
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsAddingInterview(false)} className="flex-1 kuubiik-button-secondary py-4">Cancel</button>
                   <button type="submit" className="flex-1 kuubiik-button py-4">Add Round</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
