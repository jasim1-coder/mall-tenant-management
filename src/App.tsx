import React, { useState, useEffect, useCallback } from 'react';
import { NavModule, Tenant, MonthlyCharge, PaymentRecord, ChequeRecord, OutstandingChargeDetail, ChequeStatus } from './types';
import {
  loadAppData,
  saveAppData,
  resetAppData,
  addTenantToStore,
  updateTenantInStore,
  deleteTenantFromStore,
  renewTenantContractInStore,
  addPaymentToStore,
  updateChequeStatusInStore,
  addChequeToStore,
  batchImportTenantsToStore,
} from './services/dataStore';

// WinForms Framework Shell Components
import { WinFormsWindow } from './components/winforms/WinFormsWindow';
import { WinFormsSidebar } from './components/winforms/WinFormsSidebar';
import { WinFormsStatusStrip } from './components/winforms/WinFormsStatusStrip';
import { SettingsModal } from './components/winforms/SettingsModal';

// Views
import { DashboardView } from './views/DashboardView';
import { TenantsView } from './views/TenantsView';
import { ContractsView } from './views/ContractsView';
import { MonthlyRentView } from './views/MonthlyRentView';
import { OutstandingView } from './views/OutstandingView';
import { PaymentsView } from './views/PaymentsView';
import { ChequesView } from './views/ChequesView';
import { ReportsView } from './views/ReportsView';
import { TenantDetailsView } from './views/TenantDetailsView';
import { PaymentEntryView } from './views/PaymentEntryView';

// Modals
import { AddEditTenantModal } from './views/AddEditTenantModal';
import { ImportExcelModal } from './views/ImportExcelModal';
import { RenewContractModal } from './views/RenewContractModal';

