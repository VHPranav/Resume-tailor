import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass-morphism border-b border-slate-200/60 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group transition-all duration-300">
          <div className="p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            ResumeTailor
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Dashboard
          </Link>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 rounded-lg border border-slate-200 transition-all hover:border-slate-300",
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
}
