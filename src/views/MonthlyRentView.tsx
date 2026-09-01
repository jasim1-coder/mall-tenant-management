import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  CreditCard,
  Building,
  DollarSign,
  Search,
  Filter,
  Receipt
} from 'lucide-react';
import { MonthlyCharge, PaymentStatus, Tenant } from '../types';
import { WinFormsDataGridView, ColumnDef } from '../components/winforms/WinFormsDataGridView';
import { formatCurrency } from '../services/dataStore';

interface MonthlyRentViewProps {
  id?: string;
  monthlyCharges: MonthlyCharge[];
  onReceivePaymentForCharge?: (charge: MonthlyCharge) => void;
  onGenerateCharges?: (month: string) => void;
  onViewTenantDetails?: (tenantId: string) => void;
}

export const MonthlyRentView: React.FC<MonthlyRentViewProps> = ({
  id,
  monthlyCharges,
  onReceivePaymentForCharge,
  onGenerateCharges,
  onViewTenantDetails,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(
    monthlyCharges[0]?.id || null
  );

  const monthsList = [
    'August 2026',
    'July 2026',
    'June 2026',
    'May 2026',
    'September 2026',
  ];

  // Filter charges based on month, search, and status
  const filteredCharges = useMemo(() => {
    return monthlyCharges.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.tenantName.toLowerCase().includes(q) ||
        c.shopNumber.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesMonth = c.month === selectedMonth;

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [monthlyCharges, searchQuery, statusFilter, selectedMonth]);

  // Aggregate summary metrics for selected month
  const metrics = useMemo(() => {
    const relevant = monthlyCharges.filter((c) => c.month === selectedMonth);
    const totalRent = relevant.reduce((sum, c) => sum + c.rent, 0);
    const totalMaint = relevant.reduce((sum, c) => sum + c.maintenance, 0);
    const totalElec = relevant.reduce((sum, c) => sum + c.electricity, 0);
    const totalCollected = relevant.reduce((sum, c) => sum + c.paid, 0);
    const totalOutstanding = relevant.reduce((sum, c) => sum + c.outstanding, 0);
    const totalDue = relevant.reduce((sum, c) => sum + c.totalDue, 0);

    return {
      totalRent,
      totalMaint,
      totalElec,
      totalCollected,
      totalOutstanding,
      totalDue,
      collectionRate: totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0,
    };
  }, [monthlyCharges, selectedMonth]);

  const columns: ColumnDef<MonthlyCharge>[] = [
    {
      key: 'tenantName',
      header: 'Tenant Name',
      width: '190px',
      render: (c) => (
        <span className="font-semibold text-[#0F172A]">{c.tenantName}</span>
      ),
    },
    {
      key: 'shopNumber',
      header: 'Shop',
      width: '85px',
      render: (c) => (
        <span className="font-mono font-medium text-slate-700 bg-blue-50/70 border border-blue-200 px-1.5 py-0.5 rounded-[2px]">
          {c.shopNumber}
        </span>
      ),
    },
    {
      key: 'rent',
      header: 'Rent',
      width: '105px',
      align: 'right',
      render: (c) => (
        <span className="font-mono text-slate-800">{c.rent.toLocaleString()}</span>
      ),
    },
    {
      key: 'maintenance',
      header: 'Maintenance',
      width: '100px',
      align: 'right',
      render: (c) => (
        <span className="font-mono text-slate-600">{c.maintenance.toLocaleString()}</span>
      ),
    },
    {
      key: 'electricity',
      header: 'Electricity',
      width: '95px',
      align: 'right',
      render: (c) => (
        <span className="font-mono text-slate-600">{c.electricity.toLocaleString()}</span>
      ),
    },
    {
      key: 'totalDue',
      header: 'Total Due',
      width: '115px',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
          {c.totalDue.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paid',
      header: 'Paid',
      width: '105px',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-semibold text-emerald-800">
          {c.paid.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      width: '115px',
      align: 'right',
      render: (c) => (
        <span
          className={`font-mono font-bold ${
            c.outstanding > 0 ? 'text-rose-700' : 'text-slate-400'
          }`}
        >
          {c.outstanding.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      align: 'center',
      render: (c) => {
        if (c.status === 'Paid') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Paid
            </span>
          );
        }
        if (c.status === 'Partial') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              Partial
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            Unpaid
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      width: '100px',
      align: 'center',
      sortable: false,
      render: (c) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReceivePaymentForCharge?.(c);
          }}
          disabled={c.outstanding === 0}
          className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:hover:bg-emerald-700 text-white rounded-[2px] text-[10.5px] font-semibold flex items-center gap-1 mx-auto transition-colors"
          title="Collect pending balance for this tenant"
        >
          <Receipt className="w-3 h-3" />
          <span>Pay</span>
        </button>
      ),
    },
  ];

  return (
    <div id={id} className="p-3.5 space-y-3 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Top Controls & Month Picker */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700 text-[12px]">Month:</label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-[#94A3B8] rounded-[2px] px-3 py-1 font-semibold text-[12px] text-slate-900 focus:border-[#2563EB] focus:outline-none"
            >
              {monthsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onGenerateCharges?.(selectedMonth)}
            className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Generate / View Charges</span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
          <div className="relative flex-1 max-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenant / shop..."
              className="w-full pl-7 pr-2 py-0.5 text-[11.5px] bg-white border border-[#CBD5E1] rounded-[2px]"
            />
          </div>

          <div className="flex items-center gap-1 text-[11.5px]">
            <label className="text-slate-600">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 text-[11.5px]"
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Total Rent */}
        <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs">
          <div className="text-[10.5px] font-semibold uppercase text-slate-500">
            Total Rent
          </div>
          <div className="text-[16px] font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(metrics.totalRent)}
          </div>
        </div>

        {/* Total Maintenance */}
        <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs">
          <div className="text-[10.5px] font-semibold uppercase text-slate-500">
            Total Maintenance
          </div>
          <div className="text-[16px] font-bold font-mono text-slate-700 mt-0.5">
            {formatCurrency(metrics.totalMaint)}
          </div>
        </div>

        {/* Total Electricity */}
        <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs">
          <div className="text-[10.5px] font-semibold uppercase text-slate-500">
            Total Electricity
          </div>
          <div className="text-[16px] font-bold font-mono text-slate-700 mt-0.5">
            {formatCurrency(metrics.totalElec)}
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white border border-emerald-300 bg-emerald-50/40 rounded-[3px] p-2.5 shadow-xs">
          <div className="text-[10.5px] font-semibold uppercase text-emerald-800 flex items-center justify-between">
            <span>Total Collected</span>
            <span className="font-bold">{metrics.collectionRate}%</span>
          </div>
          <div className="text-[16px] font-bold font-mono text-emerald-800 mt-0.5">
            {formatCurrency(metrics.totalCollected)}
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white border border-rose-300 bg-rose-50/40 rounded-[3px] p-2.5 shadow-xs">
          <div className="text-[10.5px] font-semibold uppercase text-rose-800">
            Total Outstanding
          </div>
          <div className="text-[16px] font-bold font-mono text-rose-700 mt-0.5">
            {formatCurrency(metrics.totalOutstanding)}
          </div>
        </div>
      </div>

      {/* Main DataGridView */}
      <WinFormsDataGridView<MonthlyCharge>
        id="monthly-rent-datagridview"
        columns={columns}
        data={filteredCharges}
        keyExtractor={(c) => c.id}
        selectedId={selectedChargeId}
        onRowSelect={(c) => setSelectedChargeId(c.id)}
        onRowDoubleClick={(c) => onViewTenantDetails?.(c.tenantId)}
        emptyMessage={`No monthly rent records found for ${selectedMonth}.`}
      />
    </div>
  );
};
