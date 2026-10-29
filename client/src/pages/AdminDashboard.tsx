import React, { useState } from 'react';
import { Policy, Claim, CustomerUser } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { AccountingInspector } from '../components/AccountingInspector';
import {
  ShieldCheck,
  FileCheck2,
  Plus,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  policies: Policy[];
  claims: Claim[];
  customers: CustomerUser[];
  activeTab: 'overview' | 'policies' | 'claims' | 'accounting';
  setActiveTab: (tab: 'overview' | 'policies' | 'claims' | 'accounting') => void;
  onOpenCreatePolicy: () => void;
  onDecideClaim: (claimId: string, decision: 'Approved' | 'Rejected') => Promise<void>;
  isLoadingDecision: string | null;
  selectedPolicy: Policy | null;
  setSelectedPolicy: (policy: Policy) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  policies,
  claims,
  customers,
  activeTab,
  setActiveTab,
  onOpenCreatePolicy,
  onDecideClaim,
  isLoadingDecision,
  selectedPolicy,
  setSelectedPolicy,
}) => {
  const totalPolicies = policies.length;
  const totalSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const remainingSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const pendingClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview (Matching Image 3 perspective & style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Policies
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalPolicies}</span>
            <Badge variant="teal" className="text-[10px]">
              {customers.length} Customers
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-tenant active coverage</p>
        </Card>

        <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Sum Insured (SI)
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{formatCurrency(totalSI)}</span>
          </div>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">
            Available: {formatCurrency(remainingSI)}
          </p>
        </Card>

        <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Claims
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingClaims}</span>
            {pendingClaims > 0 && (
              <Badge variant="warning" className="text-[10px] animate-pulse">
                Needs Review
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Submitted & blocking SI</p>
        </Card>

        <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Approved Claims
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{approvedClaims}</span>
            <span className="text-xs text-slate-400 font-medium">of {claims.length} total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Permanent consumed SI</p>
        </Card>
      </div>

      {/* Main Content Area - Split Pane Architecture (matching Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Tables & Workflows (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs Selector matching Flowly & Optima UI */}
          <div className="flex items-center justify-between">
            <Tabs
              value={activeTab}
              onValueChange={(val: any) => setActiveTab(val)}
              className="w-full"
            >
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
                  <TabsTrigger value="claims">
                    Claims ({claims.length})
                    {pendingClaims > 0 && (
                      <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="accounting">SI Ledger</TabsTrigger>
                </TabsList>

                <Button
                  onClick={onOpenCreatePolicy}
                  size="sm"
                  variant="primary"
                  className="rounded-xl gap-1 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Policy
                </Button>
              </div>

              {/* Overview Tab Content */}
              <TabsContent value="overview" className="space-y-6 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Active Policies</h3>
                      <p className="text-xs text-slate-500">
                        Select a policy to inspect live balances in the right inspector pane.
                      </p>
                    </div>
                  </div>
                  <PolicyTable
                    policies={policies}
                    isAdmin={true}
                    onSelectForClaim={(p) => setSelectedPolicy(p)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Recent Claims & Decisions</h3>
                      <p className="text-xs text-slate-500">
                        Directly review and adjudicate pending claims.
                      </p>
                    </div>
                  </div>
                  <ClaimTable
                    claims={claims}
                    isAdmin={true}
                    onDecideClaim={onDecideClaim}
                    isLoadingDecision={isLoadingDecision}
                  />
                </div>
              </TabsContent>

              {/* Policies Only Tab */}
              <TabsContent value="policies" className="space-y-4 mt-4">
                <PolicyTable
                  policies={policies}
                  isAdmin={true}
                  onSelectForClaim={(p) => setSelectedPolicy(p)}
                />
              </TabsContent>

              {/* Claims Only Tab */}
              <TabsContent value="claims" className="space-y-4 mt-4">
                <ClaimTable
                  claims={claims}
                  isAdmin={true}
                  onDecideClaim={onDecideClaim}
                  isLoadingDecision={isLoadingDecision}
                />
              </TabsContent>

              {/* Accounting Rules Deep Dive Tab */}
              <TabsContent value="accounting" className="mt-4">
                <Card className="rounded-3xl p-6 bg-white border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <h3 className="font-extrabold text-slate-900">
                      Take-Home Specification Rule Engine (Section 1.6)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <p className="font-bold text-slate-900">1. Coverage Period Invariance</p>
                      <p className="text-slate-600 leading-relaxed">
                        Claims are accepted only when <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">startDate &lt;= incidentDate &lt;= endDate</code> (calendar dates YYYY-MM-DD).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <p className="font-bold text-slate-900">2. Immediate SI Blocking</p>
                      <p className="text-slate-600 leading-relaxed">
                        A <span className="text-amber-700 font-bold">Submitted</span> claim blocks SI immediately. Total (Submitted + Approved) can never exceed original Sum Insured.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <p className="font-bold text-slate-900">3. Rejection Releases Blocked SI</p>
                      <p className="text-slate-600 leading-relaxed">
                        If a claim is <span className="text-rose-700 font-bold">Rejected</span>, its blocked amount returns directly into available claimable SI.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <p className="font-bold text-slate-900">4. Decision Immutability</p>
                      <p className="text-slate-600 leading-relaxed">
                        Only Submitted claims can be approved or rejected. A decided claim cannot be decided again.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Side: Split Preview / Accounting Inspector (4 cols, matching Image 1) */}
        <div className="lg:col-span-4 sticky top-20">
          <AccountingInspector
            selectedPolicy={selectedPolicy}
            policies={policies}
            onSelectPolicy={setSelectedPolicy}
          />
        </div>
      </div>
    </div>
  );
};
