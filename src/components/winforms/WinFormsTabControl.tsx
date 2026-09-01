import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface WinFormsTabControlProps {
  id?: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const WinFormsTabControl: React.FC<WinFormsTabControlProps> = ({
  id,
  tabs,
  activeTab,
  onTabChange,
  children,
  className = '',
}) => {
  return (
    <div id={id} className={`flex flex-col text-[12px] font-sans ${className}`}>
      {/* Tab Header Strip */}
      <div className="flex items-center gap-1 border-b border-[#94A3B8] bg-[#E2E8F0] px-2 pt-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-t-[4px] border-t border-x transition-colors flex items-center gap-1.5 select-none ${
                isActive
                  ? 'bg-white text-[#1E293B] border-[#94A3B8] border-b-white -mb-[1px] font-semibold shadow-[0_-1px_2px_rgba(0,0,0,0.05)]'
                  : 'bg-[#CBD5E1] text-[#475569] border-[#CBD5E1] hover:bg-[#D8E0EA] hover:text-slate-900'
              }`}
            >
              {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-[#4338CA] text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Page Body */}
      <div className="p-4 bg-white border-x border-b border-[#94A3B8] rounded-b-[2px] shadow-sm min-h-[300px]">
        {children}
      </div>
    </div>
  );
};
