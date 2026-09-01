import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Building2, Calendar, User, DollarSign } from 'lucide-react';
import { Tenant, RentScheduleItem, RentType, ContractStatus } from '../types';
import { WinFormsGroupBox } from '../components/winforms/WinFormsGroupBox';

interface AddEditTenantModalProps {
  id?: string;
  tenantToEdit?: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenantData: Partial<Tenant>) => void;
}

export const AddEditTenantModal: React.FC<AddEditTenantModalProps> = ({
  id,
  tenantToEdit,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = !!tenantToEdit;

  // Form State
  const [name, setName] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [shopNumber, setShopNumber] = useState('');
  const [floor, setFloor] = useState('Ground Floor');
  const [category, setCategory] = useState('Retail');
  const [areaSqM, setAreaSqM] = useState<number>(85);
  const [remarks, setRemarks] = useState('');

  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [contractStart, setContractStart] = useState('01-Jan-2026');
  const [contractEnd, setContractEnd] = useState('31-Dec-2026');
  const [status, setStatus] = useState<ContractStatus>('Active');

  const [rentType, setRentType] = useState<RentType>('Fixed');
  const [fixedMonthlyRent, setFixedMonthlyRent] = useState<number>(15000);
  const [scheduledPeriods, setScheduledPeriods] = useState<RentScheduleItem[]>([
    { id: '1', fromMonth: 'Jan-2026', toMonth: 'Dec-2026', monthlyRent: 15000 },
    { id: '2', fromMonth: 'Jan-2027', toMonth: 'Dec-2027', monthlyRent: 16000 },
    { id: '3', fromMonth: 'Jan-2028', toMonth: 'Dec-2028', monthlyRent: 17500 },
  ]);

  // Master Data 3-Check Compliance Fields (Yes / No)
  const [hasSecurityCheque, setHasSecurityCheque] = useState<boolean>(true);
  const [hasRentCheques, setHasRentCheques] = useState<boolean>(true);
  const [hasUtilityCheque, setHasUtilityCheque] = useState<boolean>(true);

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (tenantToEdit) {
      setName(tenantToEdit.name || '');
      setAccountCode(tenantToEdit.accountCode || '');
      setShopNumber(tenantToEdit.shopNumber || '');
      setFloor(tenantToEdit.floor || 'Ground Floor');
      setCategory(tenantToEdit.category || 'Retail');
      setAreaSqM(tenantToEdit.areaSqM || 85);
      setRemarks(tenantToEdit.remarks || '');

      setContactPerson(tenantToEdit.contactPerson || '');
      setPhone(tenantToEdit.phone || '');
      setEmail(tenantToEdit.email || '');

      setContractStart(tenantToEdit.contractStart || '01-Jan-2026');
      setContractEnd(tenantToEdit.contractEnd || '31-Dec-2026');
      setStatus(tenantToEdit.status || 'Active');

      setRentType(tenantToEdit.rentType || 'Fixed');
      setFixedMonthlyRent(tenantToEdit.monthlyRent || 15000);
      if (tenantToEdit.rentSchedule && tenantToEdit.rentSchedule.length > 0) {
        setScheduledPeriods(tenantToEdit.rentSchedule);
      }

      setHasSecurityCheque(tenantToEdit.hasSecurityCheque !== false);
      setHasRentCheques(tenantToEdit.hasRentCheques !== false);
      setHasUtilityCheque(tenantToEdit.hasUtilityCheque !== false);
    } else {
      // Defaults for new tenant
      setName('');
      setAccountCode(`T-${Math.floor(1000 + Math.random() * 9000)}`);
      setShopNumber('S-105');
      setFloor('Ground Floor');
      setCategory('Retail / Boutique');
      setAreaSqM(90);
      setRemarks('');
      setContactPerson('');
      setPhone('+974 ');
      setEmail('');
      setContractStart('01-Sep-2026');
      setContractEnd('31-Aug-2027');
      setStatus('Active');
      setRentType('Fixed');
      setFixedMonthlyRent(16000);
      setScheduledPeriods([
        { id: '1', fromMonth: 'Jan-2026', toMonth: 'Dec-2026', monthlyRent: 15000 },
        { id: '2', fromMonth: 'Jan-2027', toMonth: 'Dec-2027', monthlyRent: 16000 },
        { id: '3', fromMonth: 'Jan-2028', toMonth: 'Dec-2028', monthlyRent: 17500 },
      ]);
      setHasSecurityCheque(true);
      setHasRentCheques(true);
      setHasUtilityCheque(true);
    }
    setValidationError('');
  }, [tenantToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddPeriod = () => {
    const nextYear = 2026 + scheduledPeriods.length;
    const newPeriod: RentScheduleItem = {
      id: String(Date.now()),
      fromMonth: `Jan-${nextYear}`,
      toMonth: `Dec-${nextYear}`,
      monthlyRent: fixedMonthlyRent || 15000,
    };
    setScheduledPeriods([...scheduledPeriods, newPeriod]);
  };

  const handleRemovePeriod = (index: number) => {
    if (scheduledPeriods.length <= 1) return;
    setScheduledPeriods(scheduledPeriods.filter((_, i) => i !== index));
  };

  const handlePeriodChange = (
    index: number,
    field: keyof RentScheduleItem,
    val: any
  ) => {
    const updated = [...scheduledPeriods];
    updated[index] = { ...updated[index], [field]: val };
    setScheduledPeriods(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Tenant Name is required.');
      return;
    }
    if (!accountCode.trim()) {
      setValidationError('Account Code is required.');
      return;
    }
    if (!shopNumber.trim()) {
      setValidationError('Shop Number is required.');
      return;
    }

    const currentRent =
      rentType === 'Fixed'
        ? Number(fixedMonthlyRent)
        : Number(scheduledPeriods[0]?.monthlyRent || fixedMonthlyRent);

    onSave({
      id: tenantToEdit?.id,
      name: name.trim(),
      accountCode: accountCode.trim(),
      shopNumber: shopNumber.trim(),
      floor,
      category,
      areaSqM: Number(areaSqM) || 0,
      remarks: remarks.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      contractStart,
      contractEnd,
      status,
      rentType,
      monthlyRent: currentRent,
      rentSchedule: rentType === 'Scheduled' ? scheduledPeriods : undefined,
      hasSecurityCheque,
      hasRentCheques,
      hasUtilityCheque,
    });
    onClose();
  };

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[0.5px] p-4"
    >
      <div className="bg-[#F1F5F9] border-2 border-[#475569] rounded-[4px] shadow-2xl w-[720px] max-w-full max-h-[90vh] flex flex-col overflow-hidden text-[12px] font-sans">
        {/* WinForms Form Header / Titlebar */}
        <div className="bg-[#1E293B] text-white px-3.5 py-1.5 flex items-center justify-between select-none">
          <span className="font-semibold text-[12.5px] tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#38BDF8]" />
            {isEditing ? `Edit Tenant: ${name || tenantToEdit?.name}` : 'Add New Mall Tenant - [frmAddEditTenant.cs]'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white hover:bg-rose-600 px-1 py-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]">
          {validationError && (
            <div className="p-2.5 bg-rose-100 border border-rose-400 text-rose-800 rounded-[2px] text-[11.5px] font-medium">
              ⚠ {validationError}
            </div>
          )}

          {/* 1. Tenant Information */}
          <WinFormsGroupBox title="Tenant Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tenant Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ABC Trading Co."
                  className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Account Code <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  placeholder="e.g. T-1001"
                  className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Shop Name / Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={shopNumber}
                    onChange={(e) => setShopNumber(e.target.value)}
                    placeholder="e.g. S-102"
                    className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Square Meters (m²)
                  </label>
                  <input
                    type="number"
                    value={areaSqM}
                    onChange={(e) => setAreaSqM(Number(e.target.value))}
                    placeholder="e.g. 85"
                    className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Floor Level
                  </label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-2 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="First Floor">First Floor</option>
                    <option value="Second Floor">Second Floor</option>
                    <option value="Basement 1">Basement 1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Business Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Retail, F&B, Electronics"
                    className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional lease remarks, store fit-out instructions, or guarantees..."
                  className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                ></textarea>
              </div>
            </div>
          </WinFormsGroupBox>

          {/* 2. Contact Information */}
          <WinFormsGroupBox title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Mohammed Al-Kuwari"
                  className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+974 4488 1234"
                  className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@tenant.qa"
                  className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </WinFormsGroupBox>

          {/* 3. Contract Information */}
          <WinFormsGroupBox title="Contract Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contract Start Date
                </label>
                <input
                  type="text"
                  value={contractStart}
                  onChange={(e) => setContractStart(e.target.value)}
                  placeholder="01-Jan-2026"
                  className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contract End Date
                </label>
                <input
                  type="text"
                  value={contractEnd}
                  onChange={(e) => setContractEnd(e.target.value)}
                  placeholder="31-Dec-2026"
                  className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contract Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContractStatus)}
                  className="w-full px-2 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="Active">Active</option>
                  <option value="Expiring">Expiring (Notice Period)</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </WinFormsGroupBox>

          {/* 4. Rent Configuration */}
          <WinFormsGroupBox title="Rent Configuration">
            <div className="space-y-3">
              {/* Radio options for Rent Type */}
              <div className="flex items-center gap-6">
                <label className="text-slate-700 font-semibold">Rent Type:</label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="rentType"
                    checked={rentType === 'Fixed'}
                    onChange={() => setRentType('Fixed')}
                    className="text-[#2563EB]"
                  />
                  <span>Fixed Monthly Rent</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="rentType"
                    checked={rentType === 'Scheduled'}
                    onChange={() => setRentType('Scheduled')}
                    className="text-[#2563EB]"
                  />
                  <span>Scheduled Rent (Escalations)</span>
                </label>
              </div>

              {/* If Fixed */}
              {rentType === 'Fixed' ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[2px] flex items-center gap-3">
                  <label className="text-slate-700 font-semibold">
                    Monthly Rent:
                  </label>
                  <div className="relative w-48">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-[11px]">
                      QAR
                    </span>
                    <input
                      type="number"
                      value={fixedMonthlyRent}
                      onChange={(e) => setFixedMonthlyRent(Number(e.target.value))}
                      placeholder="15000"
                      className="w-full pl-12 pr-3 py-1 text-[12px] font-mono font-bold bg-white border border-[#CBD5E1] rounded-[2px] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Billed on the 1st of every calendar month.
                  </span>
                </div>
              ) : (
                /* If Scheduled */
                <div className="space-y-2">
                  <div className="border border-[#CBD5E1] rounded-[2px] overflow-hidden bg-white">
                    <table className="w-full text-left text-[11.5px] border-collapse">
                      <thead className="bg-[#E2E8F0] border-b border-[#94A3B8] text-[#1E293B]">
                        <tr>
                          <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold">From</th>
                          <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold">To</th>
                          <th className="py-1.5 px-3 border-r border-[#CBD5E1] font-semibold text-right">Monthly Rent (QAR)</th>
                          <th className="py-1.5 px-2 font-semibold text-center w-16">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {scheduledPeriods.map((period, idx) => (
                          <tr key={period.id} className="hover:bg-slate-50">
                            <td className="p-1 px-2 border-r border-[#E2E8F0]">
                              <input
                                type="text"
                                value={period.fromMonth}
                                onChange={(e) => handlePeriodChange(idx, 'fromMonth', e.target.value)}
                                className="w-full px-1.5 py-0.5 text-[11px] font-mono border border-slate-200 rounded"
                              />
                            </td>
                            <td className="p-1 px-2 border-r border-[#E2E8F0]">
                              <input
                                type="text"
                                value={period.toMonth}
                                onChange={(e) => handlePeriodChange(idx, 'toMonth', e.target.value)}
                                className="w-full px-1.5 py-0.5 text-[11px] font-mono border border-slate-200 rounded"
                              />
                            </td>
                            <td className="p-1 px-2 border-r border-[#E2E8F0]">
                              <input
                                type="number"
                                value={period.monthlyRent}
                                onChange={(e) => handlePeriodChange(idx, 'monthlyRent', Number(e.target.value))}
                                className="w-full px-1.5 py-0.5 text-[11px] font-mono font-bold text-right border border-slate-200 rounded"
                              />
                            </td>
                            <td className="p-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePeriod(idx)}
                                disabled={scheduledPeriods.length <= 1}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded disabled:opacity-30"
                                title="Remove Period"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddPeriod}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-medium rounded-[2px] flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3 h-3 text-[#2563EB]" />
                      <span>[ Add Period ]</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </WinFormsGroupBox>

          {/* 5. Master Data Cheque Verification (3 Mandatory Compliance Checks) */}
          <WinFormsGroupBox title="Master Data Cheque Verification (Lease Compliance Flags)">
            <div className="bg-slate-50 border border-slate-200 rounded-[2px] p-3 space-y-2.5">
              <div className="text-[11px] text-slate-600 mb-2">
                Mandatory tenant master data clearance flags recorded at time of onboarding (Yes / No):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Security Cheque */}
                <div className="bg-white border border-slate-300 rounded-[3px] p-2.5 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[11.5px]">
                        1. Security Cheque
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                          hasSecurityCheque
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {hasSecurityCheque ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      Security deposit / guarantee cheque received and placed in safe custody.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <label className="text-[11px] text-slate-700 font-medium">
                      Received in Safe:
                    </label>
                    <div className="inline-flex rounded-[2px] border border-slate-300 p-0.5 bg-slate-100">
                      <button
                        type="button"
                        onClick={() => setHasSecurityCheque(true)}
                        className={`px-2 py-0.5 text-[10.5px] font-bold rounded-[2px] transition-colors cursor-pointer ${
                          hasSecurityCheque
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        YES
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasSecurityCheque(false)}
                        className={`px-2 py-0.5 text-[10.5px] font-bold rounded-[2px] transition-colors cursor-pointer ${
                          !hasSecurityCheque
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. PDC / Rent Cheques */}
                <div className="bg-white border border-slate-300 rounded-[3px] p-2.5 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[11.5px]">
                        2. PDC / Rent Cheques
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                          hasRentCheques
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {hasRentCheques ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      Full term post-dated rental cheques (e.g. 12 PDCs) submitted in advance.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <label className="text-[11px] text-slate-700 font-medium">
                      PDCs Collected:
                    </label>
                    <div className="inline-flex rounded-[2px] border border-slate-300 p-0.5 bg-slate-100">
                      <button
                        type="button"
                        onClick={() => setHasRentCheques(true)}
                        className={`px-2 py-0.5 text-[10.5px] font-bold rounded-[2px] transition-colors cursor-pointer ${
                          hasRentCheques
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        YES
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasRentCheques(false)}
                        className={`px-2 py-0.5 text-[10.5px] font-bold rounded-[2px] transition-colors cursor-pointer ${
                          !hasRentCheques
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Utility / Fit-Out Deposit Cheque */}
                <div className="bg-white border border-slate-300 rounded-[3px] p-2.5 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[11.5px]">
                        3. Utility / Fit-Out Cheque
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                          hasUtilityCheque
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {hasUtilityCheque ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      Kahramaa / electricity / maintenance & fit-out guarantee cheque received.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <label className="text-[11px] text-slate-700 font-medium">
                      Deposit Cleared:
                    </label>
                    <div className="inline-flex rounded-[2px] border border-slate-300 p-0.5 bg-slate-100">
                      <button
                        type="button"
                        onClick={() => setHasUtilityCheque(true)}
                        className={`px-2 py-0.5 text-[10.5px] font-bold rounded-[2px] transition-colors cursor-pointer ${
                          hasUtilityCheque
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        YES
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasUtilityCheque(false)}
                        className={`px-2 py-0.5 text-[10.5px] font-bold rounded-[2px] transition-colors cursor-pointer ${
                          !hasUtilityCheque
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </WinFormsGroupBox>

          {/* Form Bottom Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#CBD5E1]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white text-slate-700 font-medium text-[12px] rounded-[3px] border border-[#CBD5E1] hover:bg-[#E2E8F0] shadow-sm min-w-[80px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-[#2563EB] text-white font-semibold text-[12px] rounded-[3px] border border-[#1D4ED8] hover:bg-[#1D4ED8] shadow-sm flex items-center gap-1.5 min-w-[90px]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Tenant</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
