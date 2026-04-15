// Base API Response Types
export interface ApiResponse<T = any> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    organizationId: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

// Member Types
export interface Member {
  id: string;
  names: string;
  phone: string;
  email?: string;
  idNumber: string;
  amount: string;
  currency: string;
  address: string;
  startDate?: string;
  endDate?: string;
  type: number;
  status: string;
  card?: string;
  organizationId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MemberDTO {
  id: string;
  names: string;
  phone: string;
  email?: string;
  idNumber: string;
  amount: string;
  currency: string;
  address: string;
  startDate?: string;
  endDate?: string;
  type: number;
  status: string;
  card?: string;
  organizationId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AssignCardRequest {
  cardNumber: string;
}

export interface UploadResultDTO {
  totalRecords: number;
  successCount: number;
  failedCount: number;
  errors?: string[];
}

// Season Types
export interface Season {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  organizationId: string;
  organization: Organization;
  createdAt: string;
  updatedAt?: string;
}

export interface SeasonsDTO {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  organizationId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SeasonRequest {
  months: number;
  status: string;
  createdBy: string;
  organizationId: string;
}

export interface SeasonCreationRequestDTO {
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  memberIds: string[];
  topThreeMemberIds?: string[];
}

export interface SeasonUpdateRequestDTO {
  startDate?: string;
  endDate?: string;
  status?: string;
  createdBy?: string;
}

export interface SeasonMember {
  id: string;
  seasonId: string;
  memberId: string;
  organizationId: string;
  ranking: number;
  isTopThree: boolean;
  topThreePriority?: number;
  paymentStatus: 'PENDING' | 'PAID' | 'SKIPPED';
  paidAt?: string;
  amountPaid?: number;
  paymentReference?: string;
  paidBy?: string;
  createdAt: string;
  updatedAt?: string;
  member: Member;
}

export interface MemberRankingDTO {
  seasonMemberId: string;
  memberId: string;
  memberNames: string;
  memberPhone: string;
  memberStartDate?: string;
  ranking: number;
  isTopThree: boolean;
  topThreePriority?: number;
  paymentStatus: 'PENDING' | 'PAID' | 'SKIPPED';
  paidAt?: string;
  amountPaid?: number;
  paymentReference?: string;
}

// Payment Types
export interface PaymentProcessRequestDTO {
  paymentDate: string;
  paymentMethod: string;
  processedBy: string;
  comments?: string;
  customAmount?: number;
}

export interface MemberPayout {
  id: string;
  seasonId: string;
  memberId: string;
  organizationId: string;
  weekNumber: number;
  expectedPayoutDate: string;
  actualPayoutDate?: string;
  amount: number;
  currency: string;
  status: 'SCHEDULED' | 'PAID' | 'CANCELLED' | 'PENDING';
  referenceNumber?: string;
  paymentMethod?: string;
  rankingPosition: number;
  contributingDays: number;
  totalContributions: number;
  processedBy?: string;
  comments?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MemberPayoutDTO {
  id: string;
  weekNumber: number;
  expectedPayoutDate: string;
  memberNames: string;
  status: 'SCHEDULED' | 'PAID' | 'CANCELLED' | 'PENDING';
  amount?: number;
  currency?: string;
}

export interface SeasonStatusDTO {
  seasonId: string;
  startDate: string;
  endDate: string;
  status: string;
  totalMembers: number;
  membersPaid: number;
  membersRemaining: number;
  currentWeekNumber: number;
  nextPayoutDate?: string;
  nextMemberName?: string;
  nextMemberId?: string;
  totalAmountPaid: number;
  estimatedTotalPayout: number;
  isCircleCompleted: boolean;
  completionPercentage: number;
}

// Contribution Types
export interface Contribution {
  id: string;
  memberId: string;
  amount: number;
  currency: string;
  contributionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  paymentMethod?: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContributionDTO {
  id: string;
  memberId: string;
  amount: number;
  currency: string;
  contributionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  paymentMethod?: string;
  referenceNumber?: string;
}

export interface MemberContributionResponseDTO {
  id: string;
  memberId: string;
  memberNames: string;
  amount: number;
  currency: string;
  contributionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  paymentMethod?: string;
  referenceNumber?: string;
  createdAt: string;
}

export interface ContributionSummaryDTO {
  totalContributions: number;
  totalAmount: number;
  acceptedContributions: number;
  pendingContributions: number;
  rejectedContributions: number;
}

// Debit Types
export interface DebitAlertDTO {
  memberId: string;
  memberNames: string;
  totalDebit: number;
  overdueDays: number;
  lastPaymentDate?: string;
}

export interface DebitSummaryDTO {
  memberId: string;
  memberNames: string;
  totalDebit: number;
  totalPaid: number;
  remainingDebit: number;
  paymentHistoryCount: number;
}

export interface EnhancedDebitSummaryDTO extends DebitSummaryDTO {
  overdueDays: number;
  lastPaymentDate?: string;
  averageMonthlyPayment: number;
  projectedPayoffDate?: string;
}

export interface DebitPaymentHistoryDTO {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  createdAt: string;
}

// Filter and Search Types
export interface FilterRequest {
  startDate?: string;
  endDate?: string;
  status?: string;
  memberId?: string;
  seasonId?: string;
  organizationId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// Utility Types
export type PaymentStatus = 'PENDING' | 'PAID' | 'SKIPPED';
export type SeasonStatus = 'ACTIVE' | 'ENDED' | 'SCHEDULED';
export type ContributionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type MemberType = 0 | 1 | 2; // Based on backend documentation
export type PaymentMethod = 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CASH' | 'OTHER';

// Request Headers
export interface AuthHeaders {
  Authorization: string;
}

// Common Request Options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}
