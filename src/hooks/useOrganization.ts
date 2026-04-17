import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { organizationService } from '@/services';
import { Organization, OrganizationDTO, OrganizationStatisticsDTO } from '@/types/api';

interface UseOrganizationReturn {
  organization: OrganizationDTO | null;
  organizationDetails: Organization | null;
  statistics: OrganizationStatisticsDTO | null;
  isLoading: boolean;
  error: string | null;
  getCurrentOrganization: () => Promise<OrganizationDTO | null>;
  getOrganizationById: (id: string) => Promise<Organization | null>;
  updateOrganization: (id: string, organization: Partial<Organization>) => Promise<Organization | null>;
  getOrganizationStatistics: (params?: {
    month?: number;
    year?: number;
    seasonId?: string;
    topPerformersLimit?: number;
  }) => Promise<OrganizationStatisticsDTO | null>;
  clearError: () => void;
}

export const useOrganization = (): UseOrganizationReturn => {
  const [organization, setOrganization] = useState<OrganizationDTO | null>(null);
  const [organizationDetails, setOrganizationDetails] = useState<Organization | null>(null);
  const [statistics, setStatistics] = useState<OrganizationStatisticsDTO | null>(null);
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
        toast.success('Organization updated successfully');
        return response.data;
      }

      const errorMessage = response.message || 'Failed to update organization';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update organization';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrganizationStatistics = useCallback(async (
    params?: {
      month?: number;
      year?: number;
      seasonId?: string;
      topPerformersLimit?: number;
    }
  ): Promise<OrganizationStatisticsDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await organizationService.getOrganizationStatistics(params);

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
