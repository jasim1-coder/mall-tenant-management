import React, { useState, useMemo } from 'react';
import {
  FileText,
  CalendarCheck,
  AlertTriangle,
  RotateCw,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  AlertCircle
} from 'lucide-react';
import { Tenant, ContractStatus } from '../types';
import { WinFormsDataGridView, ColumnDef } from '../components/winforms/WinFormsDataGridView';
import { formatCurrency } from '../services/dataStore';

interface ContractsViewProps {
  id?: string;
  tenants: Tenant[];
  onViewContract: (tenant: Tenant) => void;
  onRenewContract: (tenant: Tenant) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  id,
  tenants,
  onViewContract,
  onRenewContract,
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Expiring' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(tenants[0]?.id || null);

  const filteredContracts = useMemo(() => {
    return tenants.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.shopNumber.toLowerCase().includes(q) ||
        t.accountCode.toLowerCase().includes(q);

      if (filterTab === 'Active') return matchesSearch && t.status === 'Active';
      if (filterTab === 'Expiring') return matchesSearch && t.status === 'Expiring';
      if (filterTab === 'Expired') return matchesSearch && t.status === 'Expired';
      return matchesSearch;
    });
  }, [tenants, filterTab, searchQuery]);

  const selectedTenant = useMemo(() => {
    return tenants.find((t) => t.id === selectedTenantId) || null;
  }, [tenants, selectedTenantId]);

  const expiringCount = useMemo(() => {
    return tenants.filter((t) => t.status === 'Expiring').length;
  }, [tenants]);

  const expiredCount = useMemo(() => {
    return tenants.filter((t) => t.status === 'Expired').length;
  }, [tenants]);

  const columns: ColumnDef<Tenant>[] = [
    {
      key: 'name',
      header: 'Tenant Name',
      width: '220px',
      render: (t) => (
        <div>
          <div className="font-semibold text-[#0F172A]">{t.name}</div>
          <div className="text-[10px] font-mono text-slate-500">{t.accountCode} • {t.category}</div>
        </div>
      ),
    },
    {
      key: 'shopNumber',
      header: 'Shop',
      width: '90px',
      render: (t) => (
        <span className="font-mono font-medium text-slate-700 bg-blue-50/70 border border-blue-200 px-1.5 py-0.5 rounded-[2px]">
          {t.shopNumber}
        </span>
      ),
    },
    {
      key: 'contractStart',
      header: 'Contract Start',
      width: '120px',
      render: (t) => <span className="font-mono text-slate-700">{t.contractStart}</span>,
    },
    {
      key: 'contractEnd',
      header: 'Contract End',
      width: '120px',
      render: (t) => {
        const isExpiring = t.status === 'Expiring';
        const isExpired = t.status === 'Expired';
        return (
          <span
            className={`font-mono font-medium ${
              isExpired
                ? 'text-rose-700 underline font-bold'
                : isExpiring
                ? 'text-amber-800 font-bold bg-amber-50 px-1 rounded'
                : 'text-slate-700'
            }`}
          >
            {t.contractEnd}
          </span>
        );
      },
    },
    {
      key: 'monthlyRent',
      header: 'Current Rent',
      width: '130px',
      align: 'right',
      render: (t) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(t.monthlyRent)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      align: 'center',
      render: (t) => {
        if (t.status === 'Active') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Active
            </span>
          );
        }
        if (t.status === 'Expiring') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              Expiring Soon
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            Expired
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Quick Action',
      width: '160px',
      align: 'center',
      sortable: false,
      render: (t) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewContract(t);
            }}
            className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-[2px] text-[11px] font-medium flex items-center gap-1 shadow-2xs"
          >
            <Eye className="w-3 h-3 text-blue-600" />
            <span>View</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRenewContract(t);
            }}
            className="px-2 py-0.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[2px] text-[11px] font-medium flex items-center gap-1 shadow-2xs"
          >
            <RotateCw className="w-3 h-3" />
            <span>Renew</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div id={id} className="p-3.5 space-y-3 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Top Filter Buttons & Expiry Alert Notice */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#E2E8F0] p-0.5 rounded-[3px] border border-[#CBD5E1]">
            <button
              type="button"
              onClick={() => setFilterTab('All')}
              className={`px-3 py-1 rounded-[2px] text-[11.5px] font-semibold transition-all cursor-pointer ${
                filterTab === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({tenants.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('Active')}
              className={`px-3 py-1 rounded-[2px] text-[11.5px] font-semibold transition-all cursor-pointer ${
                filterTab === 'Active'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('Expiring')}
              className={`px-3 py-1 rounded-[2px] text-[11.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                filterTab === 'Expiring'
                  ? 'bg-amber-600 text-slate-950 shadow-xs'
                  : 'text-amber-800 hover:text-amber-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Expiring Soon ({expiringCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('Expired')}
              className={`px-3 py-1 rounded-[2px] text-[11.5px] font-semibold transition-all cursor-pointer ${
                filterTab === 'Expired'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Expired ({expiredCount})
            </button>
          </div>

          {/* Search bar & Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contract tenant / shop..."
                className="w-full pl-8 pr-3 py-1 text-[11.5px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            {selectedTenant && (
              <>
                <button
                  type="button"
                  onClick={() => onViewContract(selectedTenant)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Contract</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRenewContract(selectedTenant)}
                  className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Renew Contract</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Clear Expiry Warning Banner if expiring contracts exist */}
        {expiringCount > 0 && (
          <div className="p-2 bg-amber-50 border border-amber-300 rounded-[2px] flex items-center gap-2 text-amber-900 text-[11.5px]">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Contract Expiry Notice:</strong> {expiringCount} tenant contracts are due to expire within 30 days. Please issue renewal offers or formal vacancy notices before expiry cut-off.
            </span>
          </div>
        )}
      </div>

      {/* Main Contracts DataGridView */}
      <div className="flex-1 flex flex-col min-h-0">
        <WinFormsDataGridView<Tenant>
          id="contracts-datagridview"
          columns={columns}
          data={filteredContracts}
          keyExtractor={(t) => t.id}
          selectedId={selectedTenantId}
          onRowSelect={(t) => setSelectedTenantId(t.id)}
          onRowDoubleClick={(t) => onViewContract(t)}
          maxHeight="calc(100vh - 270px)"
          emptyMessage="No contract records found matching the active filter."
        />
      </div>
    </div>
  );
};
