import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { useSeasons, useMembers } from '@/hooks';
import { SeasonCreationRequestDTO } from '@/types/api';
import { CURRENCIES, SEASON_STATUS } from '@/utils/constants';
import { formatCurrency } from '@/utils/format';

interface SeasonFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SeasonForm: React.FC<SeasonFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { createSeasonWithMembers, isLoading } = useSeasons();
  const { members, fetchMembers } = useMembers();
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    status: SEASON_STATUS.ACTIVE,
    createdBy: 'System Admin',
    memberIds: [] as string[],
    topThreeMemberIds: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.memberIds.length === 0) {
      newErrors.memberIds = 'Please select at least one member';
    }

    if (formData.topThreeMemberIds.length > 3) {
      newErrors.topThreeMemberIds = 'You can only select up to 3 members for top priority';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const seasonData: SeasonCreationRequestDTO = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        createdBy: formData.createdBy,
        memberIds: formData.memberIds,
        topThreeMemberIds: formData.topThreeMemberIds.length > 0 ? formData.topThreeMemberIds : undefined,
      };

      const success = await createSeasonWithMembers(seasonData);
      
      if (success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to create season:', error);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId],
    }));
  };

  const handleTopThreeToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      topThreeMemberIds: prev.topThreeMemberIds.includes(memberId)
        ? prev.topThreeMemberIds.filter(id => id !== memberId)
        : [...prev.topThreeMemberIds, memberId],
    }));
  };

  const currencyOptions = Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.name} (${currency.symbol})`,
  }));

  const statusOptions = Object.values(SEASON_STATUS).map(status => ({
    value: status,
    label: status.charAt(0) + status.slice(1).toLowerCase(),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="startDate"
          type="date"
          label="Start Date"
          value={formData.startDate}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          error={errors.startDate}
        />

        <Input
          id="endDate"
          type="date"
          label="End Date"
          value={formData.endDate}
          onChange={(e) => handleInputChange('endDate', e.target.value)}
          error={errors.endDate}
        />

        <Select
          id="status"
          label="Status"
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
          options={statusOptions}
        />

        <Input
          id="createdBy"
          label="Created By"
          value={formData.createdBy}
          onChange={(e) => handleInputChange('createdBy', e.target.value)}
        />
      </div>

      {/* Member Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Members ({formData.memberIds.length} selected)
        </label>
        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
          {members.filter(member => member.type === 0).map((member) => (
            <div key={member.id} className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id={`member-${member.id}`}
                checked={formData.memberIds.includes(member.id)}
                onChange={() => handleMemberToggle(member.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor={`member-${member.id}`} className="text-sm">
                {member.names} - {formatCurrency(member.amount, member.currency)}
              </label>
            </div>
          ))}
        </div>
        {errors.memberIds && (
          <p className="mt-1 text-sm text-danger-600">{errors.memberIds}</p>
        )}
      </div>

      {/* Top 3 Priority Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Top 3 Priority Members ({formData.topThreeMemberIds.length}/3 selected)
        </label>
        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
          {formData.memberIds.map((memberId) => {
            const member = members.find(m => m.id === memberId);
            if (!member) return null;
            
            return (
              <div key={memberId} className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id={`top3-${memberId}`}
                  checked={formData.topThreeMemberIds.includes(memberId)}
                  onChange={() => handleTopThreeToggle(memberId)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor={`top3-${memberId}`} className="text-sm">
                  {member.names}
                </label>
              </div>
            );
          })}
        </div>
        {errors.topThreeMemberIds && (
          <p className="mt-1 text-sm text-danger-600">{errors.topThreeMemberIds}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
        >
          Create Season
        </Button>
      </div>
    </form>
  );
};
