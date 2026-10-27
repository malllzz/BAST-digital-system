export type LicenseType = 'Tahunan' | 'Bulanan' | 'Perpetual';

export type BastStatus = 'Menunggu Konfirmasi' | 'Pending User' | 'Pending PIC' | 'Selesai';

export interface LicenseItem {
  id: string;
  softwareName: string;
  licenseType: LicenseType;
  licenseKeyAccount: string;
  startDate: string;
  expiryDate?: string;
  isReminderSent?: boolean;
  itemNotes?: string;
  isAutoReminderEnabled?: boolean;
}

export interface BastRecord {
  id: string;
  bastNumber: string;
  poNumber?: string;
  notaNumber?: string;
  isPoPending?: boolean;
  recipientName: string;
  recipientNIK: string;
  recipientEmail: string;
  department: string;
  picName: string;
  picEmail: string;
  picPosition: string;
  picDepartment: string;
  createdAt: string;
  status: BastStatus;
  
  // Kolom audit lama (opsional, bisa dipertahankan)
  confirmationDate?: string;
  auditAuthUser?: string;
  auditTimestamp?: string;
  
  // Kolom audit BARU untuk 2-step verification
  userConfirmationDate?: string;
  picConfirmationDate?: string;
  
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