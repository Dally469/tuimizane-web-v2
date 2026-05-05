import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { memberService } from '@/services';
import {
  ApiResponse,
  Member,
  MemberDTO,
  AssignCardRequest,
  UploadResultDTO,
  MemberContributionResponseDTO,
  TopDefaulterDTO,
} from '@/types/api';

interface UseMembersReturn {
  members: MemberDTO[];
  currentMember: Member | null;
  memberDetail: TopDefaulterDTO | null;
  memberContributions: MemberContributionResponseDTO[];
  memberHistory: { totalContributions: number; totalAmount: number; contributions: any[] };
  uploadResult: UploadResultDTO | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  fetchMembers: (options?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    setTotalPages?: (n: number) => void;
  }) => Promise<void>;
  getMemberById: (id: string) => Promise<Member | null>;
  getMemberDetail: (id: string) => Promise<TopDefaulterDTO | null>;
  createMember: (member: Partial<Member>, months: number) => Promise<Member | null>;
  updateMember: (id: string, memberDetails: Partial<Member>) => Promise<Member | null>;
  deleteMember: (id: string) => Promise<boolean>;
  changeMemberStatus: (id: string, status: string) => Promise<boolean>;
  uploadMembers: (file: File) => Promise<boolean>;
  assignCard: (memberId: string, request: AssignCardRequest) => Promise<boolean>;
  unassignCard: (memberId: string) => Promise<boolean>;
  findMemberByCard: (cardNumber: string) => Promise<Member | null>;
  getMemberContributions: (memberId: string) => Promise<void>;
  getMemberHistory: (memberId: string, startDate?: string, endDate?: string) => Promise<void>;
  searchMembers: (query: string, filters?: any) => Promise<MemberDTO[]>;
  clearError: () => void;
}

export const useMembers = (): UseMembersReturn => {
  const [members, setMembers] = useState<MemberDTO[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [memberDetail, setMemberDetail] = useState<TopDefaulterDTO | null>(null);
  const [memberContributions, setMemberContributions] = useState<MemberContributionResponseDTO[]>([]);
  const [memberHistory, setMemberHistory] = useState<{ totalContributions: number; totalAmount: number; contributions: any[] }>({ totalContributions: 0, totalAmount: 0, contributions: [] });
  const [uploadResult, setUploadResult] = useState<UploadResultDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetch paginated members
   * @param options { page, size, sortBy, sortDirection, setTotalPages }
   */
  const fetchMembers = useCallback(
    async (options?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
      setTotalPages?: (n: number) => void;
    }): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const page = options?.page ?? 0;
        const size = options?.size ?? 20;
        const sortBy = options?.sortBy ?? 'names';
        const sortDirection = options?.sortDirection ?? 'asc';
        const response = await memberService.getAllMembers({ page, size, sortBy, sortDirection });
        if (response.success && response.data) {
          setMembers(Array.isArray(response.data.content) ? response.data.content : []);
          if (options?.setTotalPages && typeof response.data.totalPages === 'number') {
            options.setTotalPages(response.data.totalPages);
          }
        } else {
          setError(response.message || 'Failed to fetch members');
          setMembers([]);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch members';
        setError(errorMessage);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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

  const getMemberDetail = useCallback(async (id: string): Promise<TopDefaulterDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.getMemberDetail(id);
      let payload = response.data;
      if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
        payload = (payload as any).data;
      }
      if (response.success && payload) {
        setMemberDetail(payload as TopDefaulterDTO);
        return payload as TopDefaulterDTO;
      } else {
        setError(response.message || 'Failed to fetch member detail');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch member detail');
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
        toast.success('Member created successfully');
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to create member';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create member';
      setError(errorMessage);
      toast.error(errorMessage);
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
        toast.success('Member updated successfully');
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to update member';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update member';
      setError(errorMessage);
      toast.error(errorMessage);
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
        toast.success('Member deleted successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to delete member';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete member';
      setError(errorMessage);
      toast.error(errorMessage);
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
        toast.success('Member status changed successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to change member status';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to change member status';
      setError(errorMessage);
      toast.error(errorMessage);
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
        toast.success('Members uploaded successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to upload members';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload members';
      setError(errorMessage);
      toast.error(errorMessage);
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
        toast.success('Card assigned successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to assign card';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to assign card';
      setError(errorMessage);
      toast.error(errorMessage);
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
        toast.success('Card unassigned successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to unassign card';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to unassign card';
      setError(errorMessage);
      toast.error(errorMessage);
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

  const getMemberHistory = useCallback(async (
    memberId: string,
    startDate?: string,
    endDate?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.getMemberHistory(memberId, startDate, endDate);
      let payload = response.data;
      // unwrap nested envelope if present
      if (payload && typeof payload === 'object' && 'data' in payload) {
        payload = (payload as any).data;
      }
      if (payload && typeof payload === 'object' && 'contributions' in payload) {
        setMemberHistory({
          totalContributions: payload.totalContributions || 0,
          totalAmount: payload.totalAmount || 0,
          contributions: Array.isArray(payload.contributions) ? payload.contributions : [],
        });
      } else {
        setMemberHistory({ totalContributions: 0, totalAmount: 0, contributions: Array.isArray(payload) ? payload : [] });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch member history');
      setMemberHistory({ totalContributions: 0, totalAmount: 0, contributions: [] });
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
    memberDetail,
    memberContributions,
    memberHistory,
    uploadResult,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    fetchMembers,
    getMemberById,
    getMemberDetail,
    createMember,
    updateMember,
    deleteMember,
    changeMemberStatus,
    uploadMembers,
    assignCard,
    unassignCard,
    findMemberByCard,
    getMemberContributions,
    getMemberHistory,
    searchMembers,
    clearError,
  };
};
