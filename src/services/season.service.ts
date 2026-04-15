import apiClient from '@/lib/api-client';
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
  // Get all seasons for the organization
  async getAllSeasons(): Promise<ApiResponse<SeasonsDTO[]>> {
    return apiClient.get<SeasonsDTO[]>('/api/seasons');
  }

  // Get season by ID
  async getSeasonById(id: string): Promise<ApiResponse<Season>> {
    return apiClient.get<Season>(`/api/seasons/${id}`);
  }

  // Create new season
  async createSeason(request: SeasonRequest): Promise<ApiResponse<Season>> {
    return apiClient.post<Season>('/api/seasons', request);
  }

  // Create season with members
  async createSeasonWithMembers(request: SeasonCreationRequestDTO): Promise<ApiResponse<Season>> {
    return apiClient.post<Season>('/api/seasons/with-members', request);
  }

  // Update season
  async updateSeason(id: string, request: SeasonUpdateRequestDTO): Promise<ApiResponse<Season>> {
    return apiClient.put<Season>(`/api/seasons/${id}`, request);
  }

  // Delete season
  async deleteSeason(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/seasons/${id}`);
  }

  // End season
  async endSeason(seasonId: string): Promise<ApiResponse<Season>> {
    return apiClient.put<Season>(`/api/seasons/${seasonId}/end`);
  }

  // Get season members
  async getSeasonMembers(seasonId: string): Promise<ApiResponse<MemberRankingDTO[]>> {
    return apiClient.get<MemberRankingDTO[]>(`/api/seasons/${seasonId}/members`);
  }

  // Add members to season
  async addMembersToSeason(seasonId: string, memberIds: string[]): Promise<ApiResponse<SeasonMember[]>> {
    return apiClient.post<SeasonMember[]>(`/api/seasons/${seasonId}/add-members`, memberIds);
  }

  // Set top three members
  async setTopThreeMembers(seasonId: string, memberIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/api/seasons/${seasonId}/set-top-three`, memberIds);
  }

  // Recalculate rankings
  async recalculateRankings(seasonId: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/api/seasons/${seasonId}/recalculate-rankings`);
  }

  // Remove single member from season
  async removeMemberFromSeason(seasonId: string, memberId: string): Promise<ApiResponse<string>> {
    return apiClient.delete<string>(`/api/seasons/${seasonId}/remove-member/${memberId}`);
  }

  // Remove multiple members from season
  async removeMembersFromSeason(seasonId: string, memberIds: string[]): Promise<ApiResponse<string[]>> {
    return apiClient.delete<string[]>(`/api/seasons/${seasonId}/remove-members`, memberIds);
  }

  // Remove all unpaid members from season
  async removeAllUnpaidMembers(seasonId: string): Promise<ApiResponse<string[]>> {
    return apiClient.delete<string[]>(`/api/seasons/${seasonId}/remove-unpaid-members`);
  }
}

export const seasonService = new SeasonService();
