import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock, Eye, AlertCircle, FileText, Lock, Sparkles, Laptop, Calendar } from 'lucide-react';
import { BastRecord, SimulatedUser } from '../types';

interface UserPortalProps {
  currentUser: SimulatedUser;
  records: BastRecord[];
  onConfirmReceipt: (recordId: string) => void;
  onViewDetail: (record: BastRecord) => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({
  currentUser,
  records,
  onConfirmReceipt,
  onViewDetail,
}) => {
  // CRITICAL REQUIREMENT: "user hanya bisa lihat histori dokumen sendiri" (Item-Level Security)
  const myRecords = records.filter(
    (r) => r.recipientEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const pendingBast = myRecords.find((r) => r.status === 'Menunggu Konfirmasi');
  const completedRecords = myRecords.filter((r) => r.status === 'Selesai');

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirm = (id: string) => {
    setConfirmingId(id);
    setTimeout(() => {
      onConfirmReceipt(id);
      setConfirmingId(null);
    }, 600);
  };

  return (
    <div id="user-portal-view" className="space-y-6">
      {/* Security & User Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                NIK: {currentUser.nik}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {currentUser.email} • {currentUser.department}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-600 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>
            Hak Akses Terproteksi: <strong>Item-Level Security Aktif</strong>
          </span>
        </div>
      </div>

      {/* Pending BAST Action Card (If any) */}
      {pendingBast ? (
        <div
          id="pending-bast-card"
          className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-2xl border-2 border-amber-400/80 p-6 sm:p-7 shadow-md space-y-5 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/70 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-ping" />
              <h3 className="font-bold text-base text-slate-900">
                Pemberitahuan: BAST Lisensi Software Menunggu Konfirmasi Anda
              </h3>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-200">
              {pendingBast.bastNumber}
            </span>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed">
            Tim IT Asset Management telah mengalokasikan lisensi software baru untuk Anda. Silakan verifikasi lisensi
            di bawah ini telah aktif sebelum melakukan konfirmasi serah terima digital.
          </div>

          {/* Software Table in Pending Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3">Software</th>
                  <th className="p-3">Tipe Lisensi</th>
                  <th className="p-3">Keterangan Akun / Seat</th>
                  <th className="p-3">Masa Berlaku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingBast.items.map((it) => (
                  <tr key={it.id}>
                    <td className="p-3 font-semibold text-slate-900">{it.softwareName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                        {it.licenseType}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{it.licenseKeyAccount}</td>
                    <td className="p-3 text-slate-600">
                      {it.licenseType === 'Perpetual' ? 'Seumur Hidup' : it.expiryDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal statement & CTA */}
          <div className="bg-white/80 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pernyataan Konfirmasi Serah Terima:</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dengan menekan tombol konfirmasi, Anda menyatakan telah menerima lisensi software tersebut dan dapat
                digunakan dengan baik. Konfirmasi ini tervalidasi menggunakan autentikasi akun Microsoft 365 (SSO).
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => onViewDetail(pendingBast)}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Lihat BAST Penuh
              </button>
              <button
                type="button"
                disabled={confirmingId === pendingBast.id}
                onClick={() => handleConfirm(pendingBast.id)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {confirmingId === pendingBast.id ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memvalidasi SSO M365...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Konfirmasi Penerimaan Lisensi (M365 SSO)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Histori BAST Saya */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Histori BAST Pemenuhan Lisensi Saya</h3>
            <p className="text-xs text-slate-500">
              Menampilkan seluruh riwayat penyerahan lisensi yang terdaftar atas nama NIK {currentUser.nik}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {myRecords.length} Dokumen
          </span>
        </div>

        {myRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">Belum ada BAST software yang diterbitkan untuk akun ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3.5">Nomor BAST</th>
                  <th className="p-3.5">Software yang Diterima</th>
                  <th className="p-3.5">Tanggal Serah Terima</th>
                  <th className="p-3.5">Status & Verifikasi</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{rec.bastNumber}</div>
                      <div className="text-[10px] text-slate-400">PIC: {rec.picName}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        {rec.items.map((it) => (
                          <div key={it.id} className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{it.softwareName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {it.licenseType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 whitespace-nowrap">
                      {rec.confirmationDate
                        ? new Date(rec.confirmationDate).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : new Date(rec.createdAt).toLocaleDateString('id-ID')}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {rec.status === 'Selesai' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Terkonfirmasi SSO
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {rec.auditAuthUser || rec.recipientEmail}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Menunggu Konfirmasi
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewDetail(rec)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Dokumen</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
