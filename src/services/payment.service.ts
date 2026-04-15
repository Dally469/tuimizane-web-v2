import apiClient from '@/lib/api-client';
import {
  ApiResponse,
  MemberRankingDTO,
  PaymentProcessRequestDTO,
  MemberPayoutDTO,
  SeasonStatusDTO,
} from '@/types/api';

export class PaymentService {
  // Get season rankings
  async getSeasonRankings(seasonId: string): Promise<ApiResponse<MemberRankingDTO[]>> {
    return apiClient.get<MemberRankingDTO[]>(`/api/payments/season/${seasonId}/rankings`);
  }

  // Get next member to pay
  async getNextMemberToPay(seasonId: string): Promise<ApiResponse<MemberRankingDTO | null>> {
    return apiClient.get<MemberRankingDTO | null>(`/api/payments/season/${seasonId}/next-member`);
  }

  // Process payment
  async processPayment(seasonId: string, request: PaymentProcessRequestDTO): Promise<ApiResponse<MemberPayoutDTO>> {
    return apiClient.post<MemberPayoutDTO>(`/api/payments/season/${seasonId}/process`, request);
  }

  // Schedule all payouts for season
  async scheduleSeasonPayouts(seasonId: string): Promise<ApiResponse<MemberPayoutDTO[]>> {
    return apiClient.post<MemberPayoutDTO[]>(`/api/payments/season/${seasonId}/schedule`);
  }

  // Get season status
  async getSeasonStatus(seasonId: string): Promise<ApiResponse<SeasonStatusDTO>> {
    return apiClient.get<SeasonStatusDTO>(`/api/payments/season/${seasonId}/status`);
  }

  // Set top three members (payment endpoint)
  async setTopThreeMembers(seasonId: string, memberIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/api/payments/season/${seasonId}/top-three`, memberIds);
  }

  // Reset season circle
  async resetSeasonCircle(seasonId: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/api/payments/season/${seasonId}/reset-circle`);
  }

  // Get payment history for season
  async getPaymentHistory(seasonId: string): Promise<ApiResponse<MemberPayoutDTO[]>> {
    return apiClient.get<MemberPayoutDTO[]>(`/api/payments/season/${seasonId}/history`);
  }

  // Get specific payout details
  async getPayoutDetails(payoutId: string): Promise<ApiResponse<MemberPayoutDTO>> {
    return apiClient.get<MemberPayoutDTO>(`/api/payments/payout/${payoutId}`);
  }

  // Cancel scheduled payout
  async cancelPayout(payoutId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/payments/payout/${payoutId}`);
  }

  // Update payout details
  async updatePayout(payoutId: string, request: Partial<PaymentProcessRequestDTO>): Promise<ApiResponse<MemberPayoutDTO>> {
    return apiClient.put<MemberPayoutDTO>(`/api/payments/payout/${payoutId}`, request);
  }
}

export const paymentService = new PaymentService();
