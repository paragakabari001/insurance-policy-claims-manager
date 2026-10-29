import React, { useState } from 'react';
import { Policy, Claim, User } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { PolicyTable } from '../components/PolicyTable';
import { ClaimTable } from '../components/ClaimTable';
import { AccountingInspector } from '../components/AccountingInspector';
import {
  ShieldCheck,
  FilePlus,
  Clock,
  Layers,
  Sparkles,
  SlidersHorizontal,
  PieChart,
  X,
} from 'lucide-react';

interface CustomerDashboardProps {
  user: User;
  policies: Policy[];
  claims: Claim[];
  activeTab: 'overview' | 'policies' | 'claims' | 'accounting';
  setActiveTab: (tab: 'overview' | 'policies' | 'claims' | 'accounting') => void;
  onOpenSubmitClaim: (policyId?: string) => void;
  selectedPolicy: Policy | null;
  setSelectedPolicy: (policy: Policy) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  policies,
  claims,
  activeTab,
  setActiveTab,
  onOpenSubmitClaim,
  selectedPolicy,
  setSelectedPolicy,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const totalPolicies = policies.length;
  const totalCoveredSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const availableSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const submittedClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Top Banner Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              My Policies
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalPolicies}</span>
            <Badge variant="teal" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
              Active
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct insurance coverage</p>
        </Card>

        <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Covered SI
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">
              {formatCurrency(totalCoveredSI)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Aggregate policy limits</p>
        </Card>

        <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Available to Claim
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">
              {formatCurrency(availableSI)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Remaining claimable balance
          </p>
        </Card>

        <Card className="p-5 rounded-2xl bg-white border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              My Claims
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{claims.length}</span>
            <span className="text-xs text-amber-700 font-bold">
              ({submittedClaims} pending review)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {approvedClaims} approved by underwriter
          </p>
        </Card>
      </div>

      {/* Main Full-Width Content Container */}
      <div className="space-y-6 w-full">
        <Tabs
          value={activeTab}
          onValueChange={(val: any) => setActiveTab(val)}
          className="w-full"
        >
          {/* Header controls toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="policies">My Policies ({policies.length})</TabsTrigger>
              <TabsTrigger value="claims">
                Claims History ({claims.length})
                {submittedClaims > 0 && (
                  <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="accounting">SI Ledger</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowDrawer(true)}
                size="sm"
                variant="outline"
                className="rounded-xl gap-1.5 text-xs font-bold"
                title="Inspect Live Policy SI Ledger"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                <span>Live SI Ledger</span>
              </Button>

              <Button
                onClick={() => onOpenSubmitClaim()}
                size="sm"
                className="bg-[#06241b] hover:bg-[#083528] text-white rounded-xl gap-1.5 text-xs font-bold shadow-2xs"
                disabled={policies.length === 0}
              >
                <FilePlus className="w-3.5 h-3.5" />
                Submit Claim
              </Button>
            </div>
          </div>

          {/* Overview Tab Content (Full Width Tables) */}
          <TabsContent value="overview" className="space-y-6 mt-4 w-full">
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Registered Policies</h3>
                  <p className="text-xs text-slate-500">
                    Click "File Claim" on any policy to submit against that specific coverage limit.
                  </p>
                </div>
              </div>
              <PolicyTable
                policies={policies}
                isAdmin={false}
                onSelectForClaim={(p) => {
                  setSelectedPolicy(p);
                  onOpenSubmitClaim(p.id);
                }}
              />
            </div>

            <div className="space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Submitted Claims Status</h3>
                  <p className="text-xs text-slate-500">
                    Live status tracking of your submitted insurance claims.
                  </p>
                </div>
              </div>
              <ClaimTable claims={claims} isAdmin={false} />
            </div>
          </TabsContent>

          {/* Policies Only Tab (Full Width) */}
          <TabsContent value="policies" className="space-y-4 mt-4 w-full">
            <PolicyTable
              policies={policies}
              isAdmin={false}
              onSelectForClaim={(p) => {
                setSelectedPolicy(p);
                onOpenSubmitClaim(p.id);
              }}
            />
          </TabsContent>

          {/* Claims Only Tab (Full Width) */}
          <TabsContent value="claims" className="space-y-4 mt-4 w-full">
            <ClaimTable claims={claims} isAdmin={false} />
          </TabsContent>

          {/* Accounting Ledger Tab */}
          <TabsContent value="accounting" className="mt-4 space-y-6 w-full">
            <div className="max-w-2xl mx-auto">
              <AccountingInspector
                selectedPolicy={selectedPolicy}
                policies={policies}
                onSelectPolicy={setSelectedPolicy}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Slide-over Drawer for Live SI Ledger */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-extrabold text-slate-900 text-base">Policy Ledger Inspector</h3>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AccountingInspector
                selectedPolicy={selectedPolicy}
                policies={policies}
                onSelectPolicy={setSelectedPolicy}
              />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Button
                onClick={() => setShowDrawer(false)}
                variant="outline"
                className="w-full rounded-xl font-bold text-xs"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
