import { AppStateData, Tenant, PaymentRecord, ChequeRecord, OutstandingChargeDetail, MonthlyCharge, RecentActivity, ChequeStatus } from '../types';
import { INITIAL_APP_STATE } from '../data/defaultData';

const STORAGE_KEY = 'mall_tenant_mgmt_app_data_v1';

export function loadAppData(): AppStateData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tenants) && parsed.tenants.length > 0) {
        if (!parsed.settings || (parsed.settings.mallName && parsed.settings.mallName.includes('Grand'))) {
          parsed.settings = {
            ...(parsed.settings || {}),
            mallName: 'Safari Mall Doha',
          };
          saveAppData(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load local storage state:', err);
  }
  // Initialize with default state
  saveAppData(INITIAL_APP_STATE);
  return INITIAL_APP_STATE;
}

export function saveAppData(state: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save local storage state:', err);
  }
}

export function resetAppData(): AppStateData {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APP_STATE));
  } catch (err) {
    console.error('Failed to reset state:', err);
  }
  return INITIAL_APP_STATE;
}

export function addTenantToStore(tenant: Partial<Tenant>): Tenant {
  const current = loadAppData();
  const newTenant: Tenant = {
    id: `t-${Date.now()}`,
    name: tenant.name || 'New Tenant',
    accountCode: tenant.accountCode || `T-${Math.floor(1000 + Math.random() * 9000)}`,
    shopNumber: tenant.shopNumber || 'S-100',
    floor: tenant.floor || 'Ground Floor',
    category: tenant.category || 'Retail',
    areaSqM: tenant.areaSqM || 80,
    contractStart: tenant.contractStart || '01-Jan-2026',
    contractEnd: tenant.contractEnd || '31-Dec-2026',
    rentType: tenant.rentType || 'Fixed',
    monthlyRent: tenant.monthlyRent || 15000,
    status: tenant.status || 'Active',
    contactPerson: tenant.contactPerson || '',
    phone: tenant.phone || '',
    email: tenant.email || '',
    remarks: tenant.remarks || '',
    securityDeposit: tenant.securityDeposit || (tenant.monthlyRent ? tenant.monthlyRent * 3 : 45000),
    rentSchedule: tenant.rentSchedule,
  };

  current.tenants.push(newTenant);

  // Also add default monthly charge for the new tenant
  const newMonthlyCharge: MonthlyCharge = {
    id: `mc-aug-${newTenant.id}`,
    tenantId: newTenant.id,
    tenantName: newTenant.name,
    shopNumber: newTenant.shopNumber,
    month: 'August 2026',
    rent: newTenant.monthlyRent,
    maintenance: 1000,
    electricity: 500,
    totalDue: newTenant.monthlyRent + 1500,
    paid: 0,
    outstanding: newTenant.monthlyRent + 1500,
    status: 'Unpaid',
  };
  current.monthlyCharges.push(newMonthlyCharge);

  // Add outstanding charge detail
  const newOutstanding: OutstandingChargeDetail = {
    id: `out-rent-${newTenant.id}`,
    tenantId: newTenant.id,
    chargeType: 'Rent',
    month: 'Aug-2026',
    amount: newTenant.monthlyRent,
    paid: 0,
    balance: newTenant.monthlyRent,
    priority: 1,
    dueDate: '01-Aug-2026',
  };
  current.outstandingCharges.push(newOutstanding);

  // Add recent activity
  current.recentActivities.unshift({
    id: `act-${Date.now()}`,
    date: '30-Aug-2026 14:15',
    tenantName: newTenant.name,
    activity: `New lease registered for shop ${newTenant.shopNumber} at QAR ${newTenant.monthlyRent.toLocaleString()}/mo`,
    amount: newTenant.monthlyRent,
    type: 'Tenant',
  });

  saveAppData(current);
  return newTenant;
}

