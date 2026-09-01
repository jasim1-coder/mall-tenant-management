import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  DollarSign,
  Download,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  FileText
} from 'lucide-react';
import { Tenant, MonthlyCharge, PaymentRecord, ChequeRecord, OutstandingChargeDetail } from '../types';
import { WinFormsGroupBox } from '../components/winforms/WinFormsGroupBox';
import { formatCurrency } from '../services/dataStore';

interface ReportsViewProps {
  id?: string;
  tenants: Tenant[];
  monthlyCharges: MonthlyCharge[];
  payments: PaymentRecord[];
  cheques: ChequeRecord[];
  outstanding: OutstandingChargeDetail[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  id,
  tenants,
  monthlyCharges,
  payments,
  cheques,
  outstanding,
}) => {
  const [selectedReport, setSelectedReport] = useState<string>('rent_collection');
  const [dateRange, setDateRange] = useState('Aug-2026');
  const [reportFormat, setReportFormat] = useState<'Grid' | 'Print' | 'Excel'>('Grid');

  const reportList = [
    {
      id: 'rent_collection',
      title: 'Rent Collection & Realization Summary',
      category: 'Financial',
      description: 'Breakdown of monthly billed rent vs actual collections and recovery percentages per shop.',
    },
    {
      id: 'outstanding_aging',
      title: 'Outstanding Aging & Overdue Ledger',
      category: 'Financial',
      description: 'Categorization of overdue dues by 30, 60, 90, and 120+ days aging buckets.',
    },
    {
      id: 'contract_expiry',
      title: 'Contract Expiry & Renewal Forecast',
      category: 'Leasing',
      description: 'Tenancies expiring over the next 12 months with renewal escalation projections.',
    },
    {
      id: 'cheque_custody',
      title: 'Cheque Custody, Maturity & Clearance Register',
      category: 'Treasury',
      description: 'Register of post-dated cheques in company vault, deposited cheques, and bounced items.',
    },
    {
      id: 'occupancy_yield',
      title: 'Mall Space Occupancy & Revenue Yield by Floor',
      category: 'Management',
      description: 'Square meter utilization, vacant units, and average rent per m² across mall floors.',
    },
  ];

  const handleExport = (type: 'csv' | 'pdf') => {
    let csv = `Report: ${selectedReport.toUpperCase()}\nGenerated: ${new Date().toLocaleString()}\n`;
    csv += 'Tenant,Shop,Amount,Status,Remarks\n';
    tenants.forEach((t) => {
      csv += `"${t.name}","${t.shopNumber}",${t.monthlyRent},"${t.status}","${t.category}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mall_Management_Report_${selectedReport}_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div id={id} className="p-3.5 space-y-3.5 h-full flex flex-col overflow-hidden bg-[#F8FAFC] text-[12px] font-sans">
      {/* Top Toolbar */}
      <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-slate-700">Reporting Month:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-[#CBD5E1] rounded-[2px] px-2.5 py-1 font-mono font-medium text-slate-800"
          >
            <option value="Aug-2026">August 2026</option>
            <option value="Jul-2026">July 2026</option>
            <option value="Jun-2026">June 2026</option>
            <option value="Q3-2026">Q3-2026 Full Quarter</option>
            <option value="YTD-2026">YTD 2026 Financial Year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export to Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11.5px] rounded-[2px] shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Report Selector & Active Report Grid Preview */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 min-h-0">
        {/* Left Side: Report Catalog */}
        <div className="bg-white border border-[#CBD5E1] rounded-[3px] p-2 flex flex-col overflow-y-auto shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase px-2 py-1 tracking-wider border-b border-slate-200 mb-1">
            Standard Management Reports
          </div>
          <div className="space-y-1">
            {reportList.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedReport(r.id)}
                className={`w-full text-left p-2 rounded-[2px] border transition-all text-[11.5px] ${
                  selectedReport === r.id
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1E3A8A] font-semibold shadow-xs'
                    : 'bg-white border-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="truncate">{r.title}</span>
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-2">
                  {r.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Report Data & Visual Output Preview */}
        <div className="md:col-span-3 bg-white border border-[#CBD5E1] rounded-[3px] p-3.5 flex flex-col overflow-y-auto shadow-xs space-y-3.5">
          {/* Report Title & Subtitle */}
          <div className="border-b border-[#CBD5E1] pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-bold text-slate-900">
                {reportList.find((r) => r.id === selectedReport)?.title}
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                Mall: Safari Mall Doha • Period: {dateRange} • Currency: QAR (Qatari Riyal)
              </span>
            </div>
            <div className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono text-slate-700">
              Generated: 30-Aug-2026 14:30
            </div>
          </div>

          {/* Conditional Report Views */}
          {selectedReport === 'rent_collection' && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Invoiced</div>
                  <div className="text-[14px] font-bold font-mono text-slate-900">QAR 1,350,000</div>
                </div>
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-center">
                  <div className="text-[10px] text-emerald-800 uppercase font-semibold">Total Collected</div>
                  <div className="text-[14px] font-bold font-mono text-emerald-800">QAR 864,250</div>
                </div>
                <div className="p-2 bg-rose-50 border border-rose-200 rounded text-center">
                  <div className="text-[10px] text-rose-800 uppercase font-semibold">Pending Realization</div>
                  <div className="text-[14px] font-bold font-mono text-rose-700">QAR 485,750</div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
                  <div className="text-[10px] text-blue-800 uppercase font-semibold">Collection Ratio</div>
                  <div className="text-[14px] font-bold font-mono text-blue-800">64.02%</div>
                </div>
              </div>

              <div className="border border-[#CBD5E1] rounded-[2px] overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#E2E8F0] border-b border-[#CBD5E1] text-slate-800">
                    <tr>
                      <th className="py-1.5 px-3">Tenant Name</th>
                      <th className="py-1.5 px-2">Shop</th>
                      <th className="py-1.5 px-3 text-right">Base Rent</th>
                      <th className="py-1.5 px-3 text-right">Maintenance</th>
                      <th className="py-1.5 px-3 text-right">Utilities</th>
                      <th className="py-1.5 px-3 text-right font-bold">Total Billed</th>
                      <th className="py-1.5 px-3 text-right text-emerald-800">Paid</th>
                      <th className="py-1.5 px-3 text-right text-rose-700">Balance</th>
                      <th className="py-1.5 px-2 text-center">Recovery %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {monthlyCharges.slice(0, 8).map((c) => {
                      const recoveryPct = c.totalDue > 0 ? Math.round((c.paid / c.totalDue) * 100) : 0;
                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-semibold text-slate-800">{c.tenantName}</td>
                          <td className="py-1.5 px-2 font-mono text-slate-600">{c.shopNumber}</td>
                          <td className="py-1.5 px-3 text-right font-mono">{c.rent.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-mono">{c.maintenance.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-mono">{c.electricity.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold">{c.totalDue.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-mono text-emerald-700">{c.paid.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-700">{c.outstanding.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-700">{recoveryPct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReport === 'outstanding_aging' && (
            <div className="space-y-3">
              <div className="border border-[#CBD5E1] rounded-[2px] overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#E2E8F0] border-b border-[#CBD5E1] text-slate-800">
                    <tr>
                      <th className="py-1.5 px-3">Tenant Name</th>
                      <th className="py-1.5 px-2">Shop</th>
                      <th className="py-1.5 px-3 text-right">Current (0-30d)</th>
                      <th className="py-1.5 px-3 text-right">31-60 Days</th>
                      <th className="py-1.5 px-3 text-right">61-90 Days</th>
                      <th className="py-1.5 px-3 text-right">90+ Days (High Risk)</th>
                      <th className="py-1.5 px-3 text-right font-bold text-rose-800">Total Arrears</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-900">ABC Trading</td>
                      <td className="py-1.5 px-2 font-mono">S102</td>
                      <td className="py-1.5 px-3 text-right font-mono">1,650</td>
                      <td className="py-1.5 px-3 text-right font-mono">10,000</td>
                      <td className="py-1.5 px-3 text-right font-mono">0</td>
                      <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-700">11,650</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-900">Gulf Foods</td>
                      <td className="py-1.5 px-2 font-mono">S205</td>
                      <td className="py-1.5 px-3 text-right font-mono">7,300</td>
                      <td className="py-1.5 px-3 text-right font-mono">21,550</td>
                      <td className="py-1.5 px-3 text-right font-mono">0</td>
                      <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-700">28,850</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-semibold text-slate-900">XYZ Fashion</td>
                      <td className="py-1.5 px-2 font-mono">S301</td>
                      <td className="py-1.5 px-3 text-right font-mono">13,900</td>
                      <td className="py-1.5 px-3 text-right font-mono">13,900</td>
                      <td className="py-1.5 px-3 text-right font-mono">12,500</td>
                      <td className="py-1.5 px-3 text-right font-mono text-rose-700 font-bold">25,000</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-700">65,300</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReport !== 'rent_collection' && selectedReport !== 'outstanding_aging' && (
            <div className="space-y-3">
              <div className="border border-[#CBD5E1] rounded-[2px] overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-[#E2E8F0] border-b border-[#CBD5E1] text-slate-800">
                    <tr>
                      <th className="py-1.5 px-3">Item / Unit</th>
                      <th className="py-1.5 px-3">Category</th>
                      <th className="py-1.5 px-3">Reference Term</th>
                      <th className="py-1.5 px-3 text-right">Financial Exposure</th>
                      <th className="py-1.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{t.name} ({t.shopNumber})</td>
                        <td className="py-1.5 px-3 text-slate-700">{t.category}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-600">{t.contractStart} to {t.contractEnd}</td>
                        <td className="py-1.5 px-3 text-right font-mono font-bold">{formatCurrency(t.monthlyRent)}</td>
                        <td className="py-1.5 px-3 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
