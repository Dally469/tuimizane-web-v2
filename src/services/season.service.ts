import { httpRequest } from '@/lib/httpRequest';
import {
  ApiResponse,
  Season,
  SeasonsDTO,
  SeasonRequest,
  SeasonCreationRequestDTO,
  SeasonUpdateRequestDTO,
  SeasonMember,
  MemberRankingDTO,
} from '@/types/api';

export class SeasonService {
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

  // Get all seasons for the organization
  async getAllSeasons(): Promise<ApiResponse<SeasonsDTO[]>> {
    try {
      const response = await httpRequest.get('/seasons');
      return this.unwrapResponse<SeasonsDTO[]>(response, 'Seasons retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get seasons' };
    }
  }

  // Get season by ID
  async getSeasonById(id: string): Promise<ApiResponse<Season>> {
    if (!id || !this.isValidUUID(id)) {
      throw new Error('Invalid season ID: must be a valid UUID');
    }
    try {
      const response = await httpRequest.get(`/seasons/${id}`);
      return this.unwrapResponse<Season>(response, 'Season retrieved successfully');
    } catch (error: any) {
      return { status: 404, success: false, message: error.message || 'Failed to get season' };
    }
  }

  // Create new season
  async createSeason(request: SeasonRequest): Promise<ApiResponse<Season>> {
    try {
      const response = await httpRequest.post('/seasons', request);
      return this.unwrapResponse<Season>(response, 'Season created successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to create season' };
    }
  }

  // Create season with members
  async createSeasonWithMembers(request: SeasonCreationRequestDTO): Promise<ApiResponse<Season>> {
    try {
      const response = await httpRequest.post('/seasons/with-members', request);
      return this.unwrapResponse<Season>(response, 'Season created with members successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to create season with members' };
    }
  }

  // Update season
  async updateSeason(id: string, request: SeasonUpdateRequestDTO): Promise<ApiResponse<Season>> {
    try {
      const response = await httpRequest.put(`/seasons/${id}`, request);
      return this.unwrapResponse<Season>(response, 'Season updated successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to update season' };
    }
  }

  // Delete season
  async deleteSeason(id: string): Promise<ApiResponse<void>> {
    try {
      await httpRequest.delete(`/seasons/${id}`);
      return { status: 200, success: true, message: 'Season deleted successfully' };
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to delete season' };
    }
  }

  // End season
  async endSeason(seasonId: string): Promise<ApiResponse<Season>> {
    try {
      const response = await httpRequest.put(`/seasons/${seasonId}/end`);
      return this.unwrapResponse<Season>(response, 'Season ended successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to end season' };
    }
  }

  // Get season members
  async getSeasonMembers(seasonId: string): Promise<ApiResponse<MemberRankingDTO[]>> {
    try {
      const response = await httpRequest.get(`/seasons/${seasonId}/members`);
      return this.unwrapResponse<MemberRankingDTO[]>(response, 'Season members retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get season members' };
    }
  }

  // Add members to season
  async addMembersToSeason(seasonId: string, memberIds: string[]): Promise<ApiResponse<SeasonMember[]>> {
    try {
      const response = await httpRequest.post(`/seasons/${seasonId}/add-members`, memberIds);
      return this.unwrapResponse<SeasonMember[]>(response, 'Members added to season successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to add members to season' };
    }
  }

  // Set top three members
  async setTopThreeMembers(seasonId: string, memberIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await httpRequest.put(`/seasons/${seasonId}/set-top-three`, memberIds);
      return this.unwrapResponse<void>(response, 'Top three members set successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to set top three members' };
    }
  }

  // Recalculate rankings
  async recalculateRankings(seasonId: string): Promise<ApiResponse<void>> {
    try {
      const response = await httpRequest.put(`/seasons/${seasonId}/recalculate-rankings`);
      return this.unwrapResponse<void>(response, 'Rankings recalculated successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to recalculate rankings' };
    }
  }

  // Remove single member from season
  async removeMemberFromSeason(seasonId: string, memberId: string): Promise<ApiResponse<string>> {
    try {
      const response = await httpRequest.delete(`/seasons/${seasonId}/remove-member/${memberId}`);
      return this.unwrapResponse<string>(response, 'Member removed from season successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to remove member from season' };
    }
  }

  // Remove multiple members from season
  async removeMembersFromSeason(seasonId: string, memberIds: string[]): Promise<ApiResponse<string[]>> {
    try {
      const response = await httpRequest.delete(`/seasons/${seasonId}/remove-members`, memberIds);
      return this.unwrapResponse<string[]>(response, 'Members removed from season successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to remove members from season' };
    }
  }

  // Remove all unpaid members from season
  async removeAllUnpaidMembers(seasonId: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await httpRequest.delete(`/seasons/${seasonId}/remove-unpaid-members`);
      return this.unwrapResponse<string[]>(response, 'Unpaid members removed successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to remove unpaid members' };
    }
  }
}

export const seasonService = new SeasonService();
