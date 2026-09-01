import React, { useMemo } from 'react';
import {
  Users,
  FileCheck2,
  CalendarClock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  UserPlus,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  CheckCircle2
} from 'lucide-react';
import { AppStateData, ActiveNavModule, NavModule, Tenant, MonthlyCharge, PaymentRecord, ChequeRecord, OutstandingChargeDetail, RecentActivity } from '../types';
import { formatCurrency, formatNumber } from '../services/dataStore';
import { WinFormsGroupBox } from '../components/winforms/WinFormsGroupBox';

interface DashboardViewProps {
  id?: string;
  appState?: AppStateData;
  tenants?: Tenant[];
  monthlyCharges?: MonthlyCharge[];
  outstandingCharges?: OutstandingChargeDetail[];
  payments?: PaymentRecord[];
  cheques?: ChequeRecord[];
  recentActivities?: RecentActivity[];
  onNavigate: (module: any) => void;
  onNewTenant?: () => void;
  onOpenAddTenant?: () => void;
  onReceivePayment?: () => void;
  onOpenReceivePayment?: () => void;
  onImportExcel?: () => void;
  onOpenImportExcel?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  id,
  appState,
  tenants: propTenants,
  monthlyCharges: propMonthlyCharges,
  outstandingCharges: propOutstandingCharges,
  payments: propPayments,
  cheques: propCheques,
  recentActivities: propRecentActivities,
  onNavigate,
  onNewTenant,
  onOpenAddTenant,
  onReceivePayment,
  onOpenReceivePayment,
  onImportExcel,
  onOpenImportExcel,
}) => {
  // Safe extraction with fallbacks
  const tenants = propTenants || appState?.tenants || [];
  const outstandingCharges = propOutstandingCharges || appState?.outstandingCharges || [];
  const recentActivities = propRecentActivities || appState?.recentActivities || [];
  const cheques = propCheques || appState?.cheques || [];
  const settings = appState?.settings || {
    mallName: 'Safari Mall Doha',
    currency: 'QAR',
    currentMonth: 'August 2026',
    systemDate: '30-Aug-2026',
    propertyManager: 'Admin / Leasing Directorate',
  };

  const handleAddTenant = onNewTenant || onOpenAddTenant || (() => {});
  const handleReceivePayment = onReceivePayment || onOpenReceivePayment || (() => {});
  const handleImportExcel = onImportExcel || onOpenImportExcel || (() => {});

  // Dynamic metric calculations
  const totalTenantsCount = tenants.length;
  const activeContractsCount = tenants.filter((t) => t.status === 'Active').length;
  const expiringSoonCount = tenants.filter((t) => t.status === 'Expiring').length;
  const totalOutstandingAmount = useMemo(() => {
    return outstandingCharges.reduce((sum, chg) => sum + (chg.balance || 0), 0);
  }, [outstandingCharges]);

  return (
    <div id={id} className="p-4 space-y-4 overflow-y-auto h-full text-[12px] font-sans bg-[#F8FAFC]">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#CBD5E1]">
        <div>
          <h1 className="text-[16px] font-bold text-[#1E293B] flex items-center gap-2">
            Executive Property Dashboard
            <span className="text-[11px] font-normal text-slate-500 bg-white px-2 py-0.5 border border-slate-300 rounded-[3px]">
              {settings.mallName}
            </span>
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Key operational leasing, occupancy, collection, and compliance indicators as of {settings.systemDate}.
          </p>
        </div>

        {/* Quick actions strip */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddTenant}
            className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold rounded-[3px] shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Tenant</span>
          </button>
          <button
            type="button"
            onClick={handleReceivePayment}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold rounded-[3px] shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Receive Payment</span>
          </button>
          <button
            type="button"
            onClick={handleImportExcel}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-medium rounded-[3px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Import Excel</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards (Standard WinForms Metric Panels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Tenants */}
        <div
          onClick={() => onNavigate('tenants')}
          className="bg-white border border-[#CBD5E1] rounded-[3px] p-3.5 shadow-xs cursor-pointer hover:border-[#2563EB] transition-all relative overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Tenants
              </span>
              <div className="text-[24px] font-bold text-slate-900 mt-1 leading-tight font-mono">
                {totalTenantsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-emerald-700 font-semibold">96.8%</span> occupancy rate
              </div>
            </div>
            <div className="w-9 h-9 rounded bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Active Contracts */}
        <div
          onClick={() => onNavigate('tenants')}
          className="bg-white border border-[#CBD5E1] rounded-[3px] p-3.5 shadow-xs cursor-pointer hover:border-emerald-600 transition-all relative overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Active Contracts
              </span>
              <div className="text-[24px] font-bold text-emerald-700 mt-1 leading-tight font-mono">
                {activeContractsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-slate-700 font-semibold">{totalTenantsCount - activeContractsCount}</span> pending renewal
              </div>
            </div>
            <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Expiring Contracts */}
        <div
          onClick={() => onNavigate('tenants')}
          className="bg-white border border-[#CBD5E1] rounded-[3px] p-3.5 shadow-xs cursor-pointer hover:border-amber-600 transition-all relative overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Expiring Soon
              </span>
              <div className="text-[24px] font-bold text-amber-700 mt-1 leading-tight font-mono">
                {expiringSoonCount}
              </div>
              <div className="text-[11px] text-amber-800 mt-1 font-medium flex items-center gap-1">
                Within 30 calendar days
              </div>
            </div>
            <div className="w-9 h-9 rounded bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Total Outstanding */}
        <div
          onClick={() => onNavigate('outstanding')}
          className="bg-white border border-[#CBD5E1] rounded-[3px] p-3.5 shadow-xs cursor-pointer hover:border-rose-600 transition-all relative overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Outstanding
              </span>
              <div className="text-[20px] font-bold text-rose-700 mt-1 leading-tight font-mono">
                {formatCurrency(totalOutstandingAmount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                Rent, Electricity & Maintenance
              </div>
            </div>
            <div className="w-9 h-9 rounded bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Recent Activity Table + Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-2">
          <WinFormsGroupBox
            title="Recent Lease & Payment Activity"
            badge={
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="text-[11px] text-[#2563EB] hover:underline font-normal flex items-center gap-0.5 ml-auto cursor-pointer"
              >
                <span>View Reports & Journal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="border border-[#CBD5E1] rounded-[2px] overflow-hidden bg-white">
              <table className="w-full text-left text-[11.5px] border-collapse">
                <thead className="bg-[#E2E8F0] border-b border-[#94A3B8] text-[#1E293B]">
                  <tr>
                    <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold w-36">Date</th>
                    <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold">Tenant</th>
                    <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold">Activity</th>
                    <th className="py-1.5 px-3 font-semibold text-right w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {recentActivities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500 italic">
                        No recent activity recorded.
                      </td>
                    </tr>
                  ) : (
                    recentActivities.slice(0, 8).map((act, index) => (
                      <tr
                        key={act.id}
                        className={index % 2 === 1 ? 'bg-[#F8FAFC] hover:bg-[#F1F5F9]' : 'bg-white hover:bg-[#F1F5F9]'}
                      >
                        <td className="py-2 px-3 border-r border-[#E2E8F0] font-mono text-slate-600">
                          {act.date}
                        </td>
                        <td className="py-2 px-3 border-r border-[#E2E8F0] font-semibold text-slate-800">
                          {act.tenantName}
                        </td>
                        <td className="py-2 px-3 border-r border-[#E2E8F0] text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            {act.type === 'Payment' && <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            {act.type === 'Contract' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                            {act.type === 'Cheque' && <TrendingUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            {act.type === 'Tenant' && <Users className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                            {act.activity}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                          {act.amount !== null && act.amount !== undefined
                            ? formatCurrency(act.amount)
                            : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </WinFormsGroupBox>
        </div>

        {/* Alerts & Critical Action Items (1 Col) */}
        <div className="space-y-2">
          <WinFormsGroupBox title="System Action Alerts & Compliance">
            <div className="space-y-2.5">
              {/* Alert 1: Expiring contracts */}
              <div
                onClick={() => onNavigate('tenants')}
                className="p-3 bg-amber-50/80 border border-amber-300 rounded-[3px] flex items-start gap-2.5 cursor-pointer hover:bg-amber-100/80 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-amber-900">
                    {expiringSoonCount} contracts expiring within 30 days
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                    Send renewal notice or process lease extension addendum.
                  </div>
                  <div className="text-[10.5px] text-[#2563EB] font-semibold mt-1.5 flex items-center gap-1">
                    <span>View in Tenants Hub</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Alert 2: Overdue rent */}
              <div
                onClick={() => onNavigate('outstanding')}
                className="p-3 bg-rose-50/80 border border-rose-300 rounded-[3px] flex items-start gap-2.5 cursor-pointer hover:bg-rose-100/80 transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-rose-900">
                    Overdue receivables: {formatCurrency(totalOutstandingAmount)}
                  </div>
                  <div className="text-[11px] text-rose-800 mt-0.5 leading-snug">
                    Unsettled monthly charges requiring collection follow-up.
                  </div>
                  <div className="text-[10.5px] text-[#2563EB] font-semibold mt-1.5 flex items-center gap-1">
                    <span>Open Outstanding Ledger</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Alert 3: Security cheques */}
              <div
                onClick={() => onNavigate('reports')}
                className="p-3 bg-blue-50/80 border border-blue-300 rounded-[3px] flex items-start gap-2.5 cursor-pointer hover:bg-blue-100/80 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-blue-900">
                    {cheques.filter(c => c.status === 'Bounced').length} bounced &amp; {cheques.filter(c => c.status === 'Received').length} PDCs in custody
                  </div>
                  <div className="text-[11px] text-blue-800 mt-0.5 leading-snug">
                    Track security and post-dated cheques in Cheque Custody report.
                  </div>
                  <div className="text-[10.5px] text-[#2563EB] font-semibold mt-1.5 flex items-center gap-1">
                    <span>Open Custody Register</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </WinFormsGroupBox>
        </div>
      </div>
    </div>
  );
};
