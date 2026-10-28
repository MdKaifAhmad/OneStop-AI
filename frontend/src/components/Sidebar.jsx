import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  History,
  LogIn,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, isLoggedIn, logout, setIsAuthModalOpen } = useAuth();

  const navItems = [
    { id: 'placement', label: 'Placement Prep', icon: Briefcase, color: 'text-emerald-400' },
    { id: 'scholarship', label: 'Scholarship Finder', icon: Award, color: 'text-amber-400' },
    { id: 'college', label: 'College Predictor', icon: GraduationCap, color: 'text-blue-400' },
    { id: 'history', label: 'Activity History', icon: History, color: 'text-purple-400' },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Top Branding */}
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              OneStop
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium tracking-wide uppercase">
              AI Academic Navigator
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Platform Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm shadow-slate-900 border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Account / Auth Area */}
      <div className="p-4 border-t border-slate-800/80">
        {isLoggedIn ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>Browsing as Guest</span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
