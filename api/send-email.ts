import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Menangkap semua data spesifik dari frontend
  const { 
    to, 
    subject, 
    bastId,
    employeeName,
    employeeNik,
    bastNumber,
    softwareName,
    licenseType,
    expiryDate
  } = req.body;

  // Merakit URL konfirmasi unik berdasarkan ID BAST
  const confirmationLink = `https://bast-digital-system.vercel.app/konfirmasi?id=${bastId}`;

  // Merakit Template HTML
  const emailHtml = `
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
        <tr>
          <td style="padding-top: 12px; font-weight: bold;">${softwareName}</td>
          <td style="padding-top: 12px; color: #666;">${licenseType}</td>
          <td style="padding-top: 12px; color: #666;">${expiryDate}</td>
        </tr>
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

  // Konfigurasi SMTP Gmail
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Harus true untuk port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"IT Asset Management" <${process.env.EMAIL_USER}>`, // Menyesuaikan nama pengirim dengan template
      to: to,
      subject: subject,
      html: emailHtml // Menggunakan variabel emailHtml yang baru dirakit
    });
    res.status(200).json({ success: true, message: 'Email berhasil dikirim' });
  } catch (error: any) {
    console.error('Error kirim email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}