import React from 'react';
import { X, Printer, ShieldCheck, Clock, CheckCircle, User } from 'lucide-react';
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
    <>
      <style type="text/css" media="print">
        {`
          @page { 
            size: A4 portrait; 
            margin: 10mm; 
          }
          
          /* KUNCI 1: Paksa body agar tidak melampaui 1 halaman (hilangkan efek scroll & padding background) */
          html, body {
            height: 100% !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* KUNCI 2: Sembunyikan semua elemen di layar utama */
          body * {
            visibility: hidden;
          }
          
          /* KUNCI 3: Tampilkan HANYA modal BAST */
          #modal-backdrop-bast-detail, 
          #modal-backdrop-bast-detail * {
            visibility: visible;
          }
          
          /* KUNCI 4: Putus relasi class "inset-0" agar modal tidak tertarik ke bawah mengikuti background */
          #modal-backdrop-bast-detail {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            right: auto !important;
            bottom: auto !important;
            width: 100vw !important;
            display: block !important; 
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Hapus batasan scroll & shadow pada card */
          #modal-card-bast-detail {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            height: auto !important;
            max-height: none !important;
          }
          
          /* Bebaskan wrapper konten dalam dari scrollbar */
          .flex-1.overflow-y-auto {
            display: block !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            padding: 0 !important;
          }

          .avoid-page-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .print-hidden {
            display: none !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        `}
      </style>

      <div
        id="modal-backdrop-bast-detail"
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      >
        <div
          id="modal-card-bast-detail"
          className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl my-4 overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Top Control Bar (Hidden when printing) */}
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between print-hidden shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Preview Dokumen BAST:</span>
              <span className="font-mono text-xs text-blue-300 font-bold">{record.bastNumber}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
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

          {/* Printable Paper Canvas - Compact & Tightened */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-3.5 bg-white relative">
            
            {/* Header BAST Korporat */}
            <div className="border-b-2 border-slate-900 pb-3 relative z-10 avoid-page-break">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Transjakarta */}
                <div className="flex items-center shrink-0">
                  <img 
                    src="/transjakarta-logo.png" 
                    alt="Logo PT Transportasi Jakarta" 
                    className="h-10 sm:h-12 w-auto object-contain" 
                  />
                </div>
                {/* Judul & Nomor BAST */}
                <div className="text-right border-l border-slate-200 pl-4">
                  <div className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-[#004F9F] border border-blue-200 mb-1">
                    Dokumen Resmi BAST
                  </div>
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight">
                    BERITA ACARA SERAH TERIMA (BAST)
                  </h1>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    PEMENUHAN LISENSI SOFTWARE KORPORAT
                  </p>
                  <div className="font-mono text-xs font-bold text-[#004F9F] mt-0.5">
                    {record.bastNumber}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tanggal Terbit: {new Date(record.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Rujukan Dokumen Pengadaan (PO & Nota Permohonan) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 grid grid-cols-2 gap-3 text-[11px] relative z-10 avoid-page-break">
              <div className="flex items-start gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1 shrink-0"></div>
                <div>
                  <span className="text-slate-500 block font-semibold">Dasar Nota Permohonan:</span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 inline-block">
                    {record.notaNumber || 'Tidak/Belum Ada Nomor Nota'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-1.5 border-l border-slate-200 pl-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1 shrink-0"></div>
                <div>
                  <span className="text-slate-500 block font-semibold">Nomor Purchase Order (PO):</span>
                  {record.poNumber ? (
                    <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                      {record.poNumber}
                    </span>
                  ) : (
                    <span className="font-mono text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                      Belum Terbit (Kartu Kredit / Disusulkan)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pernyataan Serah Terima */}
            <p className="text-[11px] text-slate-700 leading-relaxed text-justify relative z-10 avoid-page-break">
              Pada hari ini, bertempat di lingkungan operasional perusahaan, berdasarkan rujukan pengadaan di atas, telah dilakukan serah terima hak penggunaan lisensi software antara pihak-pihak terkait di bawah ini:
            </p>

            {/* Profil Pihak Pertama & Pihak Kedua */}
            <div className="grid grid-cols-2 gap-3 relative z-10 avoid-page-break">
              {/* Pihak Pertama */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <User className="w-3 h-3" />
                  <span>Pihak Pertama (Penyerah)</span>
                </div>
                <div className="text-[11px] space-y-1 text-slate-700">
                  <div className="flex">
                    <span className="text-slate-500 w-20 shrink-0">Nama PIC:</span>
                    <span className="font-medium text-slate-900">{record.picName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-20 shrink-0">PIC Penyerah:</span>
                    <span>{record.picPosition || 'IT Asset Management'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-20 shrink-0">Departemen:</span>
                    <span>{record.picDepartment || 'Divisi TI'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-20 shrink-0">Instansi:</span>
                    <span>PT Transportasi Jakarta</span>
                  </div>
                </div>
              </div>

              {/* Pihak Kedua (User Penerima) */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <User className="w-3 h-3" />
                  <span>Pihak Kedua (Penerima)</span>
                </div>
                <div className="text-[11px] space-y-1 text-slate-700">
                  <div className="flex">
                    <span className="text-slate-500 w-20 shrink-0">Nama:</span>
                    <span className="font-semibold text-slate-900">{record.recipientName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 w-20 shrink-0">NIK:</span>
                    <span className="font-mono font-bold text-slate-900 px-1 bg-slate-200/70 rounded">
                      {record.recipientNIK}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-20 shrink-0">Email:</span>
                    <span>{record.recipientEmail}</span>
                  </div>
                  <div className="flex">
                    <span className="text-slate-500 w-20 shrink-0">Departemen:</span>
                    <span>{record.department}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian Lisensi Software (Tabel Multi-Item) */}
            <div className="space-y-1.5 relative z-10 avoid-page-break">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Rincian Lisensi Software yang Diserahterimakan:
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-2 w-8 text-center">No</th>
                      <th className="p-2">Nama Software / Aplikasi</th>
                      <th className="p-2 w-20">Tipe Lisensi</th>
                      <th className="p-2">Detail Akun / Key / Seat</th>
                      <th className="p-2 w-20">Tgl Mulai</th>
                      <th className="p-2 w-20">Masa Berlaku</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {record.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 avoid-page-break">
                        <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-2 font-medium text-slate-900">
                          {item.softwareName}
                          {item.itemNotes && (
                            <div className="text-[9px] text-blue-600 font-normal mt-0.5">↳ {item.itemNotes}</div>
                          )}
                        </td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            item.licenseType === 'Perpetual' ? 'bg-purple-100 text-purple-800' : 
                            item.licenseType === 'Tahunan' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.licenseType}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-[10px] text-slate-600 break-all">{item.licenseKeyAccount}</td>
                        <td className="p-2 text-slate-600">{item.startDate}</td>
                        <td className="p-2 text-slate-600">
                          {item.licenseType === 'Perpetual' ? <span className="text-purple-700 font-medium">Seumur Hidup</span> : (item.expiryDate || '-')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {record.notes && (
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] relative z-10 avoid-page-break">
                <span className="font-semibold text-slate-700">Catatan Tambahan: </span>
                <span className="text-slate-600">{record.notes}</span>
              </div>
            )}

            {/* Klausul Legal BAST */}
            <div className="text-[10px] text-slate-600 space-y-0.5 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100 relative z-10 avoid-page-break">
              <div className="font-semibold text-blue-950 mb-0.5">Ketentuan Penggunaan Lisensi:</div>
              <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
                <li>Pihak Pertama telah menyerahkan akses lisensi software tersebut kepada Pihak Kedua dalam keadaan aktif.</li>
                <li>Pihak Kedua bertanggung jawab menggunakan lisensi software semata-mata untuk kepentingan pekerjaan perusahaan.</li>
                <li>Bukti serah terima ini sah dan mengikat secara hukum korporat melalui konfirmasi elektronik.</li>
              </ol>
            </div>

            {/* Bukti Tanda Tangan Digital & Audit Trail */}
            <div className="grid grid-cols-2 gap-3 pt-2 relative z-10 avoid-page-break">
              {/* PIC Sign info */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/70 text-center space-y-1.5">
                <div className="text-[9px] font-bold uppercase text-slate-500">Pihak Pertama (Penyerah)</div>
                {record.status === 'Selesai' ? (
                  <div className="py-1">
                    <div className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>TERKONFIRMASI DIGITAL</span>
                    </div>
                    <div className="text-[10px] text-slate-700 font-medium">
                      {record.picName}
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="inline-flex items-center gap-1 text-amber-700 text-[10px] font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>Menunggu Finalisasi</span>
                    </div>
                  </div>
                )}
                <div className="text-[9px] text-slate-500 border-t border-slate-200 pt-1 mt-1">
                  Auth: {record.picEmail}
                </div>
              </div>

              {/* User Digital Sign / User Confirmation */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/70 text-center space-y-1.5">
                <div className="text-[9px] font-bold uppercase text-slate-500">Pihak Kedua (Penerima)</div>
                {record.status === 'Selesai' || record.status === 'Pending PIC' ? (
                  <div className="py-1">
                    <div className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>TERKONFIRMASI DIGITAL</span>
                    </div>
                    <div className="text-[10px] text-slate-700 font-medium">
                      {record.recipientName} (NIK: {record.recipientNIK})
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="inline-flex items-center gap-1 text-amber-700 text-[10px] font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>Menunggu Konfirmasi</span>
                    </div>
                  </div>
                )}
                <div className="text-[9px] text-slate-500 border-t border-slate-200 pt-1 mt-1">
                  Auth: {record.recipientEmail}
                </div>
              </div>
            </div>
            {/* End of paper */}
          </div>

          {/* Footer Actions (Tampil Khusus UI Interaktif, Tidak Tercetak) */}
          
          {/* Tombol Konfirmasi untuk User (Pihak Kedua) */}
          {isUserView && canConfirm && (record.status === 'Menunggu Konfirmasi' || record.status === 'Pending User') && (
            <div className="bg-amber-50 border-t border-amber-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 print-hidden relative z-20 shrink-0">
              <div className="text-xs text-amber-900">
                <strong>Tindakan Dibutuhkan:</strong> Periksa kesesuaian lisensi di atas, lalu konfirmasi penerimaan.
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onConfirmReceipt) onConfirmReceipt(record.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Konfirmasi Penerimaan Lisensi</span>
              </button>
            </div>
          )}

          {/* Tombol Verifikasi Akhir untuk Admin/PIC (Pihak Pertama) */}
          {!isUserView && canConfirm && record.status === 'Pending PIC' && (
            <div className="bg-blue-50 border-t border-blue-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 print-hidden relative z-20 shrink-0">
              <div className="text-xs text-blue-900">
                <strong>Pengesahan Akhir:</strong> User telah menerima dokumen ini. Lakukan validasi akhir agar BAST resmi selesai.
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onConfirmReceipt) onConfirmReceipt(record.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Sah & Selesaikan BAST</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};