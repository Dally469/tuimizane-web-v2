import { httpRequest } from '@/lib/httpRequest';
import {
  ApiResponse,
  MemberRankingDTO,
  PaymentProcessRequestDTO,
  MemberPayoutDTO,
  SeasonStatusDTO,
  MemberHistoryPayoutDTO,
} from '@/types/api';

export class PaymentService {
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

  // Get season rankings
  async getSeasonRankings(seasonId: string): Promise<ApiResponse<MemberRankingDTO[]>> {
    try {
      const response = await httpRequest.get(`/payments/season/${seasonId}/rankings`);
      return this.unwrapResponse<MemberRankingDTO[]>(response, 'Season rankings retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get season rankings' };
    }
  }

  // Get next member to pay
  async getNextMemberToPay(seasonId: string): Promise<ApiResponse<MemberRankingDTO | null>> {
    try {
      const response = await httpRequest.get(`/payments/season/${seasonId}/next-member`);
      return this.unwrapResponse<MemberRankingDTO | null>(response, 'Next member to pay retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get next member to pay' };
    }
  }

  // Process payment
  async processPayment(seasonId: string, request: PaymentProcessRequestDTO): Promise<ApiResponse<MemberPayoutDTO>> {
    try {
      const response = await httpRequest.post(`/payments/season/${seasonId}/process`, request);
      return this.unwrapResponse<MemberPayoutDTO>(response, 'Payment processed successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to process payment' };
    }
  }

  // Schedule all payouts for season
  async scheduleSeasonPayouts(seasonId: string): Promise<ApiResponse<MemberPayoutDTO[]>> {
    try {
      const response = await httpRequest.post(`/payments/season/${seasonId}/schedule`);
      return this.unwrapResponse<MemberPayoutDTO[]>(response, 'Season payouts scheduled successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to schedule season payouts' };
    }
  }

  // Get season status
  async getSeasonStatus(seasonId: string): Promise<ApiResponse<SeasonStatusDTO>> {
    try {
      const response = await httpRequest.get(`/payments/season/${seasonId}/status`);
      return this.unwrapResponse<SeasonStatusDTO>(response, 'Season status retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get season status' };
    }
  }

  // Set top three members (payment endpoint)
  async setTopThreeMembers(seasonId: string, memberIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await httpRequest.put(`/payments/season/${seasonId}/top-three`, memberIds);
      return this.unwrapResponse<void>(response, 'Top three members set successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to set top three members' };
    }
  }

  // Reset season circle
  async resetSeasonCircle(seasonId: string): Promise<ApiResponse<void>> {
    try {
      const response = await httpRequest.put(`/payments/season/${seasonId}/reset-circle`);
      return this.unwrapResponse<void>(response, 'Season circle reset successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to reset season circle' };
    }
  }

  // Get payment history for season
  async getPaymentHistory(seasonId: string): Promise<ApiResponse<MemberHistoryPayoutDTO[]>> {
    try {
      const response = await httpRequest.get(`/payments/season/${seasonId}/history`);
      return this.unwrapResponse<MemberHistoryPayoutDTO[]>(response, 'Payment history retrieved successfully');
    } catch (error: any) {
      return { status: 500, success: false, message: error.message || 'Failed to get payment history' };
    }
  }

  // Get specific payout details
  async getPayoutDetails(payoutId: string): Promise<ApiResponse<MemberPayoutDTO>> {
    try {
      const response = await httpRequest.get(`/payments/payout/${payoutId}`);
      return this.unwrapResponse<MemberPayoutDTO>(response, 'Payout details retrieved successfully');
    } catch (error: any) {
      return { status: 404, success: false, message: error.message || 'Failed to get payout details' };
    }
  }

  // Cancel scheduled payout
  async cancelPayout(payoutId: string): Promise<ApiResponse<void>> {
    try {
      await httpRequest.delete(`/payments/payout/${payoutId}`);
      return { status: 200, success: true, message: 'Payout cancelled successfully' };
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to cancel payout' };
    }
  }

  // Update payout details
  async updatePayout(payoutId: string, request: Partial<PaymentProcessRequestDTO>): Promise<ApiResponse<MemberPayoutDTO>> {
    try {
      const response = await httpRequest.put(`/payments/payout/${payoutId}`, request);
      return this.unwrapResponse<MemberPayoutDTO>(response, 'Payout updated successfully');
    } catch (error: any) {
      return { status: 400, success: false, message: error.message || 'Failed to update payout' };
    }
  }
}

export const paymentService = new PaymentService();
