import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShieldAlert, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { BastRecord, LicenseItem, LicenseType, SimulatedUser } from '../types';

interface BastFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextBastNumber: string;
  onSave: (newBast: BastRecord, isEdit: boolean) => void;
  simulatedUsers: SimulatedUser[];
  initialData?: BastRecord | null;
}

const SOFTWARE_PRESETS = [
  'Adobe Creative Cloud All Apps',
  'JetBrains All Products Pack',
  'Microsoft 365 E5 / Copilot',
  'Figma Enterprise Seat',
  'AutoCAD 2026 Commercial',
  'Tableau Desktop Professional',
  'Navicat Premium Enterprise',
  'Zoom Workplace Pro',
  'Visual Studio Enterprise',
  'Slack Enterprise Grid',
];

export const BastFormModal: React.FC<BastFormModalProps> = ({
  isOpen,
  onClose,
  nextBastNumber,
  onSave,
  simulatedUsers,
  initialData
}) => {
  if (!isOpen) return null;

  // Header data
  const [recipientNIK, setRecipientNIK] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [picName, setPicName] = useState('Dimas Pratama');
  const [picEmail, setPicEmail] = useState('dimas.pratama@corp.id');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Multi-item license table
  const [items, setItems] = useState<LicenseItem[]>([]);

  // Effect untuk mereset/mengisi data saat modal dibuka
  useEffect(() => {
    if (isOpen && initialData) {
      setRecipientNIK(initialData.recipientNIK);
      setRecipientName(initialData.recipientName);
      setRecipientEmail(initialData.recipientEmail);
      setDepartment(initialData.department);
      setPicName(initialData.picName);
      setPicEmail(initialData.picEmail);
      setNotes(initialData.notes || '');
      setItems(initialData.items.map(it => ({ ...it }))); 
    } else if (isOpen && !initialData) {
      setRecipientNIK(''); 
      setRecipientName(''); 
      setRecipientEmail(''); 
      setDepartment(''); 
      setNotes('');
      setItems([{
        id: `item-${Date.now()}-1`, 
        softwareName: '', 
        licenseType: 'Tahunan', 
        licenseKeyAccount: '',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        isReminderSent: false,
      }]);
    }
  }, [isOpen, initialData]);

  // Handle user preset auto-fill
  const handleSelectPresetUser = (email: string) => {
    const user = simulatedUsers.find((u) => u.email === email);
    if (user) {
      setRecipientName(user.name);
      setRecipientNIK(user.nik);
      setRecipientEmail(user.email);
      setDepartment(user.department);
    }
  };

  const handleAddItem = () => {
    const newItem: LicenseItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      softwareName: '',
      licenseType: 'Tahunan',
      licenseKeyAccount: '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      isReminderSent: false,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setErrorMessage('Minimal harus ada 1 item lisensi software dalam BAST.');
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: keyof LicenseItem, value: any) => {
    setErrorMessage('');
    const updated = [...items];
    const current = { ...updated[index] };

    if (field === 'licenseType') {
      current.licenseType = value as LicenseType;
      if (value === 'Perpetual') {
        current.expiryDate = undefined;
      } else if (value === 'Bulanan') {
        const start = new Date(current.startDate || new Date());
        start.setMonth(start.getMonth() + 1);
        current.expiryDate = start.toISOString().split('T')[0];
      } else if (value === 'Tahunan') {
        const start = new Date(current.startDate || new Date());
        start.setFullYear(start.getFullYear() + 1);
        current.expiryDate = start.toISOString().split('T')[0];
      }
    } else {
      (current as any)[field] = value;
    }

    updated[index] = current;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!recipientNIK.trim()) {
      setErrorMessage('NIK Karyawan wajib diisi.');
      return;
    }
    if (!recipientName.trim()) {
      setErrorMessage('Nama Penerima wajib diisi.');
      return;
    }
    if (!recipientEmail.trim()) {
      setErrorMessage('Email Microsoft 365 Penerima wajib diisi.');
      return;
    }
    if (!department.trim()) {
      setErrorMessage('Departemen wajib diisi.');
      return;
    }

    // Validate license items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.softwareName.trim()) {
        setErrorMessage(`Nama Software pada baris #${i + 1} belum diisi.`);
        return;
      }
      if (!it.licenseKeyAccount.trim()) {
        setErrorMessage(`Informasi Lisensi/Akun pada baris #${i + 1} belum diisi.`);
        return;
      }
      if (!it.startDate) {
        setErrorMessage(`Tanggal Mulai pada baris #${i + 1} belum ditentukan.`);
        return;
      }
      if (it.licenseType !== 'Perpetual' && !it.expiryDate) {
        setErrorMessage(`Tanggal Berakhir (Expiry) pada baris #${i + 1} wajib diisi untuk lisensi ${it.licenseType}.`);
        return;
      }
    }

    const newBast: BastRecord = {
      id: initialData ? initialData.id : `bast-${Date.now()}`,
      bastNumber: initialData ? initialData.bastNumber : nextBastNumber,
      recipientName: recipientName.trim(),
      recipientNIK: recipientNIK.trim(),
      recipientEmail: recipientEmail.trim(),
      department: department.trim(),
      picName: picName.trim(),
      picEmail: picEmail.trim(),
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
      status: initialData ? initialData.status : 'Menunggu Konfirmasi',
      notes: notes.trim(),
      items: items,
    };

    onSave(newBast, !!initialData);
  };

  return (
    <div
      id="modal-backdrop-bast-form"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="modal-card-bast-form"
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-lg">
                {initialData ? 'Edit Data BAST' : 'Input BAST Pemenuhan Lisensi'}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-400/30">
                {initialData ? initialData.bastNumber : nextBastNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Input data serah terima software untuk satu penerima (bisa multi-lisensi sekaligus)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Select Preset Karyawan (Hanya tampil jika mode Buat Baru) */}
          {!initialData && (
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Opsi Cepat: Isi dari Data Karyawan M365</span>
              </div>
              <div className="flex items-center gap-1.5">
                {simulatedUsers
                  .filter((u) => u.role === 'user')
                  .map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => handleSelectPresetUser(u.email)}
                      className="text-[11px] px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 transition-colors cursor-pointer"
                    >
                      {u.name} ({u.nik})
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Bagian 1: Data Penerima */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              1. Data Karyawan Penerima Lisensi (Pihak Kedua)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK (Nomor Induk Karyawan) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-recipient-nik"
                  type="text"
                  value={recipientNIK}
                  onChange={(e) => setRecipientNIK(e.target.value)}
                  placeholder="Contoh: 10928374"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-recipient-name"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Contoh: Fauzan Miftahurochman"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Microsoft 365 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-recipient-email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="user@corp.id"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departemen <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-recipient-dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Contoh: Software Engineering"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Multi-Item Lisensi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Rincian Lisensi Software (Multi-Item)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Tambahkan satu atau lebih lisensi software yang diserahkan dalam BAST ini
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Lisensi Lain</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      Item Lisensi #{idx + 1}
                    </span>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Item</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Software Name with Preset */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nama Software / Aplikasi
                      </label>
                      <input
                        type="text"
                        list={`software-list-${idx}`}
                        value={item.softwareName}
                        onChange={(e) => handleItemChange(idx, 'softwareName', e.target.value)}
                        placeholder="Ketik atau pilih software..."
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <datalist id={`software-list-${idx}`}>
                        {SOFTWARE_PRESETS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>

                    {/* Tipe Lisensi */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tipe Lisensi
                      </label>
                      <select
                        value={item.licenseType}
                        onChange={(e) => handleItemChange(idx, 'licenseType', e.target.value)}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Tahunan">Tahunan</option>
                        <option value="Bulanan">Bulanan</option>
                        <option value="Perpetual">Perpetual (Seumur Hidup)</option>
                      </select>
                    </div>

                    {/* Key / Account */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        License Key / Akun Login / Seat
                      </label>
                      <input
                        type="text"
                        value={item.licenseKeyAccount}
                        onChange={(e) => handleItemChange(idx, 'licenseKeyAccount', e.target.value)}
                        placeholder="Serial / Akun Admin / Seat ID"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Start Date */}
                    <div className="sm:col-span-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Mulai
                          </label>
                          <input
                            type="date"
                            value={item.startDate}
                            onChange={(e) => handleItemChange(idx, 'startDate', e.target.value)}
                            className="w-full text-xs px-2 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Berakhir {item.licenseType === 'Perpetual' ? '(N/A)' : ''}
                          </label>
                          <input
                            type="date"
                            disabled={item.licenseType === 'Perpetual'}
                            value={item.licenseType === 'Perpetual' ? '' : item.expiryDate || ''}
                            onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                            className={`w-full text-xs px-2 py-2 border border-slate-200 rounded-lg focus:outline-none ${
                              item.licenseType === 'Perpetual'
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-white focus:ring-1 focus:ring-blue-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 3: PIC & Catatan */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              3. PIC Penyerah (Pihak Pertama) & Catatan Tambahan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIC IT Asset Management
                </label>
                <input
                  type="text"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Serah Terima (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Harap aktivasi sebelum tanggal 25"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Format nomor otomatis: <strong>{initialData ? initialData.bastNumber : nextBastNumber}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{initialData ? 'Update & Simpan' : 'Simpan & Kirim Notifikasi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};