import { useCallback, useState } from 'react';
import { organizationService } from '@/services';
import { Organization, OrganizationDTO } from '@/types/api';

interface OrganizationStatistics {
  totalMembers: number;
  activeMembers: number;
  totalSeasons: number;
  activeSeasons: number;
  totalContributions: number;
  totalAmount: number;
  currentMonthContributions: number;
  currentMonthAmount: number;
  paymentCompletionRate: number;
}

interface UseOrganizationReturn {
  organization: OrganizationDTO | null;
  organizationDetails: Organization | null;
  statistics: OrganizationStatistics | null;
  isLoading: boolean;
  error: string | null;
  getCurrentOrganization: () => Promise<OrganizationDTO | null>;
  getOrganizationById: (id: string) => Promise<Organization | null>;
  updateOrganization: (id: string, organization: Partial<Organization>) => Promise<Organization | null>;
  getOrganizationStatistics: (organizationId?: string) => Promise<OrganizationStatistics | null>;
  clearError: () => void;
}

export const useOrganization = (): UseOrganizationReturn => {
  const [organization, setOrganization] = useState<OrganizationDTO | null>(null);
  const [organizationDetails, setOrganizationDetails] = useState<Organization | null>(null);
  const [statistics, setStatistics] = useState<OrganizationStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCurrentOrganization = useCallback(async (): Promise<OrganizationDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await organizationService.getCurrentOrganization();

      if (response.success && response.data) {
        setOrganization(response.data);
        return response.data;
      }

      setError(response.message || 'Failed to fetch organization');
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch organization';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrganizationById = useCallback(async (id: string): Promise<Organization | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await organizationService.getOrganizationById(id);

      if (response.success && response.data) {
        setOrganizationDetails(response.data);
        return response.data;
      }

      setError(response.message || 'Failed to fetch organization details');
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch organization details';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOrganization = useCallback(async (
    id: string,
    organizationData: Partial<Organization>
  ): Promise<Organization | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await organizationService.updateOrganization(id, organizationData);

      if (response.success && response.data) {
        setOrganizationDetails(response.data);
        return response.data;
      }

      setError(response.message || 'Failed to update organization');
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update organization';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrganizationStatistics = useCallback(async (
    organizationId?: string
  ): Promise<OrganizationStatistics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await organizationService.getOrganizationStatistics(organizationId);

      if (response.success && response.data) {
        setStatistics(response.data);
        return response.data;
      }

      setError(response.message || 'Failed to fetch organization statistics');
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch organization statistics';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    organization,
    organizationDetails,
    statistics,
    isLoading,
    error,
    getCurrentOrganization,
    getOrganizationById,
    updateOrganization,
    getOrganizationStatistics,
    clearError,
  };
};
