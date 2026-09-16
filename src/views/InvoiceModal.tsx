import React from 'react';
import {
  Printer,
  X,
  Building2,
  FileText
} from 'lucide-react';
import { MonthlyCharge, Tenant } from '../types';

interface InvoiceModalProps {
  isOpen: boolean;
  charge: MonthlyCharge | null;
  tenant?: Tenant | null;
  mallName?: string;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  charge,
  tenant,
  mallName = 'Safari Mall Doha',
  onClose,
}) => {
  if (!isOpen || !charge) return null;

  const invoiceNo =
    charge.invoiceNo ||
    `INV-2026-${charge.shopNumber.replace(/[^a-zA-Z0-9]/g, '')}-${charge.month.substring(0, 3).toUpperCase()}`;

  const invoiceDate = charge.invoiceDate || `01-${charge.month.substring(0, 3)}-2026`;
  const dueDate = charge.dueDate || `10-${charge.month.substring(0, 3)}-2026`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-2 sm:p-4 overflow-y-auto">
      {/* Strict Standard A4 Page & Print Styles */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        @media print {
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-a4-invoice, #printable-a4-invoice * {
            visibility: visible !important;
          }
          #printable-a4-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div className="bg-[#ECE9D8] border-2 border-[#0055EA] rounded-[4px] shadow-2xl w-full max-w-4xl max-h-[96vh] overflow-hidden flex flex-col font-sans text-[12px] my-auto">
        {/* WinForms Title Bar */}
        <div className="bg-gradient-to-r from-[#0055EA] via-[#2A75F3] to-[#0055EA] text-white px-3.5 py-1.5 flex items-center justify-between font-semibold select-none shadow-inner shrink-0 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-300" />
            <span className="text-[13px] font-bold">
              Tax Invoice Document Viewer — {invoiceNo} [{charge.tenantName}]
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 bg-[#D9381E] hover:bg-[#E81123] text-white rounded-[2px] flex items-center justify-center font-bold text-[11px] leading-none cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-[#F0EEE1] border-b border-[#D0CEBF] px-4 py-2 flex items-center justify-between gap-3 shrink-0 no-print text-[11.5px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[2px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Invoice / Save PDF (Ctrl+P)</span>
            </button>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-mono text-[11px]">
              Page Size: <strong>Standard A4 (210mm × 297mm)</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 bg-[#E1DFDD] hover:bg-[#D2D0CE] border border-[#8A8886] rounded-[2px] text-slate-800 font-semibold cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

        {/* Canvas Background */}
        <div className="p-4 sm:p-6 bg-[#475569] overflow-y-auto flex-1 flex justify-center">
          {/* Authentic Standard A4 Document Sheet (794px width = standard A4 @ 96dpi) */}
          <div
            id="printable-a4-invoice"
            className="bg-white text-slate-900 w-full max-w-[794px] min-h-[1050px] p-10 sm:p-12 shadow-2xl border border-slate-300 rounded-[1px] flex flex-col justify-between text-[12px] font-sans"
          >
            <div className="space-y-6">
              {/* Header: Company & Tax Invoice Title */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded bg-[#0F172A] text-white flex items-center justify-center font-bold text-[18px] shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-[20px] font-bold text-slate-900 uppercase tracking-tight">
                        {mallName}
                      </h1>
                      <p className="text-[11.5px] text-slate-500 font-medium">
                        Property & Mall Tenant Management
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[16px] font-bold text-slate-900 uppercase tracking-wide block">
                    TAX INVOICE / DEMAND NOTE
                  </span>
                  <div className="mt-1 space-y-0.5 text-[11.5px] font-mono">
                    <div>Invoice No: <strong className="text-slate-900 font-bold">{invoiceNo}</strong></div>
                    <div>Invoice Date: <span className="text-slate-700">{invoiceDate}</span></div>
                    <div>Due Date: <strong className="text-rose-700">{dueDate}</strong></div>
                  </div>
                </div>
              </div>

              {/* Billed To & Lease Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 border border-slate-200 p-4 rounded-[2px]">
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Billed To (Tenant):
                  </span>
                  <div className="text-[14px] font-bold text-slate-900">{charge.tenantName}</div>
                  <div className="text-[11.5px] text-slate-600 mt-1 space-y-0.5">
                    <p>Shop / Unit: <strong className="font-mono text-slate-800 font-bold">{charge.shopNumber}</strong></p>
                    {tenant?.contactPerson && <p>Contact: {tenant.contactPerson}</p>}
                    {tenant?.phone && <p>Phone: {tenant.phone}</p>}
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-6">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Billing Details:
                  </span>
                  <div className="text-[12px] space-y-1 text-slate-700">
                    <p>Billing Period: <strong className="font-semibold text-blue-900">{charge.month}</strong></p>
                    <p>Currency: <strong className="font-mono">QAR (Qatari Riyal)</strong></p>
                    <p>Payment Terms: <span className="text-slate-600">Payable on or before due date</span></p>
                  </div>
                </div>
              </div>

              {/* Professional Itemized Table */}
              <div className="border border-slate-300 rounded-[2px] overflow-hidden">
                <table className="w-full text-left border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px] tracking-wide">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-center w-36">Units / Consumption</th>
                      <th className="py-2.5 px-4 text-right w-40">Amount (QAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[12px]">
                    {/* 1. Base Rent */}
                    <tr>
                      <td className="py-3 px-3 text-center text-slate-400 font-sans">1</td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-900">
                        Monthly Base Rent — {charge.month}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 text-[11px] font-sans">
                        Contract Monthly
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {charge.rent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>

                    {/* 2. CAM / Maintenance */}
                    {charge.maintenance > 0 && (
                      <tr>
                        <td className="py-3 px-3 text-center text-slate-400 font-sans">2</td>
                        <td className="py-3 px-4 font-sans font-medium text-slate-900">
                          Common Area Maintenance (CAM) & Service Charge
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 text-[11px] font-sans">
                          Fixed Monthly Fee
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {charge.maintenance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}

                    {/* 3. Electricity */}
                    {charge.electricity > 0 && (
                      <tr>
                        <td className="py-3 px-3 text-center text-slate-400 font-sans">3</td>
                        <td className="py-3 px-4 font-sans font-medium text-slate-900">
                          Electricity Utility Charges
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700 text-[11.5px]">
                          {charge.electricityMeter?.unitsUsed
                            ? `${charge.electricityMeter.unitsUsed.toLocaleString()} kWh @ ${charge.electricityMeter.ratePerUnit}`
                            : 'Sub-Meter'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {charge.electricity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}

                    {/* 4. Water */}
                    {charge.water && charge.water > 0 ? (
                      <tr>
                        <td className="py-3 px-3 text-center text-slate-400 font-sans">4</td>
                        <td className="py-3 px-4 font-sans font-medium text-slate-900">
                          Water & Sewage Utility Charges
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700 text-[11.5px]">
                          {charge.waterMeter?.unitsUsed
                            ? `${charge.waterMeter.unitsUsed.toLocaleString()} m³ @ ${charge.waterMeter.ratePerUnit}`
                            : 'Sub-Meter'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {charge.water.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ) : null}

                    {/* 5. Gas */}
                    {charge.gas && charge.gas > 0 ? (
                      <tr>
                        <td className="py-3 px-3 text-center text-slate-400 font-sans">5</td>
                        <td className="py-3 px-4 font-sans font-medium text-slate-900">
                          Central Gas / Chilled Water AC
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500 text-[11px] font-sans">
                          Consumption
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {charge.gas.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-1.5 font-mono text-[12px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Invoiced Amount:</span>
                    <strong className="text-slate-900 text-[13px]">
                      QAR {charge.totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  {charge.paid > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Less Paid to Date:</span>
                      <span>
                        - QAR {charge.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between font-bold text-[14px]">
                    <span className="text-slate-900 font-sans">Net Balance Due:</span>
                    <span className={charge.outstanding > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                      QAR {charge.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer & Signatures */}
            <div className="pt-12 border-t border-slate-300">
              <div className="flex justify-between items-end text-[11px] text-slate-600">
                <div>
                  <p className="font-semibold text-slate-800">Issued By: Accounts & Finance Department</p>
                  <div className="mt-8 border-b border-slate-400 w-52"></div>
                  <p className="mt-1 text-slate-500">Authorized Signature</p>
                </div>
                <div className="text-right text-[10.5px] text-slate-400">
                  <p>This document serves as an official demand note for tenant monthly dues.</p>
                  <p className="font-mono mt-0.5">Generated: {invoiceDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
