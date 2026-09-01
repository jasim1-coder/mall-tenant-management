import React from 'react';
import { Database, Clock, HardDrive, CheckCircle2 } from 'lucide-react';

interface WinFormsStatusStripProps {
  id?: string;
  statusText?: string;
  recordCount?: number;
  totalOutstanding?: string;
  systemDate?: string;
  mallName?: string;
}

export const WinFormsStatusStrip: React.FC<WinFormsStatusStripProps> = ({
  id,
  statusText = 'Ready',
  recordCount,
  totalOutstanding,
  systemDate = '30-Aug-2026',
  mallName = 'Safari Mall Doha',
}) => {
  return (
    <footer
      id={id}
      className="h-6 bg-[#E2E8F0] border-t border-[#94A3B8] text-[11px] text-[#334155] flex items-center justify-between px-3 select-none shrink-0 font-sans shadow-inner"
    >
      {/* Left status panel */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{statusText}</span>
        </span>
        {recordCount !== undefined && (
          <>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">
              Active Records: <strong className="text-slate-800">{recordCount}</strong>
            </span>
          </>
        )}
      </div>

      {/* Middle status panels */}
      <div className="hidden md:flex items-center gap-4 text-slate-600">
        <span className="inline-flex items-center gap-1 text-[10.5px]">
          <HardDrive className="w-3 h-3 text-slate-500" />
          <span>Data Store: <strong className="text-slate-700">Local JSON (Persistent)</strong></span>
        </span>
        {totalOutstanding && (
          <span className="text-[10.5px]">
            Portfolio Dues: <strong className="text-rose-700">{totalOutstanding}</strong>
          </span>
        )}
        <span className="text-[10.5px] text-slate-500">
          Facility: <span className="font-semibold text-slate-700">{mallName}</span>
        </span>
      </div>

      {/* Right status panel: Keyboard & Date */}
      <div className="flex items-center gap-2 font-mono text-[10px] text-slate-600">
        <span className="px-1 bg-slate-200 border border-slate-300 rounded-[2px]">CAPS: OFF</span>
        <span className="px-1 bg-slate-200 border border-slate-300 rounded-[2px]">NUM: ON</span>
        <span className="inline-flex items-center gap-1 text-slate-700 ml-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{systemDate}</span>
        </span>
      </div>
    </footer>
  );
};
