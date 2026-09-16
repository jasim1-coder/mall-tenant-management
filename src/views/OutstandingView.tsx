import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  CreditCard,
  Building2,
  Zap,
  Droplets,
  Flame,
  Wrench,
} from 'lucide-react';
import { OutstandingChargeDetail, Tenant } from '../types';
import { formatCurrency } from '../services/dataStore';

interface OutstandingViewProps {
  id?: string;
  tenants: Tenant[];
  outstandingCharges: OutstandingChargeDetail[];
  onReceivePaymentForTenant?: (tenant: Tenant) => void;
  onOpenTenantDetails?: (tenant: Tenant) => void;
}

interface TenantOutstandingSummary {
  tenantId: string;
  tenantName: string;
  shopNumber: string;
  rentOutstanding: number;
  electricityOutstanding: number;
  waterOutstanding: number;
  gasOutstanding: number;
  maintenanceOutstanding: number;
  totalOutstanding: number;
  items: OutstandingChargeDetail[];
}

export const OutstandingView: React.FC<OutstandingViewProps> = ({
  id,
  tenants,
  outstandingCharges,
  onReceivePaymentForTenant,
}) => {
  const [tenantFilter, setTenantFilter] = useState('All');
  const [shopFilter, setShopFilter] = useState('All');
  const [chargeTypeFilter, setChargeTypeFilter] = useState('All');
  const [fromMonth, setFromMonth] = useState('May-2026');
  const [toMonth, setToMonth] = useState('Aug-2026');
  const [expandedTenantIds, setExpandedTenantIds] = useState<Set<string>>(
    () => new Set(tenants.length > 0 ? [tenants[0].id] : ['t-1001'])
  );

  // Group outstanding charges by tenant
  const groupedData: TenantOutstandingSummary[] = useMemo(() => {
    const map = new Map<string, OutstandingChargeDetail[]>();

    outstandingCharges.forEach((item) => {
      if (chargeTypeFilter !== 'All' && item.chargeType !== chargeTypeFilter) {
        return;
      }
      const list = map.get(item.tenantId) || [];
      list.push(item);
      map.set(item.tenantId, list);
    });

    const summaries: TenantOutstandingSummary[] = [];

    map.forEach((items, tId) => {
      const tenant = tenants.find((t) => t.id === tId);
      if (!tenant) return;

      // Filter checks
      if (tenantFilter !== 'All' && tenant.id !== tenantFilter) return;
      if (shopFilter !== 'All' && tenant.shopNumber !== shopFilter) return;

      const rentOutstanding = items
        .filter((i) => i.chargeType === 'Rent')
        .reduce((sum, i) => sum + i.balance, 0);

      const electricityOutstanding = items
        .filter((i) => i.chargeType === 'Electricity')
        .reduce((sum, i) => sum + i.balance, 0);

      const waterOutstanding = items
        .filter((i) => i.chargeType === 'Water')
        .reduce((sum, i) => sum + i.balance, 0);

      const gasOutstanding = items
        .filter((i) => i.chargeType === 'Gas')
        .reduce((sum, i) => sum + i.balance, 0);

      const maintenanceOutstanding = items
        .filter((i) => i.chargeType === 'Maintenance')
        .reduce((sum, i) => sum + i.balance, 0);

      const totalOutstanding = items.reduce((sum, i) => sum + i.balance, 0);

      summaries.push({
        tenantId: tId,
        tenantName: tenant.name,
        shopNumber: tenant.shopNumber,
        rentOutstanding,
        electricityOutstanding,
        waterOutstanding,
        gasOutstanding,
        maintenanceOutstanding,
        totalOutstanding,
        items,
      });
    });

    return summaries.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  }, [tenants, outstandingCharges, tenantFilter, shopFilter, chargeTypeFilter]);

  const summaryTotals = useMemo(() => {
    const totals = {
      total: 0,
      rent: 0,
      electricity: 0,
      water: 0,
      gas: 0,
      maintenance: 0,
    };
    groupedData.forEach((g) => {
      totals.total += g.totalOutstanding;
      totals.rent += g.rentOutstanding;
      totals.electricity += g.electricityOutstanding;
      totals.water += g.waterOutstanding;
      totals.gas += g.gasOutstanding;
      totals.maintenance += g.maintenanceOutstanding;
    });
    return totals;
  }, [groupedData]);

  const toggleExpand = (tenantId: string) => {
    setExpandedTenantIds((prev) => {
      const next = new Set(prev);
      if (next.has(tenantId)) {
        next.delete(tenantId);
      } else {
        next.add(tenantId);
      }
      return next;
    });
  };

  const handleExportCsv = () => {
    let csv = 'Tenant,Shop,Charge Type,Month,Amount (QAR),Paid (QAR),Balance (QAR)\n';
    groupedData.forEach((g) => {
      g.items.forEach((i) => {
        csv += `"${g.tenantName}","${g.shopNumber}","${i.chargeType}","${i.month}",${i.amount},${i.paid},${i.balance}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Outstanding_Aging_Report_${Date.now()}.csv`;
    a.click();
  };

  const renderChargeBadge = (type: string) => {
    switch (type) {
      case 'Rent':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-blue-50 text-blue-800 text-[10.5px] font-semibold border border-blue-200">
            <Building2 className="w-3 h-3 text-blue-600" />
            Rent
          </span>
        );
      case 'Electricity':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-amber-50 text-amber-900 text-[10.5px] font-semibold border border-amber-300">
            <Zap className="w-3 h-3 text-amber-600" />
            Electricity
          </span>
        );
      case 'Water':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-cyan-50 text-cyan-900 text-[10.5px] font-semibold border border-cyan-300">
            <Droplets className="w-3 h-3 text-cyan-600" />
            Water
          </span>
        );
      case 'Gas':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-orange-50 text-orange-950 text-[10.5px] font-semibold border border-orange-300">
            <Flame className="w-3 h-3 text-orange-600" />
            Gas
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-slate-100 text-slate-800 text-[10.5px] font-semibold border border-slate-300">
            <Wrench className="w-3 h-3 text-slate-600" />
            CAM / Maint
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-gray-100 text-gray-800 text-[10.5px] font-medium border border-gray-200">
            {type}
          </span>
        );
    }
  };

  return (
    <div id={id} className="p-3.5 space-y-3 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Top Filter Bar */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
          {/* Tenant filter */}
          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-700">Tenant:</label>
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5"
            >
              <option value="All">All Tenants</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.shopNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Shop filter */}
          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-700">Shop:</label>
            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5"
            >
              <option value="All">All Shops</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.shopNumber}>
                  {t.shopNumber}
                </option>
              ))}
            </select>
          </div>

          {/* From Month */}
          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-700">From Month:</label>
            <input
              type="text"
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              className="w-24 px-2 py-0.5 font-mono border border-[#CBD5E1] rounded-[2px]"
            />
          </div>

          {/* To Month */}
          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-700">To Month:</label>
            <input
              type="text"
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              className="w-24 px-2 py-0.5 font-mono border border-[#CBD5E1] rounded-[2px]"
            />
          </div>

          {/* Charge Type */}
          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-700">Charge Type:</label>
            <select
              value={chargeTypeFilter}
              onChange={(e) => setChargeTypeFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 font-medium"
            >
              <option value="All">All Charges</option>
              <option value="Rent">Rent</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Gas">Gas</option>
              <option value="Maintenance">Maintenance / CAM</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-slate-600" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary Bar - 6 Categorized Metric Cards */}
      <div className="bg-white border border-[#CBD5E1] rounded-[2px] p-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 shadow-xs">
        <div className="border-r border-[#E2E8F0] pr-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Total Outstanding</div>
          <div className="text-[14px] font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(summaryTotals.total)}
          </div>
        </div>
        <div className="border-r border-[#E2E8F0] pr-2">
          <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1">
            <Building2 className="w-3 h-3 text-blue-600" />
            Rent Dues
          </div>
          <div className="text-[14px] font-bold font-mono text-blue-900 mt-0.5">
            {formatCurrency(summaryTotals.rent)}
          </div>
        </div>
        <div className="border-r border-[#E2E8F0] pr-2">
          <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-600" />
            Electricity
          </div>
          <div className="text-[14px] font-bold font-mono text-amber-900 mt-0.5">
            {formatCurrency(summaryTotals.electricity)}
          </div>
        </div>
        <div className="border-r border-[#E2E8F0] pr-2">
          <div className="text-[10px] font-semibold text-cyan-700 uppercase tracking-wide flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-600" />
            Water
          </div>
          <div className="text-[14px] font-bold font-mono text-cyan-900 mt-0.5">
            {formatCurrency(summaryTotals.water)}
          </div>
        </div>
        <div className="border-r border-[#E2E8F0] pr-2">
          <div className="text-[10px] font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-600" />
            Gas
          </div>
          <div className="text-[14px] font-bold font-mono text-orange-950 mt-0.5">
            {formatCurrency(summaryTotals.gas)}
          </div>
        </div>
        <div className="pr-1">
          <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1">
            <Wrench className="w-3 h-3 text-slate-500" />
            CAM / Maint
          </div>
          <div className="text-[14px] font-bold font-mono text-slate-800 mt-0.5">
            {formatCurrency(summaryTotals.maintenance)}
          </div>
        </div>
      </div>

      {/* Master-Detail Expandable Table */}
      <div className="flex-1 min-h-0 border border-[#CBD5E1] rounded-[2px] bg-white overflow-y-auto shadow-xs">
        <table className="w-full text-left text-[11.5px] border-collapse">
          <thead className="sticky top-0 bg-[#E2E8F0] border-b border-[#94A3B8] text-[#1E293B] shadow-xs z-10">
            <tr>
              <th className="py-1.5 px-2 w-8 text-center border-r border-[#CBD5E1]"></th>
              <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold">Tenant</th>
              <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold">Shop</th>
              <th className="py-1.5 px-2.5 border-r border-[#CBD5E1] font-semibold text-right">Rent Due</th>
              <th className="py-1.5 px-2.5 border-r border-[#CBD5E1] font-semibold text-right">Electricity</th>
              <th className="py-1.5 px-2.5 border-r border-[#CBD5E1] font-semibold text-right">Water</th>
              <th className="py-1.5 px-2.5 border-r border-[#CBD5E1] font-semibold text-right">Gas</th>
              <th className="py-1.5 px-2.5 border-r border-[#CBD5E1] font-semibold text-right">CAM / Maint</th>
              <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold text-right">Total Outstanding</th>
              <th className="py-1.5 px-3 font-semibold text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CBD5E1]">
            {groupedData.map((tenantGroup) => {
              const isExpanded = expandedTenantIds.has(tenantGroup.tenantId);
              const matchingTenant = tenants.find((t) => t.id === tenantGroup.tenantId);
              const isOver20k = tenantGroup.totalOutstanding > 20000;

              return (
                <React.Fragment key={tenantGroup.tenantId}>
                  {/* Master Row */}
                  <tr
                    onClick={() => toggleExpand(tenantGroup.tenantId)}
                    className="bg-[#F8FAFC] hover:bg-[#EEF2F6] cursor-pointer font-medium select-none transition-colors"
                  >
                    <td className="py-2 px-2 text-center text-slate-500 border-r border-[#E2E8F0]">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 mx-auto text-[#2563EB]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 mx-auto text-slate-400" />
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E2E8F0] font-bold text-slate-900">
                      {tenantGroup.tenantName}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E2E8F0] font-mono text-slate-700 font-semibold">
                      {tenantGroup.shopNumber}
                    </td>
                    <td className="py-2 px-2.5 border-r border-[#E2E8F0] text-right font-mono font-bold text-blue-900">
                      {tenantGroup.rentOutstanding > 0 ? tenantGroup.rentOutstanding.toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-[#E2E8F0] text-right font-mono text-amber-900">
                      {tenantGroup.electricityOutstanding > 0 ? tenantGroup.electricityOutstanding.toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-[#E2E8F0] text-right font-mono text-cyan-900 font-medium">
                      {tenantGroup.waterOutstanding > 0 ? tenantGroup.waterOutstanding.toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-[#E2E8F0] text-right font-mono text-orange-950 font-medium">
                      {tenantGroup.gasOutstanding > 0 ? tenantGroup.gasOutstanding.toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-[#E2E8F0] text-right font-mono text-slate-700">
                      {tenantGroup.maintenanceOutstanding > 0 ? tenantGroup.maintenanceOutstanding.toLocaleString() : '-'}
                    </td>
                    <td
                      className={`py-2 px-3 border-r border-[#E2E8F0] text-right font-mono font-bold ${isOver20k
                        ? 'text-blue-700 bg-blue-50/70'
                        : tenantGroup.totalOutstanding > 0
                          ? 'text-rose-700 bg-rose-50/50'
                          : 'text-slate-500'
                        }`}
                    >
                      {tenantGroup.totalOutstanding.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (matchingTenant) onReceivePaymentForTenant?.(matchingTenant);
                        }}
                        className="px-2.5 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[2px] text-[10.5px] font-semibold shadow-xs flex items-center gap-1 mx-auto"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Pay Dues</span>
                      </button>
                    </td>
                  </tr>

                  {/* Detail Expanded Sub-table */}
                  {isExpanded && (
                    <tr className="bg-slate-100/70">
                      <td colSpan={10} className="p-3 pl-8">
                        <div className="bg-white border border-[#CBD5E1] rounded-[2px] shadow-inner overflow-hidden">
                          <div className="bg-[#E2E8F0] px-3 py-1.5 text-[11px] font-semibold text-slate-700 border-b border-[#CBD5E1] flex items-center justify-between">
                            <span>Detailed Monthly Charge & Utility Ledger: {tenantGroup.tenantName}</span>
                            <span className="text-[10px] text-slate-500">Sorted by FIFO collection order</span>
                          </div>
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead className="bg-[#F1F5F9] border-b border-[#E2E8F0] text-slate-600">
                              <tr>
                                <th className="py-1 px-3 border-r border-[#E2E8F0]">Charge Category</th>
                                <th className="py-1 px-3 border-r border-[#E2E8F0]">Billing Month</th>
                                <th className="py-1 px-3 border-r border-[#E2E8F0]">Due Date</th>
                                <th className="py-1 px-3 border-r border-[#E2E8F0] text-right">Invoiced Amount (QAR)</th>
                                <th className="py-1 px-3 border-r border-[#E2E8F0] text-right">Paid (QAR)</th>
                                <th className="py-1 px-3 text-right">Balance Due (QAR)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                              {tenantGroup.items.map((subItem) => (
                                <tr key={subItem.id} className="hover:bg-slate-50">
                                  <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-medium text-slate-800">
                                    {renderChargeBadge(subItem.chargeType)}
                                  </td>
                                  <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-mono text-slate-600">
                                    {subItem.month}
                                  </td>
                                  <td className="py-1.5 px-3 border-r border-[#E2E8F0] font-mono text-slate-500 text-[10.5px]">
                                    {subItem.dueDate || '10-Jul-2026'}
                                  </td>
                                  <td className="py-1.5 px-3 border-r border-[#E2E8F0] text-right font-mono">
                                    {subItem.amount.toLocaleString()}
                                  </td>
                                  <td className="py-1.5 px-3 border-r border-[#E2E8F0] text-right font-mono text-emerald-700">
                                    {subItem.paid.toLocaleString()}
                                  </td>
                                  <td
                                    className={`py-1.5 px-3 text-right font-mono font-bold ${subItem.balance > 20000
                                      ? 'text-blue-700 bg-blue-50/60'
                                      : subItem.balance > 0
                                        ? 'text-rose-700'
                                        : 'text-slate-400'
                                      }`}
                                  >
                                    {subItem.balance.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

