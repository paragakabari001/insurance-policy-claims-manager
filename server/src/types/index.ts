import { Request } from 'express';

export type UserRole = 'Customer' | 'Administrator';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface PolicyWithSI {
  id: string;
  customerId: string;
  customerName?: string;
  customerUsername?: string;
  startDate: string;
  endDate: string;
  sumInsured: number;
  totalClaimedOrApproved: number;
  remainingClaimableSI: number;
  claimsCount: number;
  createdAt: Date;
}
