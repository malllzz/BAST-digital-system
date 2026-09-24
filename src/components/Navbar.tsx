import React from 'react';
import { ShieldCheck, UserCheck, Laptop, FileText, Bell, Sparkles } from 'lucide-react';
import { UserRole, SimulatedUser } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: SimulatedUser;
  setCurrentUser: (user: SimulatedUser) => void;
  users: SimulatedUser[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewBast: () => void;
  onOpenDocs: () => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  currentUser,
  setCurrentUser,
  users,
  activeTab,
  setActiveTab,
  onOpenNewBast,
  onOpenDocs,
  pendingCount,
}) => {
  return (
    <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: M365 Ecosystem badge */}
      <div id="m365-top-bar" className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-slate-100">Microsoft 365 Architecture</span>
          <span className="text-slate-400 hidden sm:inline">• SharePoint Lists + Power Automate + Azure AD SSO</span>
        </div>
        <button
          id="btn-view-docs"
          type="button"
          onClick={onOpenDocs}
          className="text-xs text-sky-300 hover:text-sky-200 inline-flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Lihat Dokumen BA & Kontrol</span>
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
                  IT Asset
                </span>
              </div>
              <p className="text-xs text-slate-500">Pemenuhan Lisensi Software Korporat</p>
            </div>
          </div>

          {/* Role & Persona Switcher */}
          <div className="flex items-center gap-3">
            <div id="role-selector-container" className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="role-btn-pic"
                type="button"
                onClick={() => {
                  setCurrentRole('pic');
                  const picUser = users.find((u) => u.role === 'pic') || users[users.length - 1];
                  setCurrentUser(picUser);
                  setActiveTab('dashboard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentRole === 'pic'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PIC IT Asset</span>
              </button>
              <button
                id="role-btn-user"
                type="button"
                onClick={() => {
                  setCurrentRole('user');
                  const endUser = users.find((u) => u.role === 'user') || users[0];
                  setCurrentUser(endUser);
                  setActiveTab('my-bast');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  currentRole === 'user'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>End User (Penerima)</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute top-1 right-1" />
                )}
              </button>
            </div>

            {/* Active User Dropdown to test multi-user item level security */}
            {currentRole === 'user' && (
              <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="text-xs text-slate-500">Simulasi Akun:</span>
                <select
                  id="select-active-user"
                  value={currentUser.email}
                  onChange={(e) => {
                    const found = users.find((u) => u.email === e.target.value);
                    if (found) setCurrentUser(found);
                  }}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {users
                    .filter((u) => u.role === 'user')
                    .map((u) => (
                      <option key={u.email} value={u.email}>
                        {u.name} (NIK: {u.nik})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation for PIC */}
        {currentRole === 'pic' ? (
          <div className="flex items-center justify-between border-t border-slate-100 py-2">
            <nav className="flex space-x-2">
              <button
                id="tab-pic-dashboard"
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Semua BAST Pemenuhan
              </button>
              <button
                id="tab-pic-monitoring"
                type="button"
                onClick={() => setActiveTab('monitoring')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'monitoring'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Monitoring Masa Berlaku (H-30)</span>
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-full">
                  Automasi
                </span>
              </button>
            </nav>

            <button
              id="btn-new-bast"
              type="button"
              onClick={onOpenNewBast}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
            >
              <span>+ Buat BAST Baru</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between border-t border-slate-100 py-2">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <span className="font-semibold text-slate-900">{currentUser.name}</span>
              <span className="text-slate-400">|</span>
              <span>NIK: <strong className="text-slate-700">{currentUser.nik}</strong></span>
              <span className="text-slate-400">|</span>
              <span>{currentUser.department}</span>
            </div>
            <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Item-Level Security Aktif (Hanya Histori Sendiri)</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
