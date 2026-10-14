import React, { useState } from 'react';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk visibilitas password
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Section dengan Logo Baru */}
        <div className="p-8 border-b border-slate-100 flex flex-col items-center text-center bg-white">
          <img 
            src="/transjakarta-logo.png" 
            alt="Transjakarta Logo" 
            className="h-10 sm:h-12 w-auto mb-5 object-contain" 
          />
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-[#ebf4ff] text-[#00519c] border border-[#d1e3fa] mb-2">
            BAST DIGITAL IT
          </span>
          <p className="text-sm font-medium text-slate-500">
            PT Transportasi Jakarta • Manajemen Lisensi Software
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm border border-rose-100 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Korporat</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00519c] focus:border-transparent text-sm transition-all"
                  placeholder="nama@transjakarta.co.id"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00519c] focus:border-transparent text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00519c] hover:bg-[#003d75] text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-4 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk ke Portal'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Footer / Copyright info */}
      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} PT Transportasi Jakarta. All rights reserved.
      </div>
    </div>
  );
};