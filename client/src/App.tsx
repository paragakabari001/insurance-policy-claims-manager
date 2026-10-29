import React, { useState, useEffect } from 'react';
import { api, getStoredToken, clearStoredToken, setStoredToken } from './api';
import { User } from './types';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ToastContainer, ToastMessage } from './components/Toast';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // Check existing session
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

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    clearStoredToken();
    setUser(null);
    addToast('success', 'Logged out successfully.');
  };

  // Quick Switch for reviewers
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
      addToast('success', `Switched account to ${res.user.name} (${res.user.role})`);
    } catch (err: any) {
      addToast('error', `Failed to switch to ${username}: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading TailVaR Portal...</p>
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} onQuickSwitch={handleQuickSwitch} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {user.role === 'Administrator' ? (
          <AdminDashboard onNotify={addToast} />
        ) : (
          <CustomerDashboard user={user} onNotify={addToast} />
        )}
      </main>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
