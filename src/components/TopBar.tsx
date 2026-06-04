import { Search, Bell, Plus, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function TopBar({ 
  onMenuClick 
}: { 
  onMenuClick?: () => void 
}) {
  return (
    <div className="h-20 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-transparent focus:bg-white focus:border-slate-200 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors hidden sm:block">
          <Bell className="w-5 h-5" />
        </button>
        <button className="resumeii-button flex items-center gap-2 text-xs md:text-sm px-3 md:px-5 py-2">
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add new</span>
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1 hidden xs:block" />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 md:w-9 md:h-9 rounded-lg border border-slate-200 transition-all hover:border-slate-300",
            }
          }}
        />
      </div>
    </div>
  );
}
