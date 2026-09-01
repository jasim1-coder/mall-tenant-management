import React from 'react';
import {
  Building2,
  Minus,
  Square,
  X,
  UserPlus,
  CreditCard,
  FileSpreadsheet,
  CalendarDays,
  RefreshCw,
  SlidersHorizontal,
  Download
} from 'lucide-react';
import { ActiveNavModule } from '../../types';

interface WinFormsWindowProps {
  id?: string;
  title?: string;
  onNavigate: (module: ActiveNavModule) => void;
  onNewTenant: () => void;
  onReceivePayment: () => void;
  onImportExcel: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  onExportData: () => void;
  onAbout?: () => void;
  children: React.ReactNode;
}

export const WinFormsWindow: React.FC<WinFormsWindowProps> = ({
  id,
  title = 'Safari Mall Doha - Tenant Management System',
  onNavigate,
  onNewTenant,
  onReceivePayment,
  onImportExcel,
  onOpenSettings,
  onRefresh,
  onExportData,
  children,
}) => {
  return (
    <div
      id={id}
      className="flex flex-col h-screen w-screen bg-[#CBD5E1] overflow-hidden select-none font-sans text-slate-800"
    >
      {/* 1. Window Header Bar */}
      <div className="h-8 bg-[#1E293B] text-slate-100 flex items-center justify-between px-3 text-[12px] font-medium border-b border-[#0F172A] shrink-0 select-none shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-[3px] bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-3 h-3" />
          </div>
          <span className="tracking-wide text-white text-[12.5px] font-bold flex items-center gap-2">
            {title}
            <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded font-mono font-medium">
              Data Saved Locally
            </span>
          </span>
        </div>

        {/* Action Controls & Window Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefresh}
            className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-[#334155] rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-[#334155] rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Settings"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>

          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-[#334155] hover:text-white rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-[#334155] hover:text-white rounded transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-[#DC2626] hover:text-white rounded transition-colors"
            title="Close / Reload Application"
            onClick={() => {
              if (window.confirm('Do you want to reload the workspace?')) {
                window.location.reload();
              }
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Direct, High-Utility Action Toolbar */}
      <div className="h-9 bg-[#F8FAFC] border-b border-[#CBD5E1] px-3 flex items-center justify-between shrink-0 select-none overflow-x-auto shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewTenant}
            className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[3px] flex items-center gap-1.5 text-[11.5px] font-semibold transition-colors shadow-xs cursor-pointer"
            title="Add New Tenant"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Tenant</span>
          </button>

          <button
            type="button"
            onClick={onReceivePayment}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[3px] flex items-center gap-1.5 text-[11.5px] font-semibold transition-colors shadow-xs cursor-pointer"
            title="Receive & Settle Payment"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Receive Payment</span>
          </button>

          <button
            type="button"
            onClick={onImportExcel}
            className="px-2.5 py-1 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] rounded-[3px] flex items-center gap-1.5 text-[11.5px] font-medium transition-colors shadow-xs cursor-pointer"
            title="Import Tenants from Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Import Excel</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5"></div>

          <button
            type="button"
            onClick={() => onNavigate('MonthlyRent')}
            className="px-2.5 py-1 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] rounded-[3px] flex items-center gap-1.5 text-[11.5px] font-medium transition-colors shadow-xs cursor-pointer"
            title="Generate Monthly Rent Charges"
          >
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            <span>Monthly Charges</span>
          </button>

          <button
            type="button"
            onClick={onExportData}
            className="px-2.5 py-1 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] rounded-[3px] flex items-center gap-1.5 text-[11.5px] font-medium transition-colors shadow-xs cursor-pointer"
            title="Export JSON Data Backup"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Backup Data</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span className="hidden md:inline text-slate-400">Quick Jump:</span>
          <button
            type="button"
            onClick={() => onNavigate('Dashboard')}
            className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onNavigate('Tenants')}
            className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            Tenants
          </button>
          <button
            type="button"
            onClick={() => onNavigate('Outstanding')}
            className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            Outstanding
          </button>
          <button
            type="button"
            onClick={() => onNavigate('Reports')}
            className="px-2 py-0.5 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
          >
            Reports
          </button>
        </div>
      </div>

      {/* 3. Main Body SplitContainer (Sidebar + Content Area) */}
      <div className="flex-1 flex overflow-hidden">{children}</div>
    </div>
  );
};
