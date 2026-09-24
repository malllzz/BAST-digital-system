import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

// Konfigurasi khusus untuk Outlook Personal (mengatasi timeout)
  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // Harus false untuk port 587
    tls: {
      ciphers: 'SSLv3', // Memaksa protokol yang bisa diterima Outlook
      rejectUnauthorized: false // Mengabaikan error sertifikat internal server
    },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Saat mengirim email, pastikan 'from' HARUS SAMA dengan EMAIL_USER
  try {
    const info = await transporter.sendMail({
      from: `"Sistem BAST" <${process.env.EMAIL_USER}>`, // Jangan pakai email lain di sini
      to: to,
      subject: subject,
      html: html
    });
    res.status(200).json({ success: true, message: 'Email berhasil dikirim' });
  } catch (error: any) {
    console.error('Error kirim email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}