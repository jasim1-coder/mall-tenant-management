import React, { useState, useEffect } from 'react';
import { X, RotateCw, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { Tenant } from '../types';
import { WinFormsGroupBox } from '../components/winforms/WinFormsGroupBox';
import { formatCurrency } from '../services/dataStore';

interface RenewContractModalProps {
  id?: string;
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRenewal: (tenantId: string, newEndDate: string, newMonthlyRent: number, remarks: string) => void;
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({
  id,
  tenant,
  isOpen,
  onClose,
  onConfirmRenewal,
}) => {
  const [newStartDate, setNewStartDate] = useState('01-Jan-2027');
  const [newEndDate, setNewEndDate] = useState('31-Dec-2027');
  const [newRent, setNewRent] = useState<number>(15000);
  const [escalationPercent, setEscalationPercent] = useState<number>(5);
  const [renewalRemarks, setRenewalRemarks] = useState('');

  useEffect(() => {
    if (tenant) {
      // Calculate a standard 1 year renewal from previous end date
      setNewStartDate(tenant.contractEnd || '01-Jan-2027');
      setNewEndDate('31-Dec-2027');
      const calculatedRent = Math.round(tenant.monthlyRent * 1.05);
      setNewRent(calculatedRent);
      setEscalationPercent(5);
      setRenewalRemarks(`Contract renewed for 12 months with 5% lease escalation.`);
    }
  }, [tenant, isOpen]);

  if (!isOpen || !tenant) return null;

  const handleEscalationChange = (pct: number) => {
    setEscalationPercent(pct);
    const newAmt = Math.round(tenant.monthlyRent * (1 + pct / 100));
    setNewRent(newAmt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmRenewal(tenant.id, newEndDate, Number(newRent), renewalRemarks);
    onClose();
  };

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[0.5px] p-4"
    >
      <div className="bg-[#F1F5F9] border-2 border-[#475569] rounded-[4px] shadow-2xl w-[580px] max-w-full flex flex-col overflow-hidden text-[12px] font-sans">
        {/* WinForms Titlebar */}
        <div className="bg-[#1E293B] text-white px-3.5 py-1.5 flex items-center justify-between select-none">
          <span className="font-semibold text-[12.5px] tracking-wide flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-[#38BDF8]" />
            Renew Lease Contract: {tenant.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white hover:bg-rose-600 px-1 py-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-[#F8FAFC]">
          {/* Current Contract Snapshot */}
          <div className="p-3 bg-white border border-[#CBD5E1] rounded-[2px] grid grid-cols-2 gap-2 text-[11.5px]">
            <div>
              <span className="text-slate-500 block">Tenant Name:</span>
              <strong className="text-slate-900">{tenant.name}</strong> ({tenant.accountCode})
            </div>
            <div>
              <span className="text-slate-500 block">Shop &amp; Area:</span>
              <strong className="text-slate-900">{tenant.shopNumber}</strong> • {tenant.areaSqM} m²
            </div>
            <div>
              <span className="text-slate-500 block">Current Lease Term:</span>
              <span className="font-mono text-slate-700">{tenant.contractStart} to {tenant.contractEnd}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Current Monthly Rent:</span>
              <strong className="font-mono text-slate-900">{formatCurrency(tenant.monthlyRent)}</strong>
            </div>
          </div>

          {/* New Renewal Terms */}
          <WinFormsGroupBox title="New Renewal Terms">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Renewal Start Date
                  </label>
                  <input
                    type="text"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    New Contract End Date
                  </label>
                  <input
                    type="text"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px]"
                    required
                  />
                </div>
              </div>

              {/* Rent Adjustment & Escalation */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Annual Escalation (%)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[0, 5, 7.5, 10].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleEscalationChange(pct)}
                        className={`px-2 py-0.5 text-[11px] font-mono rounded border ${
                          escalationPercent === pct
                            ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        +{pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    New Monthly Rent (QAR)
                  </label>
                  <input
                    type="number"
                    value={newRent}
                    onChange={(e) => {
                      setNewRent(Number(e.target.value));
                      setEscalationPercent(0);
                    }}
                    className="w-full px-2.5 py-1 text-[12px] font-mono font-bold bg-white border border-[#CBD5E1] rounded-[2px]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Renewal Remarks / Addendum Note
                </label>
                <textarea
                  rows={2}
                  value={renewalRemarks}
                  onChange={(e) => setRenewalRemarks(e.target.value)}
                  className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px]"
                ></textarea>
              </div>
            </div>
          </WinFormsGroupBox>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#CBD5E1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white text-slate-700 font-medium text-[12px] rounded-[3px] border border-[#CBD5E1] hover:bg-[#E2E8F0] shadow-sm min-w-[75px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-[#2563EB] text-white font-semibold text-[12px] rounded-[3px] border border-[#1D4ED8] hover:bg-[#1D4ED8] shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm &amp; Issue Renewal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
