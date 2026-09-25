import React, { useState, useMemo } from 'react';
import { Search, Filter, FileText, CheckCircle2, Clock, AlertTriangle, Eye, Mail, Download, Edit, Trash2, Plus } from 'lucide-react';
import { BastRecord, BastStatus, LicenseType } from '../types';
import { calculateDaysRemaining } from '../data/initialData';

interface PicDashboardProps {
  records: BastRecord[];
  onOpenNewBast: () => void;
  onViewDetail: (record: BastRecord) => void;
  onPreviewEmail: (record: BastRecord) => void;
  onGoToMonitoring: () => void;
  onDeleteBast?: (id: string) => void;
  onForceCompleteBast?: (id: string) => void;
  onEditBast?: (record: BastRecord) => void; // <-- Tambahan untuk Edit
}

export const PicDashboard: React.FC<PicDashboardProps> = ({
  records,
  onOpenNewBast,
  onViewDetail,
  onPreviewEmail,
  onGoToMonitoring,
  onDeleteBast,
  onForceCompleteBast,
  onEditBast // <-- Tambahan untuk Edit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Metrics calculation
  const totalBast = records.length;
  const pendingCount = records.filter((r) => r.status === 'Menunggu Konfirmasi').length;
  const completedCount = records.filter((r) => r.status === 'Selesai').length;

  const expiringCount = useMemo(() => {
    let count = 0;
    records.forEach((r) => {
      r.items.forEach((item) => {
        if (item.licenseType !== 'Perpetual' && item.expiryDate) {
          const days = calculateDaysRemaining(item.expiryDate);
          if (days !== null && days >= 0 && days <= 30) {
            count++;
          }
        }
      });
    });
    return count;
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        record.bastNumber.toLowerCase().includes(query) ||
        record.recipientName.toLowerCase().includes(query) ||
        record.recipientNIK.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query) ||
        record.items.some((it) => it.softwareName.toLowerCase().includes(query));

      if (!matchSearch) return false;
      if (statusFilter !== 'all' && record.status !== statusFilter) return false;
      if (typeFilter !== 'all') {
        const hasType = record.items.some((it) => it.licenseType === typeFilter);
        if (!hasType) return false;
      }
      return true;
    });
  }, [records, searchTerm, statusFilter, typeFilter]);

  // FUNGSI BARU: Export Data ke format CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    // Siapkan Header
    let csvContent = "Nomor BAST,Penerima,NIK,Email,Departemen,Tgl Terbit,Status,Daftar Software (Nama - Tipe - Expired)\n";

    // Format Data
    filteredRecords.forEach(rec => {
      // Gabungkan multi-item menjadi satu string
      const softwareList = rec.items.map(it => 
        `${it.softwareName} (${it.licenseType} - ${it.expiryDate || 'N/A'})`
      ).join(" | ");

      const row = [
        rec.bastNumber,
        `"${rec.recipientName}"`,
        rec.recipientNIK,
        rec.recipientEmail,
        `"${rec.department}"`,
        new Date(rec.createdAt).toLocaleDateString('id-ID'),
        rec.status,
        `"${softwareList}"`
      ].join(",");
      
      csvContent += row + "\n";
    });

    // Buat Blob dan Download Trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_BAST_IT_Asset_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="pic-dashboard-view" className="space-y-6">
      {/* Metric Cards (Tetap Sama) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total BAST */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total BAST Diterbitkan</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalBast}</h3>
            <span className="text-[11px] text-slate-400">Periode Berjalan</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Menunggu Konfirmasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Menunggu Konfirmasi User</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</h3>
            <span className="text-[11px] text-amber-700">Tautan telah terkirim via M365</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Selesai / Tervalidasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">BAST Selesai (Tervalidasi)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</h3>
            <span className="text-[11px] text-emerald-700">Audit SSO M365 lengkap</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Expiry Alerts */}
        <div
          onClick={onGoToMonitoring}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Lisensi Mendekati Expired</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{expiringCount}</h3>
            <span className="text-[11px] text-rose-600 font-medium group-hover:underline">
              Target Reminder H-30 →
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No. BAST, NIK, Nama, Software..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
            <option value="Selesai">Selesai</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Semua Tipe Lisensi</option>
            <option value="Tahunan">Tahunan</option>
            <option value="Bulanan">Bulanan</option>
            <option value="Perpetual">Perpetual</option>
          </select>

          {/* TOMBOL BARU: Export Excel/CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewBast}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat BAST</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3.5">Nomor BAST</th>
                <th className="p-3.5">Penerima & Info</th>
                <th className="p-3.5">Daftar Software (Multi-Item)</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Tidak ada data BAST yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 align-top">
                      <div className="font-mono font-bold text-slate-900">{rec.bastNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Oleh: {rec.picName}</div>
                    </td>

                    <td className="p-3.5 align-top">
                      <div className="font-semibold text-slate-900">{rec.recipientName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{rec.department}</div>
                      <div className="text-[10px] text-slate-400 mt-1">NIK: {rec.recipientNIK} | {rec.recipientEmail}</div>
                    </td>

                    <td className="p-3.5 align-top">
                      <div className="space-y-1.5 max-w-62.5">
                        {rec.items.map((it) => (
                          <div key={it.id} className="flex flex-col gap-0.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-700 truncate" title={it.softwareName}>{it.softwareName}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                it.licenseType === 'Perpetual' ? 'bg-purple-100 text-purple-700' : 
                                it.licenseType === 'Tahunan' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {it.licenseType}
                              </span>
                            </div>
                            {it.licenseType !== 'Perpetual' && (
                               <div className="text-[9px] text-slate-400">Exp: {it.expiryDate}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 align-top whitespace-nowrap text-slate-500">
                      {new Date(rec.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>

                    <td className="p-3.5 align-top text-center">
                      {rec.status === 'Selesai' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Selesai
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            Pending
                          </span>
                          {/* TOMBOL BARU: Validasi Paksa (Hanya jika belum selesai) */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Validasi dokumen ini secara paksa sebagai Admin?`)) {
                                if(onForceCompleteBast) onForceCompleteBast(rec.id);
                              }
                            }}
                            className="text-[9px] text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                          >
                            Validasi Manual
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 align-top text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewDetail(rec)}
                            title="Lihat Dokumen BAST Resmi"
                            className="p-1.5 text-slate-500 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPreviewEmail(rec)}
                            title="Lihat Notifikasi Email"
                            className="p-1.5 text-slate-500 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                        {/* TOMBOL BARU: Hapus dan Edit */}
                        <div className="flex items-center gap-1.5 mt-1 border-t border-slate-100 pt-1.5 w-full justify-end">
                           <button
                              onClick={() => onEditBast && onEditBast(rec)} // <-- Panggil fungsi
                              title="Edit Data BAST"
                              className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                           </button>
                           <button
                              onClick={() => {
                                if (window.confirm(`PERINGATAN: Hapus permanen BAST ${rec.bastNumber}?`)) {
                                  if(onDeleteBast) onDeleteBast(rec.id);
                                }
                              }}
                              title="Hapus BAST"
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};