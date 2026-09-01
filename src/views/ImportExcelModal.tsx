import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  FileCheck,
  X,
  FileText,
  Trash2
} from 'lucide-react';
import { ImportPreviewRow, Tenant } from '../types';
import { WinFormsGroupBox } from '../components/winforms/WinFormsGroupBox';

interface ImportExcelModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedTenants: Tenant[]) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  id,
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isFileLoaded, setIsFileLoaded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [filterView, setFilterView] = useState<'All' | 'Valid' | 'Errors'>('All');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  if (!isOpen) return null;

  const validRecords = previewRows.filter((r) => r.status === 'Valid').length;
  const errorRecords = previewRows.filter((r) => r.status === 'Error').length;
  const totalRecords = previewRows.length;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const normalizeDate = (val: any): string => {
    if (!val) return '01-Jan-2026';
    if (val instanceof Date) {
      const day = String(val.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day}-${months[val.getMonth()]}-${val.getFullYear()}`;
    }
    const str = String(val).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
    }
    return str;
  };

  const parseBooleanCheck = (val: any): boolean => {
    if (val === true || val === 1) return true;
    if (val === false || val === 0) return false;
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      if (lower === 'yes' || lower === 'y' || lower === 'true' || lower === '1' || lower === 'valid') return true;
      if (lower === 'no' || lower === 'n' || lower === 'false' || lower === '0') return false;
    }
    return true; // default compliant
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setParseError(null);
    setSelectedFileName(file.name);
    setFileSize(formatFileSize(file.size));

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      
      if (!firstSheetName) {
        throw new Error('The selected workbook contains no worksheets.');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        throw new Error('The selected spreadsheet is empty or has no data rows.');
      }

      // Map rows with flexible header names
      const parsed: ImportPreviewRow[] = rawRows.map((row, index) => {
        // Find key helpers
        const getVal = (possibleKeys: string[]) => {
          for (const key of Object.keys(row)) {
            const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const target of possibleKeys) {
              if (cleanKey === target.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                return row[key];
              }
            }
          }
          return '';
        };

        const accountCode = String(getVal(['Account Code', 'AccountCode', 'Account', 'Code', 'Tenant ID', 'ID']) || `T-${1001 + index}`).trim();
        const tenantName = String(getVal(['Tenant Name', 'TenantName', 'Tenant', 'Name', 'Company', 'Trade Name'])).trim();
        const shop = String(getVal(['Shop Number', 'ShopNumber', 'Shop', 'Shop No', 'Unit', 'Unit No']) || `S-${101 + index}`).trim();
        const areaRaw = getVal(['Floor Area', 'Floor Area (m2)', 'Area', 'AreaSqM', 'Area (m2)', 'Size', 'Sqm']);
        const area = typeof areaRaw === 'number' ? areaRaw : parseFloat(String(areaRaw)) || 75;
        
        const startDate = normalizeDate(getVal(['Contract Start Date', 'ContractStart', 'Start Date', 'Start', 'StartDate']) || '01/01/2026');
        const endDate = normalizeDate(getVal(['Contract End Date', 'ContractEnd', 'End Date', 'End', 'EndDate']) || '31/12/2026');
        
        const rentRaw = getVal(['Monthly Rent', 'MonthlyRent', 'Monthly Rent (QAR)', 'Rent', 'Rent (QAR)', 'Amount']);
        const rent = typeof rentRaw === 'number' ? rentRaw : parseFloat(String(rentRaw).replace(/[^0-9.]/g, '')) || 0;

        const hasSecurityCheque = parseBooleanCheck(getVal(['Security Cheque', 'SecurityCheque', 'Security Cheque (Yes/No)', 'Sec Cheque', 'Deposit Cheque']));
        const hasRentCheques = parseBooleanCheck(getVal(['Rent Cheques', 'RentCheques', 'Rent Cheques (Yes/No)', 'PDC Cheques', 'Rent Cheque']));
        const hasUtilityCheque = parseBooleanCheck(getVal(['Utility Cheque', 'UtilityCheque', 'Utility Cheque (Yes/No)', 'Fitout Cheque', 'Util Cheque']));

        // Validation Rules
        let status: 'Valid' | 'Error' = 'Valid';
        let errorMessage = '';

        if (!tenantName) {
          status = 'Error';
          errorMessage = 'Missing Tenant Name';
        } else if (rent <= 0) {
          status = 'Error';
          errorMessage = 'Monthly Rent must be greater than 0 QAR';
        } else if (area <= 0) {
          status = 'Error';
          errorMessage = 'Floor Area must be greater than 0 m²';
        }

        return {
          accountCode,
          tenantName: tenantName || 'Unnamed Tenant',
          shop,
          area,
          startDate,
          endDate,
          rent,
          hasSecurityCheque,
          hasRentCheques,
          hasUtilityCheque,
          status,
          errorMessage: errorMessage || undefined,
        };
      });

      setPreviewRows(parsed);
      setIsFileLoaded(true);
    } catch (err: any) {
      console.error('Excel parse error:', err);
      setParseError(err?.message || 'Failed to read Excel/CSV file. Please ensure valid spreadsheet format.');
      setIsFileLoaded(false);
      setPreviewRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so same file can be re-selected if edited
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDownloadTemplateXlsx = () => {
    const templateData = [
      {
        'Account Code': 'T-1001',
        'Tenant Name': 'ABC Trading WLL',
        'Shop Number': 'S-102',
        'Floor Area (m2)': 85,
        'Contract Start Date': '01/01/2026',
        'Contract End Date': '31/12/2026',
        'Monthly Rent (QAR)': 15000,
        'Security Cheque (Yes/No)': 'Yes',
        'Rent Cheques (Yes/No)': 'Yes',
        'Utility Cheque (Yes/No)': 'Yes',
        'Contact Person': 'Mohammed Al-Kuwari',
        'Phone': '+974 4488 1234',
        'Email': 'm.kuwari@abctrading.qa',
        'Remarks': 'Primary retail tenant in main atrium',
      },
      {
        'Account Code': 'T-1002',
        'Tenant Name': 'Gulf Specialty Foods',
        'Shop Number': 'S-205',
        'Floor Area (m2)': 120,
        'Contract Start Date': '01/04/2026',
        'Contract End Date': '31/03/2027',
        'Monthly Rent (QAR)': 22000,
        'Security Cheque (Yes/No)': 'Yes',
        'Rent Cheques (Yes/No)': 'Yes',
        'Utility Cheque (Yes/No)': 'Yes',
        'Contact Person': 'Ahmed Al-Subaey',
        'Phone': '+974 5511 9876',
        'Email': 'admin@gulffoods.qa',
        'Remarks': 'Food court anchor unit',
      },
      {
        'Account Code': 'T-1003',
        'Tenant Name': 'Doha Gold & Diamonds Souq',
        'Shop Number': 'S-108',
        'Floor Area (m2)': 95,
        'Contract Start Date': '01/01/2026',
        'Contract End Date': '31/12/2027',
        'Monthly Rent (QAR)': 32000,
        'Security Cheque (Yes/No)': 'Yes',
        'Rent Cheques (Yes/No)': 'Yes',
        'Utility Cheque (Yes/No)': 'No',
        'Contact Person': 'Khalid Al-Thani',
        'Phone': '+974 4499 5522',
        'Email': 'leasing@dohagold.qa',
        'Remarks': 'Jewellery gallery section',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenants_Master');
    XLSX.writeFile(workbook, 'Safari_Mall_Tenant_Import_Template.xlsx');
  };

  const handleDownloadTemplateCsv = () => {
    const csvContent =
      'Account Code,Tenant Name,Shop Number,Floor Area (m2),Contract Start Date,Contract End Date,Monthly Rent (QAR),Security Cheque (Yes/No),Rent Cheques (Yes/No),Utility Cheque (Yes/No),Contact Person,Phone,Email,Remarks\n' +
      'T-1001,ABC Trading WLL,S-102,85,01/01/2026,31/12/2026,15000,Yes,Yes,Yes,Mohammed Al-Kuwari,+974 4488 1234,m.kuwari@abctrading.qa,Primary retail tenant\n' +
      'T-1002,Gulf Specialty Foods,S-205,120,01/04/2026,31/03/2027,22000,Yes,Yes,Yes,Ahmed Al-Subaey,+974 5511 9876,admin@gulffoods.qa,Food court anchor unit\n' +
      'T-1003,Doha Gold & Diamonds Souq,S-108,95,01/01/2026,31/12/2027,32000,Yes,Yes,No,Khalid Al-Thani,+974 4499 5522,leasing@dohagold.qa,Jewellery gallery section\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Safari_Mall_Tenant_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportValidRecords = () => {
    const validRows = previewRows.filter((r) => r.status === 'Valid');
    if (validRows.length === 0) return;

    const newTenants: Tenant[] = validRows.map((r, i) => ({
      id: `t-imp-${Date.now()}-${i}`,
      accountCode: r.accountCode,
      name: r.tenantName,
      shopNumber: r.shop,
      floor: r.shop.startsWith('S-1')
        ? 'Ground Floor'
        : r.shop.startsWith('S-2')
        ? 'First Floor'
        : r.shop.startsWith('S-3')
        ? 'Second Floor'
        : 'Ground Floor',
      category: 'Retail',
      areaSqM: r.area,
      contractStart: r.startDate,
      contractEnd: r.endDate,
      rentType: 'Fixed',
      monthlyRent: r.rent,
      status: 'Active',
      contactPerson: 'Authorized Signatory',
      phone: '+974 4400 0000',
      email: `info@${r.tenantName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'tenant'}.qa`,
      remarks: `Imported via ${selectedFileName || 'Excel file'} on ${new Date().toLocaleDateString()}`,
      securityDeposit: r.rent * 3,
      hasSecurityCheque: r.hasSecurityCheque !== false,
      hasRentCheques: r.hasRentCheques !== false,
      hasUtilityCheque: r.hasUtilityCheque !== false,
    }));

    onImportComplete(newTenants);
    onClose();
  };

  const filteredRows = previewRows.filter((r) => {
    if (filterView === 'Valid') return r.status === 'Valid';
    if (filterView === 'Errors') return r.status === 'Error';
    return true;
  });

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[0.5px] p-3 sm:p-4"
    >
      <div className="bg-[#F1F5F9] border-2 border-[#334155] rounded-[4px] shadow-2xl w-[920px] max-w-full max-h-[92vh] flex flex-col overflow-hidden text-[12px] font-sans">
        {/* Form Titlebar */}
        <div className="bg-[#1E293B] text-white px-3.5 py-2 flex items-center justify-between select-none shrink-0">
          <span className="font-semibold text-[13px] tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Import Tenants from Excel / CSV Spreadsheet
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white hover:bg-rose-600 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
          className="hidden"
        />

        {/* Dialog Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]">
          {/* File Picker & Drag-and-Drop Area */}
          <WinFormsGroupBox title="Spreadsheet File Selection">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[3px] p-4 transition-all text-center ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/70'
                  : isFileLoaded
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                    isFileLoaded ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isFileLoaded ? <FileCheck className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-[12.5px] flex items-center gap-2">
                      {selectedFileName || 'No Excel file selected yet'}
                      {fileSize && <span className="text-[11px] text-slate-500 font-normal">({fileSize})</span>}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Supports Excel (<span className="font-mono">.xlsx</span>, <span className="font-mono">.xls</span>) and Comma-Separated Values (<span className="font-mono">.csv</span>)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[12px] rounded-[3px] shadow-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing...' : 'Browse / Select Excel File'}</span>
                  </button>

                  {isFileLoaded && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFileName(null);
                        setFileSize(null);
                        setIsFileLoaded(false);
                        setPreviewRows([]);
                        setParseError(null);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Clear Selected File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message if parsing failed */}
            {parseError && (
              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-300 rounded text-rose-800 text-[11.5px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Failed to process spreadsheet: </span>
                  {parseError}
                </div>
              </div>
            )}
          </WinFormsGroupBox>

          {/* Validation Summary Metrics */}
          {isFileLoaded && (
            <div className="grid grid-cols-3 gap-3">
              <div
                onClick={() => setFilterView('All')}
                className={`bg-white border rounded-[3px] p-2.5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
                  filterView === 'All' ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20' : 'border-[#CBD5E1] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-[10.5px] font-semibold text-slate-500 uppercase">
                    Total Records Found
                  </div>
                  <div className="text-[20px] font-bold font-mono text-slate-900">
                    {totalRecords}
                  </div>
                </div>
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>

              <div
                onClick={() => setFilterView('Valid')}
                className={`bg-white border rounded-[3px] p-2.5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
                  filterView === 'Valid' ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20' : 'border-[#CBD5E1] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-[10.5px] font-semibold text-emerald-700 uppercase">
                    Valid Records Ready
                  </div>
                  <div className="text-[20px] font-bold font-mono text-emerald-700">
                    {validRecords}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>

              <div
                onClick={() => setFilterView('Errors')}
                className={`bg-white border rounded-[3px] p-2.5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
                  filterView === 'Errors' ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20' : 'border-[#CBD5E1] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-[10.5px] font-semibold text-rose-700 uppercase">
                    Records with Errors
                  </div>
                  <div className="text-[20px] font-bold font-mono text-rose-700">
                    {errorRecords}
                  </div>
                </div>
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          )}

          {/* Data Validation Preview Table */}
          {isFileLoaded && (
            <WinFormsGroupBox
              title={`Import Data Preview (${filteredRows.length} shown of ${totalRecords})`}
              badge={
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-500">Filter:</span>
                  <button
                    type="button"
                    onClick={() => setFilterView('All')}
                    className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                      filterView === 'All' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    All ({totalRecords})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterView('Valid')}
                    className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                      filterView === 'Valid' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    Valid ({validRecords})
                  </button>
                  {errorRecords > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterView('Errors')}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                        filterView === 'Errors' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      Errors ({errorRecords})
                    </button>
                  )}
                </div>
              }
            >
              <div className="border border-[#CBD5E1] rounded-[2px] overflow-hidden bg-white max-h-[260px] overflow-y-auto shadow-inner">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="sticky top-0 bg-[#E2E8F0] border-b border-[#94A3B8] text-[#1E293B] select-none">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-[#CBD5E1] font-semibold">Account</th>
                      <th className="py-1.5 px-2 border-r border-[#CBD5E1] font-semibold">Tenant Name</th>
                      <th className="py-1.5 px-2 border-r border-[#CBD5E1] font-semibold">Shop</th>
                      <th className="py-1.5 px-2 border-r border-[#CBD5E1] font-semibold text-right">Rent (QAR)</th>
                      <th className="py-1.5 px-2 border-r border-[#CBD5E1] font-semibold text-right">Area</th>
                      <th className="py-1.5 px-2 border-r border-[#CBD5E1] font-semibold text-center">Sec. Chq</th>
                      <th className="py-1.5 px-2 border-r border-[#CBD5E1] font-semibold text-center">Rent Chqs</th>
                      <th className="py-1.5 px-2 border-r border-[#CBD5E1] font-semibold text-center">Util. Chq</th>
                      <th className="py-1.5 px-2 font-semibold text-center w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.status === 'Error'
                            ? 'bg-rose-50/70 hover:bg-rose-100/70'
                            : idx % 2 === 1
                            ? 'bg-[#F8FAFC] hover:bg-[#F1F5F9]'
                            : 'bg-white hover:bg-[#F1F5F9]'
                        }
                      >
                        <td className="py-1.5 px-2 border-r border-[#E2E8F0] font-mono font-medium">
                          {row.accountCode}
                        </td>
                        <td className="py-1.5 px-2 border-r border-[#E2E8F0] font-semibold text-slate-800">
                          {row.tenantName}
                        </td>
                        <td className="py-1.5 px-2 border-r border-[#E2E8F0] font-mono text-slate-700">
                          {row.shop}
                        </td>
                        <td className="py-1.5 px-2 border-r border-[#E2E8F0] text-right font-mono font-semibold">
                          QAR {row.rent.toLocaleString()}
                        </td>
                        <td className="py-1.5 px-2 border-r border-[#E2E8F0] text-right font-mono text-slate-600">
                          {row.area} m²
                        </td>
                        <td className="py-1.5 px-2 border-r border-[#E2E8F0] text-center">
                          <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold font-mono ${row.hasSecurityCheque !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {row.hasSecurityCheque !== false ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 border-r border-[#E2E8F0] text-center">
                          <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold font-mono ${row.hasRentCheques !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {row.hasRentCheques !== false ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 border-r border-[#E2E8F0] text-center">
                          <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold font-mono ${row.hasUtilityCheque !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {row.hasUtilityCheque !== false ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          {row.status === 'Valid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              Valid
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 cursor-help"
                              title={row.errorMessage}
                            >
                              <XCircle className="w-3 h-3 text-rose-700" />
                              {row.errorMessage || 'Error'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </WinFormsGroupBox>
          )}

          {/* Quick Instructions & Download Templates */}
          <div className="bg-slate-100 border border-slate-300 rounded p-3 text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Need a starter spreadsheet?</span>
              Download our pre-formatted template with standard columns for Tenant Names, Shop Units, Rent amounts, and Cheque indicators.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadTemplateXlsx}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-[11px] rounded flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Download Excel Template (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Download .XLSX</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTemplateCsv}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-[11px] rounded flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Download CSV Template (.csv)"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Download .CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dialog Bottom Action Buttons */}
        <div className="bg-[#F1F5F9] px-4 py-2.5 border-t border-[#CBD5E1] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white text-slate-700 font-medium text-[12px] rounded-[3px] border border-[#CBD5E1] hover:bg-[#E2E8F0] shadow-sm min-w-[80px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportValidRecords}
            disabled={!isFileLoaded || validRecords === 0}
            className="px-5 py-1.5 bg-emerald-700 text-white font-semibold text-[12px] rounded-[3px] border border-emerald-800 hover:bg-emerald-800 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Import {validRecords} Valid Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
