import { useState, useEffect, useCallback } from 'react';
import { seasonService } from '@/services';
import {
  ApiResponse,
  Season,
  SeasonsDTO,
  SeasonRequest,
  SeasonCreationRequestDTO,
  SeasonUpdateRequestDTO,
  MemberRankingDTO,
} from '@/types/api';

interface UseSeasonsReturn {
  seasons: SeasonsDTO[];
  currentSeason: Season | null;
  seasonMembers: MemberRankingDTO[];
  isLoading: boolean;
  error: string | null;
  fetchSeasons: () => Promise<void>;
  createSeason: (request: SeasonRequest) => Promise<Season | null>;
  createSeasonWithMembers: (request: SeasonCreationRequestDTO) => Promise<Season | null>;
  updateSeason: (id: string, request: SeasonUpdateRequestDTO) => Promise<Season | null>;
  deleteSeason: (id: string) => Promise<boolean>;
  endSeason: (seasonId: string) => Promise<boolean>;
  fetchSeasonMembers: (seasonId: string) => Promise<void>;
  addMembersToSeason: (seasonId: string, memberIds: string[]) => Promise<boolean>;
  setTopThreeMembers: (seasonId: string, memberIds: string[]) => Promise<boolean>;
  recalculateRankings: (seasonId: string) => Promise<boolean>;
  removeMemberFromSeason: (seasonId: string, memberId: string) => Promise<boolean>;
  removeMembersFromSeason: (seasonId: string, memberIds: string[]) => Promise<boolean>;
  removeAllUnpaidMembers: (seasonId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useSeasons = (): UseSeasonsReturn => {
  const [seasons, setSeasons] = useState<SeasonsDTO[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [seasonMembers, setSeasonMembers] = useState<MemberRankingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchSeasons = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.getAllSeasons();
      
      if (response.success && response.data) {
        setSeasons(response.data);
      } else {
        setError(response.message || 'Failed to fetch seasons');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch seasons';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSeason = useCallback(async (request: SeasonRequest): Promise<Season | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.createSeason(request);
      
      if (response.success && response.data) {
        await fetchSeasons(); // Refresh seasons list
        return response.data;
      } else {
        setError(response.message || 'Failed to create season');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create season';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasons]);

  const createSeasonWithMembers = useCallback(async (
    request: SeasonCreationRequestDTO
  ): Promise<Season | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.createSeasonWithMembers(request);
      
      if (response.success && response.data) {
        await fetchSeasons(); // Refresh seasons list
        return response.data;
      } else {
        setError(response.message || 'Failed to create season with members');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create season with members';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasons]);

  const updateSeason = useCallback(async (
    id: string,
    request: SeasonUpdateRequestDTO
  ): Promise<Season | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.updateSeason(id, request);
      
      if (response.success && response.data) {
        await fetchSeasons(); // Refresh seasons list
        return response.data;
      } else {
        setError(response.message || 'Failed to update season');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update season';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasons]);

  const deleteSeason = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.deleteSeason(id);
      
      if (response.success) {
        await fetchSeasons(); // Refresh seasons list
        return true;
      } else {
        setError(response.message || 'Failed to delete season');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete season';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasons]);

  const endSeason = useCallback(async (seasonId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.endSeason(seasonId);
      
      if (response.success) {
        await fetchSeasons(); // Refresh seasons list
        return true;
      } else {
        setError(response.message || 'Failed to end season');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to end season';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasons]);

  const fetchSeasonMembers = useCallback(async (seasonId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.getSeasonMembers(seasonId);
      
      if (response.success && response.data) {
        setSeasonMembers(response.data);
      } else {
        setError(response.message || 'Failed to fetch season members');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch season members';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMembersToSeason = useCallback(async (
    seasonId: string,
    memberIds: string[]
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.addMembersToSeason(seasonId, memberIds);
      
      if (response.success) {
        await fetchSeasonMembers(seasonId); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to add members to season');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add members to season';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasonMembers]);

  const setTopThreeMembers = useCallback(async (
    seasonId: string,
    memberIds: string[]
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.setTopThreeMembers(seasonId, memberIds);
      
      if (response.success) {
        await fetchSeasonMembers(seasonId); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to set top three members');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to set top three members';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasonMembers]);

  const recalculateRankings = useCallback(async (seasonId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.recalculateRankings(seasonId);
      
      if (response.success) {
        await fetchSeasonMembers(seasonId); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to recalculate rankings');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to recalculate rankings';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasonMembers]);

  const removeMemberFromSeason = useCallback(async (
    seasonId: string,
    memberId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.removeMemberFromSeason(seasonId, memberId);
      
      if (response.success) {
        await fetchSeasonMembers(seasonId); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to remove member from season');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove member from season';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasonMembers]);

  const removeMembersFromSeason = useCallback(async (
    seasonId: string,
    memberIds: string[]
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.removeMembersFromSeason(seasonId, memberIds);
      
      if (response.success) {
        await fetchSeasonMembers(seasonId); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to remove members from season');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove members from season';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasonMembers]);

  const removeAllUnpaidMembers = useCallback(async (seasonId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await seasonService.removeAllUnpaidMembers(seasonId);
      
      if (response.success) {
        await fetchSeasonMembers(seasonId); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to remove unpaid members');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove unpaid members';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasonMembers]);

  return {
    seasons,
    currentSeason,
    seasonMembers,
    isLoading,
    error,
    fetchSeasons,
    createSeason,
    createSeasonWithMembers,
    updateSeason,
    deleteSeason,
    endSeason,
    fetchSeasonMembers,
    addMembersToSeason,
    setTopThreeMembers,
    recalculateRankings,
    removeMemberFromSeason,
    removeMembersFromSeason,
    removeAllUnpaidMembers,
    clearError,
  };
};
