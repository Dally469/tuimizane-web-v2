import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { useMembers } from '@/hooks';
import { Member } from '@/types/api';
import { CURRENCIES, MEMBER_TYPE } from '@/utils/constants';
import { isValidEmail, isValidPhoneNumber, isValidIdNumber } from '@/utils/validation';

interface MemberFormProps {
  member?: Partial<Member>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const MemberForm: React.FC<MemberFormProps> = ({
  member,
  onSuccess,
  onCancel,
}) => {
  const { createMember, updateMember, isLoading } = useMembers();
  
  const [formData, setFormData] = useState({
    names: member?.names || '',
    phone: member?.phone || '',
    email: member?.email || '',
    idNumber: member?.idNumber || '',
    amount: member?.amount || '',
    currency: member?.currency || 'RWF',
    address: member?.address || '',
    type: member?.type || MEMBER_TYPE.REGULAR,
    months: 12, // Default to 12 months for new members
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.names.trim()) {
      newErrors.names = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid Rwandan phone number';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    } else if (!isValidIdNumber(formData.idNumber)) {
      newErrors.idNumber = 'Please enter a valid 16-digit ID number';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const memberData: Partial<Member> = {
        names: formData.names.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        idNumber: formData.idNumber.trim(),
        amount: formData.amount,
        currency: formData.currency,
        address: formData.address.trim(),
        type: formData.type,
      };

      let success = false;
      
      if (member?.id) {
        // Update existing member
        success = await updateMember(member.id, memberData) !== null;
      } else {
        // Create new member
        success = await createMember(memberData, formData.months) !== null;
      }
      
      if (success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to save member:', error);
    }
  };

  const currencyOptions = Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.name} (${currency.symbol})`,
  }));

  const memberTypeOptions = Object.entries(MEMBER_TYPE).map(([key, value]) => ({
    value: value.toString(),
    label: key.charAt(0) + key.slice(1).toLowerCase(),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="names"
          label="Full Name"
          value={formData.names}
          onChange={(e) => handleInputChange('names', e.target.value)}
          error={errors.names}
          placeholder="Enter member's full name"
        />

        <Input
          id="phone"
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="07xxxxxxxx or +2507xxxxxxxx"
        />

        <Input
          id="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          placeholder="member@example.com"
        />

        <Input
          id="idNumber"
          label="ID Number"
          value={formData.idNumber}
          onChange={(e) => handleInputChange('idNumber', e.target.value)}
          error={errors.idNumber}
          placeholder="16-digit national ID number"
        />

        <Input
          id="amount"
          label="Contribution Amount"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          error={errors.amount}
          placeholder="e.g., 50000"
        />

        <Select
          id="currency"
          label="Currency"
          value={formData.currency}
          onChange={(e) => handleInputChange('currency', e.target.value)}
          options={currencyOptions}
        />

        <Select
          id="type"
          label="Member Type"
          value={formData.type.toString()}
          onChange={(e) => handleInputChange('type', parseInt(e.target.value))}
          options={memberTypeOptions}
        />

        {!member?.id && (
          <Input
            id="months"
            type="number"
            label="Membership Duration (months)"
            value={formData.months.toString()}
            onChange={(e) => handleInputChange('months', parseInt(e.target.value))}
            min="1"
            max="60"
            helperText="Number of months for this membership"
          />
        )}
      </div>

      <div>
        <Input
          id="address"
          label="Address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          error={errors.address}
          placeholder="Enter member's full address"
        />
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
          {member?.id ? 'Update Member' : 'Create Member'}
        </Button>
      </div>
    </form>
  );
};
