import React from 'react';
import { Laptop, FileText, LogOut, Users, FileBarChart2, Clock, ShieldCheck } from 'lucide-react';
import { UserRole, SimulatedUser } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  currentUser: SimulatedUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewBast: () => void;
  onOpenDocs: () => void;
  onLogout: () => void; // Prop baru untuk fungsi keluar
  pendingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  activeTab,
  setActiveTab,
  onOpenNewBast,
  onOpenDocs,
  onLogout,
  pendingCount = 0,
}) => {
  return (
    <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: M365 Ecosystem badge */}
      <div id="m365-top-bar" className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-slate-100">Portal BAST Perusahaan</span>
          <span className="text-slate-400 hidden sm:inline">• IT Asset & License Management</span>
        </div>
        <button
          type="button"
          onClick={onOpenDocs}
          className="text-xs text-sky-300 hover:text-sky-200 inline-flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Dokumentasi Sistem</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-base leading-tight">BAST Digital</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {currentRole.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500">Pemenuhan Lisensi Software Korporat</p>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-slate-700">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.email}</div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Khusus Admin & PIC */}
        {currentRole === 'admin' || currentRole === 'pic' ? (
          <div className="flex items-center justify-between border-t border-slate-100 py-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileBarChart2 className="w-3.5 h-3.5" />
                <span>Semua BAST</span>
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'monitoring'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Monitoring (H-30)</span>
              </button>
              
              {/* TAB BARU: Manajemen Karyawan */}
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'employees'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manajemen Karyawan</span>
              </button>
            </nav>

            <button
              onClick={onOpenNewBast}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>+ Buat BAST Baru</span>
            </button>
          </div>
        ) : (
          /* Tab Navigation Khusus Karyawan Biasa */
          <div className="flex items-center justify-between border-t border-slate-100 py-2">
            <div className="flex items-center gap-3">
              <button
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Dokumen BAST Saya</span>
                {pendingCount > 0 && (
                  <span className="ml-1 bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                    {pendingCount} Pending
                  </span>
                )}
              </button>
            </div>
            <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Proteksi Data Pribadi Aktif</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};