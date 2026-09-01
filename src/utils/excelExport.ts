import * as XLSX from 'xlsx';
import { Tenant } from '../types';

export interface ExportOptions {
  fileName?: string;
  sheetName?: string;
  mallName?: string;
  includeSummary?: boolean;
}

/**
 * Generates and downloads a clean, professional, and error-free Microsoft Excel (.xlsx) file
 * for the Tenants Master Directory with formatted headers, auto-sized columns, and summary row.
 */
export function exportTenantsToExcel(
  tenants: Tenant[],
  options: ExportOptions = {}
): boolean {
  try {
    const {
      fileName = 'Safari_Mall_Tenants_Directory',
      sheetName = 'Tenants Master',
      mallName = 'Safari Mall Doha - Tenant Master Directory',
      includeSummary = true,
    } = options;

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    // 1. Prepare raw structured data objects
    const dataRows = tenants.map((t, index) => {
      const annualRent = (Number(t.monthlyRent) || 0) * 12;
      const area = Number(t.areaSqM) || 0;
      const monthly = Number(t.monthlyRent) || 0;
      const deposit = Number(t.securityDeposit) || 0;

      return {
        'Sr. No': index + 1,
        'Account Code': t.accountCode || '',
        'Tenant Name': t.name || '',
        'Trade / Category': t.category || '',
        'Shop Number': t.shopNumber || '',
        'Floor Location': t.floor || '',
        'Area (m²)': area,
        'Monthly Rent (QAR)': monthly,
        'Annual Rent (QAR)': annualRent,
        'Contract Start': t.contractStart || '',
        'Contract End': t.contractEnd || '',
        'Lease Status': t.status || 'Active',
        'Security Cheque Received': t.hasSecurityCheque !== false ? 'YES' : 'NO',
        'Rent Cheques (PDC) Received': t.hasRentCheques !== false ? 'YES' : 'NO',
        'Utility Cheque Received': t.hasUtilityCheque !== false ? 'YES' : 'NO',
        'Security Deposit (QAR)': deposit,
        'Contact Person': t.contactPerson || '-',
        'Phone Number': t.phone || '-',
        'Email Address': t.email || '-',
        'Remarks / Notes': t.remarks || '',
      };
    });

    // 2. Add summary total row if requested
    if (includeSummary && tenants.length > 0) {
      const totalArea = tenants.reduce((acc, t) => acc + (Number(t.areaSqM) || 0), 0);
      const totalMonthlyRent = tenants.reduce((acc, t) => acc + (Number(t.monthlyRent) || 0), 0);
      const totalAnnualRent = totalMonthlyRent * 12;
      const totalDeposit = tenants.reduce((acc, t) => acc + (Number(t.securityDeposit) || 0), 0);

      dataRows.push({
        'Sr. No': '' as any,
        'Account Code': 'TOTALS' as any,
        'Tenant Name': `${tenants.length} Tenant Records` as any,
        'Trade / Category': '' as any,
        'Shop Number': '' as any,
        'Floor Location': '' as any,
        'Area (m²)': totalArea,
        'Monthly Rent (QAR)': totalMonthlyRent,
        'Annual Rent (QAR)': totalAnnualRent,
        'Contract Start': '' as any,
        'Contract End': '' as any,
        'Lease Status': '' as any,
        'Security Cheque Received': '' as any,
        'Rent Cheques (PDC) Received': '' as any,
        'Utility Cheque Received': '' as any,
        'Security Deposit (QAR)': totalDeposit,
        'Contact Person': '' as any,
        'Phone Number': '' as any,
        'Email Address': '' as any,
        'Remarks / Notes': 'Auto-generated aggregate summary' as any,
      });
    }

    // 3. Create worksheet from JSON
    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // 4. Set explicit, generous column widths (wch = character width) to avoid clipping
    worksheet['!cols'] = [
      { wch: 8 },  // Sr. No
      { wch: 14 }, // Account Code
      { wch: 30 }, // Tenant Name
      { wch: 26 }, // Trade / Category
      { wch: 13 }, // Shop Number
      { wch: 16 }, // Floor Location
      { wch: 13 }, // Area (m²)
      { wch: 20 }, // Monthly Rent (QAR)
      { wch: 20 }, // Annual Rent (QAR)
      { wch: 16 }, // Contract Start
      { wch: 16 }, // Contract End
      { wch: 14 }, // Lease Status
      { wch: 24 }, // Security Cheque Received
      { wch: 26 }, // Rent Cheques (PDC) Received
      { wch: 22 }, // Utility Cheque Received
      { wch: 22 }, // Security Deposit (QAR)
      { wch: 22 }, // Contact Person
      { wch: 18 }, // Phone Number
      { wch: 28 }, // Email Address
      { wch: 35 }, // Remarks / Notes
    ];

    // 5. Create workbook & append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

    // 6. Write file with formatted timestamp
    const timeStamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `${fileName}_${timeStamp}.xlsx`);

    return true;
  } catch (error) {
    console.error('Failed to export Excel file:', error);
    return false;
  }
}

/**
 * Exports tenants data to clean RFC 4180 compliant CSV format.
 */
export function exportTenantsToCsv(tenants: Tenant[], fileName = 'Safari_Mall_Tenants_Ledger'): boolean {
  try {
    const headers = [
      'Sr. No',
      'Account Code',
      'Tenant Name',
      'Shop Number',
      'Floor',
      'Category',
      'Area (sqm)',
      'Monthly Rent (QAR)',
      'Annual Rent (QAR)',
      'Contract Start',
      'Contract End',
      'Status',
      'Security Cheque',
      'Rent Cheques (PDC)',
      'Utility Cheque',
      'Security Deposit (QAR)',
      'Contact Person',
      'Phone',
      'Email',
      'Remarks',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = tenants.map((t, idx) => {
      const monthly = Number(t.monthlyRent) || 0;
      const annual = monthly * 12;
      return [
        idx + 1,
        escapeCsv(t.accountCode),
        escapeCsv(t.name),
        escapeCsv(t.shopNumber),
        escapeCsv(t.floor),
        escapeCsv(t.category),
        t.areaSqM || 0,
        monthly,
        annual,
        escapeCsv(t.contractStart),
        escapeCsv(t.contractEnd),
        escapeCsv(t.status),
        escapeCsv(t.hasSecurityCheque !== false ? 'YES' : 'NO'),
        escapeCsv(t.hasRentCheques !== false ? 'YES' : 'NO'),
        escapeCsv(t.hasUtilityCheque !== false ? 'YES' : 'NO'),
        t.securityDeposit || 0,
        escapeCsv(t.contactPerson || ''),
        escapeCsv(t.phone || ''),
        escapeCsv(t.email || ''),
        escapeCsv(t.remarks || ''),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export CSV file:', error);
    return false;
  }
}
