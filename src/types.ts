export type LicenseType = 'Tahunan' | 'Bulanan' | 'Perpetual';

export type BastStatus = 'Menunggu Konfirmasi' | 'Selesai';

export interface LicenseItem {
  id: string;
  softwareName: string;
  licenseType: LicenseType;
  licenseKeyAccount: string;
  startDate: string;
  expiryDate?: string;
  isReminderSent?: boolean;
}

export interface BastRecord {
  id: string;
  bastNumber: string; // e.g. BAST-IT/2026/09/01
  recipientName: string;
  recipientNIK: string; // Nomor Induk Karyawan
  recipientEmail: string;
  department: string;
  picName: string;
  picEmail: string;
  createdAt: string;
  status: BastStatus;
  confirmationDate?: string;
  auditAuthUser?: string;
  auditTimestamp?: string;
  notes?: string;
  items: LicenseItem[];
}

export type UserRole = 'admin' | 'pic' | 'user';

export interface SimulatedUser {
  name: string;
  nik: string;
  email: string;
  department: string;
  role: UserRole;
  password?: string;
}
