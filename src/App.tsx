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
import { BastRecord, UserRole, SimulatedUser, LicenseItem } from './types';
import { SIMULATED_USERS, generateNextBastNumber } from './data/initialData';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<BastRecord[]>([]);
  // State baru untuk menyimpan daftar karyawan dari Supabase
  const [employeeList, setEmployeeList] = useState<SimulatedUser[]>(SIMULATED_USERS);
  const [loadingData, setLoadingData] = useState(true);

  const [currentRole, setCurrentRole] = useState<UserRole>('pic');
  const [currentUser, setCurrentUser] = useState<SimulatedUser>(SIMULATED_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [isNewBastOpen, setIsNewBastOpen] = useState(false);
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

  // 1. Fetch Data Terpusat (BAST & Master Karyawan)
  const fetchRecords = async () => {
    setLoadingData(true);
    
    // Tarik data BAST beserta relasi item lisensinya
    const { data: bastData, error: bastError } = await supabase
      .from('bast_records')
      .select('*, items:license_items(*)'); 

    if (bastError) {
      console.error('Error fetching records:', bastError);
    } else if (bastData) {
      setRecords(bastData as BastRecord[]);
    }

    // Tarik data Master Karyawan
    const { data: usersData, error: usersError } = await supabase
      .from('master_employees')
      .select('name, nik, email, department, role');

    if (!usersError && usersData && usersData.length > 0) {
      setEmployeeList(usersData as SimulatedUser[]);
      // Set default user jika belum diubah
      if (currentUser.email === SIMULATED_USERS[0].email) {
        setCurrentUser(usersData[0] as SimulatedUser);
      }
    }

    setLoadingData(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const nextBastNumber = generateNextBastNumber(records);

  // 2. Insert Data BAST & Trigger Email Approval
  const handleSaveNewBast = async (newBast: BastRecord) => {
    const { id, items, ...bastDetails } = newBast;

    // Simpan tabel induk
    const { data: insertedBast, error: bastError } = await supabase
      .from('bast_records')
      .insert([bastDetails])
      .select()
      .single();

    if (bastError) {
      console.error("Gagal simpan BAST:", bastError);
      return;
    }

    // Simpan item anak
    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => {
        const { id, ...rest } = item; // Buang ID frontend agar UUID digenerate backend
        return {
          ...rest,
          bast_id: insertedBast.id
        };
      });

      const { error: itemsError } = await supabase
        .from('license_items')
        .insert(itemsToInsert);

      if (itemsError) console.error("Gagal simpan item:", itemsError);
    }

    // Trigger API Vercel Serverless untuk Notifikasi BAST Baru
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: newBast.recipientEmail,
          subject: `Mohon Konfirmasi - BAST Lisensi ${newBast.bastNumber}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h2>Pemberitahuan Serah Terima Lisensi Software</h2>
              <p>Halo <b>${newBast.recipientName}</b>,</p>
              <p>Tim IT telah menerbitkan BAST dengan nomor referensi <b>${newBast.bastNumber}</b> untuk pemenuhan kebutuhan lisensi Anda.</p>
              <p>Mohon segera lakukan konfirmasi penerimaan melalui portal dengan mengklik tautan di bawah ini:</p>
              <a href="${window.location.origin}/?bastId=${insertedBast.id}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px;">Buka Portal BAST</a>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">Pesan ini dihasilkan otomatis oleh sistem. Harap tidak membalas email ini.</p>
            </div>
          `
        })
      });
    } catch (emailErr) {
      console.error("Gagal mengirim notifikasi email:", emailErr);
    }

    await fetchRecords();
    setIsNewBastOpen(false);
    showToast('BAST Tersimpan & Email Terkirim!', `Nomor ${newBast.bastNumber} sukses dibuat.`);
  };

  // 3. Update Status (Konfirmasi Penerimaan)
  const handleConfirmReceipt = async (recordId: string) => {
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} UTC+7`;

    const updates = {
      status: 'Selesai',
      confirmationDate: now.toISOString(),
      auditAuthUser: `${currentUser.email} via SSO`,
      auditTimestamp: timestampStr,
    };

    const { error } = await supabase
      .from('bast_records')
      .update(updates)
      .eq('id', recordId);

    if (error) {
      console.error("Gagal update konfirmasi:", error);
      return;
    }

    await fetchRecords();

    if (detailRecord && detailRecord.id === recordId) {
      setDetailRecord({ ...detailRecord, ...updates } as BastRecord);
    }

    showToast('Konfirmasi Berhasil!', `Penerimaan divalidasi oleh ${currentUser.email}.`);
  };

  // 4. Trigger Update Reminder H-30 & Kirim Email Reminder
  const handleTriggerReminder = async (bastId: string, itemId: string) => {
    const { error } = await supabase
      .from('license_items')
      .update({ isReminderSent: true })
      .eq('id', itemId);

    if (!error) {
      // Ambil data BAST target untuk info email
      const targetBast = records.find((r) => r.id === bastId);
      const targetItem = targetBast?.items.find((i) => i.id === itemId);

      if (targetBast && targetItem) {
        try {
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
                  <p style="margin-top: 20px; font-size: 12px; color: #666;">Pesan ini dihasilkan otomatis oleh sistem.</p>
                </div>
              `
            })
          });
        } catch (emailErr) {
          console.error("Gagal mengirim email reminder:", emailErr);
        }
      }

      await fetchRecords();
      showToast('Reminder Terkirim!', `Email H-30 berhasil tercatat dan dikirim.`);
    }
  };

  const userPendingCount = records.filter(
    (r) => r.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() && r.status === 'Menunggu Konfirmasi'
  ).length;

  if (loadingData) return <div className="p-10 text-center font-bold text-slate-500">Menyinkronkan data dengan Supabase...</div>;

  return (
    <div id="bast-app-root" className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-4 h-4" /></div>
          <div className="space-y-0.5 text-xs"><div className="font-bold">{toastMessage.title}</div><div className="text-slate-300">{toastMessage.desc}</div></div>
        </div>
      )}

      {/* Komponen menggunakan employeeList dinamis */}
      <Navbar currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser} setCurrentUser={setCurrentUser} users={employeeList} activeTab={activeTab} setActiveTab={setActiveTab} onOpenNewBast={() => setIsNewBastOpen(true)} onOpenDocs={() => setIsDocsOpen(true)} pendingCount={userPendingCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRole === 'pic' ? (
          activeTab === 'dashboard' ? <PicDashboard records={records} onOpenNewBast={() => setIsNewBastOpen(true)} onViewDetail={setDetailRecord} onPreviewEmail={(rec) => setEmailModal({ isOpen: true, type: 'handover', record: rec })} onGoToMonitoring={() => setActiveTab('monitoring')} /> : <ExpiryMonitoringTab records={records} onTriggerReminder={handleTriggerReminder} onPreviewEmail={(rec, item) => setEmailModal({ isOpen: true, type: 'expiry_reminder', record: rec, item })} />
        ) : (
          <UserPortal currentUser={currentUser} records={records} onConfirmReceipt={handleConfirmReceipt} onViewDetail={setDetailRecord} />
        )}
      </main>

      {/* Modal menggunakan employeeList dinamis */}
      <BastFormModal isOpen={isNewBastOpen} onClose={() => setIsNewBastOpen(false)} nextBastNumber={nextBastNumber} onSave={handleSaveNewBast} simulatedUsers={employeeList} />
      <BastDetailModal isOpen={!!detailRecord} onClose={() => setDetailRecord(null)} record={detailRecord} onConfirmReceipt={handleConfirmReceipt} isUserView={currentRole === 'user'} canConfirm={currentRole === 'user' && detailRecord?.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() && detailRecord?.status === 'Menunggu Konfirmasi'} />
      <EmailPreviewModal isOpen={emailModal.isOpen} onClose={() => setEmailModal({ ...emailModal, isOpen: false })} type={emailModal.type} record={emailModal.record} item={emailModal.item} />
      <ArchitectureDocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}