import React, { useState } from 'react';
import { Policy, Claim, User } from '../types';
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
  FilePlus,
  Clock,
  Layers,
  Sparkles,
  Info,
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
  const totalPolicies = policies.length;
  const totalCoveredSI = policies.reduce((acc, p) => acc + p.sumInsured, 0);
  const availableSI = policies.reduce((acc, p) => acc + p.remainingClaimableSI, 0);
  const submittedClaims = claims.filter((c) => c.status === 'Submitted').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card (matching Image 3) */}
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
            <Badge variant="teal" className="text-[10px]">
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
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">
              {formatCurrency(availableSI)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Remaining claimable balance</p>
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
            {approvedClaims} approved by admin
          </p>
        </Card>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Customer Policies & History (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(val: any) => setActiveTab(val)}
            className="w-full"
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="policies">My Policies ({policies.length})</TabsTrigger>
                <TabsTrigger value="claims">
                  Claims History ({claims.length})
                  {submittedClaims > 0 && (
                    <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={() => onOpenSubmitClaim()}
                size="sm"
                variant="primary"
                className="rounded-xl gap-1.5 text-xs font-bold"
                disabled={policies.length === 0}
              >
                <FilePlus className="w-3.5 h-3.5" />
                Submit Claim
              </Button>
            </div>

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="space-y-6 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Registered Policies</h3>
                    <p className="text-xs text-slate-500">
                      Click "File Claim" on any policy to submit against that specific coverage.
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Submitted Claims Status</h3>
                    <p className="text-xs text-slate-500">
                      Live status tracking of your submitted claims.
                    </p>
                  </div>
                </div>
                <ClaimTable claims={claims} isAdmin={false} />
              </div>
            </TabsContent>

            {/* Policies Tab Content */}
            <TabsContent value="policies" className="space-y-4 mt-4">
              <PolicyTable
                policies={policies}
                isAdmin={false}
                onSelectForClaim={(p) => {
                  setSelectedPolicy(p);
                  onOpenSubmitClaim(p.id);
                }}
              />
            </TabsContent>

            {/* Claims Tab Content */}
            <TabsContent value="claims" className="space-y-4 mt-4">
              <ClaimTable claims={claims} isAdmin={false} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Live Policy Ledger Inspector (4 cols) */}
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
