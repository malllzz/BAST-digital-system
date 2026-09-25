import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Menangkap SEMUA data spesifik dari frontend
  const { 
    to, 
    subject, 
    bastId,
    employeeName,
    employeeNik,
    bastNumber,
    softwareName,
    licenseType,
    expiryDate,
    type,
    html,
    items // <-- PENAMBAHAN: Menangkap array lisensi
  } = req.body;

  const confirmationLink = `https://bast-digital-system.vercel.app/konfirmasi?id=${bastId}`;

  // ==========================================
  // LOGIKA PEMBUATAN BARIS TABEL DINAMIS
  // ==========================================
  let itemsHtml = '';
  
  if (items && Array.isArray(items) && items.length > 0) {
    // Jika ada lebih dari 1 lisensi, buat baris tabel secara dinamis
    itemsHtml = items.map((it: any) => `
      <tr>
        <td style="padding-top: 12px; font-weight: bold;">${it.softwareName}</td>
        <td style="padding-top: 12px; color: #666;">${it.licenseType}</td>
        <td style="padding-top: 12px; color: #666;">${it.licenseType === 'Perpetual' ? 'Seumur Hidup' : (it.expiryDate || '-')}</td>
      </tr>
    `).join('');
  } else {
    // Fallback jika data items kosong
    itemsHtml = `
      <tr>
        <td style="padding-top: 12px; font-weight: bold;">${softwareName}</td>
        <td style="padding-top: 12px; color: #666;">${licenseType}</td>
        <td style="padding-top: 12px; color: #666;">${expiryDate}</td>
      </tr>
    `;
  }

  // ==========================================
  // LOGIKA PEMILIHAN TEMPLATE HTML
  // ==========================================
  let emailHtml = '';

  if (type === 'expiry_reminder') {
    emailHtml = html || `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="padding: 20px; background-color: #ffffff;">
           <div style="background-color: #FFF4CE; border: 1px solid #FDE7A9; padding: 12px; border-radius: 6px; margin-bottom: 20px;">
              <div style="color: #D83B01; font-weight: bold; font-size: 14px;">⚠ Pengingat Otomatis Sistem (H-30 Hari)</div>
              <div style="color: #D83B01; font-size: 12px; margin-top: 4px;">Lisensi software Anda akan kedaluwarsa dalam 30 hari ke depan.</div>
           </div>
           
           <p style="font-size: 14px; margin-bottom: 16px;">Halo <strong>${employeeName}</strong> (NIK: ${employeeNik}),</p>
           <p style="font-size: 14px; margin-bottom: 16px;">Sistem mendeteksi bahwa lisensi software berikut yang terdaftar atas nama Anda akan segera berakhir:</p>
           
           <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
             <table style="width: 100%; font-size: 14px; text-align: left; border-collapse: collapse;">
               <tr><td style="color: #64748b; padding-bottom: 8px; width: 140px;">Nama Software:</td><td style="font-weight: bold; padding-bottom: 8px;">${softwareName}</td></tr>
               <tr><td style="color: #64748b; padding-bottom: 8px;">Tipe Lisensi:</td><td style="font-weight: bold; padding-bottom: 8px;">${licenseType}</td></tr>
               <tr><td style="color: #64748b; padding-bottom: 8px;">Tanggal Berakhir:</td><td style="font-weight: bold; color: #e11d48; padding-bottom: 8px;">${expiryDate}</td></tr>
             </table>
           </div>

           <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">Tindakan yang Disarankan:</div>
           <ul style="font-size: 14px; color: #475569; margin-top: 0; padding-left: 20px;">
             <li style="margin-bottom: 4px;">Jika lisensi ini masih aktif digunakan untuk pekerjaan Anda, mohon ajukan permohonan perpanjangan (*renewal*) ke atasan atau tim IT.</li>
             <li>Jika lisensi sudah tidak digunakan, mohon informasikan tim IT agar kuota lisensi dapat dialihkan ke user lain.</li>
           </ul>

           <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
             <p style="margin: 0;">Salam,</p>
             <p style="margin: 4px 0 0 0; font-weight: bold; color: #475569;">IT Asset & License Management Team</p>
             <p style="margin: 2px 0 0 0;">PT Korporat Teknologi Mandiri</p>
           </div>
        </div>
      </div>
    `;
  } else {
    // TEMPLATE HANDOVER (Menerapkan itemsHtml dinamis di sini)
    emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <p>Halo <strong>${employeeName}</strong> (NIK: ${employeeNik}),</p>
        
        <p>Tim IT Asset Management telah menyelesaikan pemenuhan lisensi software yang Anda butuhkan dengan nomor dokumen <strong>${bastNumber}</strong>.</p>
        
        <div style="border: 1px solid #e1e4e8; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f9fbfd;">
          <p style="margin-top: 0; font-weight: bold;">Daftar Lisensi Software:</p>
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <tr style="border-bottom: 1px solid #e1e4e8; color: #666; font-size: 14px;">
              <th style="padding-bottom: 8px;">Nama Software</th>
              <th style="padding-bottom: 8px;">Tipe</th>
              <th style="padding-bottom: 8px;">Masa Berlaku</th>
            </tr>
            ${itemsHtml} 
          </table>
        </div>

        <p style="color: #555; font-size: 14px; line-height: 1.5;">Sesuai kebijakan tata kelola IT korporat, mohon luangkan waktu 1 menit untuk memeriksa aktivasi software dan melakukan konfirmasi serah terima secara digital.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationLink}" style="background-color: #0078d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Konfirmasi Penerimaan Lisensi (Login M365)</a>
          <p style="font-size: 11px; color: #888; margin-top: 10px;">*Tautan ini mengarah langsung ke portal BAST Digital dengan verifikasi Azure AD SSO.</p>
        </div>

        <p style="font-size: 13px; color: #666; margin-top: 40px; border-top: 1px solid #eee; padding-top: 15px;">
          Salam,<br>
          <strong>IT Asset & License Management Team</strong><br>
          PT Korporat Teknologi Mandiri
        </p>
      </div>
    `;
  }

  // Konfigurasi SMTP Gmail
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"IT Asset Management" <${process.env.EMAIL_USER}>`, 
      to: to,
      subject: subject,
      html: emailHtml
    });
    res.status(200).json({ success: true, message: 'Email berhasil dikirim' });
  } catch (error: any) {
    console.error('Error kirim email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}