export type UserRole = 'Customer' | 'Administrator';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface Policy {
  id: string;
  customerId: string;
  customerUsername?: string;
  customerName?: string;
  startDate: string;
  endDate: string;
  sumInsured: number;
  remainingClaimableSI: number;
  totalReservedAndUsed?: number;
  totalBlockedOrConsumed?: number;
  coverageStatus?: 'Upcoming' | 'Active' | 'Expired';
  submittedTotal?: number;
  approvedTotal?: number;
  rejectedTotal?: number;
  claimsCount?: number;
  createdAt: string;
}

export type ClaimStatus = 'Submitted' | 'Approved' | 'Rejected';

export interface Claim {
  id: string;
  policyId: string;
  incidentDate: string;
  amount: number;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    username: string;
    name: string;
  };
  policyDetails?: {
    id: string;
    startDate: string;
    endDate: string;
    sumInsured: number;
    remainingClaimableSI: number;
  };
}

export interface CustomerUser {
  id: string;
  username: string;
  name: string;
  createdAt: string;
}
