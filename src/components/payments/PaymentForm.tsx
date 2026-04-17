import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Banknote, CalendarDays, Crown, MessageSquare } from 'lucide-react';
import { usePayments } from '@/hooks';
import { PaymentProcessRequestDTO } from '@/types/api';
import { PAYMENT_METHOD } from '@/utils/constants';

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
      if (dayOfWeek !== 1) newErrors.paymentDate = 'Payment date must be a Monday';
    }

    if (!formData.processedBy.trim()) newErrors.processedBy = 'Processed by is required';
    if (formData.customAmount && (isNaN(parseFloat(formData.customAmount)) || parseFloat(formData.customAmount) <= 0))
      newErrors.customAmount = 'Please enter a valid amount greater than 0';

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
      if (success) onSuccess?.();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1, display: 'grid', gap: 3 }}>
      {/* Next member to pay */}
      {nextMember && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'primary.soft', boxShadow: 'none', border: '1px solid', borderColor: 'primary.light' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <Crown size={18} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Next member to pay</Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontWeight: 700 }}>
              {initials(nextMember.names)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{nextMember.names}</Typography>
              <Typography variant="body2" color="text.secondary">
                Ranking #{nextMember.ranking}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {nextMember.isTopThree && <Chip label="Top 3 Priority" color="warning" size="small" />}
              <Chip label={nextMember.isTopThree ? 'High' : 'Normal'} variant="outlined" size="small" />
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Payment details */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center' }}>
          <Banknote size={18} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Payment details</Typography>
        </Stack>

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            label="Payment Date"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => handleInputChange('paymentDate', e.target.value)}
            error={!!errors.paymentDate}
            helperText={errors.paymentDate || 'Payment must be processed on a Monday'}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={formData.paymentMethod}
              label="Payment Method"
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            >
              {Object.values(PAYMENT_METHOD).map((method) => (
                <MenuItem key={method} value={method}>
                  {method.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Processed By"
            value={formData.processedBy}
            onChange={(e) => handleInputChange('processedBy', e.target.value)}
            error={!!errors.processedBy}
            helperText={errors.processedBy}
            placeholder="Enter your name"
            fullWidth
          />
          <TextField
            label="Custom Amount (Optional)"
            type="number"
            value={formData.customAmount}
            onChange={(e) => handleInputChange('customAmount', e.target.value)}
            error={!!errors.customAmount}
            helperText={errors.customAmount || 'Override the calculated contribution amount'}
            placeholder="Leave empty for default"
            fullWidth
          />
        </Box>
      </Paper>

      {/* Comments */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center' }}>
          <MessageSquare size={18} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notes</Typography>
        </Stack>
        <TextField
          label="Comments (Optional)"
          value={formData.comments}
          onChange={(e) => handleInputChange('comments', e.target.value)}
          placeholder="Add any notes about this payment"
          multiline
          minRows={2}
          fullWidth
        />
      </Paper>

      {/* Actions */}
      <Stack direction="row" spacing={1.5} sx={{ pt: 0.5, justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        )}
        <Button type="submit" variant="contained" disabled={isLoading || !nextMember}>
          {isLoading
            ? 'Processing...'
            : nextMember
              ? `Process Payment to ${nextMember.names}`
              : 'No Member Available'}
        </Button>
      </Stack>
    </Box>
  );
};
