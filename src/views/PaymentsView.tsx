import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  Download,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { PaymentRecord, Tenant } from '../types';
import { WinFormsDataGridView, ColumnDef } from '../components/winforms/WinFormsDataGridView';
import { formatCurrency } from '../services/dataStore';

interface PaymentsViewProps {
  id?: string;
  payments: PaymentRecord[];
  tenants: Tenant[];
  onOpenNewPayment: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  id,
  payments,
  tenants,
  onOpenNewPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    payments[0]?.id || null
  );

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.receiptNo.toLowerCase().includes(q) ||
        p.tenantName.toLowerCase().includes(q) ||
        p.referenceNo.toLowerCase().includes(q);

      const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, searchQuery, methodFilter]);

  const totalCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const columns: ColumnDef<PaymentRecord>[] = [
    {
      key: 'receiptNo',
      header: 'Receipt No',
      width: '130px',
      render: (p) => (
        <span className="font-mono font-bold text-[#1E3A8A] bg-blue-50/70 border border-blue-200 px-2 py-0.5 rounded">
          {p.receiptNo}
        </span>
      ),
    },
    {
      key: 'tenantName',
      header: 'Tenant Name',
      width: '210px',
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-900">{p.tenantName}</div>
          <div className="text-[10px] text-slate-500 font-mono">Shop: {p.shopNumber}</div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: '120px',
      render: (p) => <span className="font-mono text-slate-700">{p.date}</span>,
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      width: '120px',
      render: (p) => (
        <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 border border-slate-300 text-slate-800">
          {p.paymentMethod}
        </span>
      ),
    },
    {
      key: 'referenceNo',
      header: 'Ref / Cheque No',
      width: '140px',
      render: (p) => (
        <span className="font-mono text-slate-700">{p.referenceNo}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Received',
      width: '140px',
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-emerald-800 text-[12.5px]">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      key: 'allocatedAmount',
      header: 'Allocated (FIFO)',
      width: '130px',
      align: 'right',
      render: (p) => (
        <span className="font-mono text-slate-800">
          {formatCurrency(p.allocatedAmount)}
        </span>
      ),
    },
    {
      key: 'unallocatedAmount',
      header: 'Credit Balance',
      width: '120px',
      align: 'right',
      render: (p) => (
        <span className={`font-mono ${p.unallocatedAmount > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
          {formatCurrency(p.unallocatedAmount)}
        </span>
      ),
    },
  ];

  return (
    <div id={id} className="p-3.5 space-y-3 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Top Bar */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
          <div className="relative w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt / tenant / ref..."
              className="w-full pl-8 pr-2 py-0.5 text-[11.5px] bg-white border border-[#CBD5E1] rounded-[2px]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-700">Method:</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 text-[11.5px]"
            >
              <option value="All">All Methods</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 font-semibold font-mono text-[11.5px]">
            Total Collections: {formatCurrency(totalCollected)}
          </div>
          <button
            type="button"
            onClick={onOpenNewPayment}
            className="px-3.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Receive Payment</span>
          </button>
        </div>
      </div>

      {/* Main DataGridView */}
      <div className="flex-1 flex flex-col min-h-0">
        <WinFormsDataGridView<PaymentRecord>
          id="payments-datagridview"
          columns={columns}
          data={filteredPayments}
          keyExtractor={(p) => p.id}
          selectedId={selectedPaymentId}
          onRowSelect={(p) => setSelectedPaymentId(p.id)}
          maxHeight="calc(100vh - 270px)"
          emptyMessage="No payment transaction records found."
        />
      </div>
    </div>
  );
};
