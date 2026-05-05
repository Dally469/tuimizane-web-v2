// Base API Response Types
export interface ApiResponse<T = any> {
  status: number;
  success: boolean;
  message: string;
  token?: string;
  data?: T;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  organization?: Organization;
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
  months: number;
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
  topThreePriority?: number | null;
  paymentStatus: 'PENDING' | 'PAID' | 'SKIPPED';
  paidAt?: string | null;
  amountPaid?: number | null;
  paymentReference?: string | null;
  topThree?: boolean;
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

export interface MemberHistoryPayoutDTO {
  id: string;
  weekNumber: number;
  expectedPayoutDate: string;
  memberNames: string;
  memberPhone: string;
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
export interface CreateContributionRequest {
  member: { id: string };
  season?: { id: string };
  amount: number;
  debitAmount: number;
  days: number;
  currency: string;
  createdBy: string;
  status: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  memberNames?: string;
  amount: number;
  debitAmount?: number;
  days?: number;
  currency: string;
  contributionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESET';
  statusOperator?: string;
  statusTime?: string;
  statusComment?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  seasonId?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContributionDTO {
  id: string;
  memberId: string;
  memberNames?: string;
  amount: number;
  debitAmount?: number;
  days?: number;
  currency: string;
  contributionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESET';
  statusOperator?: string;
  statusTime?: string;
  statusComment?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  seasonId?: string;
  createdAt?: string;
}

export interface MemberContributionResponseDTO {
  id: string;
  memberId: string;
  memberNames: string;
  amount: number;
  debitAmount?: number;
  currency: string;
  contributionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESET';
  paymentMethod?: string;
  referenceNumber?: string;
  createdAt: string;
}

export interface ContributionSummaryDTO {
  summary: {
    totalContributions: number;
    totalAmount: number;
    averageContribution: number;
    totalDebitAmount: number;
    membersWithDebit: number;
    uniqueMembers: number;
    uniqueDays: number;
  };
  filters: {
    organizationId: string;
    seasonId?: string;
    month?: number;
    year?: number;
    dateRange?: { start: string; end: string };
  };
  currencies: CurrencySummaryDTO[];
}

export interface CurrencySummaryDTO {
  currency: string;
  metrics: {
    totalContributions: number;
    totalAmount: number;
    averageContribution: number;
    totalDebitAmount: number;
    acceptedContributions: number;
    pendingContributions: number;
    rejectedContributions: number;
    resetContributions: number;
    uniqueMembers: number;
  };
  topContributors: TopContributorDTO[];
}

export interface TopContributorDTO {
  memberId: string;
  name: string;
  phone: string;
  totalAmount: number;
  contributionCount: number;
  averageContribution: number;
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

// Member Debit Analysis (working days Mon-Sat)
export interface WorkingDayDetail {
  date: string;
  dayOfWeek: string;
  status: 'PAID' | 'UNPAID' | 'DEBIT' | 'FUTURE';
  amount?: number;
  contributionId?: string;
}

export interface WorkingDaysCalendarDTO {
  memberId: string;
  memberNames: string;
  month: number;
  year: number;
  workingDays: WorkingDayDetail[];
  totalWorkingDays: number;
  paidDays: number;
  unpaidDays: number;
  debitDays: number;
}

export interface MemberDebitAnalysisDTO {
  memberId: string;
  memberNames: string;
  memberPhone?: string;
  memberCurrency?: string;
  totalWorkingDays: number;
  expectedWorkingDays?: number;
  actualContributedDays?: number;
  paidDays: number;
  unpaidDays: number;
  debitDays: number;
  debitAmount: number;
  actualContributedAmount?: number;
  expectedTotalAmount?: number;
  contributionRate: number;
  currency: string;
  dailyRate: number;
  dailyContributionAmount?: number;
  month: number;
  year: number;
  dailyWorkingDayDetails?: DailyWorkingDayDetail[];
  contributions?: MemberContributionDetail[];
}

export interface PayDebitRequestDTO {
  debitDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  referenceNumber?: string;
}

export interface BulkPayDebitRequestDTO {
  dates: string[];
  amountPerDay: number;
  currency: string;
  paymentMethod: string;
  referenceNumber?: string;
}

export interface MemberMonthlySummaryDTO {
  memberId: string;
  memberNames: string;
  month: number;
  year: number;
  totalContributions: number;
  totalAmount: number;
  totalDebit: number;
  paidDays: number;
  unpaidDays: number;
  debitDays: number;
}

export interface OrganizationDebitStatisticsDTO {
  totalMembers: number;
  membersWithDebit: number;
  totalDebitAmount: number;
  totalPaidAmount: number;
  averageDebitPerMember: number;
  currency: string;
  month?: number;
  year?: number;
}

export interface DailyWorkingDayDetail {
  date: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
  hasContribution: boolean;
  hasDebit: boolean;
  contributionAmount: number | null;
  debitAmount: number | null;
  expectedAmount: number | null;
  status: 'CONTRIBUTED' | 'MISSED' | 'FUTURE' | 'HOLIDAY';
  currency: string | null;
}

export interface MemberContributionDetail {
  id: string;
  memberId: string;
  memberNames: string;
  referenceNumber: string;
  seasonId: string;
  seasonStartDate: string;
  seasonEndDate: string;
  amount: number;
  debitAmount: number;
  days: number;
  currency: string;
  createdBy: string;
  status: string;
  statusOperator: string | null;
  statusTime: string | null;
  statusComment: string | null;
  createdAt: string;
}

export interface TopDefaulterDTO {
  memberId: string;
  memberNames: string;
  memberPhone: string;
  memberCurrency: string;
  month: number;
  year: number;
  expectedWorkingDays: number;
  actualContributedDays: number;
  debitDays: number;
  dailyContributionAmount: number;
  expectedTotalAmount: number;
  actualContributedAmount: number;
  debitAmount: number;
  debitDayDetails?: {
    debitDate: string;
    dayOfWeek: string;
    expectedAmountCurrency: string;
    expectedAmount: number;
    reason: string;
  }[];
  dailyWorkingDayDetails?: DailyWorkingDayDetail[];
  contributions?: MemberContributionDetail[];
}

// Organization Statistics (from GET /organizations/statistics)
export interface TopPerformerDTO {
  memberId: string;
  memberNames: string;
  memberPhone: string;
  amount: number;
  performanceType: 'CONTRIBUTOR' | 'DEFAULTER';
}

export interface MonthlyTrendDTO {
  month: number;
  year: number;
  monthName: string;
  contributionAmount: number;
  debitAmount: number;
  contributionCount: number;
  memberCount: number;
  complianceRate: number;
  periodStart: string;
  periodEnd: string;
}

export interface OrganizationStatisticsDTO {
  organizationId: string;
  seasonId?: string;
  month: number;
  year: number;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newMembersThisMonth: number;
  membersWithDebit: number;
  totalContributions: number;
  totalContributionAmount: number;
  averageContributionPerMember: number;
  primaryCurrency: string;
  totalWorkingDays: number;
  totalExpectedWorkingDays: number;
  totalActualWorkingDays: number;
  overallComplianceRate: number;
  totalDebitAmount: number;
  averageDebitPerMember: number;
  debitPercentage: number;
  membersWithZeroDebit: number;
  totalPayments: number;
  totalPaymentAmount: number;
  averagePaymentAmount: number;
  pendingPayments: number;
  seasonWeeks: number;
  completedWeeks: number;
  remainingWeeks: number;
  seasonProgress: number;
  collectionEfficiency: number;
  memberRetentionRate: number;
  paymentTimelinessRate: number;
  topContributors: TopPerformerDTO[];
  topDefaulters: TopPerformerDTO[];
  monthlyTrends: MonthlyTrendDTO[];
  startDate: string;
  endDate: string;
  generatedAt: string;
}

export interface MemberContributionsWithDebitDTO {
  memberId: string;
  memberNames: string;
  contributions: ContributionDTO[];
  totalAmount: number;
  totalDebit: number;
  currency: string;
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
export type ContributionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESET';
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