export function updateTenantInStore(tenantId: string, updates: Partial<Tenant>): void {
  const current = loadAppData();
  const index = current.tenants.findIndex((t) => t.id === tenantId);
  if (index !== -1) {
    current.tenants[index] = { ...current.tenants[index], ...updates };

    // Update corresponding names in charges
    current.monthlyCharges.forEach((mc) => {
      if (mc.tenantId === tenantId) {
        if (updates.name) mc.tenantName = updates.name;
        if (updates.shopNumber) mc.shopNumber = updates.shopNumber;
      }
    });

    current.recentActivities.unshift({
      id: `act-${Date.now()}`,
      date: '30-Aug-2026 14:10',
      tenantName: current.tenants[index].name,
      activity: `Updated profile details for shop ${current.tenants[index].shopNumber}`,
      type: 'Tenant',
    });

    saveAppData(current);
  }
}

export function deleteTenantFromStore(tenantId: string): void {
  const current = loadAppData();
  const tenant = current.tenants.find((t) => t.id === tenantId);
  current.tenants = current.tenants.filter((t) => t.id !== tenantId);
  current.monthlyCharges = current.monthlyCharges.filter((c) => c.tenantId !== tenantId);
  current.outstandingCharges = current.outstandingCharges.filter((o) => o.tenantId !== tenantId);

  if (tenant) {
    current.recentActivities.unshift({
      id: `act-${Date.now()}`,
      date: '30-Aug-2026 14:05',
      tenantName: tenant.name,
      activity: `Lease cancelled / removed from mall directory: ${tenant.shopNumber}`,
      type: 'Tenant',
    });
  }

  saveAppData(current);
}

export function renewTenantContractInStore(
  tenantId: string,
  newEndDate: string,
  newMonthlyRent: number,
  remarks: string
): void {
  const current = loadAppData();
  const index = current.tenants.findIndex((t) => t.id === tenantId);
  if (index !== -1) {
    current.tenants[index].contractEnd = newEndDate;
    current.tenants[index].monthlyRent = newMonthlyRent;
    current.tenants[index].status = 'Active';
    current.tenants[index].remarks = remarks;

    current.recentActivities.unshift({
      id: `act-${Date.now()}`,
      date: '30-Aug-2026 13:55',
      tenantName: current.tenants[index].name,
      activity: `Contract renewed through ${newEndDate} at QAR ${newMonthlyRent.toLocaleString()}/mo`,
      amount: newMonthlyRent,
      type: 'Contract',
    });

    saveAppData(current);
  }
}

export function batchImportTenantsToStore(importedList: Tenant[]): void {
  const current = loadAppData();
  importedList.forEach((t) => {
    current.tenants.push(t);
    current.monthlyCharges.push({
      id: `mc-imp-${t.id}`,
      tenantId: t.id,
      tenantName: t.name,
      shopNumber: t.shopNumber,
      month: 'August 2026',
      rent: t.monthlyRent,
      maintenance: 1000,
      electricity: 500,
      totalDue: t.monthlyRent + 1500,
      paid: 0,
      outstanding: t.monthlyRent + 1500,
      status: 'Unpaid',
    });
  });

  current.recentActivities.unshift({
    id: `act-${Date.now()}`,
    date: '30-Aug-2026 13:45',
    tenantName: 'Batch Import',
    activity: `Imported ${importedList.length} tenant accounts from Excel spreadsheet`,
    type: 'Tenant',
  });

  saveAppData(current);
}

export function addPaymentToStore(payment: Partial<PaymentRecord>): PaymentRecord {
  const current = loadAppData();
  const newPayment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    receiptNo: payment.receiptNo || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    tenantId: payment.tenantId || '',
    tenantName: payment.tenantName || '',
    shopNumber: payment.shopNumber || '',
    date: payment.date || '30-Aug-2026',
    paymentMethod: payment.paymentMethod || 'Cheque',
    referenceNo: payment.referenceNo || 'REF-001',
    amount: payment.amount || 0,
    allocatedAmount: payment.allocatedAmount || payment.amount || 0,
    unallocatedAmount: payment.unallocatedAmount || 0,
    allocatedCharges: payment.allocatedCharges || [],
    notes: payment.notes || '',
  };

  current.payments.unshift(newPayment);

  // Apply FIFO settlement to outstanding charges
  if (newPayment.tenantId && newPayment.amount > 0) {
    let unspent = newPayment.amount;

    const tenantCharges = current.outstandingCharges
      .filter((c) => c.tenantId === newPayment.tenantId && c.balance > 0)
      .sort((a, b) => a.priority - b.priority);

    tenantCharges.forEach((c) => {
      if (unspent <= 0) return;
      const allocate = Math.min(c.balance, unspent);
      c.paid += allocate;
      c.balance -= allocate;
      unspent -= allocate;
    });

    const monthlyCharge = current.monthlyCharges.find(
      (m) => m.tenantId === newPayment.tenantId && m.month === 'August 2026'
    );
    if (monthlyCharge) {
      monthlyCharge.paid += newPayment.amount;
      monthlyCharge.outstanding = Math.max(0, monthlyCharge.totalDue - monthlyCharge.paid);
      monthlyCharge.status =
        monthlyCharge.outstanding === 0
          ? 'Paid'
          : monthlyCharge.paid > 0
          ? 'Partial'
          : 'Unpaid';
    }
  }

  current.recentActivities.unshift({
    id: `act-${Date.now()}`,
    date: '30-Aug-2026 13:30',
    tenantName: newPayment.tenantName,
    activity: `Payment received of QAR ${newPayment.amount.toLocaleString()} via ${newPayment.paymentMethod}`,
    amount: newPayment.amount,
    type: 'Payment',
  });

  saveAppData(current);
  return newPayment;
}

