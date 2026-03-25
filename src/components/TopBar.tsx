import { Search, MapPin, Bell, Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function TopBar() {
  return (
    <div className="h-20 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-transparent focus:bg-white focus:border-slate-200 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="kuubiik-button flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add new
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 rounded-lg border border-slate-200 transition-all hover:border-slate-300",
            }
          }}
        />
      </div>
    </div>
  );
}
