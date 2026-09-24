import React, { useState } from 'react';
import { X, FileText, CheckCircle2, ShieldAlert, Cpu, Database, Bell, Lock, UserCheck, Layers } from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeSection, setActiveSection] = useState<'all' | 'process' | 'roles' | 'fr' | 'data' | 'workflow' | 'risk' | 'arch'>('all');

  return (
    <div
      id="modal-backdrop-arch-docs"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="modal-card-arch-docs"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-semibold text-base leading-tight">
                Dokumentasi Analisis Kebutuhan Sistem & Arsitektur
              </h2>
              <p className="text-xs text-slate-400">
                BAST Digital Pemenuhan Lisensi Software (Termasuk Penambahan Atribut NIK)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Bagian
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('process')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'process' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Business Process
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('roles')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'roles' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. User Role
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('fr')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'fr' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. Functional Requirement
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('data')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'data' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Data Requirement (+NIK)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('workflow')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'workflow' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            5. Workflow
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('risk')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'risk' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            6. Risiko & Kontrol
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('arch')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'arch' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            7. Arsitektur M365
          </button>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-xs text-slate-700 leading-relaxed">
          {/* Section 1 */}
          {(activeSection === 'all' || activeSection === 'process') && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                Business Process (Alur Proses Bisnis)
              </h3>
              <p>
                Inisiasi dimulai saat PIC IT menyelesaikan pengadaan lisensi. PIC menginput data serah terima termasuk
                data identitas karyawan (Nama, NIK, Departemen, Email M365) serta satu atau beberapa lisensi software
                (Multi-Item). Sistem menerbitkan nomor urut <code>BAST-IT/YYYY/MM/XX</code> dan mengirim notifikasi email
                ke user. User menguji aktivasi software, login via SSO Microsoft 365, lalu menekan konfirmasi terima.
                Setelah konfirmasi, data terkunci (*Read-Only*) dan sistem memantau masa berlaku hingga H-30 reminder.
              </p>
            </div>
          )}

          {/* Section 2 */}
          {(activeSection === 'all' || activeSection === 'roles') && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                User Role & RACI Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-2 text-left border-r border-slate-200">Role</th>
                      <th className="p-2 text-left border-r border-slate-200">Kewenangan Sistem</th>
                      <th className="p-2 text-left">Tanggung Jawab Utama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 font-medium text-slate-900 border-r border-slate-200">PIC IT Asset</td>
                      <td className="p-2 border-r border-slate-200">Create BAST, View All Data, Monitor H-30, Export Audit</td>
                      <td className="p-2">Memastikan lisensi aktif dan data NIK penerima valid sebelum dikirim.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-900 border-r border-slate-200">End User Penerima</td>
                      <td className="p-2 border-r border-slate-200">
                        View Own Data (Item-Level Security), Konfirmasi Penerimaan via SSO
                      </td>
                      <td className="p-2">Memvalidasi akses software dan menyetujui BAST secara elektronik.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-900 border-r border-slate-200">Power Automate Bot</td>
                      <td className="p-2 border-r border-slate-200">Auto-numbering, Send Notification, Auto-lock, H-30 Checker</td>
                      <td className="p-2">Otomasi background job harian dan pengiriman email.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3 */}
          {(activeSection === 'all' || activeSection === 'fr') && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                Functional Requirement (FR)
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong>FR-01: Auto-Numbering</strong> Format <code>BAST-IT/YYYY/MM/XX</code> terisi otomatis dan berurutan tiap bulan.
                </li>
                <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong>FR-02: Multi-Item Lisensi</strong> Form input dapat memuat lebih dari 1 lisensi software untuk 1 user.
                </li>
                <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong>FR-03: SSO Authentication Sign-off</strong> Konfirmasi menggunakan akun Microsoft 365 tanpa tanda tangan gambar.
                </li>
                <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong>FR-04: Item-Level Security</strong> User biasa hanya dapat melihat dokumen miliknya sendiri.
                </li>
                <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong>FR-05: Lock Record Selesai</strong> Status Completed mengunci data dari perubahan.
                </li>
                <li className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong>FR-06: Monitoring H-30</strong> Peringatan otomatis dikirimkan 30 hari sebelum lisensi berakhir.
                </li>
              </ul>
            </div>
          )}

          {/* Section 4 */}
          {(activeSection === 'all' || activeSection === 'data') && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                Data Requirement (Skema Entitas SharePoint List + Atribut NIK)
              </h3>
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">List 1: BAST_Header</div>
                  <div className="font-mono text-[11px] text-slate-600">
                    Title (BAST_Number) | Recipient_Name | <span className="bg-amber-100 text-amber-900 px-1 font-bold rounded">Recipient_NIK</span> | Recipient_Email | Department | PIC_Created_By | Status | Confirmation_Date | Audit_User_Agent | Notes
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 mb-1">List 2: BAST_Items (Relasi 1 to Many)</div>
                  <div className="font-mono text-[11px] text-slate-600">
                    BAST_Number_FK | Software_Name | License_Type (Tahunan/Bulanan/Perpetual) | License_Key_Account | Start_Date | Expiry_Date | Is_Reminder_Sent
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5 */}
          {(activeSection === 'all' || activeSection === 'workflow') && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  5
                </span>
                Workflow Automasi (Power Automate)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                  <div className="font-bold text-blue-900">Flow 1: Penyerahan & Konfirmasi</div>
                  <p className="text-slate-600">
                    Trigger: Item baru di BAST_Header.<br />
                    Action: Ambil item lisensi, kirim email notifikasi ke email penerima, sediakan link konfirmasi M365 SSO, catat audit log saat diklik.
                  </p>
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
                  <div className="font-bold text-amber-900">Flow 2: Scheduled Reminder H-30</div>
                  <p className="text-slate-600">
                    Trigger: Recurrence harian pukul 08:00.<br />
                    Action: Query lisensi non-perpetual dengan <code>Expiry_Date == H+30</code> & <code>Is_Reminder_Sent == false</code>, kirim email ke user dan update flag.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 6 */}
          {(activeSection === 'all' || activeSection === 'risk') && (
            <div className="space-y-2 border-b border-slate-200 pb-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  6
                </span>
                Risiko dan Kontrol Audit
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Kontrol Anti-Repudiasi:</strong> Mencegah user menyangkal penerimaan dengan mengikat konfirmasi ke token Azure AD SSO dan timestamp audit trail.
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Kontrol Kerahasiaan (Item-Level Security):</strong> User hanya dapat membaca item BAST miliknya sendiri, serial key rekan kerja terisolasi.
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Integritas Data:</strong> Data dikunci read-only setelah status Selesai, mencegah pengubahan sepihak setelah disepakati.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 7 */}
          {(activeSection === 'all' || activeSection === 'arch') && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  7
                </span>
                Rekomendasi Arsitektur Microsoft 365
              </h3>
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed">
                <div>[Frontend] : Canvas Power Apps / React Web Form (Input Multi-Item & Dashboard)</div>
                <div className="pl-4">├── PIC Portal : Create BAST, Manage Records, View Organization Stats</div>
                <div className="pl-4">└── User Portal: Review License & Single-Click SSO Confirmation</div>
                <div>[Business Logic] : Power Automate Cloud Flows</div>
                <div className="pl-4">├── Flow Auto-Numbering (BAST-IT/YYYY/MM/XX)</div>
                <div className="pl-4">├── Flow Email Handover Notification</div>
                <div className="pl-4">└── Flow Scheduled Recurrence (H-30 Expiry Notification)</div>
                <div>[Database & Storage] : SharePoint Online Lists</div>
                <div className="pl-4">├── List BAST_Header (dengan Item-Level Permission & NIK Karyawan)</div>
                <div className="pl-4">└── List BAST_Items (Multi-Item software detail per BAST)</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};