export default function App() {
  // Navigation State
  const [activeModule, setActiveModule] = useState<NavModule>('dashboard');
  const [detailedTenant, setDetailedTenant] = useState<Tenant | null>(null);
  const [paymentPresetTenantId, setPaymentPresetTenantId] = useState<string | null>(null);

  // App Data State
  const [data, setData] = useState(() => loadAppData());

  // Modal Dialogs State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);

  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [tenantToRenew, setTenantToRenew] = useState<Tenant | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // System Status Message State
  const [statusMessage, setStatusMessage] = useState('Ready');

  // Flash a status message in the WinForms status strip
  const showStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage('Ready');
    }, 4000);
  }, []);

  // Reload data from storage
  const refreshData = useCallback(() => {
    setData(loadAppData());
  }, []);

  // Sync state on reset
  const handleResetData = () => {
    resetAppData();
    refreshData();
    setIsSettingsOpen(false);
    showStatus('Database successfully restored to default factory dataset.');
  };

  // --- Handlers for Tenant Operations ---
  const handleOpenAddTenant = () => {
    setTenantToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditTenant = (tenant: Tenant) => {
    setTenantToEdit(tenant);
    setIsAddEditModalOpen(true);
  };

  const handleSaveTenant = (tenantData: Partial<Tenant>) => {
    if (tenantToEdit) {
      updateTenantInStore(tenantData.id!, tenantData);
      showStatus(`Tenant record [${tenantData.name}] successfully updated.`);
    } else {
      addTenantToStore(tenantData);
      showStatus(`New tenant [${tenantData.name}] successfully registered.`);
    }
    refreshData();
    // Also update detailed view if active
    if (detailedTenant && detailedTenant.id === tenantData.id) {
      setDetailedTenant((prev) => (prev ? { ...prev, ...tenantData } as Tenant : null));
    }
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    deleteTenantFromStore(tenant.id);
    refreshData();
    showStatus(`Tenant record [${tenant.name}] deleted from ledger.`);
    if (detailedTenant?.id === tenant.id) {
      setDetailedTenant(null);
    }
  };

  const handleOpenRenewContract = (tenant: Tenant) => {
    setTenantToRenew(tenant);
    setIsRenewModalOpen(true);
  };

  const handleConfirmRenewal = (
    tenantId: string,
    newEndDate: string,
    newMonthlyRent: number,
    remarks: string
  ) => {
    renewTenantContractInStore(tenantId, newEndDate, newMonthlyRent, remarks);
    refreshData();
    showStatus(`Contract for tenant renewed through ${newEndDate}.`);
    if (detailedTenant?.id === tenantId) {
      const updated = loadAppData().tenants.find((t) => t.id === tenantId);
      if (updated) setDetailedTenant(updated);
    }
  };

  const handleImportExcelComplete = (importedList: Tenant[]) => {
    batchImportTenantsToStore(importedList);
    refreshData();
    showStatus(`Successfully imported ${importedList.length} tenant records from Excel file.`);
  };

  // --- Handlers for Payments ---
  const handleOpenReceivePayment = (tenant?: Tenant) => {
    if (tenant) {
      setPaymentPresetTenantId(tenant.id);
    } else {
      setPaymentPresetTenantId(null);
    }
    setActiveModule('receive_payment' as any);
    setDetailedTenant(null);
  };

  const handleSavePayment = (payment: Partial<PaymentRecord>) => {
    addPaymentToStore(payment);
    refreshData();
    showStatus(`Payment receipt [${payment.receiptNo}] of QAR ${payment.amount?.toLocaleString()} posted.`);
  };

  // --- Handlers for Cheques ---
  const handleUpdateChequeStatus = (chequeId: string, status: ChequeStatus) => {
    updateChequeStatusInStore(chequeId, status);
    refreshData();
    showStatus(`Cheque status updated to "${status}".`);
  };

  const handleAddCheque = (newCheque: Partial<ChequeRecord>) => {
    addChequeToStore(newCheque);
    refreshData();
    showStatus(`Cheque [${newCheque.chequeNo}] registered in custody.`);
  };

  // Count active/expiring/expired for status strip & sidebar
  const totalTenantsCount = data.tenants.length;
  const expiringContractsCount = data.tenants.filter((t) => t.status === 'Expiring').length;
  const bouncedChequesCount = data.cheques.filter((c) => c.status === 'Bounced').length;

  // View Tenant Details switch
  const handleOpenTenantDetails = (tenant: Tenant) => {
    setDetailedTenant(tenant);
  };

  const handleBackFromDetails = () => {
    setDetailedTenant(null);
  };

  // Active view content rendering
  const renderActiveView = () => {
    // If a tenant detail view is active, render it
    if (detailedTenant) {
      return (
        <TenantDetailsView
          id="view-tenant-details"
          tenant={detailedTenant}
          allCharges={data.monthlyCharges}
          allPayments={data.payments}
          allCheques={data.cheques}
          allOutstanding={data.outstandingCharges}
          onBack={handleBackFromDetails}
          onEditTenant={handleOpenEditTenant}
          onReceivePayment={handleOpenReceivePayment}
          onRenewContract={handleOpenRenewContract}
        />
      );
    }

    // Otherwise render based on active navigation module
    const normalizedMod = (activeModule || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

    switch (normalizedMod) {
      case 'dashboard':
        return (
          <DashboardView
            id="view-dashboard"
            appState={data}
            tenants={data.tenants}
            monthlyCharges={data.monthlyCharges}
            payments={data.payments}
            cheques={data.cheques}
            outstandingCharges={data.outstandingCharges}
            recentActivities={data.recentActivities}
            onNavigate={(mod) => {
              setDetailedTenant(null);
              setActiveModule(mod);
            }}
            onOpenAddTenant={handleOpenAddTenant}
            onNewTenant={handleOpenAddTenant}
            onOpenReceivePayment={() => handleOpenReceivePayment()}
            onReceivePayment={() => handleOpenReceivePayment()}
            onOpenImportExcel={() => setIsImportExcelOpen(true)}
            onImportExcel={() => setIsImportExcelOpen(true)}
          />
        );

      case 'tenants':
        return (
          <TenantsView
            id="view-tenants"
            tenants={data.tenants}
            onOpenAddTenant={handleOpenAddTenant}
            onAddTenant={handleOpenAddTenant}
            onOpenImportExcel={() => setIsImportExcelOpen(true)}
            onImportExcel={() => setIsImportExcelOpen(true)}
            onOpenEditTenant={handleOpenEditTenant}
            onEditTenant={handleOpenEditTenant}
            onViewTenantDetails={handleOpenTenantDetails}
            onOpenDetails={handleOpenTenantDetails}
            onDeleteTenant={handleDeleteTenant}
            onReceivePayment={handleOpenReceivePayment}
            onReceivePaymentForTenant={handleOpenReceivePayment}
          />
        );

      case 'contracts':
        return (
          <ContractsView
            id="view-contracts"
            tenants={data.tenants}
            onViewContract={handleOpenTenantDetails}
            onRenewContract={handleOpenRenewContract}
          />
        );

      case 'monthlyrent':
      case 'monthly_rent':
        return (
          <MonthlyRentView
            id="view-monthly-rent"
            monthlyCharges={data.monthlyCharges}
            onReceivePaymentForCharge={(charge) => {
              const matchingTenant = data.tenants.find((t) => t.id === charge.tenantId);
              handleOpenReceivePayment(matchingTenant);
            }}
            onGenerateCharges={(month) => {
              showStatus(`Monthly charges for [${month}] refreshed successfully.`);
            }}
            onViewTenantDetails={(tenantId) => {
              const matchingTenant = data.tenants.find((t) => t.id === tenantId);
              if (matchingTenant) handleOpenTenantDetails(matchingTenant);
            }}
          />
        );

      case 'outstanding':
        return (
          <OutstandingView
            id="view-outstanding"
            tenants={data.tenants}
            outstandingCharges={data.outstandingCharges}
            onReceivePaymentForTenant={handleOpenReceivePayment}
            onOpenTenantDetails={handleOpenTenantDetails}
          />
        );

      case 'payments':
        return (
          <PaymentsView
            id="view-payments"
            payments={data.payments}
            tenants={data.tenants}
            onOpenNewPayment={() => handleOpenReceivePayment()}
          />
        );

      case 'receivepayment':
      case 'receive_payment':
        return (
          <PaymentEntryView
            id="view-receive-payment"
            tenants={data.tenants}
            outstandingCharges={data.outstandingCharges}
            initialTenantId={paymentPresetTenantId}
            onSavePayment={handleSavePayment}
            onCancel={() => setActiveModule('payments')}
          />
        );

      case 'cheques':
        return (
          <ChequesView
            id="view-cheques"
            cheques={data.cheques}
            tenants={data.tenants}
            onUpdateChequeStatus={handleUpdateChequeStatus}
            onAddCheque={handleAddCheque}
          />
        );

      case 'reports':
        return (
          <ReportsView
            id="view-reports"
            tenants={data.tenants}
            monthlyCharges={data.monthlyCharges}
            payments={data.payments}
            cheques={data.cheques}
            outstanding={data.outstandingCharges}
          />
        );

      default:
        return (
          <DashboardView
            id="view-dashboard-fallback"
            appState={data}
            tenants={data.tenants}
            monthlyCharges={data.monthlyCharges}
            payments={data.payments}
            cheques={data.cheques}
            outstandingCharges={data.outstandingCharges}
            recentActivities={data.recentActivities}
            onNavigate={(mod) => {
              setDetailedTenant(null);
              setActiveModule(mod);
            }}
            onOpenAddTenant={handleOpenAddTenant}
            onNewTenant={handleOpenAddTenant}
            onOpenReceivePayment={() => handleOpenReceivePayment()}
            onReceivePayment={() => handleOpenReceivePayment()}
            onOpenImportExcel={() => setIsImportExcelOpen(true)}
            onImportExcel={() => setIsImportExcelOpen(true)}
          />
        );
    }
  };

  return (
    <div id="mall-tenant-management-root" className="w-screen h-screen overflow-hidden bg-[#CBD5E1] p-1.5 sm:p-3 flex items-center justify-center select-none font-sans">
      <WinFormsWindow
        id="main-app-window"
        title={`${data.settings?.mallName || 'Safari Mall Doha'} - Tenant Management System`}
        onNavigate={(mod) => {
          setDetailedTenant(null);
          setActiveModule(mod);
        }}
        onNewTenant={handleOpenAddTenant}
        onReceivePayment={() => handleOpenReceivePayment()}
        onImportExcel={() => setIsImportExcelOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={refreshData}
        onExportData={() => {
          const jsonStr = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `safari_mall_backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          showStatus('JSON database backup exported.');
        }}
        onAbout={() => {
          showStatus('Safari Mall Doha - Tenant Management System v2.6');
        }}
      >
        <div className="flex-1 flex flex-col min-h-0 bg-[#F1F5F9] overflow-hidden">
          {/* Main Workspace Split: Sidebar + Content Area */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Sidebar Navigation */}
            <WinFormsSidebar
              id="main-sidebar"
              activeModule={detailedTenant ? 'tenants' : activeModule}
              onSelectModule={(mod) => {
                setDetailedTenant(null);
                setActiveModule(mod);
              }}
              onNavigate={(mod) => {
                setDetailedTenant(null);
                setActiveModule(mod);
              }}
              counts={{
                tenants: totalTenantsCount,
                contractsExpiring: expiringContractsCount,
                outstandingCount: data.outstandingCharges.filter((c) => c.balance > 0).length,
                chequesPending: data.cheques.filter((c) => c.status === 'Received').length,
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onLogout={() => {
                showStatus('User session active (Prototype Mode).');
              }}
            />

            {/* Content Area */}
            <main id="main-content-viewport" className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-hidden">
              {renderActiveView()}
            </main>
          </div>

          {/* WinForms StatusStrip Footer */}
          <WinFormsStatusStrip
            id="main-statusstrip"
            statusText={statusMessage}
            recordCount={totalTenantsCount}
            mallName={data.settings?.mallName || 'Safari Mall Doha'}
          />
        </div>
      </WinFormsWindow>

      {/* --- Dialog Modals --- */}
      <AddEditTenantModal
        id="modal-add-edit-tenant"
        isOpen={isAddEditModalOpen}
        tenantToEdit={tenantToEdit}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveTenant}
      />

      <ImportExcelModal
        id="modal-import-excel"
        isOpen={isImportExcelOpen}
        onClose={() => setIsImportExcelOpen(false)}
        onImportComplete={handleImportExcelComplete}
      />

      <RenewContractModal
        id="modal-renew-contract"
        isOpen={isRenewModalOpen}
        tenant={tenantToRenew}
        onClose={() => setIsRenewModalOpen(false)}
        onConfirmRenewal={handleConfirmRenewal}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetData={handleResetData}
      />
    </div>
  );
}
