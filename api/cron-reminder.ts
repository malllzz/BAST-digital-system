import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Inisialisasi Supabase khusus untuk backend API
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  // Mengizinkan GET agar mudah dites via Browser dan dipanggil oleh Cron eksternal
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Ambil data lisensi yang automasinya AKTIF dan BELUM pernah dikirim reminder
    const { data: items, error } = await supabase
      .from('license_items')
      .select(`
        *,
        bast_records (
          id,
          bastNumber,
          recipientName,
          recipientNIK,
          recipientEmail,
          department
        )
      `)
      .eq('isAutoReminderEnabled', true)
      .eq('isReminderSent', false)
      .neq('licenseType', 'Perpetual');

    if (error) throw error;

    if (!items || items.length === 0) {
      return res.status(200).json({ message: 'Tidak ada lisensi target yang perlu dikirimkan email hari ini.' });
    }

    // 2. Konfigurasi Transporter Email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedItems = [];
    const watermarkSvg = 'https://bast-digital-system.vercel.app/transjakarta-logo.svg';
    const logoPng = 'https://bast-digital-system.vercel.app/transjakarta-logo.png';

    // 3. Evaluasi Sisa Hari dan Eksekusi Email
    for (const item of items) {
      if (!item.expiryDate) continue;

      const exp = new Date(item.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffTime = exp.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Jika tepat H-30 atau sudah lewat tapi masih dalam range 30 hari
      if (daysRemaining <= 30 && daysRemaining >= 0) {
        const bast = Array.isArray(item.bast_records) ? item.bast_records[0] : item.bast_records;
        
        const emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-image: url('${watermarkSvg}'); background-repeat: no-repeat; background-position: center; background-size: 80%; background-blend-mode: lighten;">
              <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <div style="color: #b45309; font-weight: bold; font-size: 14px;">⚠ Pengingat Otomatis Sistem (H-30 Hari)</div>
                <div style="color: #b45309; font-size: 13px; margin-top: 4px;">Lisensi software Anda akan kedaluwarsa dalam ${daysRemaining} hari ke depan.</div>
              </div>
              <p style="font-size: 14px; margin-bottom: 16px;">Halo <strong>${bast.recipientName}</strong> (NIK: ${bast.recipientNIK}),</p>
              <p style="font-size: 14px; margin-bottom: 20px; line-height: 1.6;">Sistem mendeteksi bahwa lisensi software berikut yang terdaftar atas nama Anda di departemen <strong>${bast.department}</strong> akan segera berakhir:</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; font-size: 14px; text-align: left; border-collapse: collapse;">
                  <tr><td style="color: #64748b; padding-bottom: 10px; width: 140px;">Nama Software:</td><td style="font-weight: bold; color: #0f172a; padding-bottom: 10px;">${item.softwareName}</td></tr>
                  <tr><td style="color: #64748b; padding-bottom: 10px;">Tipe Lisensi:</td><td style="font-weight: bold; color: #1e293b; padding-bottom: 10px;">${item.licenseType}</td></tr>
                  <tr><td style="color: #64748b; padding-bottom: 10px;">Tanggal Berakhir:</td><td style="font-weight: bold; color: #e11d48; padding-bottom: 10px; font-family: monospace;">${item.expiryDate}</td></tr>
                  <tr><td style="color: #64748b; padding-bottom: 10px;">No. Dokumen BAST:</td><td style="font-weight: bold; color: #1e293b; padding-bottom: 10px; font-family: monospace;">${bast.bastNumber}</td></tr>
                </table>
              </div>

              <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #0f172a;">Tindakan yang Disarankan:</div>
              <ul style="font-size: 14px; color: #475569; margin-top: 0; padding-left: 20px; line-height: 1.6; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px;">
                <li style="margin-bottom: 6px;">Jika lisensi ini masih aktif digunakan, mohon ajukan permohonan perpanjangan (*renewal*) ke atasan atau tim IT.</li>
                <li>Jika lisensi sudah tidak digunakan, mohon informasikan tim IT agar kuota lisensi dapat dialihkan ke user lain.</li>
              </ul>

              <table style="width: 100%; margin-top: 24px; font-size: 13px; color: #64748b; border-collapse: collapse;">
                <tr>
                  <td style="vertical-align: bottom;">
                    <p style="margin: 0;">Salam hangat,</p>
                    <p style="margin: 4px 0 0 0; font-weight: bold; color: #334155;">Divisi Pengembangan Sistem dan Inovasi Teknologi Informasi</p>
                    <p style="margin: 2px 0 0 0;">PT Transportasi Jakarta</p>
                  </td>
                  <td style="text-align: right; vertical-align: bottom;">
                    <img src="${logoPng}" alt="Transjakarta" style="height: 32px; display: block; margin-left: auto;" />
                  </td>
                </tr>
              </table>
          </div>
        `;

        // Kirim Email
        await transporter.sendMail({
          from: `"IT Asset Management" <${process.env.EMAIL_USER}>`,
          to: bast.recipientEmail,
          subject: `[PENGINGAT H-30] Masa Berlaku Lisensi ${item.softwareName} Akan Segera Berakhir`,
          html: emailHtml
        });

        // 4. Update status isReminderSent ke true agar tidak dikirim berulang besoknya
        await supabase
          .from('license_items')
          .update({ isReminderSent: true })
          .eq('id', item.id);

        processedItems.push(item.id);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Cron job selesai. Memproses ${processedItems.length} email pengingat.`,
      processed: processedItems
    });

  } catch (error: any) {
    console.error('Error saat menjalankan cron job:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}