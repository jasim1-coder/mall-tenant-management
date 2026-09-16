import {
  AppStateData,
  Tenant,
  PaymentRecord,
  ChequeRecord,
  OutstandingChargeDetail,
  MonthlyCharge,
  RecentActivity,
  ChequeStatus,
  PaymentStatus,
} from '../types';
import { INITIAL_APP_STATE, INITIAL_TENANTS } from '../data/defaultData';

const STORAGE_KEY = 'mall_tenant_mgmt_app_data_v1';

export function parseDateString(dateStr: string): number {
  if (!dateStr) return 0;
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10) || 1;
    const month = months[parts[1].toLowerCase().slice(0, 3)] ?? 0;
    const year = parseInt(parts[2], 10) || 2026;
    return new Date(year, month, day).getTime();
  }
  return new Date(dateStr).getTime() || 0;
}

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
            enableInvoicing: parsed.settings?.enableInvoicing === true,
          };
          saveAppData(parsed);
        } else if (parsed.settings.enableInvoicing === undefined) {
          parsed.settings.enableInvoicing = false;
          saveAppData(parsed);
        }

        // Auto-seed water and gas charges if missing in existing session
        const hasWaterOrGas = parsed.outstandingCharges?.some(
          (c: OutstandingChargeDetail) => c.chargeType === 'Water' || c.chargeType === 'Gas'
        );
        if (!hasWaterOrGas && Array.isArray(parsed.outstandingCharges)) {
          const waterGasDefaults = INITIAL_APP_STATE.outstandingCharges.filter(
            (c) => c.chargeType === 'Water' || c.chargeType === 'Gas'
          );
          parsed.outstandingCharges = [...parsed.outstandingCharges, ...waterGasDefaults];
          saveAppData(parsed);
        }

        // Auto-heal any tenants whose active dates got set to future test years (2027-2035) during previous runs
        let needsSave = false;
        parsed.tenants.forEach((t: Tenant) => {
          const startYear = parseInt((t.contractStart || '').split('-').pop() || '2026', 10);
          if (startYear > 2026) {
            const defaultMatch = INITIAL_TENANTS.find((init) => init.id === t.id || init.accountCode === t.accountCode);
            if (defaultMatch) {
              t.contractStart = defaultMatch.contractStart;
              t.contractEnd = defaultMatch.contractEnd;
              t.monthlyRent = defaultMatch.monthlyRent;
              t.status = 'Active';
              t.upcomingRenewal = {
                startDate: '01-Jan-2027',
                endDate: '31-Dec-2027',
                monthlyRent: Math.round(defaultMatch.monthlyRent * 1.05),
                executionDate: '30-Aug-2026',
                remarks: 'Contract renewed for 12 months with 5% lease escalation.'
              };
              t.contractHistory = [
                {
                  id: `ct-${t.id}-upcoming`,
                  termPeriod: '01-Jan-2027 to 31-Dec-2027',
                  startDate: '01-Jan-2027',
                  endDate: '31-Dec-2027',
                  monthlyRent: Math.round(defaultMatch.monthlyRent * 1.05),
                  executionDate: '30-Aug-2026',
                  status: 'Upcoming Renewal',
                  remarks: 'Signed renewal for 2027 term'
                },
                {
                  id: `ct-${t.id}-curr`,
                  termPeriod: `${defaultMatch.contractStart} to ${defaultMatch.contractEnd}`,
                  startDate: defaultMatch.contractStart,
                  endDate: defaultMatch.contractEnd,
                  monthlyRent: defaultMatch.monthlyRent,
                  executionDate: defaultMatch.contractStart,
                  status: 'Active Current',
                  remarks: 'Active current tenancy agreement'
                }
              ];
              needsSave = true;
            }
          }
        });

        if (needsSave) {
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app_data_changed', { detail: state }));
    }
  } catch (err) {
    console.error('Failed to save local storage state:', err);
  }
}