export function updateChequeStatusInStore(chequeId: string, status: ChequeStatus): void {
  const current = loadAppData();
  const index = current.cheques.findIndex((c) => c.id === chequeId);
  if (index !== -1) {
    const oldStatus = current.cheques[index].status;
    current.cheques[index].status = status;

    current.recentActivities.unshift({
      id: `act-${Date.now()}`,
      date: '30-Aug-2026 13:15',
      tenantName: current.cheques[index].tenantName,
      activity: `Cheque ${current.cheques[index].chequeNo} status updated: ${oldStatus} ➔ ${status}`,
      amount: current.cheques[index].amount,
      type: 'Cheque',
    });

    saveAppData(current);
  }
}

export function addChequeToStore(cheque: Partial<ChequeRecord>): ChequeRecord {
  const current = loadAppData();
  const newCheque: ChequeRecord = {
    id: `chq-${Date.now()}`,
    chequeNo: cheque.chequeNo || `CHQ-${Math.floor(1000 + Math.random() * 9000)}`,
    tenantId: cheque.tenantId || '',
    tenantName: cheque.tenantName || '',
    shopNumber: cheque.shopNumber || '',
    type: cheque.type || 'Rent',
    amount: cheque.amount || 15000,
    chequeDate: cheque.chequeDate || '05-Sep-2026',
    bankName: cheque.bankName || 'Qatar National Bank (QNB)',
    status: cheque.status || 'Received',
    remarks: cheque.remarks || '',
  };

  current.cheques.unshift(newCheque);

  current.recentActivities.unshift({
    id: `act-${Date.now()}`,
    date: '30-Aug-2026 13:00',
    tenantName: newCheque.tenantName,
    activity: `New PDC cheque ${newCheque.chequeNo} (QAR ${newCheque.amount.toLocaleString()}) logged`,
    amount: newCheque.amount,
    type: 'Cheque',
  });

  saveAppData(current);
  return newCheque;
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'QAR'): string {
  if (amount === null || amount === undefined) return '-';
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString('en-US');
}

// FIFO Payment Allocation Calculation
export function calculateFifoAllocation(
  charges: OutstandingChargeDetail[],
  paymentAmount: number
): {
  allocations: { chargeId: string; allocated: number; remainingBalance: number }[];
  totalAllocated: number;
  remainingAmount: number;
} {
  // Sort charges by priority ascending (FIFO: priority 1 first)
  const sorted = [...charges].sort((a, b) => a.priority - b.priority);
  let available = Math.max(0, paymentAmount);
  let totalAllocated = 0;

  const allocations = sorted.map((chg) => {
    const due = Math.max(0, chg.balance);
    if (available <= 0 || due <= 0) {
      return {
        chargeId: chg.id,
        allocated: 0,
        remainingBalance: due,
      };
    }

    const allocate = Math.min(due, available);
    available -= allocate;
    totalAllocated += allocate;

    return {
      chargeId: chg.id,
      allocated: allocate,
      remainingBalance: due - allocate,
    };
  });

  return {
    allocations,
    totalAllocated,
    remainingAmount: available,
  };
}
