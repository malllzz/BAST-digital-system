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
    licenseKeyAccount, // Ditambahkan untuk kebutuhan Expiry Reminder
    type,
    html,
    items, 
    notaNumber,
    poNumber,
    department,
    picName,
    picEmail,
    picPosition,
    picDepartment
  } = req.body;

  const confirmationLink = `https://bast-digital-system.vercel.app/konfirmasi?id=${bastId}`;
  
  // URL Gambar Logo Resmi yang sudah dihosting
  const watermarkSvg = 'https://bast-digital-system.vercel.app/transjakarta-logo.svg';
  const logoPng = 'https://bast-digital-system.vercel.app/transjakarta-logo.png';

  // ==========================================
  // LOGIKA PEMBUATAN BARIS TABEL DINAMIS
  // ==========================================
  let itemsHtml = '';
  
  if (items && Array.isArray(items) && items.length > 0) {
    itemsHtml = items.map((it: any) => `
      <tr>
        <td style="padding: 12px 8px 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">
          ${it.softwareName}
          ${it.itemNotes ? `<div style="font-size: 11px; color: #1d4ed8; font-family: monospace; margin-top: 4px; font-weight: normal;">↳ ${it.itemNotes}</div>` : ''}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; color: #475569;">${it.licenseType}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; color: #475569; font-family: monospace; font-size: 12px;">${it.licenseKeyAccount || '-'}</td>
        <td style="padding: 12px 0 12px 8px; border-bottom: 1px solid #f1f5f9; color: #475569;">${it.licenseType === 'Perpetual' ? 'Seumur Hidup' : (it.expiryDate || '-')}</td>
      </tr>
    `).join('');
  } else {
    itemsHtml = `
      <tr>
        <td style="padding: 12px 8px 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">${softwareName}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; color: #475569;">${licenseType}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; color: #475569; font-family: monospace;">-</td>
        <td style="padding: 12px 0 12px 8px; border-bottom: 1px solid #f1f5f9; color: #475569;">${expiryDate}</td>
      </tr>
    `;
  }

  // ==========================================
  // LOGIKA PEMILIHAN TEMPLATE HTML
  // ==========================================
  let emailHtml = '';

  if (type === 'expiry_reminder') {
    emailHtml = html || `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-image: url('${watermarkSvg}'); background-repeat: no-repeat; background-position: center; background-size: 80%; background-blend-mode: lighten; box-shadow: inset 0 0 0 1000px rgba(255,255,255,0.96);">
          
         <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 16px; border-radius: 8px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px;">
            <div style="color: #d97706; font-size: 24px;">⚠</div>
            <div>
              <div style="color: #78350f; font-weight: bold; font-size: 14px;">Pengingat Otomatis Sistem (H-30 Hari)</div>
              <div style="color: #92400e; font-size: 12px; margin-top: 4px;">Lisensi software Anda akan kedaluwarsa dalam 30 hari ke depan.</div>
            </div>
         </div>
         
         <p style="font-size: 14px; margin-bottom: 16px;">Halo <strong>${employeeName}</strong> (NIK: ${employeeNik}),</p>
         <p style="font-size: 14px; margin-bottom: 20px; line-height: 1.6;">Sistem mendeteksi bahwa lisensi software berikut yang terdaftar atas nama Anda akan segera berakhir:</p>
         
         <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
           <table style="width: 100%; font-size: 14px; text-align: left; border-collapse: collapse;">
             <tr><td style="color: #64748b; padding-bottom: 10px; width: 140px;">Nama Software:</td><td style="font-weight: bold; color: #0f172a; padding-bottom: 10px;">${softwareName}</td></tr>
             <tr><td style="color: #64748b; padding-bottom: 10px;">Tipe Lisensi:</td><td style="font-weight: 500; color: #1e293b; padding-bottom: 10px;">${licenseType}</td></tr>
             <tr><td style="color: #64748b; padding-bottom: 10px;">Tanggal Berakhir:</td><td style="font-weight: bold; color: #e11d48; padding-bottom: 10px; font-family: monospace;">${expiryDate}</td></tr>
             <tr><td style="color: #64748b; padding-bottom: 0;">Detail Akun / Key:</td><td style="color: #334155; padding-bottom: 0; font-family: monospace;">${licenseKeyAccount || (items && items[0] ? items[0].licenseKeyAccount : '-')}</td></tr>
           </table>
         </div>

         <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #0f172a;">Tindakan yang Disarankan:</div>
         <ul style="font-size: 14px; color: #475569; margin-top: 0; padding-left: 20px; line-height: 1.6; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px;">
           <li style="margin-bottom: 6px;">Jika lisensi ini masih aktif digunakan untuk pekerjaan Anda, mohon ajukan permohonan perpanjangan (*renewal*) ke atasan atau tim IT.</li>
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
  } else {
    // TEMPLATE HANDOVER
    let additionalInfo = '';
    if (notaNumber) additionalInfo += ` (Berdasarkan Nota Dinas: ${notaNumber})`;
    if (poNumber) {
        additionalInfo += ` (Purchase Order: <strong style="font-family: monospace; color: #4338ca;">${poNumber}</strong>)`;
    } else {
        additionalInfo += ` (Status Pengadaan: <span style="background-color: #fef3c7; border: 1px solid #fde68a; color: #b45309; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">Kartu Kredit - PO Menyusul</span>)`;
    }

    emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; max-width: 700px; margin: 0 auto; background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background-image: url('${watermarkSvg}'); background-repeat: no-repeat; background-position: center; background-size: 70%; background-blend-mode: lighten; box-shadow: inset 0 0 0 1000px rgba(255,255,255,0.97);">
        
        <p style="font-size: 15px; margin-top: 0;">Halo <strong>${employeeName}</strong> (NIK: ${employeeNik}),</p>
        
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Tim IT Asset Management telah menyelesaikan pemenuhan lisensi software yang Anda butuhkan dengan nomor dokumen <strong>${bastNumber}</strong>${additionalInfo}.
        </p>
        
        <table style="width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; background-color: rgba(248, 250, 252, 0.5); margin-bottom: 24px; font-size: 13px; border-collapse: collapse;">
          <tr>
            <!-- PIHAK PERTAMA DI KIRI (Sesuai Preview) -->
            <td style="padding: 16px; width: 50%; vertical-align: top; border-right: 1px solid #e2e8f0;">
              <div style="color: #64748b; margin-bottom: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Pihak Pertama (Penyerah):</div>
              <div style="font-weight: bold; color: #0f172a; font-size: 15px; margin-bottom: 4px;">${picName || 'Margaretha Irfiani Maheswari'}</div>
              <div style="color: #475569; font-size: 12px; margin-bottom: 2px;">PIC: ${picPosition || 'Aset dan Inventory Teknologi Informasi'}</div>
              <div style="color: #475569; font-size: 12px; margin-bottom: 2px;">Dept: ${picDepartment || 'Perencanaan dan Inovasi Teknologi Informasi'}</div>
              <div style="color: #475569; font-size: 12px;">Instansi: PT Transportasi Jakarta</div>
            </td>
            <!-- PIHAK KEDUA DI KANAN -->
            <td style="padding: 16px; width: 50%; vertical-align: top;">
              <div style="color: #64748b; margin-bottom: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Pihak Kedua (Penerima):</div>
              <div style="font-weight: bold; color: #0f172a; font-size: 15px; margin-bottom: 4px;">${employeeName}</div>
              <div style="color: #475569; font-size: 12px; margin-bottom: 2px;">NIK: ${employeeNik}</div>
              <div style="color: #475569; font-size: 12px; margin-bottom: 2px;">Dept: ${department || '-'}</div>
            </td>
          </tr>
        </table>

        <div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px; background-color: rgba(248, 250, 252, 0.6);">
          <div style="margin-top: 0; font-weight: bold; font-size: 14px; margin-bottom: 12px; color: #0f172a;">Daftar Lisensi Software yang Diserahkan:</div>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
            <thead>
              <tr>
                <th style="padding-bottom: 12px; border-bottom: 2px solid #f1f5f9; color: #475569; font-weight: 600;">Nama Software</th>
                <th style="padding-bottom: 12px; border-bottom: 2px solid #f1f5f9; color: #475569; font-weight: 600;">Tipe Lisensi</th>
                <th style="padding-bottom: 12px; border-bottom: 2px solid #f1f5f9; color: #475569; font-weight: 600;">Akun / Seat</th>
                <th style="padding-bottom: 12px; border-bottom: 2px solid #f1f5f9; color: #475569; font-weight: 600;">Masa Berlaku</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Sesuai kebijakan tata kelola IT korporat, mohon luangkan waktu 1 menit untuk memeriksa aktivasi software dan melakukan konfirmasi penerimaan secara digital.
        </p>
        
        <div style="text-align: center; margin: 32px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 32px;">
          <a href="${confirmationLink}" style="background-color: #0078d4; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 2px 4px rgba(0,120,212,0.2);">Konfirmasi Penerimaan Lisensi</a>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 12px; margin-bottom: 0;">
            *Tautan ini mengarah langsung ke portal BAST Digital
          </p>
        </div>

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