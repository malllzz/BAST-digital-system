import React from 'react';
import { X, Printer, ShieldCheck, Clock, CheckCircle, Calendar, Hash, Building2, User, Mail, Laptop } from 'lucide-react';
import { BastRecord } from '../types';

interface BastDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BastRecord | null;
  onConfirmReceipt?: (recordId: string) => void;
  isUserView?: boolean;
  canConfirm?: boolean;
}

export const BastDetailModal: React.FC<BastDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onConfirmReceipt,
  isUserView,
  canConfirm,
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="modal-backdrop-bast-detail"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="modal-card-bast-detail"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Dokumen Digital Resmi:</span>
            <span className="font-mono text-xs text-blue-300 font-bold">{record.bastNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6 bg-white print:p-0">
          {/* Header BAST Korporat */}
          <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  BERITA ACARA SERAH TERIMA (BAST) DIGITAL
                </h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  PEMENUHAN LISENSI SOFTWARE PERUSAHAAN
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <div className="text-xs text-slate-500 font-medium">Nomor BAST:</div>
              <div className="font-mono text-sm font-bold text-slate-900">{record.bastNumber}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Tanggal Diterbitkan: {new Date(record.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </div>
            </div>
          </div>

          {/* Status Ribbon */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <span className="font-medium">Status Dokumen:</span>
              {record.status === 'Selesai' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Selesai (Tervalidasi M365)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  Menunggu Konfirmasi User
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              Integrasi: <strong>Microsoft 365 / Azure AD SSO</strong>
            </div>
          </div>

          {/* Pernyataan Serah Terima */}
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            Pada hari ini, bertempat di lingkungan operasional perusahaan, telah dilakukan serah terima hak penggunaan
            lisensi software antara pihak-pihak terkait di bawah ini:
          </p>

          {/* Profil Pihak Pertama & Pihak Kedua */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pihak Pertama */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Pihak Pertama (Penyedia / IT Asset)</span>
              </div>
              <div className="text-xs space-y-1 text-slate-700">
                <div>
                  <span className="text-slate-500 inline-block w-20">Nama:</span>
                  <span className="font-medium text-slate-900">{record.picName}</span>
                </div>
                <div>
                  <span className="text-slate-500 inline-block w-20">Email:</span>
                  <span>{record.picEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 inline-block w-20">Divisi:</span>
                  <span>IT Asset & Infrastructure</span>
                </div>
              </div>
            </div>

            {/* Pihak Kedua (User Penerima) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Pihak Kedua (Karyawan Penerima)</span>
              </div>
              <div className="text-xs space-y-1 text-slate-700">
                <div>
                  <span className="text-slate-500 inline-block w-20">Nama:</span>
                  <span className="font-semibold text-slate-900">{record.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 inline-block w-20">NIK:</span>
                  <span className="font-mono font-bold text-slate-900 px-1.5 py-0.5 bg-slate-200/70 rounded">
                    {record.recipientNIK}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 inline-block w-20">Email M365:</span>
                  <span>{record.recipientEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 inline-block w-20">Departemen:</span>
                  <span>{record.department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Lisensi Software (Tabel Multi-Item) */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Rincian Lisensi Software yang Diserahterimakan:
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5">Nama Software / Aplikasi</th>
                    <th className="p-2.5 w-24">Tipe Lisensi</th>
                    <th className="p-2.5">Detail Akun / Key / Seat</th>
                    <th className="p-2.5 w-24">Tgl Mulai</th>
                    <th className="p-2.5 w-24">Masa Berlaku</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {record.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="p-2.5 font-medium text-slate-900">{item.softwareName}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.licenseType === 'Perpetual'
                              ? 'bg-purple-100 text-purple-800'
                              : item.licenseType === 'Tahunan'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.licenseType}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600 break-all">
                        {item.licenseKeyAccount}
                      </td>
                      <td className="p-2.5 text-slate-600">{item.startDate}</td>
                      <td className="p-2.5 text-slate-600">
                        {item.licenseType === 'Perpetual' ? (
                          <span className="text-purple-700 font-medium">Seumur Hidup</span>
                        ) : (
                          item.expiryDate || '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {record.notes && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Catatan PIC IT: </span>
              <span className="text-slate-600">{record.notes}</span>
            </div>
          )}

          {/* Klausul Legal BAST */}
          <div className="text-xs text-slate-600 space-y-1 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
            <div className="font-semibold text-blue-950 mb-1">Ketentuan Penggunaan Lisensi:</div>
            <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
              <li>Pihak Pertama telah menyerahkan akses lisensi software tersebut kepada Pihak Kedua dalam keadaan aktif.</li>
              <li>Pihak Kedua bertanggung jawab menggunakan lisensi software semata-mata untuk kepentingan pekerjaan perusahaan.</li>
              <li>Bukti serah terima ini sah dan mengikat secara hukum korporat melalui konfirmasi autentikasi Single Sign-On (SSO) Microsoft 365.</li>
            </ol>
          </div>

          {/* Bukti Tanda Tangan Digital & Audit Trail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* PIC Sign info */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 text-center space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-500">Pihak Pertama (Penyerah)</div>
              <div className="py-2 text-xs font-semibold text-slate-800">
                {record.picName}
                <div className="text-[10px] text-slate-500 font-normal">IT Asset & Infrastructure</div>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1.5">
                Dibuat: {new Date(record.createdAt).toLocaleString('id-ID')}
              </div>
            </div>

            {/* User Digital Sign / SSO Confirmation */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 text-center space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-500">Pihak Kedua (Penerima)</div>
              {record.status === 'Selesai' ? (
                <div className="py-1">
                  <div className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>TERKONFIRMASI DIGITAL (SSO M365)</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-medium">
                    {record.recipientName} (NIK: {record.recipientNIK})
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Timestamp: {record.auditTimestamp || record.confirmationDate}
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <div className="inline-flex items-center gap-1 text-amber-700 text-xs font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Menunggu Konfirmasi User</span>
                  </div>
                </div>
              )}
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1.5">
                Autentikasi Akun: {record.recipientEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions in User View */}
        {isUserView && canConfirm && record.status === 'Menunggu Konfirmasi' && (
          <div className="bg-amber-50 border-t border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div className="text-xs text-amber-900">
              <strong>Tindakan Dibutuhkan:</strong> Periksa kesesuaian lisensi software di atas, kemudian lakukan konfirmasi penerimaan.
            </div>
            <button
              type="button"
              onClick={() => {
                if (onConfirmReceipt) onConfirmReceipt(record.id);
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Konfirmasi Penerimaan Lisensi (M365 SSO)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
