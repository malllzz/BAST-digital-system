import React, { useRef, useState } from 'react';
import { Upload, Plus, Trash2, Edit, Search, Shield, User, Briefcase, X } from 'lucide-react';
import { SimulatedUser, UserRole } from '../types';

interface EmployeeManagementTabProps {
  users: SimulatedUser[];
  onAddUser: (user: SimulatedUser) => void;
  onUpdateUser: (email: string, updatedData: Partial<SimulatedUser>) => void;
  onDeleteUser: (email: string) => void;
  onImportCSV: (users: SimulatedUser[]) => void;
}

export const EmployeeManagementTab: React.FC<EmployeeManagementTabProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onImportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STATE UNTUK MODAL FORM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SimulatedUser | null>(null);
  const [formData, setFormData] = useState<SimulatedUser>({
    name: '', 
    nik: '', 
    email: '', 
    department: '', 
    role: 'user', 
    password: 'Corp2026!'
  });

  // Filter pencarian
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nik.includes(searchTerm)
  );

  // Fungsi membaca dan mem-parsing CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n').filter((line) => line.trim() !== '');
      
      const importedUsers: SimulatedUser[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(col => col.trim());
        
        if (columns.length >= 4) {
          importedUsers.push({
            name: columns[0] || 'Unknown',
            nik: columns[1] || '00000',
            email: columns[2] || `user${i}@corp.id`,
            department: columns[3] || 'General',
            password: 'Corp2026!',
            role: (columns[4]?.toLowerCase() === 'admin' || columns[4]?.toLowerCase() === 'pic') 
                  ? columns[4].toLowerCase() as UserRole 
                  : 'user',
          });
        }
      }

      if (importedUsers.length > 0) {
        onImportCSV(importedUsers);
      } else {
        alert("Gagal membaca CSV. Pastikan formatnya: nama,nik,email,departemen,role");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  // FUNGSI MEMBUKA MODAL
  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ 
      name: '', nik: '', email: '', department: '', role: 'user', password: 'Corp2026!' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: SimulatedUser) => {
    setEditingUser(user);
    setFormData({ 
      ...user, 
      password: user.password || 'Corp2026!' 
    });
    setIsModalOpen(true);
  };

  // FUNGSI SUBMIT FORM
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser(editingUser.email, formData);
    } else {
      onAddUser(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Data Karyawan</h2>
          <p className="text-sm text-slate-500">Kelola daftar profil, departemen, dan hak akses (Role)</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* Tabel Karyawan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Total: <span className="font-bold text-slate-700">{filteredUsers.length}</span> Karyawan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 font-medium">Profil Karyawan</th>
                <th className="px-6 py-4 font-medium">Departemen</th>
                <th className="px-6 py-4 font-medium text-center">Akses (Role)</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{user.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>NIK: {user.nik}</span>
                            <span>•</span>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span>{user.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'admin' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.role === 'pic'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {user.role === 'admin' || user.role === 'pic' ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit Karyawan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Yakin ingin menghapus ${user.name} dari sistem?`)) {
                              onDeleteUser(user.email);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Karyawan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL TAMBAH/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold">
                {editingUser ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">NIK</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.nik} 
                    onChange={e => setFormData({...formData, nik: e.target.value})} 
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Email M365 (Unik)</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  disabled={!!editingUser} 
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Departemen</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})} 
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Role Aplikasi</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})} 
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">USER</option>
                    <option value="pic">PIC</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Password Sistem</label>
                <input 
                  required 
                  type="text" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};