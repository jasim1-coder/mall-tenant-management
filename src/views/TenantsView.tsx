import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  FileSpreadsheet,
  Download,
  Filter,
  Eye,
  Edit,
  CreditCard,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Tenant, ContractStatus } from '../types';
import { WinFormsDataGridView, ColumnDef } from '../components/winforms/WinFormsDataGridView';
import { formatCurrency, formatNumber } from '../services/dataStore';

interface TenantsViewProps {
  id?: string;
  tenants: Tenant[];
  onOpenDetails?: (tenant: Tenant) => void;
  onViewTenantDetails?: (tenant: Tenant) => void;
  onEditTenant?: (tenant: Tenant) => void;
  onOpenEditTenant?: (tenant: Tenant) => void;
  onAddTenant?: () => void;
  onOpenAddTenant?: () => void;
  onImportExcel?: () => void;
  onOpenImportExcel?: () => void;
  onExportCsv?: () => void;
  onDeleteTenant?: (tenant: Tenant) => void;
  onReceivePayment?: (tenant: Tenant) => void;
  onReceivePaymentForTenant?: (tenant: Tenant) => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({
  id,
  tenants,
  onOpenDetails,
  onViewTenantDetails,
  onEditTenant,
  onOpenEditTenant,
  onAddTenant,
  onOpenAddTenant,
  onImportExcel,
  onOpenImportExcel,
  onExportCsv,
  onDeleteTenant,
  onReceivePayment,
  onReceivePaymentForTenant,
}) => {
  const handleOpenDetails = onOpenDetails || onViewTenantDetails || (() => {});
  const handleEditTenant = onEditTenant || onOpenEditTenant || (() => {});
  const handleAddTenant = onAddTenant || onOpenAddTenant || (() => {});
  const handleImportExcel = onImportExcel || onOpenImportExcel || (() => {});
  const handleReceivePayment = onReceivePayment || onReceivePaymentForTenant || (() => {});
  const handleDeleteTenant = onDeleteTenant || (() => {});
  const handleExportCsv = onExportCsv || (() => {
    // Standard CSV export
    const headers = ['Account Code', 'Name', 'Shop', 'Floor', 'Category', 'Area (sqm)', 'Monthly Rent', 'Contract Start', 'Contract End', 'Status', 'Contact', 'Phone', 'Email'];
    const rows = tenants.map((t) => [
      `"${t.accountCode}"`,
      `"${t.name}"`,
      `"${t.shopNumber}"`,
      `"${t.floor}"`,
      `"${t.category}"`,
      t.areaSqM,
      t.monthlyRent,
      `"${t.contractStart}"`,
      `"${t.contractEnd}"`,
      `"${t.status}"`,
      `"${t.contactPerson || ''}"`,
      `"${t.phone || ''}"`,
      `"${t.email || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mall_tenants_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [floorFilter, setFloorFilter] = useState<string>('All');
  const [expiryFilter, setExpiryFilter] = useState<string>('All');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    tenants[0]?.id || null
  );

  // Filtered dataset
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      // Search matching account code, name, or shop number
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.accountCode.toLowerCase().includes(q) ||
        t.shopNumber.toLowerCase().includes(q) ||
        (t.contactPerson && t.contactPerson.toLowerCase().includes(q));

      // Status filter
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

      // Floor filter
      const matchesFloor =
        floorFilter === 'All' ||
        (floorFilter === 'Ground' && t.shopNumber.startsWith('S-1')) ||
        (floorFilter === 'First' && t.shopNumber.startsWith('S-2')) ||
        (floorFilter === 'Second' && t.shopNumber.startsWith('S-3')) ||
        (floorFilter === 'Basement' && t.shopNumber.startsWith('S-0'));

      // Expiring filter
      let matchesExpiry = true;
      if (expiryFilter === 'Expiring30') {
        matchesExpiry = t.status === 'Expiring';
      } else if (expiryFilter === 'Expired') {
        matchesExpiry = t.status === 'Expired';
      } else if (expiryFilter === 'Active') {
        matchesExpiry = t.status === 'Active';
      }

      return matchesSearch && matchesStatus && matchesFloor && matchesExpiry;
    });
  }, [tenants, searchQuery, statusFilter, floorFilter, expiryFilter]);

  const selectedTenant = useMemo(() => {
    return tenants.find((t) => t.id === selectedTenantId) || null;
  }, [tenants, selectedTenantId]);

  // DataGridView column definitions
  const columns: ColumnDef<Tenant>[] = [
    {
      key: 'accountCode',
      header: 'Account Code',
      width: '110px',
      render: (t) => (
        <span className="font-mono font-semibold text-[#1E293B] bg-slate-100 px-1.5 py-0.5 rounded-[2px] border border-slate-300">
          {t.accountCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tenant Name',
      width: '210px',
      render: (t) => (
        <div>
          <div className="font-semibold text-[#0F172A]">{t.name}</div>
          <div className="text-[10px] text-slate-500 truncate">{t.category}</div>
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
      key: 'areaSqM',
      header: 'Area (m²)',
      width: '95px',
      align: 'right',
      render: (t) => <span>{formatNumber(t.areaSqM)} m²</span>,
    },
    {
      key: 'contractEnd',
      header: 'Contract End',
      width: '120px',
      render: (t) => (
        <span className="font-mono text-slate-700">{t.contractEnd}</span>
      ),
    },
    {
      key: 'monthlyRent',
      header: 'Monthly Rent',
      width: '120px',
      align: 'right',
      render: (t) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(t.monthlyRent)}
        </span>
      ),
    },
    {
      key: 'hasSecurityCheque',
      header: 'Cheque Checks',
      width: '135px',
      align: 'center',
      render: (t) => (
        <div className="flex items-center justify-center gap-1">
          <span
            title={`Security Cheque: ${t.hasSecurityCheque !== false ? 'Received (YES)' : 'Missing (NO)'}`}
            className={`text-[9.5px] px-1 py-0.2 rounded font-mono font-bold ${
              t.hasSecurityCheque !== false
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            SEC:{t.hasSecurityCheque !== false ? 'Y' : 'N'}
          </span>
          <span
            title={`Rent Cheques: ${t.hasRentCheques !== false ? 'Received (YES)' : 'Missing (NO)'}`}
            className={`text-[9.5px] px-1 py-0.2 rounded font-mono font-bold ${
              t.hasRentCheques !== false
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            PDC:{t.hasRentCheques !== false ? 'Y' : 'N'}
          </span>
          <span
            title={`Utility Cheque: ${t.hasUtilityCheque !== false ? 'Received (YES)' : 'Missing (NO)'}`}
            className={`text-[9.5px] px-1 py-0.2 rounded font-mono font-bold ${
              t.hasUtilityCheque !== false
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            UTL:{t.hasUtilityCheque !== false ? 'Y' : 'N'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '105px',
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              Expiring
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
      header: 'Actions',
      width: '130px',
      align: 'center',
      sortable: false,
      render: (t) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetails(t);
            }}
            className="p-1 hover:bg-blue-100 text-blue-700 rounded border border-transparent hover:border-blue-300 transition-colors"
            title="Open Tenant Details Dossier (Enter/Double-Click)"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTenant(t);
            }}
            className="p-1 hover:bg-amber-100 text-amber-700 rounded border border-transparent hover:border-amber-300 transition-colors"
            title="Edit Tenant Information"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTenant(t);
            }}
            className="p-1 hover:bg-rose-100 text-rose-700 rounded border border-transparent hover:border-rose-300 transition-colors"
            title="Delete Tenant"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div id={id} className="p-3.5 space-y-3 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Top Controls & Search Bar */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Search box with WinForms look */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <label className="text-[11.5px] font-semibold text-slate-700 whitespace-nowrap">
              Search:
            </label>
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant / account code / shop / contact..."
                className="w-full pl-8 pr-3 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAddTenant}
              className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Tenant</span>
            </button>
            <button
              type="button"
              onClick={handleImportExcel}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200 text-[11.5px] text-slate-700">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </div>

          {/* Contract Status Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600">Contract Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 text-[11.5px] text-slate-800 focus:border-[#2563EB] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring">Expiring</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Shop / Floor Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600">Shop / Floor:</label>
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 text-[11.5px] text-slate-800 focus:border-[#2563EB] focus:outline-none"
            >
              <option value="All">All Floors</option>
              <option value="Ground">Ground Floor (S-1xx)</option>
              <option value="First">First Floor (S-2xx)</option>
              <option value="Second">Second Floor (S-3xx)</option>
              <option value="Basement">Basement (S-0xx)</option>
            </select>
          </div>

          {/* Expiry Window Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600">Expiring:</label>
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 text-[11.5px] text-slate-800 focus:border-[#2563EB] focus:outline-none"
            >
              <option value="All">All Timeframes</option>
              <option value="Expiring30">Expiring &lt; 30 Days</option>
              <option value="Expired">Expired Leases</option>
              <option value="Active">Standard Active</option>
            </select>
          </div>

          {(statusFilter !== 'All' || floorFilter !== 'All' || expiryFilter !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setFloorFilter('All');
                setExpiryFilter('All');
                setSearchQuery('');
              }}
              className="text-[#2563EB] hover:underline text-[11px] ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main DataGridView Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <WinFormsDataGridView<Tenant>
          id="tenants-datagridview"
          columns={columns}
          data={filteredTenants}
          keyExtractor={(t) => t.id}
          selectedId={selectedTenantId}
          onRowSelect={(t) => setSelectedTenantId(t.id)}
          onRowDoubleClick={(t) => handleOpenDetails(t)}
          maxHeight="calc(100vh - 280px)"
          emptyMessage="No tenants matched the search criteria or selected filters."
        />
      </div>

      {/* Selected Tenant Quick Preview Strip */}
      {selectedTenant && (
        <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2 flex items-center justify-between text-[11px] text-slate-700 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-900">
              Selected: {selectedTenant.accountCode} - {selectedTenant.name}
            </span>
            <span className="text-slate-400">|</span>
            <span>Shop: <strong className="text-slate-800">{selectedTenant.shopNumber}</strong> ({selectedTenant.areaSqM} m²)</span>
            <span className="text-slate-400">|</span>
            <span>Contact: {selectedTenant.contactPerson || 'N/A'} ({selectedTenant.phone})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenDetails(selectedTenant)}
              className="px-2.5 py-0.5 bg-[#2563EB] text-white font-medium rounded-[2px] hover:bg-[#1D4ED8] flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>Open Details Window</span>
            </button>
            <button
              type="button"
              onClick={() => handleEditTenant(selectedTenant)}
              className="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium rounded-[2px] flex items-center gap-1 cursor-pointer"
            >
              <Edit className="w-3 h-3 text-slate-600" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
