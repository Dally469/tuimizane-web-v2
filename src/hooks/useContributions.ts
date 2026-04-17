import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { contributionService } from '@/services';
import {
  BulkPayDebitRequestDTO,
  Contribution,
  ContributionDTO,
  ContributionSummaryDTO,
  CreateContributionRequest,
  DebitPaymentHistoryDTO,
  MemberDebitAnalysisDTO,
  MemberContributionsWithDebitDTO,
  OrganizationDebitStatisticsDTO,
  PayDebitRequestDTO,
  TopDefaulterDTO,
  WorkingDaysCalendarDTO,
  MemberMonthlySummaryDTO,
} from '@/types/api';

interface ContributionFilters {
  memberId?: string;
  seasonId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const useContributions = () => {
  const [contributions, setContributions] = useState<ContributionDTO[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number | null>(null);
  const [summary, setSummary] = useState<ContributionSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debit state
  const [debitAnalysis, setDebitAnalysis] = useState<MemberDebitAnalysisDTO | null>(null);
  const [workingDaysCalendar, setWorkingDaysCalendar] = useState<WorkingDaysCalendarDTO | null>(null);
  const [debitHistory, setDebitHistory] = useState<DebitPaymentHistoryDTO[]>([]);
  const [orgDebitStats, setOrgDebitStats] = useState<OrganizationDebitStatisticsDTO | null>(null);
  const [topDefaulters, setTopDefaulters] = useState<TopDefaulterDTO[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MemberMonthlySummaryDTO[]>([]);
  const [memberDebitContributions, setMemberDebitContributions] = useState<MemberContributionsWithDebitDTO | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchContributions = useCallback(async (filters?: ContributionFilters): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const mergedFilters = { page, limit, ...(filters || {}) } as ContributionFilters;
      const response = await contributionService.getAllContributions(mergedFilters);

      let payload: any = response.data;
      if (payload && typeof payload === 'object' && 'data' in payload) {
        payload = payload.data;
      }

      if (payload !== undefined && payload !== null) {
        if (Array.isArray(payload)) {
          setContributions(payload as ContributionDTO[]);
          setTotal(null);
        } else if (payload.items) {
          setContributions(payload.items);
          setTotal(payload.total ?? payload.meta?.total ?? null);
        } else {
          const maybeArray = payload.results ?? payload.items ?? payload;
          setContributions(Array.isArray(maybeArray) ? maybeArray : []);
        }
      } else {
        setError(response.message || 'Failed to fetch contributions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contributions');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  const fetchSummary = useCallback(async (
    filters?: Omit<ContributionFilters, 'status' | 'page' | 'limit'>
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.getContributionSummary(filters);

      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        setError(response.message || 'Failed to fetch contribution summary');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contribution summary');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createContribution = useCallback(async (
    contribution: CreateContributionRequest
  ): Promise<Contribution | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.createContribution(contribution);

      if (response.success && response.data) {
        await fetchContributions();
        await fetchSummary();
        toast.success('Contribution created successfully');
        return response.data;
      }

      const errorMessage = response.message || 'Failed to create contribution';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create contribution';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchContributions, fetchSummary]);

  const approveContribution = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.approveContribution(id);

      if (response.success) {
        await fetchContributions();
        await fetchSummary();
        toast.success('Contribution approved successfully');
        return true;
      }

      const errorMessage = response.message || 'Failed to approve contribution';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to approve contribution';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchContributions, fetchSummary]);

  const rejectContribution = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.rejectContribution(id, reason);

      if (response.success) {
        await fetchContributions();
        await fetchSummary();
        toast.success('Contribution rejected');
        return true;
      }

      const errorMessage = response.message || 'Failed to reject contribution';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reject contribution';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchContributions, fetchSummary]);

  // === Debit Methods ===

  const resetContributions = useCallback(async (params?: {
    seasonId?: string;
    memberId?: string;
    resetDate?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (params?.memberId) {
        response = await contributionService.resetContributionsByMember(params.memberId, params.resetDate);
      } else if (params?.seasonId) {
        response = await contributionService.resetContributionsBySeason(params.seasonId);
      } else {
        response = await contributionService.resetContributions();
      }

      if (response.success) {
        await fetchContributions();
        await fetchSummary();
        toast.success('Contributions reset successfully');
        return true;
      }

      toast.error(response.message || 'Failed to reset contributions');
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset contributions');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchContributions, fetchSummary]);

  const fetchMemberDebitAnalysis = useCallback(async (memberId: string, params?: {
    month?: number;
    year?: number;
    seasonId?: string;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.getMemberDebitAnalysis(memberId, params);
      if (response.success && response.data) {
        setDebitAnalysis(response.data);
      } else {
        setError(response.message || 'Failed to fetch debit analysis');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch debit analysis');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMemberContributionsWithDebit = useCallback(async (memberId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.getMemberContributionsWithDebit(memberId);
      if (response.success && response.data) {
        setMemberDebitContributions(response.data);
      } else {
        setError(response.message || 'Failed to fetch member debit contributions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch member debit contributions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWorkingDaysCalendar = useCallback(async (memberId: string, params?: {
    month?: number;
    year?: number;
    seasonId?: string;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.getMemberWorkingDaysCalendar(memberId, params);
      if (response.success && response.data) {
        setWorkingDaysCalendar(response.data);
      } else {
        setError(response.message || 'Failed to fetch working days calendar');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch working days calendar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDebitHistory = useCallback(async (memberId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.getMemberDebitHistory(memberId);
      if (response.success && response.data) {
        setDebitHistory(response.data);
      } else {
        setDebitHistory([]);
      }
    } catch (err: any) {
      setDebitHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const payDebit = useCallback(async (memberId: string, payload: PayDebitRequestDTO): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.payMemberDebit(memberId, payload);
      if (response.success) {
        toast.success('Debit paid successfully');
        return true;
      }
      toast.error(response.message || 'Failed to pay debit');
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Failed to pay debit');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkPayDebit = useCallback(async (memberId: string, payload: BulkPayDebitRequestDTO): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.bulkPayMemberDebit(memberId, payload);
      if (response.success) {
        toast.success('Bulk debit payment successful');
        return true;
      }
      toast.error(response.message || 'Failed to bulk pay debit');
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Failed to bulk pay debit');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrgDebitStatistics = useCallback(async (params?: {
    month?: number;
    year?: number;
    seasonId?: string;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.getOrganizationDebitStatistics(params);
      if (response.success && response.data) {
        setOrgDebitStats(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch debit statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTopDefaulters = useCallback(async (params?: {
    month?: number;
    year?: number;
    limit?: number;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.getTopDefaulters(params);
      if (response.success && response.data) {
        setTopDefaulters(response.data);
      } else {
        setTopDefaulters([]);
      }
    } catch (err: any) {
      setTopDefaulters([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMonthlySummary = useCallback(async (params?: {
    month?: number;
    year?: number;
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contributionService.getOrganizationMonthlySummary(params);
      if (response.success && response.data) {
        setMonthlySummary(response.data);
      } else {
        setMonthlySummary([]);
      }
    } catch (err: any) {
      setMonthlySummary([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Existing
    contributions,
    summary,
    isLoading,
    error,
    fetchContributions,
    fetchSummary,
    createContribution,
    approveContribution,
    rejectContribution,
    clearError,
    // Pagination
    page,
    limit,
    total,
    setPage,
    setLimit,
    // Debit
    debitAnalysis,
    workingDaysCalendar,
    debitHistory,
    orgDebitStats,
    topDefaulters,
    monthlySummary,
    memberDebitContributions,
    resetContributions,
    fetchMemberDebitAnalysis,
    fetchMemberContributionsWithDebit,
    fetchWorkingDaysCalendar,
    fetchDebitHistory,
    payDebit,
    bulkPayDebit,
    fetchOrgDebitStatistics,
    fetchTopDefaulters,
    fetchMonthlySummary,
  };
};
