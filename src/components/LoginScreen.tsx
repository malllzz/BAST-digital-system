import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Portal BAST Digital</h1>
          <p className="text-blue-200 mt-2 text-sm">IT Asset & License Management</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm border border-rose-100 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Korporat</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                  placeholder="nama@perusahaan.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk ke Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};