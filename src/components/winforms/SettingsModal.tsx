import React, { useState } from 'react';
import { X, Settings, Database, RefreshCw, Check } from 'lucide-react';
import { WinFormsGroupBox } from './WinFormsGroupBox';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  const [mallName, setMallName] = useState('Safari Mall Doha');
  const [currency, setCurrency] = useState('QAR');
  const [fiscalYear, setFiscalYear] = useState('2026 (Calendar Jan-Dec)');
  const [autoAllocation, setAutoAllocation] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[0.5px] p-4">
      <div className="bg-[#F1F5F9] border-2 border-[#475569] rounded-[4px] shadow-2xl w-[520px] max-w-full flex flex-col overflow-hidden text-[12px] font-sans">
        {/* Titlebar */}
        <div className="bg-[#1E293B] text-white px-3.5 py-1.5 flex items-center justify-between select-none">
          <span className="font-semibold text-[12.5px] tracking-wide flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#38BDF8]" />
            System Configuration &amp; Preferences
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white hover:bg-rose-600 px-1 py-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-4 space-y-3.5 bg-[#F8FAFC]">
          <WinFormsGroupBox title="Mall Property & Accounting Profile">
            <div className="space-y-2.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mall Facility Name</label>
                <input
                  type="text"
                  value={mallName}
                  onChange={(e) => setMallName(e.target.value)}
                  className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Operating Currency</label>
                  <input
                    type="text"
                    value={currency}
                    disabled
                    className="w-full px-2.5 py-1 text-[12px] font-mono font-bold bg-slate-100 border border-[#CBD5E1] rounded-[2px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fiscal Year Cycle</label>
                  <input
                    type="text"
                    value={fiscalYear}
                    disabled
                    className="w-full px-2.5 py-1 text-[12px] bg-slate-100 border border-[#CBD5E1] rounded-[2px]"
                  />
                </div>
              </div>
            </div>
          </WinFormsGroupBox>

          <WinFormsGroupBox title="Payment Rules &amp; Demo Data">
            <div className="space-y-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAllocation}
                  onChange={(e) => setAutoAllocation(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span className="text-slate-800">
                  Enforce strict <strong>First-In-First-Out (FIFO)</strong> payment allocation
                </span>
              </label>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-[11.5px]">Reset Prototype Data</div>
                  <div className="text-[10.5px] text-slate-500">Restore all dummy tenants, contracts, charges &amp; cheques</div>
                </div>
                <button
                  type="button"
                  onClick={onResetData}
                  className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-semibold text-[11px] rounded-[2px] shadow-2xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restore Factory Defaults</span>
                </button>
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
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
