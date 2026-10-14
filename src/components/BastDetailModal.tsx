import React from 'react';
import { X, Printer, ShieldCheck, Clock, CheckCircle, User, Cloud } from 'lucide-react';
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
      {/* 
        Injeksi CSS khusus untuk Print PDF agar rapi, tidak terpotong, 
        dan membongkar batasan Modal (overflow & max-height) 
      */}
      <style type="text/css" media="print">
        {`
          @page { 
            size: A4 portrait; 
            margin: 15mm; 
          }
          body * {
            visibility: hidden;
          }
          /* Hanya tampilkan modal saat print */
          #modal-backdrop-bast-detail, 
          #modal-backdrop-bast-detail * {
            visibility: visible;
          }
          /* Reset container modal agar bisa diprint utuh tanpa scroll */
          #modal-backdrop-bast-detail {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 100vh !important;
          }
          #modal-card-bast-detail {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            overflow: visible !important;
            max-height: none !important;
          }
          /* Mencegah elemen terpotong di antara halaman */
          .avoid-page-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-hidden {
            display: none !important;
          }
          /* Cetak warna background (opsional tergantung browser, tapi membantu) */
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
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Control Bar (Hidden when printing) */}
          <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print-hidden">
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
                <span>Cetak / Simpan PDF</span>
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
          <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6 bg-white relative">
            
            {/* Watermark Logo TJ (SVG) - Hanya tampil jika Selesai */}
            {record.status === 'Selesai' && (
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.04] pointer-events-none print:opacity-[0.06]">
                <img 
                  src="/transjakarta-logo.svg" 
                  alt="Watermark" 
                  className="w-3/4 max-w-2xl h-auto transform -rotate-12 grayscale"
                />
              </div>
            )}

            {/* Header BAST Korporat - Menggunakan PNG */}
            <div className="border-b-2 border-slate-900 pb-4 relative z-10 avoid-page-break">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Logo Resmi Transjakarta (Kop Surat) */}
                <div className="flex items-center gap-3.5">
                  <img 
                    src="/transjakarta-logo.png" 
                    alt="Logo PT Transportasi Jakarta" 
                    className="h-10 sm:h-12 w-auto object-contain" 
                  />
                </div>

                {/* Judul & Nomor BAST */}
                <div className="text-left md:text-right md:border-l md:border-slate-200 md:pl-5 shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#004F9F] border border-blue-200 mb-1">
                    <span>Dokumen Resmi BAST</span>
                    {record.status === 'Selesai' && (
                      <span className="text-emerald-700 font-bold">Sah & Selesai</span>
                    )}
                  </div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                    BERITA ACARA SERAH TERIMA (BAST)
                  </h1>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    PEMENUHAN LISENSI SOFTWARE KORPORAT
                  </p>
                  <div className="font-mono text-xs sm:text-sm font-bold text-[#004F9F] mt-1">
                    {record.bastNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tanggal Terbit: {new Date(record.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Ribbon */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl relative z-10 avoid-page-break">
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span className="font-medium">Status Dokumen:</span>
                {record.status === 'Selesai' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Selesai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Menunggu Konfirmasi User
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Diterima oleh: <strong>{record.recipientName}</strong>
              </div>
            </div>

            {/* Rujukan Dokumen Pengadaan (PO & Nota Permohonan) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs relative z-10 avoid-page-break">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                <div>
                  <span className="text-slate-500 text-[11px] block font-semibold">Dasar Nota Permohonan / Memo Dinas:</span>
                  <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 inline-block">
                    {/* Mengambil nilai notaNumber dari record, atau menampilkan placeholder jika kosong */}
                    {record.notaNumber || 'Tidak/Belum Ada Nomor Nota'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></div>
                <div>
                  <span className="text-slate-500 text-[11px] block font-semibold">Nomor Purchase Order (PO):</span>
                  {record.poNumber ? (
                    <span className="font-mono font-bold text-indigo-900 text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                      {record.poNumber}
                    </span>
                  ) : (
                    <span className="font-mono text-amber-700 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                      Belum Terbit (Transaksi Kartu Kredit / Disusulkan)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pernyataan Serah Terima */}
            <p className="text-xs text-slate-700 leading-relaxed text-justify relative z-10 avoid-page-break">
              Pada hari ini, bertempat di lingkungan operasional perusahaan, berdasarkan rujukan pengadaan di atas, telah dilakukan serah terima hak penggunaan
              lisensi software antara pihak-pihak terkait di bawah ini:
            </p>

            {/* Profil Pihak Pertama & Pihak Kedua */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 avoid-page-break">
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
                    <span className="text-slate-500 inline-block w-20">Departemen:</span>
                    <span>{record.department}</span>
                  </div>
                </div>
              </div>

              {/* Pihak Kedua (User Penerima) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Pihak Kedua (Penerima)</span>
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
                    <span className="text-slate-500 inline-block w-20">Email:</span>
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
            <div className="space-y-2 relative z-10 avoid-page-break">
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
                      <tr key={item.id} className="hover:bg-slate-50 avoid-page-break">
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
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs relative z-10 avoid-page-break">
                <span className="font-semibold text-slate-700">Catatan PIC IT: </span>
                <span className="text-slate-600">{record.notes}</span>
              </div>
            )}

            {/* Klausul Legal BAST */}
            <div className="text-xs text-slate-600 space-y-1 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100 relative z-10 avoid-page-break">
              <div className="font-semibold text-blue-950 mb-1">Ketentuan Penggunaan Lisensi:</div>
              <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
                <li>Pihak Pertama telah menyerahkan akses lisensi software tersebut kepada Pihak Kedua dalam keadaan aktif.</li>
                <li>Pihak Kedua bertanggung jawab menggunakan lisensi software semata-mata untuk kepentingan pekerjaan perusahaan.</li>
                <li>Bukti serah terima ini sah dan mengikat secara hukum korporat melalui konfirmasi dari pihak penerima dengan email korporat.</li>
              </ol>
            </div>

            {/* Bukti Tanda Tangan Digital & Audit Trail */}
            <div className="space-y-4 pt-2 relative z-10 avoid-page-break">
              {record.status === 'Selesai' && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                        Dokumen BAST Telah Selesai & Sah Secara Hukum Korporat
                      </div>
                      <div className="text-[11px] text-emerald-800 leading-relaxed">
                        Telah diverifikasi oleh tim IT PT Transportasi Jakarta.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PIC Sign info */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 text-center space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-500">Pihak Pertama (Penyerah)</div>
                  <div className="py-2 text-xs font-semibold text-slate-800">
                    {record.picName}
                    <div className="text-[10px] text-slate-500 font-normal">IT Asset & Infrastructure • PT Transportasi Jakarta</div>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1.5">
                    Dibuat: {new Date(record.createdAt).toLocaleString('id-ID')}
                  </div>
                </div>

                {/* User Digital Sign / User Confirmation */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 text-center space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-500">Pihak Kedua (Penerima)</div>
                  {record.status === 'Selesai' ? (
                    <div className="py-1">
                      <div className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>TERKONFIRMASI DIGITAL</span>
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
          </div>

          {/* Footer actions in User View (Hidden when printing) */}
          {isUserView && canConfirm && record.status === 'Menunggu Konfirmasi' && (
            <div className="bg-amber-50 border-t border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 print-hidden relative z-20">
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
                <span>Konfirmasi Penerimaan Lisensi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};