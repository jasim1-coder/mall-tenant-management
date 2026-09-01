import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  FileSpreadsheet,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Tenant } from '../types';
import { WinFormsDataGridView, ColumnDef } from '../components/winforms/WinFormsDataGridView';
import { formatCurrency, formatNumber } from '../services/dataStore';
import { exportTenantsToExcel } from '../utils/excelExport';

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
  onDeleteTenant,
}) => {
  const handleOpenDetails = onOpenDetails || onViewTenantDetails || (() => {});
  const handleEditTenant = onEditTenant || onOpenEditTenant || (() => {});
  const handleAddTenant = onAddTenant || onOpenAddTenant || (() => {});
  const handleImportExcel = onImportExcel || onOpenImportExcel || (() => {});
  const handleDeleteTenant = onDeleteTenant || (() => {});

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    tenants[0]?.id || null
  );

  // Filtered dataset
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.accountCode.toLowerCase().includes(q) ||
        t.shopNumber.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.contactPerson && t.contactPerson.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tenants, searchQuery, statusFilter]);

  // Clean, single-click Excel export
  const handleExport = () => {
    if (filteredTenants.length === 0) return;
    exportTenantsToExcel(filteredTenants, {
      fileName: 'Safari_Mall_Tenants',
      sheetName: 'Tenants',
      includeSummary: false,
    });
  };

  // DataGridView column definitions - clean, essential data only
  const columns: ColumnDef<Tenant>[] = [
    {
      key: 'accountCode',
      header: 'Account Code',
      width: '115px',
      render: (t) => (
        <span className="font-mono font-semibold text-slate-800">
          {t.accountCode}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tenant Name',
      width: '230px',
      render: (t) => (
        <span className="font-medium text-slate-900">{t.name}</span>
      ),
    },
    {
      key: 'shopNumber',
      header: 'Shop',
      width: '90px',
      render: (t) => (
        <span className="font-mono font-medium text-slate-700">
          {t.shopNumber}
        </span>
      ),
    },
    {
      key: 'floor',
      header: 'Floor',
      width: '100px',
      render: (t) => <span className="text-slate-600">{t.floor}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      width: '140px',
      render: (t) => <span className="text-slate-600 truncate">{t.category}</span>,
    },
    {
      key: 'areaSqM',
      header: 'Area (m²)',
      width: '90px',
      align: 'right',
      render: (t) => <span>{formatNumber(t.areaSqM)} m²</span>,
    },
    {
      key: 'monthlyRent',
      header: 'Monthly Rent (QAR)',
      width: '140px',
      align: 'right',
      render: (t) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(t.monthlyRent)}
        </span>
      ),
    },
    {
      key: 'contractEnd',
      header: 'Contract End',
      width: '115px',
      render: (t) => (
        <span className="font-mono text-slate-700">{t.contractEnd}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      align: 'center',
      render: (t) => {
        if (t.status === 'Active') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Active
            </span>
          );
        }
        if (t.status === 'Expiring') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              Expiring
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            Expired
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '110px',
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
            className="p-1 hover:bg-blue-100 text-blue-700 rounded transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTenant(t);
            }}
            className="p-1 hover:bg-amber-100 text-amber-700 rounded transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTenant(t);
            }}
            className="p-1 hover:bg-rose-100 text-rose-700 rounded transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div id={id} className="p-3 space-y-2.5 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Search & Status Filter */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenant name, account code, or shop..."
              className="w-full pl-8 pr-3 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-1 text-[12px] text-slate-700 focus:outline-none focus:border-[#2563EB]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddTenant}
            className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Tenant</span>
          </button>

          <button
            type="button"
            onClick={handleImportExcel}
            className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Import Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <WinFormsDataGridView<Tenant>
        id="tenants-datagridview"
        columns={columns}
        data={filteredTenants}
        keyExtractor={(t) => t.id}
        selectedId={selectedTenantId}
        onRowSelect={(t) => setSelectedTenantId(t.id)}
        onRowDoubleClick={(t) => handleOpenDetails(t)}
        emptyMessage="No tenants found."
      />
    </div>
  );
};
