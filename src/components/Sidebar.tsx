"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Briefcase, 
  Settings, 
  LayoutGrid,
  Sparkles,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Tailor Resume", href: "/upload", icon: Sparkles },
  { name: "My Jobs", href: "/jobs", icon: Briefcase },
];

const system = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen?: boolean; 
  onClose?: () => void 
}) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "w-64 border-r border-slate-200/60 h-screen sticky top-0 bg-white flex flex-col px-4 py-8 overflow-y-auto transition-all duration-300 z-50",
      "fixed lg:sticky lg:translate-x-0",
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            kuubiik
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 lg:hidden text-slate-400 hover:text-slate-900 transition-colors"
        >
          <Sparkles className="w-5 h-5" /> {/* Close icon could be X, but using Sparkles for style if preferred or just Lucide X */}
           {/* Let's use X for clarity */}
           <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="space-y-8">
        <div>
          <div className="space-y-1">
            {navigation.map((item) => (
              <SidebarLink 
                key={item.name} 
                item={item} 
                isActive={pathname === item.href} 
              />
            ))}
          </div>
        </div>

        <div>
           <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">System</p>
           <div className="space-y-1">
            {system.map((item) => (
              <SidebarLink 
                key={item.name} 
                item={item} 
                isActive={pathname === item.href} 
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

function SidebarLink({ item, isActive }: { item: any; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-slate-50 text-slate-900 shadow-sm" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className={cn(
        "w-4 h-4 transition-colors",
        isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"
      )} />
      {item.name}
    </Link>
  );
}
