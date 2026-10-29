import React, { useState, useEffect } from 'react';
import { api, getStoredToken, clearStoredToken, setStoredToken } from './api';
import { User, Policy, Claim, CustomerUser } from './types';
import { Sidebar, ActiveView } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CreatePolicyModal } from './components/CreatePolicyModal';
import { SubmitClaimModal } from './components/SubmitClaimModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { formatCurrency } from './utils/formatters';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Core Data
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modals & Action States
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [preselectedPolicyId, setPreselectedPolicyId] = useState<string | undefined>(undefined);
  const [isLoadingDecision, setIsLoadingDecision] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const addToast = (type: 'success' | 'error', text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all domain data
  const loadData = async () => {
    if (!user) return;
    try {
      setIsDataLoading(true);
      const [policiesRes, claimsRes] = await Promise.all([
        api.getPolicies(),
        api.getClaims(),
      ]);
      setPolicies(policiesRes.policies);
      setClaims(claimsRes.claims);

      if (user.role === 'Administrator') {
        const custRes = await api.getCustomers();
        setCustomers(custRes.customers);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to sync data with server.');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getCurrentUser();
        setUser(res.user);
      } catch (err) {
        clearStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Reload data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    clearStoredToken();
    setUser(null);
    setPolicies([]);
    setClaims([]);
    setActiveView('dashboard');
    addToast('success', 'You have been signed out.');
  };

  // 1-Click Evaluator Account Switcher (Uses actual API login endpoint)
  const handleQuickSwitch = async (username: string) => {
    const passwords: Record<string, string> = {
      customer1: 'Customer1@Demo26',
      customer2: 'Customer2@Demo26',
      admin: 'Admin@Demo26',
    };

    try {
      const res = await api.login({
        username,
        password: passwords[username],
      });
      setStoredToken(res.token);
      setUser(res.user);
      setActiveView('dashboard');
      addToast('success', `Signed in as ${res.user.name} (${res.user.role}).`);
    } catch (err: any) {
      addToast('error', `Failed to switch to ${username}: ${err.message}`);
    }
  };

  // Action: Create Policy (Admin)
  const handleCreatePolicy = async (data: {
    customerId: string;
    startDate: string;
    endDate: string;
    sumInsured: number;
    customId?: string;
  }) => {
    const res = await api.createPolicy(data);
    addToast('success', `Policy ${res.policy.id} successfully created.`);
    await loadData();
  };

  // Action: Submit Claim (Customer)
  const handleSubmitClaim = async (data: {
    policyId: string;
    incidentDate: string;
    amount: number;
    customId?: string;
  }) => {
    const res = await api.submitClaim(data);
    addToast(
      'success',
      `Claim ${res.claim.id} submitted. Available coverage updated to ${formatCurrency(
        res.remainingClaimableSI
      )}.`
    );
    await loadData();
  };

  // Action: Decide Claim (Admin)
  const handleDecideClaim = async (claimId: string, decision: 'Approved' | 'Rejected') => {
    try {
      setIsLoadingDecision(claimId);
      const res = await api.decideClaim(claimId, decision);
      addToast(
        'success',
        `Claim ${claimId} marked as ${decision}. Available coverage is now ${formatCurrency(
          res.policyRemainingClaimableSI
        )}.`
      );
      await loadData();
    } catch (err: any) {
      addToast('error', err.message || `Failed to ${decision.toLowerCase()} claim.`);
    } finally {
      setIsLoadingDecision(null);
    }
  };

  const handleOpenClaimModalForPolicy = (policyId?: string) => {
    setPreselectedPolicyId(policyId);
    setIsClaimModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onLoginSuccess={setUser} onNotify={addToast} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  const pendingClaimsCount = claims.filter((c) => c.status === 'Submitted').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Single Clean Sidebar Navigation */}
      <Sidebar
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        onQuickSwitch={handleQuickSwitch}
        pendingClaimsCount={pendingClaimsCount}
        policiesCount={policies.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar
          user={user}
          activeView={activeView}
          onOpenCreatePolicy={() => setIsPolicyModalOpen(true)}
          onOpenSubmitClaim={() => handleOpenClaimModalForPolicy()}
          onRefresh={loadData}
          isLoading={isDataLoading}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 px-5 py-6 sm:px-8 w-full">
          {user.role === 'Administrator' ? (
            <AdminDashboard
              policies={policies}
              claims={claims}
              customers={customers}
              activeView={activeView}
              onDecideClaim={handleDecideClaim}
              isLoadingDecision={isLoadingDecision}
            />
          ) : (
            <CustomerDashboard
              user={user}
              policies={policies}
              claims={claims}
              activeView={activeView}
              onOpenSubmitClaim={handleOpenClaimModalForPolicy}
            />
          )}
        </main>
      </div>

      {/* Create Policy Modal (Admin) */}
      <CreatePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        customers={customers}
        onSubmit={handleCreatePolicy}
      />

      {/* Submit Claim Modal (Customer) */}
      <SubmitClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        policies={policies}
        preselectedPolicyId={preselectedPolicyId}
        onSubmit={handleSubmitClaim}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
