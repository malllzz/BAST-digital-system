import React from 'react';
import { X, Mail, AlertTriangle } from 'lucide-react';
import { BastRecord, LicenseItem } from '../types';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'handover' | 'expiry_reminder';
  record?: BastRecord;
  item?: LicenseItem;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  type,
  record,
  item,
}) => {
  if (!isOpen) return null;

  const recipientEmail = record?.recipientEmail || 'sitirahmi@corp.id';
  const recipientName = record?.recipientName || 'Siti Rahmi';
  const recipientNIK = record?.recipientNIK || '111222333';

  return (
    <div
      id="modal-backdrop-email"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="modal-card-email"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col"
      >
        {/* Outlook Header Simulator */}
        <div className="bg-[#0078D4] text-white px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <span className="font-semibold text-sm">Simulasi Notifikasi Microsoft Outlook (Power Automate)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Meta */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 text-sm space-y-2 font-sans z-10">
          <div className="flex">
            <span className="text-slate-500 w-20">Dari:</span>
            <span className="font-semibold text-slate-800">
              IT Asset Management Notification &lt;no-reply.itasset@corp.id&gt;
            </span>
          </div>
          <div className="flex">
            <span className="text-slate-500 w-20">Kepada:</span>
            <span className="font-medium text-slate-800">
              {recipientName} ({recipientNIK}) &lt;{recipientEmail}&gt;
            </span>
          </div>
          <div className="flex">
            <span className="text-slate-500 w-20">Subjek:</span>
            <span className="font-bold text-slate-900">
              {type === 'handover'
                ? `[PENTING] Penyerahan Lisensi Software Baru - No. ${record?.bastNumber || 'BAST-IT/2026/09/04'}`
                : `[PENGINGAT H-30] Masa Berlaku Lisensi ${item?.softwareName || 'Software'} Akan Segera Berakhir`}
            </span>
          </div>
        </div>

        {/* Email Body */}
        <div className="relative p-6 space-y-5 text-sm text-slate-700 leading-relaxed font-sans bg-white overflow-y-auto max-h-[60vh]">
          
          {/* Watermark Background SVG */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <img 
              src="/logo-transjakarta.svg" 
              alt="Watermark" 
              className="w-3/4 max-w-md h-auto transform -rotate-12 grayscale"
            />
          </div>

          <div className="relative z-10 space-y-5">
            {type === 'handover' ? (
              <>
                <p>Halo <strong>{recipientName}</strong> (NIK: {recipientNIK}),</p>
                
                <p className="leading-relaxed">
                  Tim IT Asset Management telah menyelesaikan pemenuhan lisensi software yang Anda butuhkan dengan nomor
                  dokumen <strong>{record?.bastNumber || 'BAST-IT/2026/09/04'}</strong>
                  {record?.notaNumber && ` (Berdasarkan Nota Dinas: ${record.notaNumber})`}
                  {record?.poNumber ? (
                    <> (Purchase Order: <strong className="font-mono text-indigo-700">{record.poNumber}</strong>)</>
                  ) : (
                    <> (Status Pengadaan: <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Kartu Kredit - PO Menyusul</span>)</>
                  )}
                  .
                </p>

                {/* Data Karyawan & PIC Penyerah (Desain Box Baru) */}
                <div className="flex flex-col sm:flex-row gap-4 p-5 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div className="flex-1 space-y-1">
                    <span className="text-slate-500 block text-xs">Penerima Lisensi:</span>
                    <span className="font-bold text-slate-800 block text-sm">{recipientName}</span>
                    <span className="text-slate-500 block font-mono text-xs">
                      NIK: {recipientNIK} &bull; {record?.department || 'Planning and Inovation'}
                    </span>
                  </div>
                  <div className="hidden sm:block w-px bg-slate-200"></div>
                  <div className="flex-1 space-y-1">
                    <span className="text-slate-500 block text-xs">PIC IT Penyerah Lisensi:</span>
                    <span className="font-bold text-slate-800 block text-sm">{record?.picName || 'Dimas Pratama'}</span>
                    <span className="text-slate-500 block font-mono text-xs">{record?.picEmail || 'dimas.pratama@corp.id'}</span>
                  </div>
                </div>

                {/* Tabel Detail Lisensi */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="font-bold text-slate-800 text-sm">Daftar Lisensi Software yang Diserahkan:</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="border-b-2 border-slate-100 text-slate-500">
                          <th className="py-2.5 font-semibold">Nama Software</th>
                          <th className="py-2.5 font-semibold">Tipe Lisensi</th>
                          <th className="py-2.5 font-semibold">Akun / Seat</th>
                          <th className="py-2.5 font-semibold">Masa Berlaku</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record?.items.map((it) => (
                          <tr key={it.id} className="border-b border-slate-100">
                            <td className="py-3 font-bold text-slate-900">
                              {it.softwareName}
                              {it.itemNotes && (
                                <div className="text-xs text-blue-700 font-mono mt-1 font-normal">
                                  ↳ {it.itemNotes}
                                </div>
                              )}
                            </td>
                            <td className="py-3 text-slate-600">{it.licenseType}</td>
                            <td className="py-3 text-slate-600 font-mono text-xs">{it.licenseKeyAccount || '-'}</td>
                            <td className="py-3 text-slate-600">
                              {it.licenseType === 'Perpetual' ? 'Seumur Hidup' : it.expiryDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="leading-relaxed">
                  Sesuai kebijakan tata kelola IT korporat, mohon luangkan waktu 1 menit untuk memeriksa aktivasi software
                  dan melakukan konfirmasi serah terima secara digital.
                </p>

                <div className="pt-2 text-center pb-4 border-b border-slate-100">
                  <div className="inline-block px-6 py-2.5 bg-[#0078D4] hover:bg-[#006abc] text-white font-semibold rounded-lg shadow-sm text-sm transition-colors cursor-pointer">
                    Konfirmasi Penerimaan Lisensi
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    *Tautan ini mengarah langsung ke portal BAST Digital dengan verifikasi Azure AD SSO.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Pengingat Otomatis Sistem (H-30 Hari)</div>
                    <div className="text-xs mt-0.5">Lisensi software Anda akan kedaluwarsa dalam 30 hari ke depan.</div>
                  </div>
                </div>

                <p>Halo <strong>{recipientName}</strong> (NIK: {recipientNIK}),</p>
                <p>
                  Sistem mendeteksi bahwa lisensi software berikut yang terdaftar atas nama Anda akan segera berakhir:
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
                  <div className="flex items-center">
                    <span className="text-slate-500 w-40">Nama Software:</span>
                    <strong className="text-slate-900">{item?.softwareName || 'Software'}</strong>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 w-40">Tipe Lisensi:</span>
                    <span className="font-medium text-slate-800">{item?.licenseType}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 w-40">Tanggal Berakhir:</span>
                    <strong className="text-rose-600 font-mono">{item?.expiryDate}</strong>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 w-40">Detail Akun / Key:</span>
                    <span className="font-mono text-slate-700">{item?.licenseKeyAccount}</span>
                  </div>
                </div>

                <p>
                  <strong>Tindakan yang Disarankan:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 ml-1 border-b border-slate-100 pb-6">
                  <li>Jika lisensi ini masih aktif digunakan untuk pekerjaan Anda, mohon ajukan permohonan perpanjangan (*renewal*) ke atasan atau tim IT.</li>
                  <li>Jika lisensi sudah tidak digunakan, mohon informasikan tim IT agar kuota lisensi dapat dialihkan ke user lain.</li>
                </ul>
              </>
            )}

            {/* Footer Surat Email (Kop Transjakarta menggunakan PNG) */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="text-sm text-slate-500 leading-relaxed">
                Salam hangat,<br />
                <strong className="text-slate-700">Divisi Teknologi Informasi & Komunikasi</strong><br />
                PT Transportasi Jakarta (Transjakarta)
              </div>
              <div className="shrink-0">
                <img 
                  src="/transjakarta-logo.png" 
                  alt="Transjakarta" 
                  className="h-8 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex justify-end z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  );
};