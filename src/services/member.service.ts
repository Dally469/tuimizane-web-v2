import apiClient from '@/lib/api-client';
import {
  ApiResponse,
  Member,
  MemberDTO,
  AssignCardRequest,
  UploadResultDTO,
  MemberContributionResponseDTO,
} from '@/types/api';

export class MemberService {
  // Get all members for the organization
  async getAllMembers(): Promise<ApiResponse<MemberDTO[]>> {
    return apiClient.get<MemberDTO[]>('/api/members');
  }

  // Get member by ID
  async getMemberById(id: string): Promise<ApiResponse<Member>> {
    return apiClient.get<Member>(`/api/members/${id}`);
  }

  // Create new member
  async createMember(member: Partial<Member>, months: number): Promise<ApiResponse<Member>> {
    return apiClient.post<Member>(`/api/members/add-member?months=${months}`, member);
  }

  // Update member
  async updateMember(id: string, memberDetails: Partial<Member>): Promise<ApiResponse<Member>> {
    return apiClient.put<Member>(`/api/members/${id}`, memberDetails);
  }

  // Delete member
  async deleteMember(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/members/${id}`);
  }

  // Change member status
  async changeMemberStatus(id: string, status: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/api/members/${id}/status?status=${status}`);
  }

  // Upload members from Excel file
  async uploadMembers(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<UploadResultDTO>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.upload<UploadResultDTO>('/api/members/upload', formData, onProgress);
  }

  // Assign card to member
  async assignCard(memberId: string, request: AssignCardRequest): Promise<ApiResponse<Member>> {
    return apiClient.put<Member>(`/api/members/${memberId}/assign-card`, request);
  }

  // Unassign card from member
  async unassignCard(memberId: string): Promise<ApiResponse<Member>> {
    return apiClient.put<Member>(`/api/members/${memberId}/unassign-card`);
  }

  // Find member by card number
  async findMemberByCard(cardNumber: string): Promise<ApiResponse<Member>> {
    return apiClient.get<Member>(`/api/members/find-by-card/${cardNumber}`);
  }

  // Get member contributions
  async getMemberContributions(memberId: string): Promise<ApiResponse<MemberContributionResponseDTO[]>> {
    return apiClient.get<MemberContributionResponseDTO[]>(`/api/members/${memberId}/contributions`);
  }

  // Get member contributions from start date
  async getMemberContributionsFromStartDate(
    memberId: string,
    seasonId?: string
  ): Promise<ApiResponse<MemberContributionResponseDTO[]>> {
    const params = seasonId ? { seasonId } : {};
    return apiClient.get<MemberContributionResponseDTO[]>(
      `/api/members/${memberId}/contributions-from-start-date`,
      params
    );
  }

  // Get member contributions by date range
  async getMemberContributionsByDateRange(
    memberId: string,
    startDate: string,
    endDate: string,
    seasonId?: string
  ): Promise<ApiResponse<MemberContributionResponseDTO[]>> {
    const params: any = { startDate, endDate };
    if (seasonId) params.seasonId = seasonId;
    
    return apiClient.get<MemberContributionResponseDTO[]>(
      `/api/members/${memberId}/contributions-by-date-range`,
      params
    );
  }

  // Get member history
  async getMemberHistory(
    memberId: string,
    startDate?: string,
    endDate?: string,
    seasonId?: string
  ): Promise<ApiResponse<any>> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (seasonId) params.seasonId = seasonId;
    
    return apiClient.get<any>(`/api/members/${memberId}/history`, params);
  }

  // Reset member start date
  async resetMemberStartDate(memberId: string, startDate: string, months?: number): Promise<ApiResponse<Member>> {
    const params: any = { startDate };
    if (months) params.months = months;
    
    return apiClient.put<Member>(`/api/members/${memberId}/reset-start-date`, null, params);
  }

  // Search members
  async searchMembers(query: string, filters?: {
    status?: string;
    type?: number;
    cardAssigned?: boolean;
  }): Promise<ApiResponse<MemberDTO[]>> {
    const params: any = { query };
    if (filters) {
      Object.assign(params, filters);
    }
    
    return apiClient.get<MemberDTO[]>('/api/members/search', params);
  }

  // Get member statistics
  async getMemberStatistics(memberId: string): Promise<ApiResponse<{
    totalContributions: number;
    totalAmount: number;
    averageContribution: number;
    lastContributionDate?: string;
    paymentStatus: string;
  }>> {
    return apiClient.get<any>(`/api/members/${memberId}/statistics`);
  }
}

export const memberService = new MemberService();
