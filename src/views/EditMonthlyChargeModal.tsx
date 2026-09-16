import React, { useState, useEffect } from 'react';
import {
  Zap,
  Droplets,
  Flame,
  Wrench,
  Building2,
  Save,
  X,
  PlusCircle,
  Sliders
} from 'lucide-react';
import { MonthlyCharge, Tenant, UtilityMeterReading } from '../types';

interface EditMonthlyChargeModalProps {
  isOpen: boolean;
  charge: MonthlyCharge | null;
  tenants: Tenant[];
  defaultMonth?: string;
  onClose: () => void;
  onSave: (values: {
    id?: string;
    tenantId: string;
    tenantName: string;
    shopNumber: string;
    month: string;
    rent: number;
    maintenance: number;
    electricity: number;
    water: number;
    gas: number;
    electricityMeter?: UtilityMeterReading;
    waterMeter?: UtilityMeterReading;
  }) => void;
}

export const EditMonthlyChargeModal: React.FC<EditMonthlyChargeModalProps> = ({
  isOpen,
  charge,
  tenants,
  defaultMonth = 'August 2026',
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isNew = !charge;

  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    charge?.tenantId || tenants[0]?.id || ''
  );
  const [month, setMonth] = useState<string>(charge?.month || defaultMonth);
  const [rent, setRent] = useState<number>(charge?.rent || 0);
  const [maintenance, setMaintenance] = useState<number>(charge?.maintenance || 0);
  const [electricity, setElectricity] = useState<number>(charge?.electricity || 0);
  const [water, setWater] = useState<number>(charge?.water || 0);
  const [gas, setGas] = useState<number>(charge?.gas || 0);

  // Locked Previous Readings
  const [elecPrev, setElecPrev] = useState<number>(
    charge?.electricityMeter?.prevReading !== undefined ? charge.electricityMeter.prevReading : 12000
  );
  const [elecCurr, setElecCurr] = useState<string>(
    charge?.electricityMeter?.currReading !== undefined ? String(charge.electricityMeter.currReading) : '12500'
  );
  const elecRate = charge?.electricityMeter?.ratePerUnit || 0.32;

  const [waterPrev, setWaterPrev] = useState<number>(
    charge?.waterMeter?.prevReading !== undefined ? charge.waterMeter.prevReading : 450
  );
  const [waterCurr, setWaterCurr] = useState<string>(
    charge?.waterMeter?.currReading !== undefined ? String(charge.waterMeter.currReading) : '485'
  );
  const waterRate = charge?.waterMeter?.ratePerUnit || 4.40;

  const [gasPrev, setGasPrev] = useState<number>(100);
  const [gasCurr, setGasCurr] = useState<string>('150');
  const gasRate = 1.50;

  useEffect(() => {
    if (charge) {
      setSelectedTenantId(charge.tenantId);
      setMonth(charge.month);
      setRent(charge.rent || 0);
      setMaintenance(charge.maintenance || 0);
      setElectricity(charge.electricity || 0);
      setWater(charge.water || 0);
      setGas(charge.gas || 0);

      if (charge.electricityMeter) {
        setElecPrev(charge.electricityMeter.prevReading ?? 12000);
        setElecCurr(String(charge.electricityMeter.currReading ?? 12500));
      }
      if (charge.waterMeter) {
        setWaterPrev(charge.waterMeter.prevReading ?? 450);
        setWaterCurr(String(charge.waterMeter.currReading ?? 485));
      }
    } else {
      const firstTenant = tenants[0];
      if (firstTenant) {
        setSelectedTenantId(firstTenant.id);
        setRent(firstTenant.monthlyRent || 0);
        setMaintenance(1000);
      }
      setMonth(defaultMonth);
      setElectricity(160);
      setWater(154);
      setGas(75);
      setElecPrev(12000);
      setElecCurr('12500');
      setWaterPrev(450);
      setWaterCurr('485');
      setGasPrev(100);
      setGasCurr('150');
    }
  }, [charge, isOpen, defaultMonth, tenants]);

  // Recalculate Electricity when Current changes
  const handleElecCurrChange = (currStr: string) => {
    setElecCurr(currStr);
    const c = parseFloat(currStr);
    if (!isNaN(c) && c >= elecPrev) {
      const units = c - elecPrev;
      setElectricity(Math.round(units * elecRate * 100) / 100);
    }
  };

  // Recalculate Water when Current changes
  const handleWaterCurrChange = (currStr: string) => {
    setWaterCurr(currStr);
    const c = parseFloat(currStr);
    if (!isNaN(c) && c >= waterPrev) {
      const units = c - waterPrev;
      setWater(Math.round(units * waterRate * 100) / 100);
    }
  };

  // Recalculate Gas when Current changes
  const handleGasCurrChange = (currStr: string) => {
    setGasCurr(currStr);
    const c = parseFloat(currStr);
    if (!isNaN(c) && c >= gasPrev) {
      const units = c - gasPrev;
      setGas(Math.round(units * gasRate * 100) / 100);
    }
  };

  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const selected = tenants.find((t) => t.id === tenantId);
    if (selected) {
      setRent(selected.monthlyRent || 0);
    }
  };

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || {
    id: selectedTenantId,
    name: charge?.tenantName || 'Selected Tenant',
    shopNumber: charge?.shopNumber || 'S-100',
  };

  const elecUnitsNet = Math.max(0, (parseFloat(elecCurr) || 0) - elecPrev);
  const waterUnitsNet = Math.max(0, (parseFloat(waterCurr) || 0) - waterPrev);
  const gasUnitsNet = Math.max(0, (parseFloat(gasCurr) || 0) - gasPrev);

  const totalDue = (rent || 0) + (maintenance || 0) + (electricity || 0) + (water || 0) + (gas || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) return;

    onSave({
      id: charge?.id,
      tenantId: selectedTenantId,
      tenantName: selectedTenant.name,
      shopNumber: selectedTenant.shopNumber,
      month,
      rent,
      maintenance,
      electricity,
      water,
      gas,
      electricityMeter: {
        prevReading: elecPrev,
        currReading: parseFloat(elecCurr) || 0,
        unitsUsed: elecUnitsNet,
        ratePerUnit: elecRate,
      },
      waterMeter: {
        prevReading: waterPrev,
        currReading: parseFloat(waterCurr) || 0,
        unitsUsed: waterUnitsNet,
        ratePerUnit: waterRate,
      },
    });
    onClose();
  };

  const monthsList = [
    'August 2026',
    'September 2026',
    'October 2026',
    'November 2026',
    'December 2026',
    'July 2026',
    'June 2026',
    'May 2026',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-3">
      <div className="bg-[#ECE9D8] border-2 border-[#0055EA] rounded-[3px] shadow-2xl w-full max-w-[430px] overflow-hidden flex flex-col font-sans text-[11.5px]">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0055EA] via-[#2A75F3] to-[#0055EA] text-white px-3 py-1.5 flex items-center justify-between font-semibold select-none shadow-inner">
          <div className="flex items-center gap-1.5">
            {isNew ? (
              <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span className="text-[12px] font-bold">
              {isNew ? 'New Bill & Utilities' : 'Set Monthly Bill & Utilities'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-4 h-4 bg-[#D9381E] hover:bg-[#E81123] text-white rounded-[2px] flex items-center justify-center font-bold text-[10px] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="p-2.5 space-y-2 bg-[#F8FAFC]">
          {/* Tenant Line */}
          {isNew ? (
            <div className="grid grid-cols-2 gap-2 bg-white p-2 border border-[#CBD5E1] rounded-[2px]">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Tenant:</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleTenantSelect(e.target.value)}
                  className="w-full bg-white border border-[#94A3B8] rounded-[2px] px-1.5 py-0.5 text-[11px] font-semibold text-slate-900 focus:outline-none"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shopNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Month:</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-white border border-[#94A3B8] rounded-[2px] px-1.5 py-0.5 text-[11px] font-semibold text-slate-900 focus:outline-none"
                >
                  {monthsList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="bg-white px-2.5 py-1.5 border border-[#CBD5E1] rounded-[2px] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-[12px]">{charge.tenantName}</span>
                <span className="text-slate-500 text-[10.5px] ml-1.5">
                  ({charge.shopNumber}) • <strong className="text-blue-700">{charge.month}</strong>
                </span>
              </div>
              {charge.paid > 0 && (
                <span className="text-[10.5px] font-mono text-emerald-700 font-bold">
                  Paid: QAR {charge.paid.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Charges Grid */}
          <div className="bg-white border border-[#CBD5E1] rounded-[2px] p-2 space-y-1.5">
            {/* 1. Base Rent (Fixed from Contract) */}
            <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Base Rent:</span>
              </span>
              <div className="font-mono font-bold text-[12px] text-slate-900">
                QAR {rent.toLocaleString()}
              </div>
            </div>

            {/* 2. Maintenance */}
            <div className="flex items-center justify-between px-2 py-0.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                <span>CAM / Maint:</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400">QAR</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={maintenance || ''}
                  onChange={(e) => setMaintenance(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-24 bg-white border border-[#94A3B8] rounded-[2px] px-1.5 py-0.5 text-right font-mono font-bold text-slate-900 focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 my-1" />

            {/* 3. Electricity */}
            <div className="space-y-1 bg-amber-50/50 p-2 rounded border border-amber-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Electricity (kWh)
                </span>
                <span className="text-[10px] font-mono text-amber-900">
                  {elecUnitsNet.toLocaleString()} units @{elecRate}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 text-[11px]">
                {/* Previous Reading */}
                <div className="flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10.5px]">
                  <span className="text-slate-500 font-medium">Prev:</span>
                  <strong className="font-mono text-slate-800">{elecPrev.toLocaleString()}</strong>
                </div>

                {/* Enter Current Reading */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-700 font-semibold text-[10.5px]">Current:</span>
                  <input
                    type="number"
                    value={elecCurr}
                    onChange={(e) => handleElecCurrChange(e.target.value)}
                    placeholder="Current"
                    className="w-18 bg-white border border-amber-400 rounded-[2px] px-1.5 py-0.5 text-right font-mono font-bold text-[11px] text-amber-950 focus:outline-none"
                  />
                </div>

                {/* Amount */}
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-[10px] text-slate-400">QAR</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={electricity || ''}
                    onChange={(e) => setElectricity(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-18 bg-white border border-amber-300 rounded-[2px] px-1.5 py-0.5 text-right font-mono font-bold text-amber-950 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Water */}
            <div className="space-y-1 bg-cyan-50/50 p-2 rounded border border-cyan-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-cyan-950 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                  Water (m³)
                </span>
                <span className="text-[10px] font-mono text-cyan-900">
                  {waterUnitsNet.toLocaleString()} units @{waterRate}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 text-[11px]">
                {/* Previous Reading */}
                <div className="flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10.5px]">
                  <span className="text-slate-500 font-medium">Prev:</span>
                  <strong className="font-mono text-slate-800">{waterPrev.toLocaleString()}</strong>
                </div>

                {/* Enter Current Reading */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-700 font-semibold text-[10.5px]">Current:</span>
                  <input
                    type="number"
                    value={waterCurr}
                    onChange={(e) => handleWaterCurrChange(e.target.value)}
                    placeholder="Current"
                    className="w-18 bg-white border border-cyan-400 rounded-[2px] px-1.5 py-0.5 text-right font-mono font-bold text-[11px] text-cyan-950 focus:outline-none"
                  />
                </div>

                {/* Amount */}
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-[10px] text-slate-400">QAR</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={water || ''}
                    onChange={(e) => setWater(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-18 bg-white border border-cyan-300 rounded-[2px] px-1.5 py-0.5 text-right font-mono font-bold text-cyan-950 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 5. Gas */}
            <div className="space-y-1 bg-orange-50/50 p-2 rounded border border-orange-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-orange-950 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  Gas / Chilled
                </span>
                <span className="text-[10px] font-mono text-orange-900">
                  {gasUnitsNet.toLocaleString()} units @{gasRate}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 text-[11px]">
                {/* Previous Reading */}
                <div className="flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10.5px]">
                  <span className="text-slate-500 font-medium">Prev:</span>
                  <strong className="font-mono text-slate-800">{gasPrev.toLocaleString()}</strong>
                </div>

                {/* Enter Current Reading */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-700 font-semibold text-[10.5px]">Current:</span>
                  <input
                    type="number"
                    value={gasCurr}
                    onChange={(e) => handleGasCurrChange(e.target.value)}
                    placeholder="Current"
                    className="w-18 bg-white border border-orange-400 rounded-[2px] px-1.5 py-0.5 text-right font-mono font-bold text-[11px] text-orange-950 focus:outline-none"
                  />
                </div>

                {/* Amount */}
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-[10px] text-slate-400">QAR</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={gas || ''}
                    onChange={(e) => setGas(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-18 bg-white border border-orange-300 rounded-[2px] px-1.5 py-0.5 text-right font-mono font-bold text-orange-950 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total Strip */}
          <div className="bg-[#E2E8F0] border border-[#CBD5E1] rounded-[2px] px-2.5 py-1.5 flex items-center justify-between font-mono">
            <span className="font-bold text-slate-800 text-[11.5px]">Total Monthly Bill:</span>
            <span className="text-[13px] font-bold text-blue-900">
              QAR {totalDue.toLocaleString()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-0.5 bg-[#E1DFDD] hover:bg-[#D2D0CE] border border-[#8A8886] rounded-[2px] text-slate-800 font-semibold cursor-pointer text-[11px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[2px] font-bold flex items-center gap-1 shadow-xs cursor-pointer text-[11px]"
            >
              <Save className="w-3 h-3" />
              <span>{isNew ? 'Save Bill' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
