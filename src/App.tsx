/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { PicDashboard } from './components/PicDashboard';
import { UserPortal } from './components/UserPortal';
import { BastFormModal } from './components/BastFormModal';
import { BastDetailModal } from './components/BastDetailModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { ExpiryMonitoringTab } from './components/ExpiryMonitoringTab';
import { LoginScreen } from './components/LoginScreen';
import { EmployeeManagementTab } from './components/EmployeeManagementTab';
import { BastRecord, UserRole, SimulatedUser, LicenseItem } from './types';
import { SIMULATED_USERS, generateNextBastNumber } from './data/initialData';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<BastRecord[]>([]);
  const [employeeList, setEmployeeList] = useState<SimulatedUser[]>(SIMULATED_USERS);
  
  // STATE LOADING UTAMA
  const [loadingData, setLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // ==========================================
  // STATE AUTENTIKASI (DENGAN LOCAL STORAGE)
  // ==========================================
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bast_auth_user') !== null;
  });

  const [isStandaloneMode, setIsStandaloneMode] = useState(false); // <-- INI YANG SEMPAT HILANG

  const [currentUser, setCurrentUser] = useState<SimulatedUser>(() => {
    const savedUser = localStorage.getItem('bast_auth_user');
    return savedUser ? JSON.parse(savedUser) : SIMULATED_USERS[0];
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem('bast_auth_user');
    return savedUser ? JSON.parse(savedUser).role as UserRole : 'pic';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [isNewBastOpen, setIsNewBastOpen] = useState(false);
  const [editingBastRecord, setEditingBastRecord] = useState<BastRecord | null>(null);

  const [detailRecord, setDetailRecord] = useState<BastRecord | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [emailModal, setEmailModal] = useState<{
    isOpen: boolean;
    type: 'handover' | 'expiry_reminder';
    record?: BastRecord;
    item?: LicenseItem;
  }>({ isOpen: false, type: 'handover' });

  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Data Terpusat
  const fetchRecords = async () => {
    setLoadingData(true);
    try {
      const { data: bastData, error: bastError } = await supabase
        .from('bast_records')
        .select('*, items:license_items(*)');

      if (bastError) throw bastError;
      if (bastData) setRecords(bastData as BastRecord[]);

      const { data: usersData, error: usersError } = await supabase
        .from('master_employees')
        .select('name, nik, email, department, role, password');

      if (usersError) throw usersError;
      if (usersData && usersData.length > 0) setEmployeeList(usersData as SimulatedUser[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // LOGIKA Standalone Mode (Tautan Email)
  useEffect(() => {
    if (records.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');

      if (urlId) {
        const targetRecord = records.find(r => r.id === urlId);
        if (targetRecord) {
          setIsStandaloneMode(true);
          setCurrentRole('user');
          setCurrentUser({
            name: targetRecord.recipientName,
            nik: targetRecord.recipientNIK,
            email: targetRecord.recipientEmail,
            department: targetRecord.department,
            role: 'user',
            password: ''
          });
          setDetailRecord(targetRecord);
        }
      }
    }
  }, [records]);

  // FUNGSI LOGIN DENGAN PENYIMPANAN SESI
  const handleLogin = async (email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = employeeList.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && user.password === pass) {
      setCurrentUser(user);
      setCurrentRole(user.role as UserRole);
      setIsAuthenticated(true);
      
      // Simpan data login ke browser agar awet saat di-refresh
      localStorage.setItem('bast_auth_user', JSON.stringify(user));
      
      showToast('Login Berhasil', `Selamat datang, ${user.name}`);
      return;
    }
    
    throw new Error('Email tidak ditemukan atau password salah.');
  };

  const nextBastNumber = generateNextBastNumber(records);

  // --- AKSI 1: CREATE & UPDATE BAST ---
  const handleSaveNewBast = async (newBast: BastRecord, isEdit: boolean = false) => {
    setIsProcessing(true); 
    try {
      const { id, items, ...bastDetails } = newBast;
      
      if (isEdit) {
        const { error: updateError } = await supabase.from('bast_records').update(bastDetails).eq('id', id);
        if (updateError) throw updateError;
        
        await supabase.from('license_items').delete().eq('bast_id', id);
        const itemsToInsert = items.map(it => { 
          const { id: itemId, ...rest } = it; 
          return { ...rest, bast_id: id }; 
        });
        await supabase.from('license_items').insert(itemsToInsert);
        
        showToast('BAST Diperbarui', `Dokumen ${newBast.bastNumber} berhasil diupdate.`);
      } else {
        const { data: insertedBast, error: bastError } = await supabase
          .from('bast_records')
          .insert([bastDetails])
          .select()
          .single();
          
        if (bastError) throw bastError;

        if (items && items.length > 0) {
          const itemsToInsert = items.map(item => { 
            const { id: itemId, ...rest } = item; 
            return { ...rest, bast_id: insertedBast.id }; 
          });
          await supabase.from('license_items').insert(itemsToInsert);
        }

        const firstItem = items && items.length > 0 ? items[0] : null;
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: newBast.recipientEmail, 
            subject: `Mohon Konfirmasi - BAST Lisensi ${newBast.bastNumber}`,
            bastId: insertedBast.id, 
            employeeName: newBast.recipientName, 
            employeeNik: newBast.recipientNIK,
            bastNumber: newBast.bastNumber, 
            softwareName: firstItem ? firstItem.softwareName : 'Multiple Licenses',
            licenseType: firstItem ? firstItem.licenseType : '-', 
            expiryDate: firstItem?.expiryDate ? firstItem.expiryDate : '-'
          })
        });
        showToast('BAST Tersimpan & Email Terkirim!', `Nomor ${newBast.bastNumber} sukses dibuat.`);
      }

      await fetchRecords();
      setIsNewBastOpen(false);
      setEditingBastRecord(null);
    } catch (error: any) {
      console.error("Gagal memproses BAST:", error);
      alert("Gagal memproses BAST: " + error.message);
    } finally {
      setIsProcessing(false); 
    }
  };

  // --- AKSI 2: UPDATE (Konfirmasi BAST) ---
  const handleConfirmReceipt = async (recordId: string) => {
    setIsProcessing(true);
    try {
      const now = new Date();
      const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} UTC+7`;

      const updates = {
        status: 'Selesai',
        confirmationDate: now.toISOString(),
        auditAuthUser: `${currentUser.email} via SSO`,
        auditTimestamp: timestampStr,
      };

      const { error } = await supabase.from('bast_records').update(updates).eq('id', recordId);
      if (error) throw error;

      await fetchRecords();
      if (detailRecord && detailRecord.id === recordId) {
        setDetailRecord({ ...detailRecord, ...updates } as BastRecord);
      }
      showToast('Konfirmasi Berhasil!', `Penerimaan divalidasi oleh ${currentUser.email}.`);
    } catch (error: any) {
      console.error("Gagal update konfirmasi:", error);
      alert("Gagal melakukan konfirmasi: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- AKSI 3: REMINDER EMAIL ---
  const handleTriggerReminder = async (bastId: string, itemId: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('license_items').update({ isReminderSent: true }).eq('id', itemId);
      if (error) throw error;

      const targetBast = records.find((r) => r.id === bastId);
      const targetItem = targetBast?.items.find((i) => i.id === itemId);

      if (targetBast && targetItem) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetBast.recipientEmail,
            subject: `Reminder Perpanjangan Lisensi: ${targetItem.softwareName}`,
            html: `
              <div style="font-family: sans-serif; color: #333;">
                <h2>Peringatan Masa Berlaku Lisensi</h2>
                <p>Halo <b>${targetBast.recipientName}</b>,</p>
                <p>Masa berlaku untuk lisensi <b>${targetItem.softwareName}</b> Anda akan segera berakhir pada tanggal <b>${targetItem.expiryDate}</b>.</p>
                <p>Mohon segera informasikan kepada Tim IT jika Anda masih membutuhkan perpanjangan untuk lisensi perangkat lunak ini.</p>
              </div>
            `
          })
        });
      }

      await fetchRecords();
      showToast('Reminder Terkirim!', `Email H-30 berhasil dikirim.`);
    } catch (error: any) {
      console.error("Gagal mengirim reminder:", error);
      alert("Gagal mengirim reminder: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- AKSI 4: DELETE BAST ---
  const handleDeleteBast = async (recordId: string) => {
    setIsProcessing(true);
    try {
      await supabase.from('license_items').delete().eq('bast_id', recordId);
      const { error } = await supabase.from('bast_records').delete().eq('id', recordId);
      
      if (error) throw error;
      
      showToast('Data Dihapus', 'Dokumen BAST berhasil dihapus permanen dari database.');
      await fetchRecords();
    } catch (err: any) {
      console.error("Gagal menghapus data:", err);
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- FUNGSI ADMIN: CRUD Karyawan ---
  const handleAddUser = async (user: SimulatedUser) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('master_employees').insert([user]);
      if (error) throw error;
      showToast('Berhasil', `Karyawan ${user.name} ditambahkan.`);
      await fetchRecords();
    } catch (err: any) { 
      alert("Gagal menambahkan karyawan: " + err.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleUpdateUser = async (oldEmail: string, data: Partial<SimulatedUser>) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('master_employees').update(data).eq('email', oldEmail);
      if (error) throw error;
      showToast('Berhasil', `Data karyawan diperbarui.`);
      await fetchRecords();
    } catch (err: any) { 
      alert("Gagal memperbarui data: " + err.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleDeleteUser = async (email: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('master_employees').delete().eq('email', email);
      if (error) throw error;
      showToast('Dihapus', `Data karyawan berhasil dihapus.`);
      await fetchRecords();
    } catch (err: any) { 
      alert("Gagal menghapus karyawan: " + err.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleImportCSVUsers = async (newUsers: SimulatedUser[]) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('master_employees').insert(newUsers);
      if (error) throw error;
      showToast('Sukses', `${newUsers.length} data Karyawan berhasil diimpor.`);
      await fetchRecords();
    } catch (err: any) { 
      alert("Gagal mengimpor CSV: " + err.message); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const userPendingCount = records.filter(
    (r) => r.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() && r.status === 'Menunggu Konfirmasi'
  ).length;

  // ==========================================
  // RENDER LOGIC
  // ==========================================

  const GlobalProcessingOverlay = () => (
    <div className="fixed inset-0 z-100 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 min-w-70">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <div className="text-center">
          <p className="font-bold text-slate-800">Memproses Data...</p>
          <p className="text-xs text-slate-500 mt-1">Mohon tunggu sebentar.</p>
        </div>
      </div>
    </div>
  );

  if (loadingData) return <div className="p-10 flex flex-col items-center justify-center gap-3 text-slate-500 font-medium h-screen bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /> <span>Menyinkronkan Database...</span></div>;

  // 1. Standalone Mode (Link Konfirmasi dari Email)
  if (isStandaloneMode && detailRecord) {
    return (
      <div id="bast-app-root" className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
        {isProcessing && <GlobalProcessingOverlay />}
        {toastMessage && (
          <div className="fixed top-5 z-50 bg-white text-slate-800 px-5 py-3.5 rounded-2xl shadow-xl flex items-start gap-3 border border-slate-200">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4 text-white" /></div>
            <div className="space-y-0.5 text-xs"><div className="font-bold">{toastMessage.title}</div><div className="text-slate-600">{toastMessage.desc}</div></div>
          </div>
        )}
        <BastDetailModal
          isOpen={true}
          onClose={() => { }}
          record={detailRecord}
          onConfirmReceipt={handleConfirmReceipt}
          isUserView={true}
          canConfirm={detailRecord.status === 'Menunggu Konfirmasi'}
        />
      </div>
    );
  }

  // 2. Tampilkan Halaman Login jika belum terautentikasi
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 3. Tampilkan Aplikasi Utama setelah Login
  return (
    <div id="bast-app-root" className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {isProcessing && <GlobalProcessingOverlay />}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
          <div className="space-y-0.5 text-xs"><div className="font-bold">{toastMessage.title}</div><div className="text-slate-300">{toastMessage.desc}</div></div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentRole={currentRole}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewBast={() => { 
          setEditingBastRecord(null); 
          setIsNewBastOpen(true); 
        }}
        onOpenDocs={() => setIsDocsOpen(true)}
        pendingCount={userPendingCount}
        onLogout={() => {
          setIsAuthenticated(false);
          setActiveTab('dashboard');
          // Hapus sesi login dari browser saat Logout
          localStorage.removeItem('bast_auth_user');
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'admin' || currentRole === 'pic' ? (
          activeTab === 'dashboard' ? (
            <PicDashboard
              records={records}
              onOpenNewBast={() => { 
                setEditingBastRecord(null); 
                setIsNewBastOpen(true); 
              }}
              onViewDetail={setDetailRecord}
              onPreviewEmail={(rec) => setEmailModal({ isOpen: true, type: 'handover', record: rec })}
              onGoToMonitoring={() => setActiveTab('monitoring')}
              onEditBast={(rec) => { 
                setEditingBastRecord(rec); 
                setIsNewBastOpen(true); 
              }}
              onDeleteBast={handleDeleteBast} 
              onForceCompleteBast={handleConfirmReceipt}
            />
          ) : activeTab === 'monitoring' ? (
            <ExpiryMonitoringTab
              records={records}
              onTriggerReminder={handleTriggerReminder}
              onPreviewEmail={(rec, item) => setEmailModal({ isOpen: true, type: 'expiry_reminder', record: rec, item })}
            />
          ) : (
            <EmployeeManagementTab 
              users={employeeList}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onImportCSV={handleImportCSVUsers}
            />
          )
        ) : (
          <UserPortal
            currentUser={currentUser}
            records={records.filter(r => r.recipientEmail.toLowerCase() === currentUser.email.toLowerCase())}
            onConfirmReceipt={handleConfirmReceipt}
            onViewDetail={setDetailRecord}
          />
        )}
      </main>

      <BastFormModal 
        initialData={editingBastRecord} 
        isOpen={isNewBastOpen} 
        onClose={() => { 
          setIsNewBastOpen(false); 
          setEditingBastRecord(null); 
        }} 
        nextBastNumber={nextBastNumber} 
        onSave={handleSaveNewBast} 
        simulatedUsers={employeeList} 
      />
      
      <BastDetailModal 
        isOpen={!!detailRecord} 
        onClose={() => setDetailRecord(null)} 
        record={detailRecord} 
        onConfirmReceipt={handleConfirmReceipt} 
        isUserView={currentRole === 'user'} 
        canConfirm={currentRole === 'user' && detailRecord?.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() && detailRecord?.status === 'Menunggu Konfirmasi'} 
      />
      
      <EmailPreviewModal 
        isOpen={emailModal.isOpen} 
        onClose={() => setEmailModal({ ...emailModal, isOpen: false })} 
        type={emailModal.type} 
        record={emailModal.record} 
        item={emailModal.item} 
      />
      
      <ArchitectureDocsModal 
        isOpen={isDocsOpen} 
        onClose={() => setIsDocsOpen(false)} 
      />
    </div>
  );
}