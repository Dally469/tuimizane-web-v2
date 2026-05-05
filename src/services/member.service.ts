import { httpRequest } from '@/lib/httpRequest';
import {
  ApiResponse,
  Member,
  MemberDTO,
  AssignCardRequest,
  UploadResultDTO,
  MemberContributionResponseDTO,
  TopDefaulterDTO,
} from '@/types/api';

export class MemberService {
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

  /**
   * Fetch paginated members
   * @param page 0-based page index
   * @param size page size
   * @param sortBy field to sort by (default: 'names')
   * @param sortDirection 'asc' or 'desc' (default: 'asc')
   */
  async getAllMembers({
    page = 0,
    size = 20,
    sortBy = 'names',
    sortDirection = 'asc',
  }: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<{ content: MemberDTO[]; totalPages: number; totalElements: number; page: number; size: number }>> {
    try {
      const url = `/members/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
      const response = await httpRequest.get(url);
      return this.unwrapResponse(response, 'Members retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get members' };
    }
  }

  // Get member by ID
  async getMemberById(id: string): Promise<ApiResponse<Member>> {
    if (!id || !this.isValidUUID(id)) {
      throw new Error('Invalid member ID: must be a valid UUID');
    }
    try {
      const response = await httpRequest.get(`/members/${id}`);
      return this.unwrapResponse<Member>(response, 'Member retrieved successfully');
    } catch (error: any) {
      return { status: 404, success: false, message: error.message || 'Failed to get member' };
    }
  }

  // Create new member
  async createMember(member: Partial<Member>, months: number): Promise<ApiResponse<Member>> {
    try {
      const response = await httpRequest.post(`/members/add-member?months=${months}`, member);
      return this.unwrapResponse<Member>(response, 'Member created successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to create member' };
    }
  }

  // Update member
  async updateMember(id: string, memberDetails: Partial<Member>): Promise<ApiResponse<Member>> {
    try {
      const response = await httpRequest.put(`/members/${id}`, memberDetails);
      return this.unwrapResponse<Member>(response, 'Member updated successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to update member' };
    }
  }

  // Delete member
  async deleteMember(id: string): Promise<ApiResponse<void>> {
    try {
      await httpRequest.delete(`/members/${id}`);
      return { status: 200, success: true, message: 'Member deleted successfully' };
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to delete member' };
    }
  }

  // Change member status
  async changeMemberStatus(id: string, status: string): Promise<ApiResponse<void>> {
    try {
      await httpRequest.put(`/members/${id}/status?status=${status}`);
      return { status: 200, success: true, message: 'Member status changed successfully' };
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to change member status' };
    }
  }

  // Upload members from Excel file
  async uploadMembers(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<UploadResultDTO>> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await httpRequest.post('/members/upload', formData, true); // multipart
      return this.unwrapResponse<UploadResultDTO>(response, 'Members uploaded successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to upload members' };
    }
  }

  // Assign card to member
  async assignCard(memberId: string, request: AssignCardRequest): Promise<ApiResponse<Member>> {
    try {
      const response = await httpRequest.put(`/members/${memberId}/assign-card`, request);
      return this.unwrapResponse<Member>(response, 'Card assigned successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to assign card' };
    }
  }

  // Unassign card from member
  async unassignCard(memberId: string): Promise<ApiResponse<Member>> {
    try {
      const response = await httpRequest.put(`/members/${memberId}/unassign-card`);
      return this.unwrapResponse<Member>(response, 'Card unassigned successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to unassign card' };
    }
  }

  // Find member by card number
  async findMemberByCard(cardNumber: string): Promise<ApiResponse<Member>> {
    try {
      const response = await httpRequest.get(`/members/find-by-card/${cardNumber}`);
      return this.unwrapResponse<Member>(response, 'Member found successfully');
    } catch (error: any) {
      return { status: 404, success: false, message: error.message || 'Failed to find member by card' };
    }
  }

  // Get member contributions
  async getMemberContributions(memberId: string): Promise<ApiResponse<MemberContributionResponseDTO[]>> {
    try {
      const response = await httpRequest.get(`/members/${memberId}/contributions`);
      return this.unwrapResponse<MemberContributionResponseDTO[]>(response, 'Member contributions retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member contributions' };
    }
  }

  // Get member contributions from start date
  async getMemberContributionsFromStartDate(
    memberId: string,
    seasonId?: string
  ): Promise<ApiResponse<MemberContributionResponseDTO[]>> {
    const url = seasonId 
      ? `/members/${memberId}/contributions-from-start-date?seasonId=${seasonId}`
      : `/members/${memberId}/contributions-from-start-date`;
    
    try {
      const response = await httpRequest.get(url);
      return this.unwrapResponse<MemberContributionResponseDTO[]>(response, 'Member contributions from start date retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member contributions from start date' };
    }
  }

  // Get member contributions by date range
  async getMemberContributionsByDateRange(
    memberId: string,
    startDate: string,
    endDate: string,
    seasonId?: string
  ): Promise<ApiResponse<MemberContributionResponseDTO[]>> {
    const params = seasonId 
      ? `?startDate=${startDate}&endDate=${endDate}&seasonId=${seasonId}`
      : `?startDate=${startDate}&endDate=${endDate}`;
    
    try {
      const response = await httpRequest.get(`/members/${memberId}/contributions-by-date-range${params}`);
      return this.unwrapResponse<MemberContributionResponseDTO[]>(response, 'Member contributions by date range retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member contributions by date range' };
    }
  }

  // Get member history
  async getMemberHistory(
    memberId: string,
    startDate?: string,
    endDate?: string,
    seasonId?: string
  ): Promise<ApiResponse<any>> {
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (seasonId) params.push(`seasonId=${seasonId}`);
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    
    try {
      const response = await httpRequest.get(`/members/${memberId}/history${queryString}`);
      return this.unwrapResponse(response, 'Member history retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member history' };
    }
  }

  // Reset member start date
  async resetMemberStartDate(memberId: string, startDate: string, months?: number): Promise<ApiResponse<Member>> {
    const params = months ? `?startDate=${startDate}&months=${months}` : `?startDate=${startDate}`;
    
    try {
      const response = await httpRequest.put(`/members/${memberId}/reset-start-date${params}`);
      return this.unwrapResponse<Member>(response, 'Member start date reset successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to reset member start date' };
    }
  }

  // Search members
  async searchMembers(query: string, filters?: {
    status?: string;
    type?: number;
    cardAssigned?: boolean;
  }): Promise<ApiResponse<MemberDTO[]>> {
    const params = [`query=${encodeURIComponent(query)}`];
    if (filters) {
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.type !== undefined) params.push(`type=${filters.type}`);
      if (filters.cardAssigned !== undefined) params.push(`cardAssigned=${filters.cardAssigned}`);
    }
    const queryString = `?${params.join('&')}`;
    
    try {
      const response = await httpRequest.get(`/members/search${queryString}`);
      return this.unwrapResponse<MemberDTO[]>(response, 'Members searched successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to search members' };
    }
  }

  // Get member detail with debit information
  async getMemberDetail(memberId: string): Promise<ApiResponse<TopDefaulterDTO>> {
    if (!memberId || !this.isValidUUID(memberId)) {
      throw new Error('Invalid member ID: must be a valid UUID');
    }
    try {
      const response = await httpRequest.get(`/members/${memberId}`);
      return this.unwrapResponse<TopDefaulterDTO>(response, 'Member detail retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member detail' };
    }
  }

  // Get member statistics
  async getMemberStatistics(memberId: string): Promise<ApiResponse<{
    totalContributions: number;
    totalAmount: number;
    averageContribution: number;
    lastContributionDate?: string;
    paymentStatus: string;
  }>> {
    try {
      const response = await httpRequest.get(`/members/${memberId}/statistics`);
      return this.unwrapResponse(response, 'Member statistics retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get member statistics' };
    }
  }
}

export const memberService = new MemberService();
