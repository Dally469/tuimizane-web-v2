import apiClient from '@/lib/api-client';
import {
  ApiResponse,
  Contribution,
  ContributionDTO,
  ContributionSummaryDTO,
  MemberContributionResponseDTO,
} from '@/types/api';

export class ContributionService {
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
    return apiClient.get<ContributionDTO[]>('/api/contributions', params);
  }

  // Get contribution by ID
  async getContributionById(id: string): Promise<ApiResponse<Contribution>> {
    return apiClient.get<Contribution>(`/api/contributions/${id}`);
  }

  // Create new contribution
  async createContribution(contribution: Partial<Contribution>): Promise<ApiResponse<Contribution>> {
    return apiClient.post<Contribution>('/api/contributions', contribution);
  }

  // Update contribution
  async updateContribution(id: string, contribution: Partial<Contribution>): Promise<ApiResponse<Contribution>> {
    return apiClient.put<Contribution>(`/api/contributions/${id}`, contribution);
  }

  // Delete contribution
  async deleteContribution(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/contributions/${id}`);
  }

  // Approve contribution
  async approveContribution(id: string): Promise<ApiResponse<Contribution>> {
    return apiClient.put<Contribution>(`/api/contributions/${id}/approve`);
  }

  // Reject contribution
  async rejectContribution(id: string, reason?: string): Promise<ApiResponse<Contribution>> {
    return apiClient.put<Contribution>(`/api/contributions/${id}/reject`, { reason });
  }

  // Get contributions by member
  async getContributionsByMember(memberId: string): Promise<ApiResponse<MemberContributionResponseDTO[]>> {
    return apiClient.get<MemberContributionResponseDTO[]>(`/api/contributions/member/${memberId}`);
  }

  // Get contributions by season
  async getContributionsBySeason(seasonId: string): Promise<ApiResponse<ContributionDTO[]>> {
    return apiClient.get<ContributionDTO[]>(`/api/contributions/season/${seasonId}`);
  }

  // Get contribution summary
  async getContributionSummary(filters?: {
    memberId?: string;
    seasonId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ContributionSummaryDTO>> {
    return apiClient.get<ContributionSummaryDTO>('/api/contributions/summary', filters);
  }

  // Check contribution existence
  async checkContributionExistence(memberId: string, date: string): Promise<ApiResponse<{
    exists: boolean;
    contribution?: ContributionDTO;
  }>> {
    return apiClient.get<any>(`/api/contributions/check`, { memberId, date });
  }

  // Get daily contribution patterns
  async getDailyContributionPatterns(seasonId: string): Promise<ApiResponse<{
    date: string;
    totalAmount: number;
    contributionCount: number;
  }[]>> {
    return apiClient.get<any[]>(`/api/contributions/daily-patterns/${seasonId}`);
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
    return apiClient.get<any>('/api/contributions/statistics', filters);
  }

  // Export contributions
  async exportContributions(filters?: {
    seasonId?: string;
    memberId?: string;
    startDate?: string;
    endDate?: string;
    format?: 'excel' | 'csv' | 'pdf';
  }): Promise<void> {
    const params = { format: 'excel', ...filters };
    return apiClient.download('/api/contributions/export', `contributions-export-${Date.now()}.xlsx`);
  }

  // Bulk approve contributions
  async bulkApproveContributions(contributionIds: string[]): Promise<ApiResponse<Contribution[]>> {
    return apiClient.post<Contribution[]>('/api/contributions/bulk-approve', { contributionIds });
  }

  // Bulk reject contributions
  async bulkRejectContributions(contributionIds: string[], reason?: string): Promise<ApiResponse<Contribution[]>> {
    return apiClient.post<Contribution[]>('/api/contributions/bulk-reject', { contributionIds, reason });
  }
}

export const contributionService = new ContributionService();
