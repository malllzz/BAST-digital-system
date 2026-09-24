import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Mail, Send, Sparkles, Filter, Calendar, User, Search } from 'lucide-react';
import { BastRecord, LicenseItem } from '../types';
import { calculateDaysRemaining } from '../data/initialData';

interface ExpiryMonitoringTabProps {
  records: BastRecord[];
  onTriggerReminder: (bastId: string, itemId: string) => void;
  onPreviewEmail: (record: BastRecord, item: LicenseItem) => void;
}

export const ExpiryMonitoringTab: React.FC<ExpiryMonitoringTabProps> = ({
  records,
  onTriggerReminder,
  onPreviewEmail,
}) => {
  const [filterType, setFilterType] = useState<'h30' | 'expiring' | 'all'>('h30');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten items with their parent BAST record
  const licenseRows = useMemo(() => {
    const list: {
      bast: BastRecord;
      item: LicenseItem;
      daysRemaining: number | null;
      isH30: boolean;
    }[] = [];

    records.forEach((bast) => {
      bast.items.forEach((item) => {
        const days = calculateDaysRemaining(item.expiryDate);
        const isH30 = item.licenseType !== 'Perpetual' && days !== null && days >= 0 && days <= 30;
        list.push({
          bast,
          item,
          daysRemaining: days,
          isH30,
        });
      });
    });

    return list;
  }, [records]);

  const filteredRows = useMemo(() => {
    return licenseRows.filter((row) => {
      // Search
      const query = searchQuery.toLowerCase();
      const matchSearch =
        row.item.softwareName.toLowerCase().includes(query) ||
        row.bast.recipientName.toLowerCase().includes(query) ||
        row.bast.recipientNIK.toLowerCase().includes(query) ||
        row.bast.recipientEmail.toLowerCase().includes(query) ||
        row.bast.bastNumber.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // Filter
      if (filterType === 'h30') {
        return row.isH30;
      }
      if (filterType === 'expiring') {
        return row.item.licenseType !== 'Perpetual';
      }
      return true;
    });
  }, [licenseRows, searchQuery, filterType]);

  const h30Count = licenseRows.filter((r) => r.isH30).length;

  return (
    <div id="expiry-monitoring-view" className="space-y-6">
      {/* Automasi banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-medium border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Power Automate Scheduled Cloud Flow (Setiap Hari 08:00 AM)</span>
          </div>
          <h2 className="text-lg font-bold">Monitoring & Reminder Masa Berlaku Lisensi (H-30)</h2>
          <p className="text-xs text-blue-200/90 leading-relaxed max-w-2xl">
            Sistem secara otomatis mengevaluasi seluruh tanggal kedaluwarsa lisensi software. Pada H-30 sebelum masa
            berlaku habis, notifikasi pengingat perpanjangan dikirimkan langsung ke alamat email user yang tercatat di
            BAST.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-3 rounded-xl text-center shrink-0">
          <div className="text-2xl font-black text-amber-300">{h30Count}</div>
          <div className="text-[11px] font-medium text-blue-100">Lisensi Target H-30</div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari software, user, NIK..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setFilterType('h30')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'h30'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Peringatan H-30 ({h30Count})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'expiring'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Tahunan/Bulanan
          </button>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Termasuk Perpetual
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3.5">Software & Akun</th>
                <th className="p-3.5">Karyawan Penerima (NIK)</th>
                <th className="p-3.5">No. BAST</th>
                <th className="p-3.5">Tipe & Tanggal Expired</th>
                <th className="p-3.5">Sisa Hari</th>
                <th className="p-3.5">Status Reminder H-30</th>
                <th className="p-3.5 text-right">Aksi Simulasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Tidak ada data lisensi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ bast, item, daysRemaining, isH30 }) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{item.softwareName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.licenseKeyAccount}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{bast.recipientName}</div>
                      <div className="text-[11px] text-slate-500">
                        NIK: <span className="font-mono font-semibold text-slate-700">{bast.recipientNIK}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{bast.recipientEmail}</div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-600 font-medium">{bast.bastNumber}</td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{item.licenseType}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.licenseType === 'Perpetual' ? 'Seumur Hidup' : item.expiryDate}
                      </div>
                    </td>

                    {/* Sisa Hari */}
                    <td className="p-3.5 whitespace-nowrap">
                      {item.licenseType === 'Perpetual' ? (
                        <span className="text-slate-400 text-xs">-</span>
                      ) : daysRemaining !== null && daysRemaining <= 30 && daysRemaining >= 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          {daysRemaining} Hari Lagi
                        </span>
                      ) : daysRemaining !== null && daysRemaining > 30 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {daysRemaining} Hari Lagi
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">Kedaluwarsa</span>
                      )}
                    </td>

                    {/* Status Reminder */}
                    <td className="p-3.5 whitespace-nowrap">
                      {item.licenseType === 'Perpetual' ? (
                        <span className="text-slate-400 text-xs">Tidak Diperlukan</span>
                      ) : item.isReminderSent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Email Terkirim
                        </span>
                      ) : isH30 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Siap Dikirim
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Menunggu H-30</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {item.licenseType !== 'Perpetual' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPreviewEmail(bast, item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Preview Email</span>
                          </button>
                          {!item.isReminderSent && isH30 && (
                            <button
                              type="button"
                              onClick={() => onTriggerReminder(bast.id, item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim H-30</span>
                            </button>
                          )}
                        </div>
                      )}
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
