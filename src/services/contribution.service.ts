import { httpRequest } from '@/lib/httpRequest';
import { store } from '@/store';
import {
  ApiResponse,
  BulkPayDebitRequestDTO,
  Contribution,
  ContributionDTO,
  ContributionSummaryDTO,
  CreateContributionRequest,
  MemberContributionResponseDTO,
  MemberContributionsWithDebitDTO,
  MemberDebitAnalysisDTO,
  OrganizationDebitStatisticsDTO,
  PayDebitRequestDTO,
  TopDefaulterDTO,
  WorkingDaysCalendarDTO,
  MemberMonthlySummaryDTO,
  DebitPaymentHistoryDTO,
} from '@/types/api';

export class ContributionService {
  // UUID validation regex
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private unwrapResponse<T>(response: ApiResponse<T> | T, fallbackMessage: string): ApiResponse<T> {
    if (
      response &&
      typeof response === 'object' &&
      'success' in (response as Record<string, unknown>) &&
      'status' in (response as Record<string, unknown>)
    ) {
      return response as ApiResponse<T>;
    }

    return {
      status: 200,
      success: true,
      message: fallbackMessage,
      data: response as T,
    };
  }

  private buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  private getAuthToken(): string | null {
    const { auth } = store.getState();
    if (auth.token) {
      return auth.token;
    }

    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }

