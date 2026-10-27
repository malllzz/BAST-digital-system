import React, { useState, useMemo, useRef } from 'react';
import { Search, Filter, FileText, CheckCircle2, Clock, AlertTriangle, Eye, Mail, Download, Edit, Trash2, Plus, ArrowUpDown, Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { BastRecord } from '../types';
import { calculateDaysRemaining } from '../data/initialData';
import * as XLSX from 'xlsx';

interface PicDashboardProps {
  records: BastRecord[];
  onOpenNewBast: () => void;
  onViewDetail: (record: BastRecord) => void;
  onPreviewEmail: (record: BastRecord) => void;
  onGoToMonitoring: () => void;
  onDeleteBast?: (id: string) => void;
  onForceCompleteBast?: (id: string) => void;
  onEditBast?: (record: BastRecord) => void;
  onImportBast?: (data: any[]) => void;
}

export const PicDashboard: React.FC<PicDashboardProps> = ({
  records,
  onOpenNewBast,
  onViewDetail,
  onPreviewEmail,
  onGoToMonitoring,
  onDeleteBast,
  onForceCompleteBast,
  onEditBast,
  onImportBast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [poFilter, setPoFilter] = useState<string>('all'); 
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('date_desc'); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalBast = records.length;
  const pendingUserCount = records.filter((r) => r.status === 'Pending User' || r.status === 'Menunggu Konfirmasi').length;
  const pendingPicCount = records.filter((r) => r.status === 'Pending PIC').length;
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

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    records.forEach(rec => {
      const year = new Date(rec.createdAt).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => (a > b ? -1 : 1));
  }, [records]);

  const filteredAndSortedRecords = useMemo(() => {
    let result = records.filter((record) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        record.bastNumber.toLowerCase().includes(query) ||
        record.recipientName.toLowerCase().includes(query) ||
        record.recipientNIK.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query) ||
        (record.poNumber && record.poNumber.toLowerCase().includes(query)) ||
        (record.notaNumber && record.notaNumber.toLowerCase().includes(query)) ||
        record.items.some((it) => it.softwareName.toLowerCase().includes(query));

      if (!matchSearch) return false;

      if (statusFilter !== 'all') {
        if (statusFilter === 'Pending User') {
          if (record.status !== 'Pending User' && record.status !== 'Menunggu Konfirmasi') return false;
        } else if (record.status !== statusFilter) {
          return false;
        }
      }

      if (typeFilter !== 'all') {
        const hasType = record.items.some((it) => it.licenseType === typeFilter);
        if (!hasType) return false;
      }

      if (poFilter === 'has_po' && (!record.poNumber || record.poNumber.trim() === '')) return false;
      if (poFilter === 'no_po' && (record.poNumber && record.poNumber.trim() !== '')) return false;

      if (yearFilter !== 'all') {
        const recordYear = new Date(record.createdAt).getFullYear().toString();
        if (recordYear !== yearFilter) return false;
      }

      return true;
    });

    result = result.sort((a, b) => {
      if (sortOption === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOption === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOption === 'name_asc') return a.recipientName.localeCompare(b.recipientName);
      if (sortOption === 'name_desc') return b.recipientName.localeCompare(a.recipientName);
      return 0;
    });

    return result;
  }, [records, searchTerm, statusFilter, typeFilter, poFilter, yearFilter, sortOption]);

  const handleExportExcel = () => {
    if (filteredAndSortedRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const excelData = filteredAndSortedRecords.map(rec => {
      const softwareList = rec.items.map(it => 
        `${it.softwareName} (${it.licenseType} - ${it.expiryDate || 'N/A'})`
      ).join(" | ");

      return {
        "Nomor BAST": rec.bastNumber,
        "Nomor PO": rec.poNumber || (rec.isPoPending ? "PO Menyusul" : "No. PO Belum Ada"),
        "Nomor Nota": rec.notaNumber || "Tidak Ada Nota",
        "Penerima": rec.recipientName,
        "NIK": rec.recipientNIK,
        "Email": rec.recipientEmail,
        "Departemen": rec.department,
        "Tanggal Terbit": new Date(rec.createdAt).toLocaleDateString('id-ID'),
        "Tgl Konfirmasi User": rec.userConfirmationDate ? new Date(rec.userConfirmationDate).toLocaleString('id-ID') : (rec.confirmationDate ? new Date(rec.confirmationDate).toLocaleString('id-ID') : "-"),
        "Tgl Pengesahan PIC": rec.picConfirmationDate ? new Date(rec.picConfirmationDate).toLocaleString('id-ID') : "-",
        "Status": rec.status,
        "Daftar Software (Nama - Tipe - Expired)": softwareList
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const wscols = [{ wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 60 }];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data BAST");
    XLSX.writeFile(workbook, `Data_BAST_IT_Asset_${new Date().getTime()}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
      "Nomor BAST": "BAST-IT/2026/10/01",
      "Penerima": "Budi Santoso",
      "NIK": "12345678",
      "Email": "budi.santoso@corp.id",
      "Departemen": "IT Dept",
      "Nomor PO": "PO-12345",
      "Nomor Nota": "NOTA-12345",
      "Nama Software": "Microsoft 365 E5",
      "Tipe Lisensi": "Tahunan",
      "Akun/Seat": "budi.santoso@corp.id",
      "Tanggal Expired": "2027-10-01"
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Import");
    XLSX.writeFile(wb, "Template_Import_BAST.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (onImportBast) onImportBast(data);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        alert("Gagal membaca file Excel. Pastikan formatnya sesuai.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div id="pic-dashboard-view" className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total BAST Diterbitkan</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalBast}</h3>
            <span className="text-[11px] text-slate-400">Periode Berjalan</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-medium text-slate-500">Menunggu Verifikasi</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex gap-2">
            <div 
              onClick={() => setStatusFilter('Pending User')} 
              className="flex-1 bg-amber-50 hover:bg-amber-100 rounded-xl p-2 cursor-pointer border border-amber-100/50 transition-colors text-center"
            >
              <div className="text-lg font-bold text-amber-700">{pendingUserCount}</div>
              <div className="text-[10px] text-amber-600 font-medium">User</div>
            </div>
            <div 
              onClick={() => setStatusFilter('Pending PIC')} 
              className="flex-1 bg-sky-50 hover:bg-sky-100 rounded-xl p-2 cursor-pointer border border-sky-100/50 transition-colors text-center"
            >
              <div className="text-lg font-bold text-sky-700">{pendingPicCount}</div>
              <div className="text-[10px] text-sky-600 font-medium">PIC</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">BAST Selesai (Tervalidasi)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</h3>
            <span className="text-[11px] text-emerald-700">Konfirmasi Kedua Pihak Selesai</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

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
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-3">
          <div className="relative w-full xl:max-w-xs shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari No. BAST, PO, NIK, Nama..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto xl:justify-end">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-transparent font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">Status (Semua)</option>
                <option value="Pending User">Pending User</option>
                <option value="Pending PIC">Pending PIC</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Tipe Lisensi (Semua)</option>
              <option value="Tahunan">Tahunan</option>
              <option value="Bulanan">Bulanan</option>
              <option value="Perpetual">Perpetual</option>
            </select>

            <select
              value={poFilter}
              onChange={(e) => setPoFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Data PO (Semua)</option>
              <option value="has_po">Sudah Ada PO</option>
              <option value="no_po">PO Belum Ada / Menyusul</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Tahun (Semua)</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-xs bg-transparent font-medium text-slate-700 focus:outline-none"
              >
                <option value="date_desc">Terbaru</option>
                <option value="date_asc">Terlama</option>
                <option value="name_asc">Abjad Nama (A-Z)</option>
                <option value="name_desc">Abjad Nama (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Template</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .csv" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import BAST</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewBast}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat BAST Baru</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3.5">Nomor Dokumen</th>
                <th className="p-3.5">Penerima & Info</th>
                <th className="p-3.5">Daftar Software (Multi-Item)</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5 text-center">Status BAST</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Tidak ada data BAST yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredAndSortedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 align-top">
                      <div className="font-mono font-bold text-slate-900">{rec.bastNumber}</div>
                      <div className="text-[10px] text-slate-500 mt-1">PO: <span className="font-mono">{rec.poNumber || (rec.isPoPending ? 'Menyusul' : 'No PO Belum Ada')}</span></div>
                      {rec.notaNumber && <div className="text-[10px] text-slate-500">Nota: <span className="font-mono">{rec.notaNumber}</span></div>}
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
                      <div className="flex flex-col items-center gap-1.5">
                        {rec.status === 'Selesai' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Selesai & Sah
                          </span>
                        ) : rec.status === 'Pending PIC' ? (
                          <>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800">
                              <Clock className="w-3 h-3 text-sky-600 animate-pulse" />
                              Pending PIC
                            </span>
                            <button
                              onClick={() => {
                                if (onForceCompleteBast) onForceCompleteBast(rec.id);
                              }}
                              className="inline-flex items-center justify-center gap-1 mt-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Validasi Akhir</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                              Pending User
                            </span>
                            <button
                              onClick={() => {
                                if (window.confirm(`User belum konfirmasi. Apakah Anda ingin bypass dan validasi dokumen ini secara paksa sebagai Admin?`)) {
                                  if(onForceCompleteBast) onForceCompleteBast(rec.id);
                                }
                              }}
                              className="text-[9px] text-amber-600 hover:text-amber-800 underline font-medium cursor-pointer"
                            >
                              Force Bypass
                            </button>
                          </>
                        )}
                      </div>
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
                        <div className="flex items-center gap-1.5 mt-1 border-t border-slate-100 pt-1.5 w-full justify-end">
                           <button
                              onClick={() => onEditBast && onEditBast(rec)}
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