import apiClient from '@/lib/api-client';
import { ApiResponse, Organization, OrganizationDTO } from '@/types/api';

export class OrganizationService {
  // Get organization by ID
  async getOrganizationById(id: string): Promise<ApiResponse<Organization>> {
    return apiClient.get<Organization>(`/api/organizations/${id}`);
  }

  // Get current user's organization
  async getCurrentOrganization(): Promise<ApiResponse<OrganizationDTO>> {
    return apiClient.get<OrganizationDTO>('/api/organizations/current');
  }

  // Update organization
  async updateOrganization(id: string, organization: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return apiClient.put<Organization>(`/api/organizations/${id}`, organization);
  }

  // Get organization statistics
  async getOrganizationStatistics(organizationId?: string): Promise<ApiResponse<{
    totalMembers: number;
    activeMembers: number;
    totalSeasons: number;
    activeSeasons: number;
    totalContributions: number;
    totalAmount: number;
    currentMonthContributions: number;
    currentMonthAmount: number;
    paymentCompletionRate: number;
  }>> {
    const url = organizationId ? `/api/organizations/${organizationId}/statistics` : '/api/organizations/statistics';
    return apiClient.get<any>(url);
  }

  // Get organization performance metrics
  async getPerformanceMetrics(organizationId?: string, period?: 'month' | 'quarter' | 'year'): Promise<ApiResponse<{
    period: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    memberGrowth: number;
    retentionRate: number;
    averageContributionPerMember: number;
    seasonCompletionRate: number;
  }>> {
    const params: any = {};
    if (period) params.period = period;
    
    const url = organizationId ? `/api/organizations/${organizationId}/performance` : '/api/organizations/performance';
    return apiClient.get<any>(url, params);
  }

  // Get member statistics
  async getMemberStatistics(organizationId?: string): Promise<ApiResponse<{
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    newMembersThisMonth: number;
    membersWithCards: number;
    membersWithoutCards: number;
    averageMemberDuration: number;
  }>> {
    const url = organizationId ? `/api/organizations/${organizationId}/member-stats` : '/api/organizations/member-stats';
    return apiClient.get<any>(url);
  }

  // Get seasonal comparison
  async getSeasonalComparison(organizationId?: string): Promise<ApiResponse<{
    currentSeason: {
      seasonName: string;
      totalMembers: number;
      totalContributions: number;
      completionRate: number;
    };
    previousSeason: {
      seasonName: string;
      totalMembers: number;
      totalContributions: number;
      completionRate: number;
    };
    comparison: {
      memberGrowth: number;
      contributionGrowth: number;
      completionRateChange: number;
    };
  }>> {
    const url = organizationId ? `/api/organizations/${organizationId}/seasonal-comparison` : '/api/organizations/seasonal-comparison';
    return apiClient.get<any>(url);
  }

  // Export organization data
  async exportOrganizationData(
    organizationId?: string,
    format: 'excel' | 'csv' | 'pdf' = 'excel',
    dataTypes?: string[]
  ): Promise<void> {
    const params: any = { format };
    if (dataTypes) params.dataTypes = dataTypes.join(',');
    
    const url = organizationId ? `/api/organizations/${organizationId}/export` : '/api/organizations/export';
    return apiClient.download(url, `organization-data-${Date.now()}.${format}`);
  }

  // Get organization settings
  async getOrganizationSettings(organizationId?: string): Promise<ApiResponse<{
    defaultCurrency: string;
    contributionFrequency: string;
    paymentMethods: string[];
    notificationSettings: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      paymentReminders: boolean;
    };
    seasonSettings: {
      defaultDuration: number;
      autoSchedule: boolean;
      allowMemberRemoval: boolean;
    };
  }>> {
    const url = organizationId ? `/api/organizations/${organizationId}/settings` : '/api/organizations/settings';
    return apiClient.get<any>(url);
  }

  // Update organization settings
  async updateOrganizationSettings(settings: any, organizationId?: string): Promise<ApiResponse<void>> {
    const url = organizationId ? `/api/organizations/${organizationId}/settings` : '/api/organizations/settings';
    return apiClient.put<void>(url, settings);
  }
}

export const organizationService = new OrganizationService();
