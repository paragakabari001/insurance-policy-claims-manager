import React, { useState, useEffect } from 'react';
import { api, getStoredToken, clearStoredToken, setStoredToken } from './api';
import { User, Policy, Claim, CustomerUser } from './types';
import { Sidebar } from './components/Sidebar';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'claims' | 'accounting'>('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Core Data
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modals & Action States
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [preselectedPolicyId, setPreselectedPolicyId] = useState<string | undefined>(undefined);
  const [isLoadingDecision, setIsLoadingDecision] = useState<string | null>(null);

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

      if (policiesRes.policies.length > 0) {
        setSelectedPolicy((prev) => {
          if (!prev) return policiesRes.policies[0];
          const updated = policiesRes.policies.find((p) => p.id === prev.id);
          return updated || policiesRes.policies[0];
        });
      }

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
    setSelectedPolicy(null);
    addToast('success', 'You have been signed out.');
  };

  // 1-Click Evaluator Account Switcher
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
      setActiveTab('overview');
      addToast('success', `Switched to ${res.user.name} (${res.user.role}).`);
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
    addToast('success', `Policy ${res.policy.id} successfully created!`);
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
      `Claim ${res.claim.id} submitted! Remaining claimable SI updated to ${formatCurrency(
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
        `Claim ${claimId} marked as ${decision}. Available SI is now ${formatCurrency(
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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading TailVaR Portal...
          </p>
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
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sleek Modern Left Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onQuickSwitch={handleQuickSwitch}
        pendingClaimsCount={pendingClaimsCount}
        policiesCount={policies.length}
      />

      {/* Main App Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar
          user={user}
          activeTab={activeTab}
          onOpenCreateModal={() => {
            if (user.role === 'Administrator') {
              setIsPolicyModalOpen(true);
            } else {
              handleOpenClaimModalForPolicy();
            }
          }}
          onRefresh={loadData}
          isLoading={isDataLoading}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
          {user.role === 'Administrator' ? (
            <AdminDashboard
              policies={policies}
              claims={claims}
              customers={customers}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenCreatePolicy={() => setIsPolicyModalOpen(true)}
              onDecideClaim={handleDecideClaim}
              isLoadingDecision={isLoadingDecision}
              selectedPolicy={selectedPolicy}
              setSelectedPolicy={setSelectedPolicy}
            />
          ) : (
            <CustomerDashboard
              user={user}
              policies={policies}
              claims={claims}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenSubmitClaim={handleOpenClaimModalForPolicy}
              selectedPolicy={selectedPolicy}
              setSelectedPolicy={setSelectedPolicy}
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
