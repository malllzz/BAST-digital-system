import { BastRecord, SimulatedUser } from '../types';

export const SIMULATED_USERS: SimulatedUser[] = [
  {
    name: 'Fauzan Miftahurochman',
    nik: '10928374',
    email: 'fauzanmiftahurochman@gmail.com',
    department: 'Software Engineering',
    role: 'user',
  },
  {
    name: 'Budi Santoso',
    nik: '10293847',
    email: 'budi.santoso@corp.id',
    department: 'Digital Design & UI/UX',
    role: 'user',
  },
  {
    name: 'Siti Rahma',
    nik: '10554433',
    email: 'siti.rahma@corp.id',
    department: 'Data & Business Intelligence',
    role: 'user',
  },
  {
    name: 'Dimas Pratama (PIC IT)',
    nik: '10112233',
    email: 'dimas.pratama@corp.id',
    department: 'IT Asset & Infrastructure',
    role: 'pic',
  },
];

export const INITIAL_BAST_DATA: BastRecord[] = [
  {
    id: 'bast-001',
    bastNumber: 'BAST-IT/2026/09/01',
    recipientName: 'Fauzan Miftahurochman',
    recipientNIK: '10928374',
    recipientEmail: 'fauzanmiftahurochman@gmail.com',
    department: 'Software Engineering',
    picName: 'Dimas Pratama',
    picEmail: 'dimas.pratama@corp.id',
    createdAt: '2026-09-18T09:30:00Z',
    status: 'Menunggu Konfirmasi',
    notes: 'Lisensi diserahkan untuk kebutuhan proyek Q4 2026. Silakan cek aktivasi sebelum konfirmasi.',
    items: [
      {
        id: 'item-101',
        softwareName: 'JetBrains All Products Pack',
        licenseType: 'Tahunan',
        licenseKeyAccount: 'JB-ORG-2026-FZ99',
        startDate: '2026-09-18',
        expiryDate: '2027-09-18',
        isReminderSent: false,
      },
      {
        id: 'item-102',
        softwareName: 'Figma Enterprise',
        licenseType: 'Bulanan',
        licenseKeyAccount: 'Invite via M365 (fauzanmiftahurochman@gmail.com)',
        startDate: '2026-09-18',
        expiryDate: '2026-10-16', // Expiring in 27 days -> Triggers H-30 reminder!
        isReminderSent: false,
      },
    ],
  },
  {
    id: 'bast-002',
    bastNumber: 'BAST-IT/2026/09/02',
    recipientName: 'Budi Santoso',
    recipientNIK: '10293847',
    recipientEmail: 'budi.santoso@corp.id',
    department: 'Digital Design & UI/UX',
    picName: 'Dimas Pratama',
    picEmail: 'dimas.pratama@corp.id',
    createdAt: '2026-09-15T10:15:00Z',
    status: 'Selesai',
    confirmationDate: '2026-09-15T11:42:18Z',
    auditAuthUser: 'budi.santoso@corp.id via Azure AD SSO',
    auditTimestamp: '2026-09-15 11:42:18 UTC+7',
    notes: 'Pemenuhan perpanjangan lisensi Adobe CC Creative Cloud.',
    items: [
      {
        id: 'item-201',
        softwareName: 'Adobe Creative Cloud All Apps',
        licenseType: 'Tahunan',
        licenseKeyAccount: 'VIP Account: budi.santoso@corp.id',
        startDate: '2026-09-15',
        expiryDate: '2027-09-15',
        isReminderSent: false,
      },
    ],
  },
  {
    id: 'bast-003',
    bastNumber: 'BAST-IT/2026/09/03',
    recipientName: 'Siti Rahma',
    recipientNIK: '10554433',
    recipientEmail: 'siti.rahma@corp.id',
    department: 'Data & Business Intelligence',
    picName: 'Dimas Pratama',
    picEmail: 'dimas.pratama@corp.id',
    createdAt: '2026-09-10T14:20:00Z',
    status: 'Selesai',
    confirmationDate: '2026-09-10T15:05:00Z',
    auditAuthUser: 'siti.rahma@corp.id via Azure AD SSO',
    auditTimestamp: '2026-09-10 15:05:00 UTC+7',
    notes: 'Alokasi lisensi analitik data visual dan lisensi seumur hidup SQL Tool.',
    items: [
      {
        id: 'item-301',
        softwareName: 'Tableau Desktop Professional',
        licenseType: 'Tahunan',
        licenseKeyAccount: 'TC-PRO-8899-7721',
        startDate: '2026-09-10',
        expiryDate: '2026-10-09', // Expiring in 20 days -> triggers H-30!
        isReminderSent: true,
      },
      {
        id: 'item-302',
        softwareName: 'Navicat Premium Enterprise',
        licenseType: 'Perpetual',
        licenseKeyAccount: 'NAV-PERPETUAL-CORP-4421',
        startDate: '2026-09-10',
        isReminderSent: false,
      },
    ],
  },
];

export function generateNextBastNumber(records: BastRecord[]): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `BAST-IT/${year}/${month}/`;

  // Find highest XX for current month
  let highestIndex = 0;
  for (const record of records) {
    if (record.bastNumber.startsWith(prefix)) {
      const parts = record.bastNumber.split('/');
      const numPart = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(numPart) && numPart > highestIndex) {
        highestIndex = numPart;
      }
    }
  }

  const nextIndex = String(highestIndex + 1).padStart(2, '0');
  return `${prefix}${nextIndex}`;
}

export function calculateDaysRemaining(expiryDateStr?: string): number | null {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  const now = new Date('2026-09-19'); // anchor with simulated current date
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
