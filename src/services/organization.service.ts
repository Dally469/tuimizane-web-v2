import { httpRequest } from '@/lib/httpRequest';
import { store } from '@/store';
import { ApiResponse, Organization, OrganizationDTO, OrganizationStatisticsDTO } from '@/types/api';

export class OrganizationService {
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
    if (auth.token) return auth.token;
    if (typeof window !== 'undefined') return localStorage.getItem('auth_token');
    return null;
  }

  private async downloadExport(url: string, filename: string): Promise<void> {
    const token = this.getAuthToken();
    const headers: HeadersInit = { 'Accept-Language': 'en' };
    if (token) headers.Authorization = `Bearer ${token}`;

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
        // Ignore JSON parsing failure
      }
      throw new Error(message || 'Failed to export organization data');
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

  // Get organization by ID
  async getOrganizationById(id: string): Promise<ApiResponse<Organization>> {
    if (!id || !this.isValidUUID(id)) {
      throw new Error('Invalid organization ID: must be a valid UUID');
    }
    try {
      const response = await httpRequest.get(`/organizations/${id}`);
      return this.unwrapResponse<Organization>(response, 'Organization retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get organization' };
    }
  }

  // Get current user's organization
  async getCurrentOrganization(): Promise<ApiResponse<OrganizationDTO>> {
    try {
      const response = await httpRequest.get('/organizations/current');
      return this.unwrapResponse<OrganizationDTO>(response, 'Organization retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get current organization' };
    }
  }

  // Update organization
  async updateOrganization(id: string, organization: Partial<Organization>): Promise<ApiResponse<Organization>> {
    try {
      const response = await httpRequest.put(`/organizations/${id}`, organization);
      return this.unwrapResponse<Organization>(response, 'Organization updated successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to update organization' };
    }
  }

  // Get organization statistics
  async getOrganizationStatistics(params?: {
    month?: number;
    year?: number;
    seasonId?: string;
    topPerformersLimit?: number;
  }): Promise<ApiResponse<OrganizationStatisticsDTO>> {
    const queryString = this.buildQueryString(params || {});
    try {
      const response = await httpRequest.get(`/organizations/statistics${queryString}`);
      return this.unwrapResponse<OrganizationStatisticsDTO>(response, 'Organization statistics retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get organization statistics' };
    }
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
    const queryString = period ? this.buildQueryString({ period }) : '';
    const basePath = organizationId ? `/organizations/${organizationId}/performance` : '/organizations/performance';
    try {
      const response = await httpRequest.get(`${basePath}${queryString}`);
      return this.unwrapResponse(response, 'Performance metrics retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get performance metrics' };
    }
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
    const url = organizationId ? `/organizations/${organizationId}/member-stats` : '/organizations/member-stats';
    try {
      const response = await httpRequest.get(url);
      return this.unwrapResponse(response, 'Member statistics retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member statistics' };
    }
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
    const url = organizationId ? `/organizations/${organizationId}/seasonal-comparison` : '/organizations/seasonal-comparison';
    try {
      const response = await httpRequest.get(url);
      return this.unwrapResponse(response, 'Seasonal comparison retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get seasonal comparison' };
    }
  }

  // Export organization data
  async exportOrganizationData(
    organizationId?: string,
    format: 'excel' | 'csv' | 'pdf' = 'excel',
    dataTypes?: string[]
  ): Promise<void> {
    const queryString = this.buildQueryString({
      format,
      dataTypes: dataTypes?.join(','),
    });
    const basePath = organizationId ? `/organizations/${organizationId}/export` : '/organizations/export';
    return this.downloadExport(`${basePath}${queryString}`, `organization-data-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`);
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
    const url = organizationId ? `/organizations/${organizationId}/settings` : '/organizations/settings';
    try {
      const response = await httpRequest.get(url);
      return this.unwrapResponse(response, 'Organization settings retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get organization settings' };
    }
  }

  // Update organization settings
  async updateOrganizationSettings(settings: any, organizationId?: string): Promise<ApiResponse<void>> {
    const url = organizationId ? `/organizations/${organizationId}/settings` : '/organizations/settings';
    try {
      const response = await httpRequest.put(url, settings);
      return this.unwrapResponse<void>(response, 'Organization settings updated successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to update organization settings' };
    }
  }
}

export const organizationService = new OrganizationService();
