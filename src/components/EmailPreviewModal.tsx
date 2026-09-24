import React from 'react';
import { X, Mail, Send, CheckCircle2, Clock, AlertTriangle, Building2 } from 'lucide-react';
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

  const recipientEmail = record?.recipientEmail || 'fauzanmiftahurochman@gmail.com';
  const recipientName = record?.recipientName || 'Fauzan Miftahurochman';
  const recipientNIK = record?.recipientNIK || '10928374';

  return (
    <div
      id="modal-backdrop-email"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="modal-card-email"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col"
      >
        {/* Outlook Header Simulator */}
        <div className="bg-[#0078D4] text-white px-5 py-3 flex items-center justify-between">
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
        <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-1.5 font-sans">
          <div className="flex">
            <span className="text-slate-500 w-16">Dari:</span>
            <span className="font-semibold text-slate-800">
              IT Asset Management Notification &lt;no-reply.itasset@corp.id&gt;
            </span>
          </div>
          <div className="flex">
            <span className="text-slate-500 w-16">Kepada:</span>
            <span className="font-medium text-slate-800">
              {recipientName} ({recipientNIK}) &lt;{recipientEmail}&gt;
            </span>
          </div>
          <div className="flex">
            <span className="text-slate-500 w-16">Subjek:</span>
            <span className="font-bold text-slate-900">
              {type === 'handover'
                ? `[PENTING] Penyerahan Lisensi Software Baru - No. ${record?.bastNumber}`
                : `[PENGINGAT H-30] Masa Berlaku Lisensi ${item?.softwareName || 'Software'} Akan Segera Berakhir`}
            </span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed font-sans bg-white overflow-y-auto max-h-[60vh]">
          {type === 'handover' ? (
            <>
              <p>Halo <strong>{recipientName}</strong> (NIK: {recipientNIK}),</p>
              <p>
                Tim IT Asset Management telah menyelesaikan pemenuhan lisensi software yang Anda butuhkan dengan nomor
                dokumen <strong>{record?.bastNumber}</strong>.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-slate-800">Daftar Lisensi Software:</div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-1">Nama Software</th>
                      <th className="py-1">Tipe</th>
                      <th className="py-1">Masa Berlaku</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record?.items.map((it) => (
                      <tr key={it.id} className="border-b border-slate-100">
                        <td className="py-1.5 font-medium text-slate-900">{it.softwareName}</td>
                        <td className="py-1.5 text-slate-600">{it.licenseType}</td>
                        <td className="py-1.5 text-slate-600">
                          {it.licenseType === 'Perpetual' ? 'Seumur Hidup' : it.expiryDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                Sesuai kebijakan tata kelola IT korporat, mohon luangkan waktu 1 menit untuk memeriksa aktivasi software
                dan melakukan konfirmasi serah terima secara digital.
              </p>

              <div className="pt-2 text-center">
                <div className="inline-block px-5 py-2.5 bg-[#0078D4] text-white font-semibold rounded-lg shadow-sm text-xs">
                  Konfirmasi Penerimaan Lisensi (Login M365)
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  *Tautan ini mengarah langsung ke portal BAST Digital dengan verifikasi Azure AD SSO.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Pengingat Otomatis Sistem (H-30 Hari)</div>
                  <div className="text-[11px]">Lisensi software Anda akan kedaluwarsa dalam 30 hari ke depan.</div>
                </div>
              </div>

              <p>Halo <strong>{recipientName}</strong> (NIK: {recipientNIK}),</p>
              <p>
                Sistem mendeteksi bahwa lisensi software berikut yang terdaftar atas nama Anda akan segera berakhir:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div>
                  <span className="text-slate-500 w-32 inline-block">Nama Software:</span>
                  <strong className="text-slate-900">{item?.softwareName || 'Software'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 w-32 inline-block">Tipe Lisensi:</span>
                  <span className="font-medium text-slate-800">{item?.licenseType}</span>
                </div>
                <div>
                  <span className="text-slate-500 w-32 inline-block">Tanggal Berakhir:</span>
                  <strong className="text-rose-600 font-mono">{item?.expiryDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 w-32 inline-block">Detail Akun / Key:</span>
                  <span className="font-mono text-slate-700">{item?.licenseKeyAccount}</span>
                </div>
              </div>

              <p>
                <strong>Tindakan yang Disarankan:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Jika lisensi ini masih aktif digunakan untuk pekerjaan Anda, mohon ajukan permohonan perpanjangan (*renewal*) ke atasan atau tim IT.</li>
                <li>Jika lisensi sudah tidak digunakan, mohon informasikan tim IT agar kuota lisensi dapat dialihkan ke user lain.</li>
              </ul>
            </>
          )}

          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500">
            Salam,<br />
            <strong>IT Asset & License Management Team</strong><br />
            PT Korporat Teknologi Mandiri
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  );
};
