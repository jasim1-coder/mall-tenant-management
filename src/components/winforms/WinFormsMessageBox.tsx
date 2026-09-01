import React from 'react';
import { AlertCircle, HelpCircle, Info, XCircle, X } from 'lucide-react';

export type MessageBoxIcon = 'Information' | 'Question' | 'Warning' | 'Error';
export type MessageBoxButtons = 'OK' | 'OKCancel' | 'YesNo' | 'YesNoCancel';

export interface MessageBoxOptions {
  title: string;
  message: string;
  details?: string;
  icon?: MessageBoxIcon;
  buttons?: MessageBoxButtons;
  onResult: (result: 'OK' | 'Cancel' | 'Yes' | 'No') => void;
}

interface WinFormsMessageBoxProps {
  options: MessageBoxOptions | null;
  onClose: () => void;
}

export const WinFormsMessageBox: React.FC<WinFormsMessageBoxProps> = ({
  options,
  onClose,
}) => {
  if (!options) return null;

  const getIcon = () => {
    switch (options.icon) {
      case 'Information':
        return <Info className="w-8 h-8 text-[#2563EB]" />;
      case 'Question':
        return <HelpCircle className="w-8 h-8 text-[#0284C7]" />;
      case 'Warning':
        return <AlertCircle className="w-8 h-8 text-[#D97706]" />;
      case 'Error':
        return <XCircle className="w-8 h-8 text-[#DC2626]" />;
      default:
        return <Info className="w-8 h-8 text-[#2563EB]" />;
    }
  };

  const handleAction = (result: 'OK' | 'Cancel' | 'Yes' | 'No') => {
    options.onResult(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[0.5px]">
      <div className="bg-[#F1F5F9] border-2 border-[#64748B] rounded-[4px] shadow-2xl w-[440px] max-w-[90vw] overflow-hidden text-[12px] font-sans animate-in fade-in zoom-in-95 duration-100">
        {/* Title bar */}
        <div className="bg-[#1E293B] text-white px-3 py-1.5 flex items-center justify-between select-none">
          <span className="font-semibold text-[12px] tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
            {options.title || 'Application Message'}
          </span>
          <button
            type="button"
            onClick={() => handleAction('Cancel')}
            className="text-slate-300 hover:text-white hover:bg-rose-600 px-1 py-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 bg-white flex items-start gap-3.5 border-b border-[#CBD5E1]">
          <div className="shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 space-y-1.5">
            <p className="text-[13px] text-slate-800 font-medium leading-relaxed">
              {options.message}
            </p>
            {options.details && (
              <p className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 border border-slate-200 rounded">
                {options.details}
              </p>
            )}
          </div>
        </div>

        {/* Buttons strip */}
        <div className="bg-[#F1F5F9] px-4 py-2.5 flex items-center justify-end gap-2">
          {(!options.buttons || options.buttons === 'OK') && (
            <button
              type="button"
              onClick={() => handleAction('OK')}
              className="px-5 py-1 bg-[#1E293B] text-white font-medium text-[12px] rounded-[3px] border border-[#0F172A] hover:bg-[#334155] active:bg-[#0F172A] transition-all shadow-sm min-w-[75px]"
              autoFocus
            >
              OK
            </button>
          )}

          {options.buttons === 'OKCancel' && (
            <>
              <button
                type="button"
                onClick={() => handleAction('OK')}
                className="px-4 py-1 bg-[#1E293B] text-white font-medium text-[12px] rounded-[3px] border border-[#0F172A] hover:bg-[#334155] shadow-sm min-w-[75px]"
                autoFocus
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => handleAction('Cancel')}
                className="px-4 py-1 bg-white text-slate-700 font-medium text-[12px] rounded-[3px] border border-[#CBD5E1] hover:bg-[#E2E8F0] shadow-sm min-w-[75px]"
              >
                Cancel
              </button>
            </>
          )}

          {options.buttons === 'YesNo' && (
            <>
              <button
                type="button"
                onClick={() => handleAction('Yes')}
                className="px-5 py-1 bg-[#2563EB] text-white font-medium text-[12px] rounded-[3px] border border-[#1D4ED8] hover:bg-[#1D4ED8] shadow-sm min-w-[75px]"
                autoFocus
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAction('No')}
                className="px-5 py-1 bg-white text-slate-700 font-medium text-[12px] rounded-[3px] border border-[#CBD5E1] hover:bg-[#E2E8F0] shadow-sm min-w-[75px]"
              >
                No
              </button>
            </>
          )}

          {options.buttons === 'YesNoCancel' && (
            <>
              <button
                type="button"
                onClick={() => handleAction('Yes')}
                className="px-4 py-1 bg-[#2563EB] text-white font-medium text-[12px] rounded-[3px] border border-[#1D4ED8] hover:bg-[#1D4ED8] shadow-sm min-w-[70px]"
                autoFocus
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAction('No')}
                className="px-4 py-1 bg-white text-slate-700 font-medium text-[12px] rounded-[3px] border border-[#CBD5E1] hover:bg-[#E2E8F0] shadow-sm min-w-[70px]"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleAction('Cancel')}
                className="px-4 py-1 bg-white text-slate-700 font-medium text-[12px] rounded-[3px] border border-[#CBD5E1] hover:bg-[#E2E8F0] shadow-sm min-w-[70px]"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
