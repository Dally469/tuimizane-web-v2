import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { paymentService } from '@/services';
import {
  ApiResponse,
  MemberRankingDTO,
  PaymentProcessRequestDTO,
  MemberPayoutDTO,
  SeasonStatusDTO,
} from '@/types/api';

interface UsePaymentsReturn {
  rankings: MemberRankingDTO[];
  nextMember: MemberRankingDTO | null;
  seasonStatus: SeasonStatusDTO | null;
  payoutHistory: MemberPayoutDTO[];
  scheduledPayouts: MemberPayoutDTO[];
  payoutDetail: MemberPayoutDTO | null;
  isLoading: boolean;
  error: string | null;
  fetchRankings: (seasonId: string) => Promise<void>;
  fetchNextMember: (seasonId: string) => Promise<void>;
  fetchSeasonStatus: (seasonId: string) => Promise<void>;
  processPayment: (seasonId: string, request: PaymentProcessRequestDTO) => Promise<MemberPayoutDTO | null>;
  schedulePayouts: (seasonId: string) => Promise<boolean>;
  setTopThreeMembers: (seasonId: string, memberIds: string[]) => Promise<boolean>;
  resetSeasonCircle: (seasonId: string) => Promise<boolean>;
  fetchPaymentHistory: (seasonId: string) => Promise<void>;
  fetchPayoutDetails: (payoutId: string) => Promise<MemberPayoutDTO | null>;
  cancelPayout: (payoutId: string) => Promise<boolean>;
  updatePayout: (payoutId: string, request: Partial<PaymentProcessRequestDTO>) => Promise<MemberPayoutDTO | null>;
  clearError: () => void;
}

export const usePayments = (): UsePaymentsReturn => {
  const [rankings, setRankings] = useState<MemberRankingDTO[]>([]);
  const [nextMember, setNextMember] = useState<MemberRankingDTO | null>(null);
  const [seasonStatus, setSeasonStatus] = useState<SeasonStatusDTO | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<MemberPayoutDTO[]>([]);
  const [scheduledPayouts, setScheduledPayouts] = useState<MemberPayoutDTO[]>([]);
  const [payoutDetail, setPayoutDetail] = useState<MemberPayoutDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchRankings = useCallback(async (seasonId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getSeasonRankings(seasonId);
      
      if (response.success && response.data) {
        setRankings(response.data);
      } else {
        setError(response.message || 'Failed to fetch rankings');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch rankings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNextMember = useCallback(async (seasonId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getNextMemberToPay(seasonId);
      
      if (response.success && response.data) {
        setNextMember(response.data);
      } else {
        setError(response.message || 'Failed to fetch next member');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch next member';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSeasonStatus = useCallback(async (seasonId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getSeasonStatus(seasonId);
      
      if (response.success && response.data) {
        setSeasonStatus(response.data);
      } else {
        setError(response.message || 'Failed to fetch season status');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch season status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (
    seasonId: string,
    request: PaymentProcessRequestDTO
  ): Promise<MemberPayoutDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.processPayment(seasonId, request);
      
      if (response.success && response.data) {
        // Refresh related data
        await Promise.all([
          fetchNextMember(seasonId),
          fetchSeasonStatus(seasonId),
          fetchRankings(seasonId),
        ]);
        toast.success('Payment processed successfully');
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to process payment';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process payment';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchNextMember, fetchSeasonStatus, fetchRankings]);

  const schedulePayouts = useCallback(async (seasonId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.scheduleSeasonPayouts(seasonId);
      
      if (response.success && response.data) {
        setScheduledPayouts(response.data);
        await fetchSeasonStatus(seasonId); // Refresh status
        toast.success('Payouts scheduled successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to schedule payouts';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to schedule payouts';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSeasonStatus]);

  const setTopThreeMembers = useCallback(async (
    seasonId: string,
    memberIds: string[]
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.setTopThreeMembers(seasonId, memberIds);
      
      if (response.success) {
        await Promise.all([
          fetchRankings(seasonId),
          fetchNextMember(seasonId),
        ]);
        toast.success('Top three members set successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to set top three members';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to set top three members';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRankings, fetchNextMember]);

  const resetSeasonCircle = useCallback(async (seasonId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.resetSeasonCircle(seasonId);
      
      if (response.success) {
        // Refresh all payment-related data
        await Promise.all([
          fetchRankings(seasonId),
          fetchNextMember(seasonId),
          fetchSeasonStatus(seasonId),
        ]);
        toast.success('Season circle reset successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to reset season circle';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset season circle';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRankings, fetchNextMember, fetchSeasonStatus]);

  const fetchPaymentHistory = useCallback(async (seasonId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getPaymentHistory(seasonId);
      
      if (response.success && response.data) {
        setPayoutHistory(response.data);
      } else {
        setError(response.message || 'Failed to fetch payment history');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch payment history';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPayoutDetails = useCallback(async (payoutId: string): Promise<MemberPayoutDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getPayoutDetails(payoutId);

      if (response.success && response.data) {
        setPayoutDetail(response.data);
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to fetch payout details';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch payout details';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelPayout = useCallback(async (payoutId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.cancelPayout(payoutId);

      if (response.success) {
        toast.success('Payout cancelled successfully');
        return true;
      } else {
        const errorMessage = response.message || 'Failed to cancel payout';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel payout';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePayout = useCallback(async (
    payoutId: string,
    request: Partial<PaymentProcessRequestDTO>
  ): Promise<MemberPayoutDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.updatePayout(payoutId, request);

      if (response.success && response.data) {
        setPayoutDetail(response.data);
        toast.success('Payout updated successfully');
        return response.data;
      } else {
        const errorMessage = response.message || 'Failed to update payout';
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update payout';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    rankings,
    nextMember,
    seasonStatus,
    payoutHistory,
    scheduledPayouts,
    payoutDetail,
    isLoading,
    error,
    fetchRankings,
    fetchNextMember,
    fetchSeasonStatus,
    processPayment,
    schedulePayouts,
    setTopThreeMembers,
    resetSeasonCircle,
    fetchPaymentHistory,
    fetchPayoutDetails,
    cancelPayout,
    updatePayout,
    clearError,
  };
};
