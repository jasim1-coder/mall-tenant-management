export type ContractStatus = 'Active' | 'Expiring' | 'Expired';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type ChequeType = 'Rent' | 'Security' | 'Other';
export type ChequeStatus = 'Received' | 'Deposited' | 'Cleared' | 'Bounced' | 'Returned' | 'Held';
export type RentType = 'Fixed' | 'Scheduled';

export interface RentScheduleItem {
  id: string;
  fromMonth: string; // e.g. "Jan-2026"
  toMonth: string;   // e.g. "Dec-2026"
  monthlyRent: number;
}

export interface Tenant {
  id: string;
  accountCode: string;   // e.g. "T-1001"
  name: string;          // e.g. "ABC Trading"
  shopNumber: string;    // e.g. "S-102"
  floor: string;         // e.g. "Ground Floor"
  category: string;      // e.g. "Retail / Fashion"
  areaSqM: number;       // e.g. 85
  contractStart: string; // e.g. "01-Jan-2026"
  contractEnd: string;   // e.g. "31-Dec-2026"
  rentType: RentType;
  monthlyRent: number;   // Current active monthly rent
  rentSchedule?: RentScheduleItem[];
  status: ContractStatus;
  contactPerson: string;
  phone: string;
  email: string;
  remarks: string;
  securityDeposit: number;
  // Master Data 3-Check Compliance Fields (Yes / No)
  hasSecurityCheque?: boolean; // Security Cheque (Yes / No)
  hasRentCheques?: boolean;     // PDC / Rent Cheques (Yes / No)
  hasUtilityCheque?: boolean;   // Utility / Fit-Out Deposit Cheque (Yes / No)
}

export interface RecentActivity {
  id: string;
  date: string;
  tenantName: string;
  activity: string;
  amount?: number | null;
  type: 'Payment' | 'Contract' | 'Cheque' | 'Charge' | 'Tenant';
}

export interface MonthlyCharge {
  id: string;
  tenantId: string;
  tenantName: string;
  shopNumber: string;
  month: string;         // e.g. "August 2026"
  rent: number;
  maintenance: number;
  electricity: number;
  totalDue: number;
  paid: number;
  outstanding: number;
  status: PaymentStatus;
}

export interface OutstandingChargeDetail {
  id: string;
  tenantId: string;
  chargeType: 'Rent' | 'Electricity' | 'Maintenance' | 'Other';
  month: string;         // e.g. "May-2026"
  amount: number;
  paid: number;
  balance: number;
  priority: number;      // FIFO priority: lower is older
  dueDate: string;
}

export interface PaymentRecord {
  id: string;
  receiptNo: string;     // e.g. "REC-2026-089"
  tenantId: string;
  tenantName: string;
  shopNumber: string;
  date: string;
  paymentMethod: 'Cheque' | 'Bank Transfer' | 'Cash' | 'Credit Card';
  referenceNo: string;   // e.g. "CHQ-45821"
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  allocatedCharges: {
    chargeDetailId: string;
    chargeType: string;
    month: string;
    allocated: number;
  }[];
  notes?: string;
}

export interface ChequeRecord {
  id: string;
  chequeNo: string;      // e.g. "CHQ-1001"
  tenantId: string;
  tenantName: string;
  shopNumber: string;
  type: ChequeType;
  amount: number;
  chequeDate: string;    // e.g. "05-Aug-2026"
  bankName: string;      // e.g. "Qatar National Bank (QNB)"
  status: ChequeStatus;
  depositDate?: string;
  clearanceDate?: string;
  remarks?: string;
}

export interface ImportPreviewRow {
  accountCode: string;
  tenantName: string;
  shop: string;
  area: number;
  startDate: string;
  endDate: string;
  rent: number;
  securityCheque?: 'Yes' | 'No' | string;
  rentCheques?: 'Yes' | 'No' | string;
  utilityCheque?: 'Yes' | 'No' | string;
  hasSecurityCheque?: boolean;
  hasRentCheques?: boolean;
  hasUtilityCheque?: boolean;
  status: 'Valid' | 'Error';
  errorMessage?: string;
}

export type NavModule =
  | 'dashboard'
  | 'tenants'
  | 'contracts'
  | 'monthly_rent'
  | 'outstanding'
  | 'payments'
  | 'cheques'
  | 'reports';

export type ActiveNavModule =
  | 'Dashboard'
  | 'Tenants'
  | 'Contracts'
  | 'MonthlyRent'
  | 'Outstanding'
  | 'Payments'
  | 'Cheques'
  | 'Reports';

export interface AppStateData {
  tenants: Tenant[];
  monthlyCharges: MonthlyCharge[];
  outstandingCharges: OutstandingChargeDetail[];
  payments: PaymentRecord[];
  cheques: ChequeRecord[];
  recentActivities: RecentActivity[];
  settings: {
    mallName: string;
    currency: string;
    currentMonth: string;
    systemDate: string;
    propertyManager: string;
  };
}
