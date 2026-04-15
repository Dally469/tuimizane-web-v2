import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { usePayments } from '@/hooks';
import { PaymentProcessRequestDTO } from '@/types/api';
import { PAYMENT_METHOD } from '@/utils/constants';
import { formatCurrency } from '@/utils/format';

interface PaymentFormProps {
  seasonId: string;
  nextMember?: {
    id: string;
    names: string;
    ranking: number;
    isTopThree: boolean;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  seasonId,
  nextMember,
  onSuccess,
  onCancel,
}) => {
  const { processPayment, isLoading } = usePayments();
  
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: PAYMENT_METHOD.MOBILE_MONEY,
    processedBy: '',
    comments: '',
    customAmount: '',
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

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    } else {
      const paymentDate = new Date(formData.paymentDate);
      const dayOfWeek = paymentDate.getDay();
      if (dayOfWeek !== 1) { // 1 = Monday
        newErrors.paymentDate = 'Payment date must be a Monday';
      }
    }

    if (!formData.processedBy.trim()) {
      newErrors.processedBy = 'Processed by is required';
    }

    if (formData.customAmount && (isNaN(parseFloat(formData.customAmount)) || parseFloat(formData.customAmount) <= 0)) {
      newErrors.customAmount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const paymentData: PaymentProcessRequestDTO = {
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        processedBy: formData.processedBy.trim(),
        comments: formData.comments.trim() || undefined,
        customAmount: formData.customAmount ? parseFloat(formData.customAmount) : undefined,
      };

      const success = await processPayment(seasonId, paymentData);
      
      if (success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const paymentMethodOptions = Object.values(PAYMENT_METHOD).map(method => ({
    value: method,
    label: method.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Next Member Info */}
      {nextMember && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Next Member to Pay</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span> {nextMember.names}
            </div>
            <div>
              <span className="font-medium">Ranking:</span> #{nextMember.ranking}
              {nextMember.isTopThree && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Top 3 Priority
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">Priority:</span> {nextMember.isTopThree ? 'High' : 'Normal'}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="paymentDate"
          type="date"
          label="Payment Date"
          value={formData.paymentDate}
          onChange={(e) => handleInputChange('paymentDate', e.target.value)}
          error={errors.paymentDate}
          helperText="Payment must be processed on a Monday"
        />

        <Select
          id="paymentMethod"
          label="Payment Method"
          value={formData.paymentMethod}
          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
          options={paymentMethodOptions}
        />

        <Input
          id="processedBy"
          label="Processed By"
          value={formData.processedBy}
          onChange={(e) => handleInputChange('processedBy', e.target.value)}
          error={errors.processedBy}
          placeholder="Enter your name"
        />

        <Input
          id="customAmount"
          type="number"
          label="Custom Amount (Optional)"
          value={formData.customAmount}
          onChange={(e) => handleInputChange('customAmount', e.target.value)}
          error={errors.customAmount}
          placeholder="Leave empty for default calculation"
          helperText="Override the calculated contribution amount"
        />
      </div>

      <div>
        <Input
          id="comments"
          label="Comments (Optional)"
          value={formData.comments}
          onChange={(e) => handleInputChange('comments', e.target.value)}
          placeholder="Add any notes about this payment"
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
          variant="success"
          loading={isLoading}
          disabled={!nextMember}
        >
          {nextMember ? `Process Payment to ${nextMember.names}` : 'No Member Available'}
        </Button>
      </div>
    </form>
  );
};
