import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Edit,
  Download,
  AlertCircle,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Eye
} from 'lucide-react';
import { ChequeRecord, ChequeType, ChequeStatus, Tenant } from '../types';
import { WinFormsDataGridView, ColumnDef } from '../components/winforms/WinFormsDataGridView';
import { formatCurrency } from '../services/dataStore';

interface ChequesViewProps {
  id?: string;
  cheques: ChequeRecord[];
  tenants: Tenant[];
  onUpdateChequeStatus: (chequeId: string, status: ChequeStatus) => void;
  onAddCheque: (newCheque: Partial<ChequeRecord>) => void;
}

export const ChequesView: React.FC<ChequesViewProps> = ({
  id,
  cheques,
  tenants,
  onUpdateChequeStatus,
  onAddCheque,
}) => {
  const [tenantFilter, setTenantFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(
    cheques[0]?.id || null
  );

  // New Cheque Quick Entry Drawer / Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChequeNo, setNewChequeNo] = useState('CHQ-1009');
  const [newTenantId, setNewTenantId] = useState(tenants[0]?.id || '');
  const [newType, setNewType] = useState<ChequeType>('Rent');
  const [newAmount, setNewAmount] = useState<number>(15000);
  const [newDate, setNewDate] = useState('05-Oct-2026');
  const [newBank, setNewBank] = useState('Qatar National Bank (QNB)');
  const [newStatus, setNewStatus] = useState<ChequeStatus>('Received');
  const [newRemarks, setNewRemarks] = useState('');

  const filteredCheques = useMemo(() => {
    return cheques.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.chequeNo.toLowerCase().includes(q) ||
        c.tenantName.toLowerCase().includes(q) ||
        c.bankName.toLowerCase().includes(q);

      const matchesTenant = tenantFilter === 'All' || c.tenantId === tenantFilter;
      const matchesType = typeFilter === 'All' || c.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesTenant && matchesType && matchesStatus;
    });
  }, [cheques, searchQuery, tenantFilter, typeFilter, statusFilter]);

  const selectedCheque = useMemo(() => {
    return cheques.find((c) => c.id === selectedChequeId) || null;
  }, [cheques, selectedChequeId]);

  const handleCreateCheque = (e: React.FormEvent) => {
    e.preventDefault();
    const tenantObj = tenants.find((t) => t.id === newTenantId) || tenants[0];
    onAddCheque({
      chequeNo: newChequeNo,
      tenantId: tenantObj.id,
      tenantName: tenantObj.name,
      shopNumber: tenantObj.shopNumber,
      type: newType,
      amount: Number(newAmount),
      chequeDate: newDate,
      bankName: newBank,
      status: newStatus,
      remarks: newRemarks || `${newType} payment guarantee`,
    });
    setShowAddForm(false);
  };

  const columns: ColumnDef<ChequeRecord>[] = [
    {
      key: 'chequeNo',
      header: 'Cheque No',
      width: '120px',
      render: (c) => (
        <span className="font-mono font-bold text-[#1E293B] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
          {c.chequeNo}
        </span>
      ),
    },
    {
      key: 'tenantName',
      header: 'Tenant Name',
      width: '210px',
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-900">{c.tenantName}</div>
          <div className="text-[10px] text-slate-500 font-mono">{c.shopNumber}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '100px',
      render: (c) => {
        if (c.type === 'Rent') {
          return (
            <span className="px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Rent
            </span>
          );
        }
        if (c.type === 'Security') {
          return (
            <span className="px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Security
            </span>
          );
        }
        return (
          <span className="px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Other
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '125px',
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(c.amount)}
        </span>
      ),
    },
    {
      key: 'chequeDate',
      header: 'Cheque Date',
      width: '120px',
      render: (c) => (
        <span className="font-mono text-slate-700">{c.chequeDate}</span>
      ),
    },
    {
      key: 'bankName',
      header: 'Drawn Bank',
      width: '180px',
      render: (c) => <span className="text-slate-700 truncate">{c.bankName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      align: 'center',
      render: (c) => {
        switch (c.status) {
          case 'Received':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-50 text-blue-800 border border-blue-300">
                <Clock className="w-3 h-3 text-blue-600" />
                Received
              </span>
            );
          case 'Deposited':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                <RotateCw className="w-3 h-3 text-amber-700" />
                Deposited
              </span>
            );
          case 'Cleared':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                Cleared
              </span>
            );
          case 'Bounced':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 font-bold animate-pulse">
                <XCircle className="w-3 h-3 text-rose-700" />
                Bounced
              </span>
            );
          case 'Returned':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-orange-100 text-orange-800 border border-orange-300">
                Returned
              </span>
            );
          case 'Held':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                Held (PDC)
              </span>
            );
          default:
            return <span>{c.status}</span>;
        }
      },
    },
    {
      key: 'quickAction',
      header: 'Change Status',
      width: '140px',
      align: 'center',
      sortable: false,
      render: (c) => (
        <select
          value={c.status}
          onChange={(e) => onUpdateChequeStatus(c.id, e.target.value as ChequeStatus)}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-[#CBD5E1] rounded-[2px] px-1.5 py-0.5 text-[11px] text-slate-800 focus:border-[#2563EB]"
        >
          <option value="Received">Received</option>
          <option value="Deposited">Deposited</option>
          <option value="Cleared">Cleared</option>
          <option value="Bounced">Bounced</option>
          <option value="Returned">Returned</option>
          <option value="Held">Held</option>
        </select>
      ),
    },
  ];

  return (
    <div id={id} className="p-3.5 space-y-3 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Top Filter Strip */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
            {/* Search */}
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cheque no / bank..."
                className="w-full pl-8 pr-2 py-0.5 text-[11.5px] bg-white border border-[#CBD5E1] rounded-[2px]"
              />
            </div>

            {/* Tenant */}
            <div className="flex items-center gap-1.5">
              <label className="font-semibold text-slate-700">Tenant:</label>
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 text-[11.5px]"
              >
                <option value="All">All Tenants</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cheque Type */}
            <div className="flex items-center gap-1.5">
              <label className="font-semibold text-slate-700">Cheque Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 text-[11.5px]"
              >
                <option value="All">All Types</option>
                <option value="Rent">Rent</option>
                <option value="Security">Security</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <label className="font-semibold text-slate-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#CBD5E1] rounded-[2px] px-2 py-0.5 text-[11.5px]"
              >
                <option value="All">All Statuses</option>
                <option value="Received">Received</option>
                <option value="Deposited">Deposited</option>
                <option value="Cleared">Cleared</option>
                <option value="Bounced">Bounced</option>
                <option value="Returned">Returned</option>
                <option value="Held">Held</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Cheque Entry</span>
          </button>
        </div>
      </div>

      {/* New Cheque Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateCheque}
          className="bg-white border border-[#2563EB] rounded-[3px] p-3 shadow-md grid grid-cols-1 md:grid-cols-4 gap-3 text-[11.5px] animate-in fade-in"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">
              Cheque Number *
            </label>
            <input
              type="text"
              value={newChequeNo}
              onChange={(e) => setNewChequeNo(e.target.value)}
              className="w-full px-2 py-1 font-mono border border-slate-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">
              Tenant *
            </label>
            <select
              value={newTenantId}
              onChange={(e) => setNewTenantId(e.target.value)}
              className="w-full px-2 py-1 border border-slate-300 rounded"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.shopNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">
              Cheque Type
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ChequeType)}
              className="w-full px-2 py-1 border border-slate-300 rounded"
            >
              <option value="Rent">Rent</option>
              <option value="Security">Security Deposit</option>
              <option value="Other">Other Fit-out Guarantee</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">
              Amount (QAR) *
            </label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(Number(e.target.value))}
              className="w-full px-2 py-1 font-mono font-bold border border-slate-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">
              Cheque Date
            </label>
            <input
              type="text"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-2 py-1 font-mono border border-slate-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">
              Drawn Bank
            </label>
            <input
              type="text"
              value={newBank}
              onChange={(e) => setNewBank(e.target.value)}
              className="w-full px-2 py-1 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">
              Initial Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ChequeStatus)}
              className="w-full px-2 py-1 border border-slate-300 rounded"
            >
              <option value="Received">Received</option>
              <option value="Deposited">Deposited</option>
              <option value="Cleared">Cleared</option>
              <option value="Held">Held (PDC Custody)</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded shadow-xs"
            >
              Save Cheque
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main DataGridView */}
      <div className="flex-1 flex flex-col min-h-0">
        <WinFormsDataGridView<ChequeRecord>
          id="cheques-datagridview"
          columns={columns}
          data={filteredCheques}
          keyExtractor={(c) => c.id}
          selectedId={selectedChequeId}
          onRowSelect={(c) => setSelectedChequeId(c.id)}
          maxHeight="calc(100vh - 280px)"
          emptyMessage="No cheques found in active search or status filter."
        />
      </div>
    </div>
  );
};
