import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  CreditCard,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  UserCheck
} from 'lucide-react';
import { NavModule, ActiveNavModule } from '../../types';

export interface WinFormsSidebarProps {
  id?: string;
  activeModule: NavModule | ActiveNavModule | string;
  onNavigate?: (module: any) => void;
  onSelectModule?: (module: any) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  counts?: {
    tenants?: number;
    contractsExpiring?: number;
    outstandingCount?: number;
    chequesPending?: number;
  };
}

export const WinFormsSidebar: React.FC<WinFormsSidebarProps> = ({
  id,
  activeModule,
  onNavigate,
  onSelectModule,
  onOpenSettings,
  onLogout,
  counts,
}) => {
  const handleNavigation = (mod: NavModule) => {
    if (onSelectModule) {
      onSelectModule(mod);
    } else if (onNavigate) {
      onNavigate(mod);
    }
  };

  const navItems: {
    id: NavModule;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: <Users className="w-4 h-4" />,
      badge: counts?.tenants,
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: <FileText className="w-4 h-4" />,
      badge: counts?.contractsExpiring ? `${counts.contractsExpiring} Exp` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'monthly_rent',
      label: 'Monthly Rent',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'outstanding',
      label: 'Outstanding',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: counts?.outstandingCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'cheques',
      label: 'Cheques',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: counts?.chequesPending ? `${counts.chequesPending}` : undefined,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  // Normalize activeModule string for comparison
  const normalizedActive = (activeModule || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <aside
      id={id}
      className="w-56 bg-[#0F172A] text-slate-200 flex flex-col border-r border-[#334155] select-none text-[12px] font-sans shrink-0"
    >
      {/* App Branding Header in Sidebar */}
      <div className="px-3.5 py-3 border-b border-[#1E293B] bg-[#090D16] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded bg-[#2563EB] flex items-center justify-center text-white shadow-md shrink-0 border border-blue-400/30">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-[13px] text-white tracking-tight leading-tight truncate">
            Safari Mall Doha
          </div>
          <div className="text-[10px] text-emerald-400 font-mono leading-none mt-0.5 font-medium">
            Property Directorate
          </div>
        </div>
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
        <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Navigation Modules
        </div>
        {navItems.map((item) => {
          const itemNormalized = item.id.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isActive = normalizedActive === itemNormalized;
          return (
            <button
              key={item.id}
              type="button"
              id={`nav-item-${item.id}`}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[3px] text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="text-[12px]">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-[2px] font-mono leading-none ${
                    item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-[#334155] text-slate-200')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile and Settings Section */}
      <div className="p-2 border-t border-[#1E293B] bg-[#090D16]/70 space-y-1">
        {/* Logged in User Badge */}
        <div className="px-2 py-1.5 rounded-[3px] bg-[#1E293B] border border-[#334155] flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-[11px] font-semibold text-slate-200 truncate leading-tight">
              Administrator
            </div>
            <div className="text-[9px] text-emerald-400 truncate leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Safari Mall Operations
            </div>
          </div>
        </div>

        {/* Settings & Logout Buttons */}
        <div className="grid grid-cols-2 gap-1 pt-1">
          <button
            type="button"
            id="btn-sidebar-settings"
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-[3px] text-[11px] text-slate-300 hover:text-white bg-[#1E293B]/70 hover:bg-[#1E293B] border border-[#334155] transition-colors cursor-pointer"
            title="System Settings and JSON Data Store"
          >
            <Settings className="w-3 h-3 text-slate-400" />
            <span>Settings</span>
          </button>
          <button
            type="button"
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-[3px] text-[11px] text-rose-300 hover:text-white bg-[#1E293B]/70 hover:bg-rose-900/60 border border-[#334155] transition-colors cursor-pointer"
            title="Exit Session"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
