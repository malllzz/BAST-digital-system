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

  const [loadingData, setLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bast_auth_user') !== null;
  });

  const [isStandaloneMode, setIsStandaloneMode] = useState(false);

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

  const handleLogin = async (email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = employeeList.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && user.password === pass) {
      setCurrentUser(user);
      setCurrentRole(user.role as UserRole);
      setIsAuthenticated(true);
      localStorage.setItem('bast_auth_user', JSON.stringify(user));
      showToast('Login Berhasil', `Selamat datang, ${user.name}`);
      return;
    }

    throw new Error('Email tidak ditemukan atau password salah.');
  };

  const nextBastNumber = generateNextBastNumber(records);

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
            department: newBast.department,
            bastNumber: newBast.bastNumber,
            items: items,
            softwareName: firstItem ? firstItem.softwareName : 'Multiple Licenses',
            licenseType: firstItem ? firstItem.licenseType : '-',
            expiryDate: firstItem?.expiryDate ? firstItem.expiryDate : '-',
            picName: newBast.picName,
            picEmail: newBast.picEmail,
            picPosition: newBast.picPosition,
            picDepartment: newBast.picDepartment
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

  const handleConfirmReceipt = async (recordId: string) => {
    setIsProcessing(true);
    try {
      const now = new Date();
      const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} UTC+7`;

      const record = records.find(r => r.id === recordId);
      if (!record) throw new Error("Dokumen BAST tidak ditemukan.");

      let updates: Partial<BastRecord> = {};

      if (record.status === 'Menunggu Konfirmasi' || record.status === 'Pending User') {
        if (currentRole === 'admin' || currentRole === 'pic') {
          // Bypass oleh admin/PIC
          updates = {
            status: 'Selesai',
            userConfirmationDate: now.toISOString(),
            picConfirmationDate: now.toISOString(),
            auditAuthUser: `Bypass Admin: ${currentUser.email}`,
            auditTimestamp: timestampStr,
          };
        } else {
          // Normal flow: User melakukan konfirmasi
          updates = {
            status: 'Pending PIC',
            userConfirmationDate: now.toISOString(),
            auditAuthUser: `${currentUser.email} via SSO`,
            auditTimestamp: timestampStr,
          };
        }
      } else if (record.status === 'Pending PIC') {
        // Tahap 2: Pengesahan akhir oleh PIC
        updates = {
          status: 'Selesai',
          picConfirmationDate: now.toISOString(),
        };
      }

      const { error } = await supabase.from('bast_records').update(updates).eq('id', recordId);
      if (error) throw error;

      await fetchRecords();
      if (detailRecord && detailRecord.id === recordId) {
        setDetailRecord({ ...detailRecord, ...updates } as BastRecord);
      }
      showToast('Konfirmasi Berhasil!', `Dokumen berhasil diproses.`);
    } catch (error: any) {
      console.error("Gagal update konfirmasi:", error);
      alert("Gagal melakukan konfirmasi: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

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
            subject: `[PENGINGAT H-30] Masa Berlaku Lisensi ${targetItem.softwareName} Akan Segera Berakhir`,
            type: 'expiry_reminder',
            employeeName: targetBast.recipientName,
            employeeNik: targetBast.recipientNIK,
            department: targetBast.department,
            bastNumber: targetBast.bastNumber,
            softwareName: targetItem.softwareName,
            licenseType: targetItem.licenseType,
            expiryDate: targetItem.expiryDate,
            picName: currentUser.name,
            picEmail: currentUser.email
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

  const handleToggleAutoReminder = async (bastId: string, itemId: string, isEnabled: boolean) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('license_items')
        .update({ isAutoReminderEnabled: isEnabled })
        .eq('id', itemId);
      if (error) throw error;
      showToast('Automasi Diperbarui', `Automasi email untuk lisensi ini telah ${isEnabled ? 'diaktifkan' : 'dimatikan'}.`);
      await fetchRecords();
    } catch (err: any) {
      console.error("Gagal mengubah automasi:", err);
      alert("Gagal mengubah automasi: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleAllAutoReminder = async (updates: { bastId: string, itemId: string, isEnabled: boolean }[]) => {
    if (updates.length === 0) return;
    setIsProcessing(true);
    try {
      const itemIds = updates.map(u => u.itemId);
      const targetState = updates[0].isEnabled;
      const { error } = await supabase
        .from('license_items')
        .update({ isAutoReminderEnabled: targetState })
        .in('id', itemIds);
      if (error) throw error;
      showToast('Automasi Global Diperbarui', `${updates.length} lisensi berhasil diubah ke status ${targetState ? 'Aktif' : 'Nonaktif'}.`);
      await fetchRecords();
    } catch (err: any) {
      console.error("Gagal mengubah automasi massal:", err);
      alert("Gagal mengubah automasi massal: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

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
    (r) => r.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() && (r.status === 'Menunggu Konfirmasi' || r.status === 'Pending User')
  ).length;

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
          canConfirm={detailRecord.status === 'Menunggu Konfirmasi' || detailRecord.status === 'Pending User'}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div id="bast-app-root" className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {isProcessing && <GlobalProcessingOverlay />}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
          <div className="space-y-0.5 text-xs"><div className="font-bold">{toastMessage.title}</div><div className="text-slate-300">{toastMessage.desc}</div></div>
        </div>
      )}

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
              onToggleAutoReminder={handleToggleAutoReminder}
              onToggleAllAutoReminder={handleToggleAllAutoReminder}
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
        canConfirm={currentRole === 'user' && detailRecord?.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() && (detailRecord?.status === 'Menunggu Konfirmasi' || detailRecord?.status === 'Pending User')}
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