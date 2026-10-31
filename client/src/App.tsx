import React, { useState, useEffect } from 'react';
import { api, getStoredToken, clearStoredToken, setStoredToken } from './api';
import { User, Policy, Claim, CustomerUser } from './types';
import { Sidebar, ActiveView } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CreatePolicyModal } from './components/CreatePolicyModal';
import { SubmitClaimModal } from './components/SubmitClaimModal';
import { Toaster } from './components/ui/toaster';
import { toast } from './components/ui/use-toast';
import { formatCurrency } from './utils/formatters';

// Helper functions to map URL paths to application views and back
export const pathToView = (path: string): ActiveView => {
  const clean = path.replace(/^\/+/, '').split('/')[0].split('?')[0].toLowerCase();
  switch (clean) {
    case 'policies':
      return 'policies';
    case 'claims':
      return 'claims';
    case 'customers':
      return 'customers';
    case 'analytics':
      return 'analytics';
    case 'reports':
      return 'reports';
    case 'dashboard':
    default:
      return 'dashboard';
  }
};

export const viewToPath = (view: ActiveView): string => {
  return view === 'dashboard' ? '/dashboard' : `/${view}`;
};

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveViewState] = useState<ActiveView>(() => {
    return pathToView(window.location.pathname);
  });

  // Synchronized navigation function: updates React view and browser history / URL
  const setActiveView = (view: ActiveView, replace = false) => {
    setActiveViewState(view);
    const targetPath = viewToPath(view);
    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ view }, '', targetPath);
      } else {
        window.history.pushState({ view }, '', targetPath);
      }
    }
  };

  // Listen to popstate (browser Back and Forward buttons) and sync URL on mount
  useEffect(() => {
    const handlePopState = () => {
      const view = pathToView(window.location.pathname);
      setActiveViewState(view);
    };

    // If currently on '/' or empty, normalize to '/dashboard' without extra history entry
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState({ view: 'dashboard' }, '', '/dashboard');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Role-based route protection: Customer cannot access '/customers'
  useEffect(() => {
    if (user && user.role !== 'Administrator' && activeView === 'customers') {
      setActiveView('dashboard', true);
    }
  }, [user?.role, activeView]);

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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Hamburger: opens the drawer on mobile, collapses/expands the sidebar on desktop.
  const handleMenuToggle = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setIsSidebarCollapsed((prev) => !prev);
    } else {
      setIsMobileDrawerOpen(true);
    }
  };

  const addToast = (type: 'success' | 'error', text: string) => {
    toast({
      variant: type === 'success' ? 'success' : 'destructive',
      title: type === 'success' ? 'Success' : 'Error',
      description: text,
    });
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

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    const targetView = pathToView(
      window.location.pathname === '/login' ? '/dashboard' : window.location.pathname
    );
    setActiveView(targetView, true);
    addToast('success', `Welcome back, ${loggedInUser.name}`);
  };

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
    setActiveViewState('dashboard');
    window.history.replaceState({ view: 'dashboard' }, '', '/login');
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
      // Clear previous cached account data when switching demo user
      setPolicies([]);
      setClaims([]);
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
        <LoginPage onLoginSuccess={handleLoginSuccess} onNotify={addToast} />
        <Toaster />
      </>
    );
  }

  const pendingClaimsCount = claims.filter((c) => c.status === 'Submitted').length;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8fafc] flex">
      {/* Responsive Sidebar (Desktop & Mobile Drawer) */}
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
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area (Unified full-height canvas, flush with sidebar & topbar, zero double-backgrounds) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] h-screen transition-all overflow-hidden">
        <TopBar
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          policies={policies}
          claims={claims}
          customers={customers}
          onOpenCreatePolicy={() => setIsPolicyModalOpen(true)}
          onOpenSubmitClaim={() => handleOpenClaimModalForPolicy()}
          onRefresh={loadData}
          isLoading={isDataLoading}
          onOpenMobileMenu={handleMenuToggle}
          onQuickSwitch={handleQuickSwitch}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6 w-full pb-28 md:pb-6 bg-[#f8fafc]">
          <div key={activeView} className="anim-page">
          {user.role === 'Administrator' ? (
            <AdminDashboard
              user={user}
              policies={policies}
              claims={claims}
              customers={customers}
              activeView={activeView}
              setActiveView={setActiveView}
              onDecideClaim={handleDecideClaim}
              isLoadingDecision={isLoadingDecision}
              onOpenCreatePolicy={() => setIsPolicyModalOpen(true)}
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
          </div>
        </main>
      </div>

      {/* Native-feeling Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        pendingClaimsCount={pendingClaimsCount}
        policiesCount={policies.length}
        onOpenProfileDrawer={() => setIsMobileDrawerOpen(true)}
      />

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

      <Toaster />
    </div>
  );
}

export default App;
