import DashboardShell from "@/components/DashboardShell";
import { 
  ChevronRight, 
  ChevronLeft, 
  MoreHorizontal, 
  MapPin, 
  Clock, 
  Sparkles,
  LayoutGrid,
  Target,
  FileText,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }

  // Fetch user and their analyses
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        include: { job: true },
      },
    },
  });

  const analyses = user?.analyses || [];
  const userName = user?.email.split("@")[0] || "User";

  return (
    <DashboardShell>
      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Welcome Banner */}
          <section className="flex-1 kuubiik-card p-10 bg-[#F8F9F5] border-none shadow-none relative overflow-hidden group">
            <Sparkles className="w-64 h-64 text-emerald-500/5 absolute -bottom-10 -right-10 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 capitalize">
                  Welcome back, {userName}!
                </h1>
                <p className="text-slate-500 font-medium max-w-lg leading-relaxed text-lg">
                   Your personalized workspace for tailoring resumes and landing your dream job. Ready for your next application?
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/upload" className="kuubiik-button px-8 py-3 h-auto text-sm">
                   Tailor new resume
                </Link>
              </div>
            </div>
          </section>

          {/* Setup Widget */}
          <section className="w-full lg:w-96 bg-[#FFFBEB] rounded-kuubiik p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
            <div className="relative space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Your Progress</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                   You've completed <span className="text-slate-900 font-bold">{analyses.length}</span> analyses so far. Keep going!
                </p>
              </div>
              
              <div className="space-y-3">
                <SetupItem color="bg-emerald-100" title="Profile 80% complete" />
                <SetupItem color="bg-indigo-100" title="5 optimized resumes" />
              </div>
            </div>
          </section>
        </div>

        {/* Recent Analyses Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-widest leading-none">
                History
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Recent Analyses
              </h2>
            </div>
          </div>

          {analyses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {analyses.map((analysis: any) => (
                <HistoryCard 
                  key={analysis.id}
                  id={analysis.id}
                  title={analysis.job?.title || "Tailored Resume"}
                  score={analysis.matchScore}
                  date={new Date(analysis.createdAt).toLocaleDateString("en-US", { 
                    month: "short", 
                    day: "numeric", 
                    year: "numeric" 
                  })}
                />
              ))}
            </div>
          ) : (
            <div className="kuubiik-card p-20 text-center space-y-6 bg-slate-50/50 border-dashed border-2 border-slate-200">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  <FileText className="w-10 h-10 text-slate-300" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">No analyses yet</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">Upload your resume and a job description to see the magic happen.</p>
               </div>
               <Link href="/upload" className="kuubiik-button inline-flex">
                  Start first analysis
               </Link>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

function SetupItem({ color, title }: { color: string, title: string }) {
  return (
    <div className="bg-white/60 p-3 rounded-2xl flex items-center gap-4 hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-100">
      <div className={cn("w-10 h-10 rounded-xl", color)} />
      <span className="text-sm font-bold text-slate-700">{title}</span>
    </div>
  );
}

function HistoryCard({ id, title, score, date }: any) {
  return (
    <Link 
      href={`/results?id=${id}`}
      className="kuubiik-card p-8 flex flex-col justify-between group min-h-[340px] hover:shadow-2xl hover:shadow-slate-200/80 transition-all hover:-translate-y-1"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white relative overflow-hidden group-hover:bg-emerald-600 transition-colors duration-500">
            <LayoutGrid className="w-6 h-6 relative z-10" />
            <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full translate-x-4 -translate-y-4" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Score</span>
               <span className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-none tracking-tighter">{score}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-slate-900 leading-snug tracking-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 italic">
            Analyzed for career fit and technical skills alignment...
          </p>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
           <Clock className="w-3.5 h-3.5" />
           {date}
         </div>
         <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600 group-hover:gap-2 transition-all">
            View Results <ExternalLink className="w-3.5 h-3.5" />
         </div>
      </div>
    </Link>
  );
}