export function resetAppData(): AppStateData {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APP_STATE));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app_data_changed', { detail: INITIAL_APP_STATE }));
    }
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
    hasSecurityCheque: tenant.hasSecurityCheque ?? true,
    hasRentCheques: tenant.hasRentCheques ?? true,
    hasUtilityCheque: tenant.hasUtilityCheque ?? true,
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

    // Update corresponding names and shop numbers in all related collections
    current.monthlyCharges.forEach((mc) => {
      if (mc.tenantId === tenantId) {
        if (updates.name) mc.tenantName = updates.name;
        if (updates.shopNumber) mc.shopNumber = updates.shopNumber;
      }
    });

    current.payments.forEach((p) => {
      if (p.tenantId === tenantId) {
        if (updates.name) p.tenantName = updates.name;
        if (updates.shopNumber) p.shopNumber = updates.shopNumber;
      }
    });

    current.cheques.forEach((chq) => {
      if (chq.tenantId === tenantId) {
        if (updates.name) chq.tenantName = updates.name;
        if (updates.shopNumber) chq.shopNumber = updates.shopNumber;
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
  remarks: string,
  newStartDate?: string
): void {
  const current = loadAppData();
  const index = current.tenants.findIndex((t) => t.id === tenantId);
  if (index !== -1) {
    const tenant = current.tenants[index];
    const systemDate = current.settings?.systemDate || '30-Aug-2026';
    const effectiveStartDate = newStartDate || tenant.contractEnd || '01-Jan-2027';

    if (!tenant.contractHistory) {
      tenant.contractHistory = [];
    }

    // Ensure the baseline current term is captured in contract history if not present
    const hasCurrentInHistory = tenant.contractHistory.some(
      (h) => h.startDate === tenant.contractStart && h.endDate === tenant.contractEnd
    );
    if (!hasCurrentInHistory) {
      tenant.contractHistory.push({
        id: `ct-${tenant.id}-initial`,
        termPeriod: `${tenant.contractStart} to ${tenant.contractEnd}`,
        startDate: tenant.contractStart,
        endDate: tenant.contractEnd,
        monthlyRent: tenant.monthlyRent,
        executionDate: tenant.contractStart,
        status: tenant.status === 'Expired' ? 'Expired' : 'Active Current',
        remarks: tenant.remarks || 'Standard tenancy term',
      });
    }

    // Check if the renewal start date is in a future period relative to systemDate
    const systemDateTimestamp = parseDateString(systemDate);
    const startTimestamp = parseDateString(effectiveStartDate);
    const isFutureTerm = startTimestamp > systemDateTimestamp;

    if (isFutureTerm) {
      // Mark current active term in history
      tenant.contractHistory.forEach((h) => {
        if (h.startDate === tenant.contractStart && h.endDate === tenant.contractEnd) {
          h.status = 'Active Current';
        }
      });

      // Add the upcoming renewal term to contract history
      const renewalRecord = {
        id: `ct-${tenant.id}-${Date.now()}`,
        termPeriod: `${effectiveStartDate} to ${newEndDate}`,
        startDate: effectiveStartDate,
        endDate: newEndDate,
        monthlyRent: newMonthlyRent,
        executionDate: systemDate,
        status: 'Upcoming Renewal' as const,
        remarks: remarks || `Signed renewal addendum for term ${effectiveStartDate} to ${newEndDate}`,
      };

      // Remove any existing upcoming renewal to avoid duplicates
      tenant.contractHistory = tenant.contractHistory.filter((h) => h.status !== 'Upcoming Renewal');
      tenant.contractHistory.unshift(renewalRecord);

      // The tenant status becomes 'Active' because renewal is signed & secured
      tenant.status = 'Active';
      tenant.upcomingRenewal = {
        startDate: effectiveStartDate,
        endDate: newEndDate,
        monthlyRent: newMonthlyRent,
        executionDate: systemDate,
        remarks: remarks || `Signed renewal for next term (${effectiveStartDate} to ${newEndDate})`,
      };
      tenant.remarks = `Contract renewed for next term (${effectiveStartDate} to ${newEndDate} @ QAR ${newMonthlyRent.toLocaleString()}/mo). ${remarks || ''}`.trim();
    } else {
      // Immediate renewal term (e.g. for expired leases or immediate rate changes)
      tenant.contractHistory.forEach((h) => {
        if (h.status === 'Active Current') {
          h.status = 'Completed';
        }
      });

      const activeRecord = {
        id: `ct-${tenant.id}-${Date.now()}`,
        termPeriod: `${effectiveStartDate} to ${newEndDate}`,
        startDate: effectiveStartDate,
        endDate: newEndDate,
        monthlyRent: newMonthlyRent,
        executionDate: systemDate,
        status: 'Active Current' as const,
        remarks: remarks || `Renewed active lease through ${newEndDate}`,
      };
      tenant.contractHistory.unshift(activeRecord);

      tenant.contractStart = effectiveStartDate;
      tenant.contractEnd = newEndDate;
      tenant.monthlyRent = newMonthlyRent;
      tenant.status = 'Active';
      tenant.upcomingRenewal = undefined;
      tenant.remarks = remarks || `Contract renewed through ${newEndDate}`;

      // Update current unpaid monthly charges
      current.monthlyCharges.forEach((mc) => {
        if (mc.tenantId === tenantId && mc.status === 'Unpaid' && mc.paid === 0) {
          mc.rent = newMonthlyRent;
          mc.totalDue =
            newMonthlyRent +
            mc.maintenance +
            mc.electricity +
            (mc.water || 0) +
            (mc.gas || 0);
          mc.outstanding = mc.totalDue;
        }
      });
    }

    current.recentActivities.unshift({
      id: `act-${Date.now()}`,
      date: systemDate,
      tenantName: tenant.name,
      activity: `Contract renewed for term ${effectiveStartDate} to ${newEndDate} at QAR ${newMonthlyRent.toLocaleString()}/mo`,
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
        monthlyCharge.totalDue > 0 && monthlyCharge.paid >= monthlyCharge.totalDue
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

    if (status === 'Deposited' && !current.cheques[index].depositDate) {
      current.cheques[index].depositDate = new Date().toISOString().split('T')[0];
    } else if (status === 'Cleared' && !current.cheques[index].clearanceDate) {
      current.cheques[index].clearanceDate = new Date().toISOString().split('T')[0];
    }

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

export function addOrUpdateMonthlyChargeInStore(chargeData: {
  id?: string;
  tenantId: string;
  tenantName?: string;
  shopNumber?: string;
  month: string;
  rent: number;
  maintenance: number;
  electricity: number;
  water?: number;
  gas?: number;
  electricityMeter?: {
    prevReading?: number;
    currReading?: number;
    unitsUsed?: number;
    ratePerUnit?: number;
  };
  waterMeter?: {
    prevReading?: number;
    currReading?: number;
    unitsUsed?: number;
    ratePerUnit?: number;
  };
}): MonthlyCharge {
  const current = loadAppData();
  const water = Number(chargeData.water) || 0;
  const gas = Number(chargeData.gas) || 0;
  const rent = Number(chargeData.rent) || 0;
  const maintenance = Number(chargeData.maintenance) || 0;
  const electricity = Number(chargeData.electricity) || 0;
  const totalDue = rent + maintenance + electricity + water + gas;

  let existingIndex = -1;
  if (chargeData.id) {
    existingIndex = current.monthlyCharges.findIndex((c) => c.id === chargeData.id);
  } else {
    existingIndex = current.monthlyCharges.findIndex(
      (c) => c.tenantId === chargeData.tenantId && c.month.toLowerCase() === chargeData.month.toLowerCase()
    );
  }

  const tenant = current.tenants.find((t) => t.id === chargeData.tenantId);
  const tenantName = chargeData.tenantName || tenant?.name || 'Tenant';
  const shopNumber = chargeData.shopNumber || tenant?.shopNumber || 'S-100';

  if (existingIndex !== -1) {
    const existing = current.monthlyCharges[existingIndex];
    const outstanding = Math.max(0, totalDue - existing.paid);
    const status: PaymentStatus =
      totalDue > 0 && existing.paid >= totalDue
        ? 'Paid'
        : existing.paid > 0
        ? 'Partial'
        : 'Unpaid';

    current.monthlyCharges[existingIndex] = {
      ...existing,
      tenantName,
      shopNumber,
      month: chargeData.month || existing.month,
      rent,
      maintenance,
      electricity,
      water,
      gas,
      electricityMeter: chargeData.electricityMeter || existing.electricityMeter,
      waterMeter: chargeData.waterMeter || existing.waterMeter,
      totalDue,
      outstanding,
      status,
    };

    // Sync or update outstanding charges breakdown
    const monthStr = chargeData.month || existing.month;
    const monthKey = monthStr.includes('-')
      ? monthStr
      : `${monthStr.substring(0, 3)}-2026`;

    // Remove older auto-generated charge items for this tenant & month
    current.outstandingCharges = current.outstandingCharges.filter(
      (o) =>
        !(
          o.tenantId === chargeData.tenantId &&
          o.month.toLowerCase().includes(monthStr.substring(0, 3).toLowerCase())
        )
    );

    let priorityCount = 1;
    const itemsToRecord: Array<{
      type: 'Rent' | 'Electricity' | 'Water' | 'Gas' | 'Maintenance';
      amount: number;
    }> = [
      { type: 'Rent', amount: rent },
      { type: 'Maintenance', amount: maintenance },
      { type: 'Electricity', amount: electricity },
      { type: 'Water', amount: water },
      { type: 'Gas', amount: gas },
    ];

    itemsToRecord.forEach(({ type, amount }) => {
      if (amount > 0) {
        current.outstandingCharges.push({
          id: `out-${type.toLowerCase()}-${chargeData.tenantId}-${Date.now()}-${priorityCount}`,
          tenantId: chargeData.tenantId,
          chargeType: type,
          month: monthKey,
          amount: amount,
          paid: 0,
          balance: amount,
          priority: priorityCount++,
          dueDate: `10-${monthStr.substring(0, 3)}-2026`,
        });
      }
    });

    current.recentActivities.unshift({
      id: `act-${Date.now()}`,
      date: '30-Aug-2026 15:30',
      tenantName,
      activity: `Updated monthly utilities for ${monthStr} (Total Due: QAR ${totalDue.toLocaleString()})`,
      amount: totalDue,
      type: 'Charge',
    });

    saveAppData(current);
    return current.monthlyCharges[existingIndex];
  } else {
    const newCharge: MonthlyCharge = {
      id: chargeData.id || `mc-${Date.now()}`,
      tenantId: chargeData.tenantId,
      tenantName,
      shopNumber,
      month: chargeData.month,
      rent,
      maintenance,
      electricity,
      water,
      gas,
      electricityMeter: chargeData.electricityMeter,
      waterMeter: chargeData.waterMeter,
      totalDue,
      paid: 0,
      outstanding: totalDue,
      status: totalDue > 0 ? 'Unpaid' : 'Paid',
    };

    current.monthlyCharges.unshift(newCharge);

    // Also add categorized breakdown to outstanding charges ledger
    const monthKey = chargeData.month.includes('-')
      ? chargeData.month
      : `${chargeData.month.substring(0, 3)}-2026`;

    let priorityCount = 1;
    const itemsToRecord: Array<{
      type: 'Rent' | 'Electricity' | 'Water' | 'Gas' | 'Maintenance';
      amount: number;
    }> = [
      { type: 'Rent', amount: rent },
      { type: 'Maintenance', amount: maintenance },
      { type: 'Electricity', amount: electricity },
      { type: 'Water', amount: water },
      { type: 'Gas', amount: gas },
    ];

    itemsToRecord.forEach(({ type, amount }) => {
      if (amount > 0) {
        current.outstandingCharges.push({
          id: `out-${type.toLowerCase()}-${chargeData.tenantId}-${Date.now()}-${priorityCount}`,
          tenantId: chargeData.tenantId,
          chargeType: type,
          month: monthKey,
          amount: amount,
          paid: 0,
          balance: amount,
          priority: priorityCount++,
          dueDate: `10-${chargeData.month.substring(0, 3)}-2026`,
        });
      }
    });

    current.recentActivities.unshift({
      id: `act-${Date.now()}`,
      date: '30-Aug-2026 15:35',
      tenantName,
      activity: `Generated new monthly utility bill for ${chargeData.month} (Total: QAR ${totalDue.toLocaleString()})`,
      amount: totalDue,
      type: 'Charge',
    });

    saveAppData(current);
    return newCharge;
  }
}

export function updateMonthlyChargeInStore(
  chargeId: string,
  updatedValues: {
    rent: number;
    maintenance: number;
    electricity: number;
    water?: number;
    gas?: number;
  }
): MonthlyCharge | null {
  const current = loadAppData();
  const target = current.monthlyCharges.find((c) => c.id === chargeId);
  if (!target) return null;

  return addOrUpdateMonthlyChargeInStore({
    id: chargeId,
    tenantId: target.tenantId,
    tenantName: target.tenantName,
    shopNumber: target.shopNumber,
    month: target.month,
    ...updatedValues,
  });
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

export function updateSettingsInStore(partialSettings: Partial<AppStateData['settings']>): AppStateData {
  const current = loadAppData();
  current.settings = {
    ...current.settings,
    ...partialSettings,
  };
  saveAppData(current);
  return current;
}

