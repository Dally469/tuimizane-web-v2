import { useState, useEffect, useCallback } from 'react';
import { memberService } from '@/services';
import {
  ApiResponse,
  Member,
  MemberDTO,
  AssignCardRequest,
  UploadResultDTO,
  MemberContributionResponseDTO,
} from '@/types/api';

interface UseMembersReturn {
  members: MemberDTO[];
  currentMember: Member | null;
  memberContributions: MemberContributionResponseDTO[];
  uploadResult: UploadResultDTO | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  fetchMembers: () => Promise<void>;
  getMemberById: (id: string) => Promise<Member | null>;
  createMember: (member: Partial<Member>, months: number) => Promise<Member | null>;
  updateMember: (id: string, memberDetails: Partial<Member>) => Promise<Member | null>;
  deleteMember: (id: string) => Promise<boolean>;
  changeMemberStatus: (id: string, status: string) => Promise<boolean>;
  uploadMembers: (file: File) => Promise<boolean>;
  assignCard: (memberId: string, request: AssignCardRequest) => Promise<boolean>;
  unassignCard: (memberId: string) => Promise<boolean>;
  findMemberByCard: (cardNumber: string) => Promise<Member | null>;
  getMemberContributions: (memberId: string) => Promise<void>;
  searchMembers: (query: string, filters?: any) => Promise<MemberDTO[]>;
  clearError: () => void;
}

export const useMembers = (): UseMembersReturn => {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [memberContributions, setMemberContributions] = useState<MemberContributionResponseDTO[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResultDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchMembers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.getAllMembers();
      
      if (response.success && response.data) {
        setMembers(response.data);
      } else {
        setError(response.message || 'Failed to fetch members');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch members';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMemberById = useCallback(async (id: string): Promise<Member | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.getMemberById(id);
      
      if (response.success && response.data) {
        setCurrentMember(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch member');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch member';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMember = useCallback(async (
    member: Partial<Member>,
    months: number
  ): Promise<Member | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.createMember(member, months);
      
      if (response.success && response.data) {
        await fetchMembers(); // Refresh members list
        return response.data;
      } else {
        setError(response.message || 'Failed to create member');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create member';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers]);

  const updateMember = useCallback(async (
    id: string,
    memberDetails: Partial<Member>
  ): Promise<Member | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.updateMember(id, memberDetails);
      
      if (response.success && response.data) {
        await fetchMembers(); // Refresh members list
        setCurrentMember(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to update member');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update member';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers]);

  const deleteMember = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.deleteMember(id);
      
      if (response.success) {
        await fetchMembers(); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to delete member');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete member';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers]);

  const changeMemberStatus = useCallback(async (
    id: string,
    status: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.changeMemberStatus(id, status);
      
      if (response.success) {
        await fetchMembers(); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to change member status');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to change member status';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers]);

  const uploadMembers = useCallback(async (file: File): Promise<boolean> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      const response = await memberService.uploadMembers(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (response.success && response.data) {
        setUploadResult(response.data);
        await fetchMembers(); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to upload members');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload members';
      setError(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [fetchMembers]);

  const assignCard = useCallback(async (
    memberId: string,
    request: AssignCardRequest
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.assignCard(memberId, request);
      
      if (response.success) {
        await fetchMembers(); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to assign card');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to assign card';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers]);

  const unassignCard = useCallback(async (memberId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.unassignCard(memberId);
      
      if (response.success) {
        await fetchMembers(); // Refresh members list
        return true;
      } else {
        setError(response.message || 'Failed to unassign card');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to unassign card';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers]);

  const findMemberByCard = useCallback(async (cardNumber: string): Promise<Member | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.findMemberByCard(cardNumber);
      
      if (response.success && response.data) {
        setCurrentMember(response.data);
        return response.data;
      } else {
        setError(response.message || 'Member not found');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to find member';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMemberContributions = useCallback(async (memberId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.getMemberContributions(memberId);
      
      if (response.success && response.data) {
        setMemberContributions(response.data);
      } else {
        setError(response.message || 'Failed to fetch member contributions');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch member contributions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchMembers = useCallback(async (
    query: string,
    filters?: any
  ): Promise<MemberDTO[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.searchMembers(query, filters);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Failed to search members');
        return [];
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search members';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    members,
    currentMember,
    memberContributions,
    uploadResult,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    fetchMembers,
    getMemberById,
    createMember,
    updateMember,
    deleteMember,
    changeMemberStatus,
    uploadMembers,
    assignCard,
    unassignCard,
    findMemberByCard,
    getMemberContributions,
    searchMembers,
    clearError,
  };
};
