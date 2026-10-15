import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Mail, Send, Sparkles, Search, ArrowDownUp } from 'lucide-react';
import { BastRecord, LicenseItem } from '../types';

interface ExpiryMonitoringTabProps {
  records: BastRecord[];
  onTriggerReminder: (bastId: string, itemId: string) => void;
  onPreviewEmail: (record: BastRecord, item: LicenseItem) => void;
  // Tambahan Props untuk mengubah data di Database melalui parent component
  onToggleAutoReminder: (bastId: string, itemId: string, isEnabled: boolean) => void;
  onToggleAllAutoReminder: (updates: {bastId: string, itemId: string, isEnabled: boolean}[]) => void;
}

const calculateRealtimeDaysRemaining = (expiryDate?: string) => {
  if (!expiryDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const ExpiryMonitoringTab: React.FC<ExpiryMonitoringTabProps> = ({
  records,
  onTriggerReminder,
  onPreviewEmail,
  onToggleAutoReminder,
  onToggleAllAutoReminder,
}) => {
  const [filterType, setFilterType] = useState<'h30' | 'expiring' | 'all'>('h30');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const licenseRows = useMemo(() => {
    const list: {
      bast: BastRecord;
      item: LicenseItem;
      daysRemaining: number | null;
      isH30: boolean;
    }[] = [];

    records.forEach((bast) => {
      bast.items.forEach((item) => {
        const days = calculateRealtimeDaysRemaining(item.expiryDate);
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

  const filteredAndSortedRows = useMemo(() => {
    let result = licenseRows.filter((row) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        row.item.softwareName.toLowerCase().includes(query) ||
        row.bast.recipientName.toLowerCase().includes(query) ||
        row.bast.recipientNIK.toLowerCase().includes(query) ||
        row.bast.recipientEmail.toLowerCase().includes(query) ||
        row.bast.bastNumber.toLowerCase().includes(query);

      if (!matchSearch) return false;

      if (filterType === 'h30') return row.isH30;
      if (filterType === 'expiring') return row.item.licenseType !== 'Perpetual';
      
      return true;
    });

    result.sort((a, b) => {
      if (a.item.licenseType === 'Perpetual' && b.item.licenseType === 'Perpetual') return 0;
      if (a.item.licenseType === 'Perpetual') return 1;
      if (b.item.licenseType === 'Perpetual') return -1;

      const daysA = a.daysRemaining ?? Infinity;
      const daysB = b.daysRemaining ?? Infinity;

      if (sortOrder === 'asc') return daysA - daysB;
      return daysB - daysA;
    });

    return result;
  }, [licenseRows, searchQuery, filterType, sortOrder]);

  const h30Count = licenseRows.filter((r) => r.isH30).length;

  const nonPerpetualVisibleItems = filteredAndSortedRows.filter(row => row.item.licenseType !== 'Perpetual');
  const isAllEnabled = nonPerpetualVisibleItems.length > 0 && nonPerpetualVisibleItems.every(row => row.item.isAutoReminderEnabled);

  const handleToggleAll = () => {
    const targetState = !isAllEnabled; 
    const updates = nonPerpetualVisibleItems.map(row => ({
      bastId: row.bast.id,
      itemId: row.item.id,
      isEnabled: targetState
    }));
    
    // Memicu update batch ke database
    onToggleAllAutoReminder(updates);
  };

  return (
    <div id="expiry-monitoring-view" className="space-y-6">
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-medium border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Power Automate Scheduled Cloud Flow (Setiap Hari 08:00 AM)</span>
          </div>
          <h2 className="text-lg font-bold">Monitoring & Reminder Masa Berlaku Lisensi (H-30)</h2>
          <p className="text-xs text-blue-200/90 leading-relaxed max-w-2xl">
            Sistem secara otomatis mengevaluasi seluruh tanggal kedaluwarsa lisensi software secara realtime. Pada H-30 sebelum masa
            berlaku habis, notifikasi pengingat perpanjangan dikirimkan secara otomatis jika status automasi aktif.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-3 rounded-xl text-center shrink-0">
          <div className="text-2xl font-black text-amber-300">{h30Count}</div>
          <div className="text-[11px] font-medium text-blue-100">Lisensi Target H-30</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari software, user, NIK, No BAST..."
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div 
            onClick={handleToggleAll}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer border transition-colors ${
              isAllEnabled 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="text-xs font-semibold select-none">Aktifkan Semua Kirim Email Reminder H-30</div>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAllEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isAllEnabled ? 'translate-x-4.5' : 'translate-x-1'}`} />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
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

          <button
            type="button"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold border border-indigo-100 transition-colors cursor-pointer w-full md:w-auto justify-center"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span>Urutkan: {sortOrder === 'asc' ? 'Terdekat Expired' : 'Terlama Expired'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3.5">Software & Akun</th>
                <th className="p-3.5">Penerima (NIK)</th>
                <th className="p-3.5">No. BAST</th>
                <th className="p-3.5">Tipe & Tanggal Expired</th>
                <th className="p-3.5">Sisa Hari</th>
                <th className="p-3.5 text-right min-w-60">Automasi & Aksi Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Tidak ada data lisensi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAndSortedRows.map(({ bast, item, daysRemaining, isH30 }) => {
                  const isAutoEnabled = item.isAutoReminderEnabled || false;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 align-top">
                        <div className="font-semibold text-slate-900">{item.softwareName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.licenseKeyAccount}</div>
                      </td>

                      <td className="p-3.5 align-top">
                        <div className="font-medium text-slate-900">{bast.recipientName}</div>
                        <div className="text-[11px] text-slate-500">
                          NIK: <span className="font-mono font-semibold text-slate-700">{bast.recipientNIK}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{bast.recipientEmail}</div>
                      </td>

                      <td className="p-3.5 align-top font-mono text-slate-600 font-medium">{bast.bastNumber}</td>

                      <td className="p-3.5 align-top">
                        <div className="font-medium text-slate-800">{item.licenseType}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.licenseType === 'Perpetual' ? 'Seumur Hidup' : item.expiryDate}
                        </div>
                      </td>

                      <td className="p-3.5 align-top whitespace-nowrap">
                        {item.licenseType === 'Perpetual' ? (
                          <span className="text-slate-400 text-xs">-</span>
                        ) : daysRemaining !== null && daysRemaining <= 30 && daysRemaining >= 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            {daysRemaining} Hari Lagi
                          </span>
                        ) : daysRemaining !== null && daysRemaining < 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Terlewat {Math.abs(daysRemaining)} Hari
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {daysRemaining} Hari Lagi
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 align-top text-right">
                        {item.licenseType !== 'Perpetual' ? (
                          <div className="flex flex-col items-end gap-2.5">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-[10px] font-medium ${isAutoEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {isAutoEnabled ? 'Automasi Aktif' : 'Automasi Mati'}
                              </span>
                              <div 
                                onClick={() => onToggleAutoReminder(bast.id, item.id, !isAutoEnabled)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${isAutoEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isAutoEnabled ? 'translate-x-4.5' : 'translate-x-1'}`} />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onPreviewEmail(bast, item)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => onTriggerReminder(bast.id, item.id)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shadow-xs ${
                                  item.isReminderSent 
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200' 
                                    : 'bg-amber-600 text-white hover:bg-amber-700'
                                }`}
                              >
                                {item.isReminderSent ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Kirim Ulang</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3 h-3" />
                                    <span>Kirim Manual</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Tidak Berlaku</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};