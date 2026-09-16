import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Phone,
  Mail,
  User,
  CreditCard,
  CheckSquare,
  AlertTriangle,
  Receipt,
  FileText,
  RotateCw,
  Plus,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { Tenant, MonthlyCharge, PaymentRecord, ChequeRecord, OutstandingChargeDetail } from '../types';
import { WinFormsTabControl, TabItem } from '../components/winforms/WinFormsTabControl';
import { WinFormsGroupBox } from '../components/winforms/WinFormsGroupBox';
import { formatCurrency } from '../services/dataStore';

interface TenantDetailsViewProps {
  id?: string;
  tenant: Tenant;
  allCharges: MonthlyCharge[];
  allPayments: PaymentRecord[];
  allCheques: ChequeRecord[];
  allOutstanding: OutstandingChargeDetail[];
  onBack?: () => void;
  onEditTenant?: (tenant: Tenant) => void;
  onReceivePayment?: (tenant: Tenant) => void;
  onRenewContract?: (tenant: Tenant) => void;
}

export const TenantDetailsView: React.FC<TenantDetailsViewProps> = ({
  id,
  tenant,
  allCharges,
  allPayments,
  allCheques,
  allOutstanding,
  onBack,
  onEditTenant,
  onReceivePayment,
  onRenewContract,
}) => {
  const handleBack = onBack || (() => {});
  const handleEditTenant = onEditTenant || (() => {});
  const handleReceivePayment = onReceivePayment || (() => {});
  const handleRenewContract = onRenewContract || (() => {});
  const [activeTab, setActiveTab] = useState('overview');

  // Filter records for this tenant
  const tenantCharges = allCharges.filter((c) => c.tenantId === tenant.id);
  const tenantPayments = allPayments.filter((p) => p.tenantId === tenant.id);
  const tenantCheques = allCheques.filter((c) => c.tenantId === tenant.id);
  const tenantOutstanding = allOutstanding.filter((o) => o.tenantId === tenant.id && o.balance > 0);

  const totalOutstandingBalance = tenantOutstanding.reduce((sum, o) => sum + o.balance, 0);

  const tabDefs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'contract',
      label: 'Contract',
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: 'schedule',
      label: 'Rent Schedule',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      id: 'outstanding',
      label: 'Outstanding',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      badge: tenantOutstanding.length > 0 ? tenantOutstanding.length : undefined,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <Receipt className="w-3.5 h-3.5" />,
    },
    {
      id: 'cheques',
      label: 'Cheques',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-3.5 text-[12px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Property & Lease Specs */}
              <WinFormsGroupBox title="Property & Lease Specifications">
                <table className="w-full text-left text-[11.5px] border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold w-36">Account Code</td>
                      <td className="py-1.5 font-mono font-bold text-slate-900">{tenant.accountCode}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold">Shop / Unit No</td>
                      <td className="py-1.5 font-mono font-bold text-[#2563EB]">{tenant.shopNumber} ({tenant.floor})</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold">Floor Area</td>
                      <td className="py-1.5 font-mono text-slate-800">{tenant.areaSqM} m² (Square Meters)</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold">Trade Category</td>
                      <td className="py-1.5 text-slate-800">{tenant.category}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold">Rent Structure</td>
                      <td className="py-1.5 text-slate-800">
                        <span className="font-semibold">{tenant.rentType} Monthly Rent</span>
                        {tenant.rentType === 'Scheduled' && (
                          <span className="text-[10px] text-blue-700 ml-1.5 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                            Step-up schedule active
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold">Current Monthly Rent</td>
                      <td className="py-1.5 font-mono font-bold text-[13px] text-slate-900">
                        {formatCurrency(tenant.monthlyRent)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-500 font-semibold">Security Deposit</td>
                      <td className="py-1.5 font-mono font-bold text-slate-900">
                        {formatCurrency(tenant.securityDeposit || tenant.monthlyRent * 3)}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-50/50">
                      <td className="py-1.5 text-slate-600 font-semibold align-middle">
                        3-Cheque Clearance
                      </td>
                      <td className="py-1.5 flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${tenant.hasSecurityCheque !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                          Sec Chq: {tenant.hasSecurityCheque !== false ? 'YES' : 'NO'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${tenant.hasRentCheques !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                          Rent Chqs: {tenant.hasRentCheques !== false ? 'YES' : 'NO'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${tenant.hasUtilityCheque !== false ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                          Util Chq: {tenant.hasUtilityCheque !== false ? 'YES' : 'NO'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </WinFormsGroupBox>

              {/* Contact Person Details */}
              <WinFormsGroupBox title="Primary Contact & Communications">
                <table className="w-full text-left text-[11.5px] border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold w-36">Authorized Contact</td>
                      <td className="py-1.5 font-semibold text-slate-900">{tenant.contactPerson || 'General Manager'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold">Phone / Mobile</td>
                      <td className="py-1.5 font-mono text-slate-800">{tenant.phone}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold">Email Address</td>
                      <td className="py-1.5 text-slate-800 font-mono">{tenant.email}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 text-slate-500 font-semibold">Contract Status</td>
                      <td className="py-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          tenant.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          tenant.status === 'Expiring' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {tenant.status}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-500 font-semibold align-top">Lease Remarks</td>
                      <td className="py-1.5 text-slate-700 italic">
                        {tenant.remarks || 'Standard commercial tenancy agreement on file.'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </WinFormsGroupBox>
            </div>

            {/* Overdue alert */}
            {totalOutstandingBalance > 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-[2px] flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-rose-900 text-[11.5px]">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>
                    This tenant has an overdue balance of <strong>{formatCurrency(totalOutstandingBalance)}</strong> across unpaid monthly billing cycles.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleReceivePayment(tenant)}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] rounded-[2px] shadow-xs flex items-center gap-1 shrink-0"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Collect Payment</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-[2px] text-emerald-900 text-[11.5px] font-medium">
                ✓ Account is fully paid up. No outstanding rent or utility dues.
              </div>
            )}
          </div>
        );

      case 'contract': {
        // Collect history items from persistent store or baseline initial terms
        const historyItems = tenant.contractHistory && tenant.contractHistory.length > 0
          ? [...tenant.contractHistory]
          : (() => {
              const items = [
                {
                  id: `ct-curr-${tenant.id}`,
                  termPeriod: `${tenant.contractStart} to ${tenant.contractEnd}`,
                  startDate: tenant.contractStart,
                  endDate: tenant.contractEnd,
                  monthlyRent: tenant.monthlyRent,
                  executionDate: tenant.contractStart,
                  status: (tenant.status === 'Expired' ? 'Expired' : 'Active Current') as any,
                  remarks: tenant.remarks || 'Active tenancy agreement',
                }
              ];

              const startParts = tenant.contractStart.split('-');
              const endParts = tenant.contractEnd.split('-');
              const startYear = parseInt(startParts[startParts.length - 1], 10) || 2026;
              const endYear = parseInt(endParts[endParts.length - 1], 10) || 2026;
              if (startYear >= 2026) {
                const prevStartYear = startYear - 1;
                const prevEndYear = endYear - 1;
                const prevStart = `${startParts[0]}-${startParts[1] || 'Jan'}-${prevStartYear}`;
                const prevEnd = `${endParts[0]}-${endParts[1] || 'Dec'}-${prevEndYear}`;
                const prevExec = `15-Dec-${prevStartYear - 1}`;
                items.push({
                  id: `ct-prev-${tenant.id}`,
                  termPeriod: `${prevStart} to ${prevEnd}`,
                  startDate: prevStart,
                  endDate: prevEnd,
                  monthlyRent: Math.round(tenant.monthlyRent * 0.92),
                  executionDate: prevExec,
                  status: 'Completed' as any,
                  remarks: 'Prior term completed & renewed',
                });
              }
              return items;
            })();

        return (
          <div className="space-y-3.5 text-[12px]">
            {/* Active / Current Contract Summary */}
            <WinFormsGroupBox title="Current Active Contract Terms">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-[2px]">
                <div>
                  <span className="text-slate-500 block text-[11px]">Active Lease Term:</span>
                  <strong className="font-mono text-[12.5px] text-slate-900">
                    {tenant.contractStart} to {tenant.contractEnd}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Agreed Monthly Rent:</span>
                  <strong className="font-mono text-[13px] text-emerald-800">
                    {formatCurrency(tenant.monthlyRent)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Contract Status:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold mt-0.5 ${
                    tenant.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    tenant.status === 'Expiring' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {tenant.status === 'Active' && tenant.upcomingRenewal ? 'Active (Renewed for Next Term)' : tenant.status}
                  </span>
                </div>
              </div>

              {/* Upcoming Signed Renewal Callout if present */}
              {tenant.upcomingRenewal && (
                <div className="mt-2.5 p-2.5 bg-blue-50 border border-blue-300 rounded-[2px] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900 text-[11.5px]">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold">Next Term Renewal Signed:</span>{' '}
                      <span className="font-mono font-semibold">{tenant.upcomingRenewal.startDate} to {tenant.upcomingRenewal.endDate}</span> at{' '}
                      <span className="font-mono font-bold text-blue-800">{formatCurrency(tenant.upcomingRenewal.monthlyRent)}/mo</span>.
                      <span className="text-slate-500 text-[10.5px] block mt-0.5">
                        (Executed on {tenant.upcomingRenewal.executionDate}. Becomes active upon arrival of next term date.)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </WinFormsGroupBox>

            {/* Renewal & Lease History */}
            <WinFormsGroupBox title="Complete Contract & Renewal History">
              <div className="border border-[#CBD5E1] rounded-[2px] bg-white overflow-hidden">
                <table className="w-full text-left text-[11.5px]">
                  <thead className="bg-[#E2E8F0] border-b border-[#CBD5E1] text-slate-800">
                    <tr>
                      <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Term Period</th>
                      <th className="py-1.5 px-3 border-r border-[#CBD5E1] text-right">Agreed Rent</th>
                      <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Execution Date</th>
                      <th className="py-1.5 px-3 border-r border-[#CBD5E1] text-center">Term Status</th>
                      <th className="py-1.5 px-3">Remarks / Addendum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {historyItems.map((item) => (
                      <tr
                        key={item.id}
                        className={
                          item.status === 'Upcoming Renewal'
                            ? 'bg-blue-50/60'
                            : item.status === 'Active Current'
                            ? 'bg-emerald-50/40 font-medium'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-800">
                          {item.termPeriod || `${item.startDate} to ${item.endDate}`}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-mono text-right font-bold text-slate-900">
                          {formatCurrency(item.monthlyRent)}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">
                          {item.executionDate}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center">
                          {item.status === 'Upcoming Renewal' && (
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              Upcoming Term
                            </span>
                          )}
                          {item.status === 'Active Current' && (
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Active Current
                            </span>
                          )}
                          {item.status === 'Completed' && (
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
                              Completed
                            </span>
                          )}
                          {item.status === 'Expired' && (
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              Expired
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600 italic text-[11px]">
                          {item.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRenewContract(tenant)}
                  className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-[2px] text-[11.5px] flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Renew Contract / Issue Next Term</span>
                </button>
              </div>
            </WinFormsGroupBox>
          </div>
        );
      }

      case 'schedule':
        return (
          <div className="space-y-3 text-[12px]">
            <WinFormsGroupBox title="Configured Rent Schedule & Step-Up Escalations">
              {tenant.rentSchedule && tenant.rentSchedule.length > 0 ? (
                <div className="border border-[#CBD5E1] rounded-[2px] bg-white overflow-hidden">
                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead className="bg-[#E2E8F0] border-b border-[#CBD5E1] text-[#1E293B]">
                      <tr>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">From Month</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">To Month</th>
                        <th className="py-1.5 px-3 text-right">Monthly Rent (QAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {tenant.rentSchedule.map((sch) => (
                        <tr key={sch.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 border-r border-[#E2E8F0] font-mono font-medium text-slate-800">
                            {sch.fromMonth}
                          </td>
                          <td className="py-2 px-3 border-r border-[#E2E8F0] font-mono font-medium text-slate-800">
                            {sch.toMonth}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(sch.monthlyRent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-[2px] text-center text-slate-600">
                  This tenant uses a <strong>Fixed Monthly Rent</strong> of <strong>{formatCurrency(tenant.monthlyRent)}</strong> per calendar month.
                </div>
              )}
            </WinFormsGroupBox>
          </div>
        );

      case 'outstanding':
        return (
          <div className="space-y-3 text-[12px]">
            <WinFormsGroupBox
              title="Unpaid Charges & Balances"
              badge={
                <span className="text-rose-700 font-bold font-mono">
                  Total Overdue: {formatCurrency(totalOutstandingBalance)}
                </span>
              }
            >
              {tenantOutstanding.length === 0 ? (
                <div className="p-4 text-center text-emerald-700 font-medium">
                  ✓ All charges for this tenant have been settled in full.
                </div>
              ) : (
                <div className="border border-[#CBD5E1] rounded-[2px] bg-white overflow-hidden">
                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead className="bg-[#E2E8F0] border-b border-[#CBD5E1] text-[#1E293B]">
                      <tr>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Charge Type</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Month</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1] text-right">Invoiced Amount</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1] text-right">Paid</th>
                        <th className="py-1.5 px-3 text-right font-bold text-rose-700">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {tenantOutstanding.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-semibold text-slate-800">
                            {item.chargeType}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-mono text-slate-600">
                            {item.month}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] text-right font-mono">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] text-right font-mono text-emerald-700">
                            {formatCurrency(item.paid)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-700">
                            {formatCurrency(item.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </WinFormsGroupBox>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-3 text-[12px]">
            <WinFormsGroupBox title="Historical Payment Receipts & Allocations">
              {tenantPayments.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic">
                  No payment transactions recorded for this tenant yet.
                </div>
              ) : (
                <div className="border border-[#CBD5E1] rounded-[2px] bg-white overflow-hidden">
                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead className="bg-[#E2E8F0] border-b border-[#CBD5E1] text-[#1E293B]">
                      <tr>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Receipt No</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Date</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Method</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Ref / Cheque</th>
                        <th className="py-1.5 px-3 text-right">Amount (QAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {tenantPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-mono font-bold text-blue-700">
                            {p.receiptNo}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-mono text-slate-700">
                            {p.date}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] text-slate-700">
                            {p.paymentMethod}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-mono text-slate-600">
                            {p.referenceNo}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-800">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </WinFormsGroupBox>
          </div>
        );

      case 'cheques':
        return (
          <div className="space-y-3 text-[12px]">
            <WinFormsGroupBox title="Cheques Issued & Custody Register">
              {tenantCheques.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic">
                  No post-dated or security cheques logged for this tenant.
                </div>
              ) : (
                <div className="border border-[#CBD5E1] rounded-[2px] bg-white overflow-hidden">
                  <table className="w-full text-left text-[11.5px] border-collapse">
                    <thead className="bg-[#E2E8F0] border-b border-[#CBD5E1] text-[#1E293B]">
                      <tr>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Cheque No</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Type</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1] text-right">Amount (QAR)</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Maturity Date</th>
                        <th className="py-1.5 px-3 border-r border-[#CBD5E1]">Bank</th>
                        <th className="py-1.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {tenantCheques.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-mono font-bold text-slate-800">
                            {c.chequeNo}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] text-slate-700">
                            {c.type}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] text-right font-mono font-bold text-slate-900">
                            {formatCurrency(c.amount)}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-mono text-slate-600">
                            {c.chequeDate}
                          </td>
                          <td className="py-1.5 px-3 border-r border-[#E2E8F0] text-slate-600">
                            {c.bankName}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </WinFormsGroupBox>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id={id} className="p-3.5 space-y-3 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 px-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded text-slate-700 flex items-center gap-1.5 text-[11px] font-semibold shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Back to Tenants</span>
          </button>

          <div>
            <h2 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2563EB]" />
              {tenant.name}
              <span className="font-mono text-[11px] text-slate-500 font-normal">
                ({tenant.accountCode} • Shop {tenant.shopNumber})
              </span>
            </h2>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleRenewContract(tenant)}
            className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1 cursor-pointer"
            title="Renew this tenant's contract for next cycle"
          >
            <RotateCw className="w-3 h-3" />
            <span>Renew Contract</span>
          </button>
          <button
            type="button"
            onClick={() => handleReceivePayment(tenant)}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <CreditCard className="w-3 h-3" />
            <span>Receive Payment</span>
          </button>
          <button
            type="button"
            onClick={() => handleEditTenant(tenant)}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11.5px] rounded-[2px] shadow-xs cursor-pointer"
          >
            Edit Record
          </button>
        </div>
      </div>

      {/* Main WinForms TabControl */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#CBD5E1] rounded-[3px] shadow-xs overflow-hidden">
        <WinFormsTabControl
          id="tenant-details-tabcontrol"
          tabs={tabDefs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {renderTabContent()}
        </WinFormsTabControl>
      </div>
    </div>
  );
};