    return null;
  }

  private async downloadExport(url: string, filename: string): Promise<void> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Accept-Language': 'en',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api${url}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      let message = response.statusText;

      try {
        const errorData = await response.json();
        message = errorData?.message || message;
      } catch {
        // Ignore JSON parsing failure and keep the default message.
      }

      throw new Error(message || 'Failed to export contributions');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Get all contributions
  async getAllContributions(params?: {
    memberId?: string;
    seasonId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ContributionDTO[]>> {
    const queryString = this.buildQueryString({
      memberId: params?.memberId,
      seasonId: params?.seasonId,
      status: params?.status,
      startDate: params?.startDate,
      endDate: params?.endDate,
      page: params?.page,
      limit: params?.limit,
    });
    
    try {
      const response = await httpRequest.get(`/contributions${queryString}`);
      return this.unwrapResponse<ContributionDTO[]>(response, 'Contributions retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get contributions' };
    }
  }

  // Get contribution by ID
  async getContributionById(id: string): Promise<ApiResponse<Contribution>> {
    if (!id || !this.isValidUUID(id)) {
      throw new Error('Invalid contribution ID: must be a valid UUID');
    }
    try {
      const response = await httpRequest.get(`/contributions/${id}`);
      return this.unwrapResponse<Contribution>(response, 'Contribution retrieved successfully');
    } catch (error: any) {
      return { status: 404, success: false, message: error.message || 'Failed to get contribution' };
    }
  }

  // Create new contribution
  async createContribution(contribution: CreateContributionRequest): Promise<ApiResponse<Contribution>> {
    try {
      const response = await httpRequest.post('/contributions', contribution);
      return this.unwrapResponse<Contribution>(response, 'Contribution created successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to create contribution' };
    }
  }

  // Update contribution
  async updateContribution(id: string, contribution: Partial<Contribution>): Promise<ApiResponse<Contribution>> {
    try {
      const response = await httpRequest.put(`/contributions/${id}`, contribution);
      return this.unwrapResponse<Contribution>(response, 'Contribution updated successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to update contribution' };
    }
  }

  // Delete contribution
  async deleteContribution(id: string): Promise<ApiResponse<void>> {
    try {
      await httpRequest.delete(`/contributions/${id}`);
      return { status: 200, success: true, message: 'Contribution deleted successfully' };
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to delete contribution' };
    }
  }

  // Approve contribution
  async approveContribution(id: string): Promise<ApiResponse<Contribution>> {
    try {
      const response = await httpRequest.put(`/contributions/${id}/approve`);
      return this.unwrapResponse<Contribution>(response, 'Contribution approved successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to approve contribution' };
    }
  }

  // Reject contribution
  async rejectContribution(id: string, reason?: string): Promise<ApiResponse<Contribution>> {
    try {
      const response = await httpRequest.put(`/contributions/${id}/reject`, { reason });
      return this.unwrapResponse<Contribution>(response, 'Contribution rejected successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to reject contribution' };
    }
  }

  // Get contributions by member
  async getContributionsByMember(memberId: string): Promise<ApiResponse<MemberContributionResponseDTO[]>> {
    try {
      const response = await httpRequest.get(`/contributions/member/${memberId}`);
      return this.unwrapResponse<MemberContributionResponseDTO[]>(response, 'Member contributions retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member contributions' };
    }
  }

  // Get contributions by season
  async getContributionsBySeason(seasonId: string): Promise<ApiResponse<ContributionDTO[]>> {
    try {
      const response = await httpRequest.get(`/contributions/season/${seasonId}`);
      return this.unwrapResponse<ContributionDTO[]>(response, 'Season contributions retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get season contributions' };
    }
  }

  // Get contribution summary
  async getContributionSummary(filters?: {
    memberId?: string;
    seasonId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ContributionSummaryDTO>> {
    const queryString = this.buildQueryString(filters || {});

    try {
      const response = await httpRequest.get(`/contributions/summary${queryString}`);
      return this.unwrapResponse<ContributionSummaryDTO>(response, 'Contribution summary retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get contribution summary' };
    }
  }

  // Check contribution existence
  async checkContributionExistence(memberId: string, date: string): Promise<ApiResponse<{
    exists: boolean;
    contribution?: ContributionDTO;
  }>> {
    const queryString = this.buildQueryString({ memberId, date });

    try {
      const response = await httpRequest.get(`/contributions/check${queryString}`);
      return this.unwrapResponse(response, 'Contribution existence checked successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to check contribution existence' };
    }
  }

  // Get daily contribution patterns
  async getDailyContributionPatterns(seasonId: string): Promise<ApiResponse<{
    date: string;
    totalAmount: number;
    contributionCount: number;
  }[]>> {
    try {
      const response = await httpRequest.get(`/contributions/daily-patterns/${seasonId}`);
      return this.unwrapResponse(response, 'Daily contribution patterns retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get daily contribution patterns' };
    }
  }

  // Get contribution statistics
  async getContributionStatistics(filters?: {
    seasonId?: string;
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    totalContributions: number;
    totalAmount: number;
    averageAmount: number;
    highestAmount: number;
    lowestAmount: number;
    statusBreakdown: {
      PENDING: number;
      ACCEPTED: number;
      REJECTED: number;
    };
  }>> {
    const queryString = this.buildQueryString(filters || {});

    try {
      const response = await httpRequest.get(`/contributions/statistics${queryString}`);
      return this.unwrapResponse(response, 'Contribution statistics retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get contribution statistics' };
    }
  }

  // Export contributions
  async exportContributions(filters?: {
    seasonId?: string;
    memberId?: string;
    startDate?: string;
    endDate?: string;
    format?: 'excel' | 'csv' | 'pdf';
  }): Promise<void> {
    const format = filters?.format ?? 'excel';
    const queryString = this.buildQueryString({
      format,
      seasonId: filters?.seasonId,
      memberId: filters?.memberId,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
    });

    return this.downloadExport(
      `/contributions/export${queryString}`,
      `contributions-export-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`
    );
  }

  // Bulk approve contributions
  async bulkApproveContributions(contributionIds: string[]): Promise<ApiResponse<Contribution[]>> {
    try {
      const response = await httpRequest.post('/contributions/bulk-approve', { contributionIds });
      return this.unwrapResponse<Contribution[]>(response, 'Contributions approved successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to bulk approve contributions' };
    }
  }

  // Bulk reject contributions
  async bulkRejectContributions(contributionIds: string[], reason?: string): Promise<ApiResponse<Contribution[]>> {
    try {
      const response = await httpRequest.post('/contributions/bulk-reject', { contributionIds, reason });
      return this.unwrapResponse<Contribution[]>(response, 'Contributions rejected successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to bulk reject contributions' };
    }
  }

  // Reset all ACCEPTED contributions to RESET status
  async resetContributions(): Promise<ApiResponse<ContributionDTO[]>> {
    try {
      const response = await httpRequest.put('/contributions/reset-to-reset');
      return this.unwrapResponse<ContributionDTO[]>(response, 'Contributions reset successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to reset contributions' };
    }
  }

  // Reset ACCEPTED contributions by season
  async resetContributionsBySeason(seasonId: string): Promise<ApiResponse<ContributionDTO[]>> {
    try {
      const response = await httpRequest.put(`/contributions/reset-to-reset/season/${seasonId}`);
      return this.unwrapResponse<ContributionDTO[]>(response, 'Season contributions reset successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to reset season contributions' };
    }
  }

  // Reset ACCEPTED contributions by member
  async resetContributionsByMember(memberId: string, resetDate?: string): Promise<ApiResponse<ContributionDTO[]>> {
    try {
      const queryString = resetDate ? this.buildQueryString({ resetDate }) : '';
      const response = await httpRequest.put(`/contributions/reset-to-reset/member/${memberId}${queryString}`);
      return this.unwrapResponse<ContributionDTO[]>(response, 'Member contributions reset successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to reset member contributions' };
    }
  }

  // Get contributions with debit for a member
  async getMemberContributionsWithDebit(memberId: string): Promise<ApiResponse<MemberContributionsWithDebitDTO>> {
    try {
      const response = await httpRequest.get(`/contributions/member/${memberId}/with-debit`);
      return this.unwrapResponse<MemberContributionsWithDebitDTO>(response, 'Member debit contributions retrieved');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member debit contributions' };
    }
  }

  // Get member debit analysis with working days (Mon-Sat)
  async getMemberDebitAnalysis(memberId: string, params?: {
    month?: number;
    year?: number;
    seasonId?: string;
  }): Promise<ApiResponse<MemberDebitAnalysisDTO>> {
    const queryString = this.buildQueryString(params || {});
    try {
      const response = await httpRequest.get(`/contributions/member/${memberId}/debit-analysis${queryString}`);
      return this.unwrapResponse<MemberDebitAnalysisDTO>(response, 'Debit analysis retrieved');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get debit analysis' };
    }
  }

  // Pay member debit for a specific date
  async payMemberDebit(memberId: string, payload: PayDebitRequestDTO): Promise<ApiResponse<Contribution>> {
    try {
      const response = await httpRequest.post(`/contributions/member/${memberId}/pay-debit`, payload);
      return this.unwrapResponse<Contribution>(response, 'Debit paid successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to pay debit' };
    }
  }

  // Bulk pay member debit for multiple dates
  async bulkPayMemberDebit(memberId: string, payload: BulkPayDebitRequestDTO): Promise<ApiResponse<Contribution[]>> {
    try {
      const response = await httpRequest.post(`/contributions/member/${memberId}/bulk-pay-debit`, payload);
      return this.unwrapResponse<Contribution[]>(response, 'Bulk debit payment successful');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to bulk pay debit' };
    }
  }

  // Get member working days calendar
  async getMemberWorkingDaysCalendar(memberId: string, params?: {
    month?: number;
    year?: number;
    seasonId?: string;
  }): Promise<ApiResponse<WorkingDaysCalendarDTO>> {
    const queryString = this.buildQueryString(params || {});
    try {
      const response = await httpRequest.get(`/contributions/member/${memberId}/working-days-calendar${queryString}`);
      return this.unwrapResponse<WorkingDaysCalendarDTO>(response, 'Working days calendar retrieved');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get working days calendar' };
    }
  }

  // Get member debit history
  async getMemberDebitHistory(memberId: string): Promise<ApiResponse<DebitPaymentHistoryDTO[]>> {
    try {
      const response = await httpRequest.get(`/contributions/member/${memberId}/debit-history`);
      return this.unwrapResponse<DebitPaymentHistoryDTO[]>(response, 'Debit history retrieved');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get debit history' };
    }
  }

  // Get organization debit statistics
  async getOrganizationDebitStatistics(params?: {
    month?: number;
    year?: number;
    seasonId?: string;
  }): Promise<ApiResponse<OrganizationDebitStatisticsDTO>> {
    const queryString = this.buildQueryString(params || {});
    try {
      const response = await httpRequest.get(`/contributions/organization/debit-statistics${queryString}`);
      return this.unwrapResponse<OrganizationDebitStatisticsDTO>(response, 'Debit statistics retrieved');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get debit statistics' };
    }
  }

  // Get top defaulters
  async getTopDefaulters(params?: {
    month?: number;
    year?: number;
    limit?: number;
  }): Promise<ApiResponse<TopDefaulterDTO[]>> {
    const queryString = this.buildQueryString(params || {});
    try {
      const response = await httpRequest.get(`/contributions/organization/top-defaulters${queryString}`);
      return this.unwrapResponse<TopDefaulterDTO[]>(response, 'Top defaulters retrieved');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get top defaulters' };
    }
  }

  // Get organization monthly summary
  async getOrganizationMonthlySummary(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<MemberMonthlySummaryDTO[]>> {
    const queryString = this.buildQueryString(params || {});
    try {
      const response = await httpRequest.get(`/contributions/organization/monthly-summary${queryString}`);
      return this.unwrapResponse<MemberMonthlySummaryDTO[]>(response, 'Monthly summary retrieved');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get monthly summary' };
    }
  }

  // Search contributions
  async searchContributions(query: string): Promise<ApiResponse<ContributionDTO[]>> {
    const queryString = this.buildQueryString({ query });
    try {
      const response = await httpRequest.get(`/contributions/search${queryString}`);
      return this.unwrapResponse<ContributionDTO[]>(response, 'Search results retrieved');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to search contributions' };
    }
  }
}

export const contributionService = new ContributionService();
