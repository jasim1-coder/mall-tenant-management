import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Save,
  RotateCcw
} from 'lucide-react';
import { Tenant, OutstandingChargeDetail, PaymentRecord } from '../types';
import { WinFormsGroupBox } from '../components/winforms/WinFormsGroupBox';
import { calculateFifoAllocation, formatCurrency } from '../services/dataStore';

interface PaymentEntryViewProps {
  id?: string;
  tenants: Tenant[];
  outstandingCharges: OutstandingChargeDetail[];
  initialTenantId?: string | null;
  onSavePayment: (payment: Partial<PaymentRecord>) => void;
  onCancel: () => void;
}

export const PaymentEntryView: React.FC<PaymentEntryViewProps> = ({
  id,
  tenants,
  outstandingCharges,
  initialTenantId,
  onSavePayment,
  onCancel,
}) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    initialTenantId || tenants[0]?.id || ''
  );
  const [paymentDate, setPaymentDate] = useState('30-Aug-2026');
  const [paymentMethod, setPaymentMethod] = useState<'Cheque' | 'Bank Transfer' | 'Cash' | 'Credit Card'>('Cheque');
  const [referenceNo, setReferenceNo] = useState('CHQ-45821');
  const [paymentAmount, setPaymentAmount] = useState<number>(20000);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialTenantId) {
      setSelectedTenantId(initialTenantId);
    }
  }, [initialTenantId]);

  const currentTenant = useMemo(() => {
    return tenants.find((t) => t.id === selectedTenantId) || tenants[0];
  }, [tenants, selectedTenantId]);

  // Outstanding charges for the selected tenant sorted by priority (FIFO)
  const tenantCharges = useMemo(() => {
    if (!currentTenant) return [];
    return outstandingCharges
      .filter((c) => c.tenantId === currentTenant.id && c.balance > 0)
      .sort((a, b) => a.priority - b.priority);
  }, [outstandingCharges, currentTenant]);

  // Compute FIFO allocation
  const fifoResult = useMemo(() => {
    return calculateFifoAllocation(tenantCharges, paymentAmount);
  }, [tenantCharges, paymentAmount]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || paymentAmount <= 0) return;

    const allocatedCharges = fifoResult.allocations
      .filter((a) => a.allocated > 0)
      .map((a) => {
        const matching = tenantCharges.find((c) => c.id === a.chargeId);
        return {
          chargeDetailId: a.chargeId,
          chargeType: matching?.chargeType || 'Charge',
          month: matching?.month || 'Current',
          allocated: a.allocated,
        };
      });

    onSavePayment({
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      shopNumber: currentTenant.shopNumber,
      date: paymentDate,
      paymentMethod,
      referenceNo,
      amount: paymentAmount,
      allocatedAmount: fifoResult.totalAllocated,
      unallocatedAmount: fifoResult.remainingAmount,
      allocatedCharges,
      notes: paymentNotes || `${paymentMethod} payment allocated by FIFO`,
    });

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
    }, 2500);
  };

  return (
    <div id={id} className="p-4 space-y-4 h-full overflow-y-auto bg-[#F8FAFC] text-[12px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#CBD5E1]">
        <div>
          <h1 className="text-[16px] font-bold text-[#1E293B] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Receive Tenant Payment
          </h1>
          <p className="text-slate-500 text-[11px]">
            Record cash, bank transfer, or cheque collections with automatic First-In-First-Out (FIFO) charge settlement.
          </p>
        </div>

        {isSavedSuccess && (
          <div className="px-3 py-1 bg-emerald-100 border border-emerald-400 text-emerald-800 rounded-[3px] font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Payment successfully posted and allocated!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-4xl">
        {/* 1. Payment Header Inputs */}
        <WinFormsGroupBox title="Payment & Receipt Parameters">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Tenant Dropdown */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tenant <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full px-2.5 py-1 text-[12px] font-semibold bg-white border border-[#CBD5E1] rounded-[2px] focus:border-[#2563EB]"
                required
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shopNumber})
                  </option>
                ))}
              </select>
              {currentTenant && (
                <div className="text-[10.5px] text-slate-500 mt-1">
                  Shop: <strong>{currentTenant.shopNumber}</strong> | Code: {currentTenant.accountCode}
                </div>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Payment Date
              </label>
              <input
                type="text"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px]"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px]"
              >
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            {/* Reference / Cheque No */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Reference / Cheque No
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. CHQ-45821"
                className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px]"
                required
              />
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Amount <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-[11px]">
                  QAR
                </span>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-3 py-1 text-[13px] font-mono font-bold text-slate-900 bg-white border border-[#2563EB] rounded-[2px] focus:ring-1 focus:ring-[#2563EB]"
                  required
                />
              </div>
            </div>

            {/* Remarks / Memo */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Payment Memo
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Remarks or bank branch..."
                className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px]"
              />
            </div>
          </div>
        </WinFormsGroupBox>

        {/* 2. Interactive FIFO Outstanding Charges Breakdown Table */}
        <WinFormsGroupBox
          title={`Outstanding Charges: ${currentTenant?.name || 'Selected Tenant'}`}
          badge={
            <span className="text-[10.5px] font-normal text-slate-500">
              {tenantCharges.length} open unpaid charges
            </span>
          }
        >
          <div className="space-y-3">
            <div className="border border-[#CBD5E1] rounded-[2px] overflow-hidden bg-white">
              <table className="w-full text-left text-[11.5px] border-collapse">
                <thead className="bg-[#E2E8F0] border-b border-[#94A3B8] text-[#1E293B]">
                  <tr>
                    <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold w-16 text-center">Priority</th>
                    <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold">Charge</th>
                    <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold">Month</th>
                    <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold text-right">Outstanding (QAR)</th>
                    <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold text-right bg-emerald-50/70 text-emerald-950">
                      Allocate (QAR)
                    </th>
                    <th className="py-1.5 px-3 font-semibold text-right text-slate-600">Remaining Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {tenantCharges.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 italic">
                        ✓ No pending outstanding charges for this tenant. All ledger bills are settled.
                      </td>
                    </tr>
                  ) : (
                    tenantCharges.map((chg) => {
                      const allocation = fifoResult.allocations.find((a) => a.chargeId === chg.id);
                      const allocatedAmt = allocation?.allocated || 0;
                      const remBalance = allocation?.remainingBalance ?? chg.balance;

                      return (
                        <tr
                          key={chg.id}
                          className={allocatedAmt > 0 ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}
                        >
                          <td className="py-2 px-3 border-r border-[#E2E8F0] text-center font-mono font-bold text-slate-700">
                            {chg.priority}
                          </td>
                          <td className="py-2 px-3 border-r border-[#E2E8F0] font-semibold text-slate-800">
                            {chg.chargeType}
                          </td>
                          <td className="py-2 px-3 border-r border-[#E2E8F0] font-mono text-slate-600">
                            {chg.month}
                          </td>
                          <td className="py-2 px-3 border-r border-[#E2E8F0] text-right font-mono font-medium text-slate-800">
                            {chg.balance.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 border-r border-[#E2E8F0] text-right font-mono font-bold text-emerald-700 bg-emerald-50/50">
                            {allocatedAmt.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-500">
                            {remBalance.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Allocation Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white border border-[#CBD5E1] rounded-[2px] shadow-xs">
              <div>
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase">
                  Payment
                </span>
                <div className="text-[16px] font-bold font-mono text-slate-900">
                  {formatCurrency(paymentAmount)}
                </div>
              </div>
              <div>
                <span className="text-[10.5px] font-semibold text-emerald-700 uppercase">
                  Allocated
                </span>
                <div className="text-[16px] font-bold font-mono text-emerald-700">
                  {formatCurrency(fifoResult.totalAllocated)}
                </div>
              </div>
              <div>
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase">
                  Remaining (Unallocated)
                </span>
                <div className={`text-[16px] font-bold font-mono ${fifoResult.remainingAmount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                  {formatCurrency(fifoResult.remainingAmount)}
                </div>
              </div>
            </div>

            {/* Note badge */}
            <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-[2px] flex items-center gap-2 text-[11.5px]">
              <HelpCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>FIFO Business Rule:</strong> Payment is allocated to the oldest outstanding charges first (Priority 1 through N). Any surplus balance is held as unallocated credit.
              </span>
            </div>
          </div>
        </WinFormsGroupBox>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#CBD5E1]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 bg-white text-slate-700 font-medium text-[12px] rounded-[3px] border border-[#CBD5E1] hover:bg-[#E2E8F0] shadow-sm min-w-[75px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-1.5 bg-emerald-700 text-white font-semibold text-[12px] rounded-[3px] border border-emerald-800 hover:bg-emerald-800 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Payment</span>
          </button>
        </div>
      </form>
    </div>
  );
};
