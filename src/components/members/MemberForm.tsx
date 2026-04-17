import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { User, Phone, Mail, CreditCard, Banknote, MapPin } from 'lucide-react';
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
    type: member?.type || MEMBER_TYPE.VISION_1,
    months: 12,
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

    if (!formData.names.trim()) newErrors.names = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!isValidPhoneNumber(formData.phone)) newErrors.phone = 'Enter a valid Rwanda or DRC phone number';
    if (formData.email && !isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    else if (!isValidIdNumber(formData.idNumber)) newErrors.idNumber = 'Enter a valid ID (6-20 alphanumeric characters)';
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required';
    else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0)
      newErrors.amount = 'Please enter a valid amount greater than 0';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

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
        success = await updateMember(member.id, memberData) !== null;
      } else {
        success = await createMember(memberData, formData.months) !== null;
      }
      if (success) onSuccess?.();
    } catch (error) {
      console.error('Failed to save member:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1, display: 'grid', gap: 3 }}>
      {/* Personal info */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center' }}>
          <User size={18} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Personal information</Typography>
        </Stack>

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            label="Full Name"
            value={formData.names}
            onChange={(e) => handleInputChange('names', e.target.value)}
            error={!!errors.names}
            helperText={errors.names}
            placeholder="Enter member's full name"
            fullWidth
          />
          <TextField
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            placeholder="RW: 07xx or +2507xx · DRC: 09xx or +243xx"
            slotProps={{
              input: { startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment> },
            }}
            fullWidth
          />
          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            placeholder="member@example.com"
            slotProps={{
              input: { startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment> },
            }}
            fullWidth
          />
          <TextField
            label="ID Number"
            value={formData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            error={!!errors.idNumber}
            helperText={errors.idNumber}
            placeholder="National ID (6-20 chars)"
            slotProps={{
              input: { startAdornment: <InputAdornment position="start"><CreditCard size={16} /></InputAdornment> },
            }}
            fullWidth
          />
        </Box>
      </Paper>

      {/* Financial info */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center' }}>
          <Banknote size={18} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Contribution details</Typography>
        </Stack>

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            label="Contribution Amount"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
            placeholder="e.g., 50000"
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={formData.currency}
              label="Currency"
              onChange={(e) => handleInputChange('currency', e.target.value)}
            >
              {Object.values(CURRENCIES).map((c) => (
                <MenuItem key={c.code} value={c.code}>{c.name} ({c.symbol})</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Member Type</InputLabel>
            <Select
              value={formData.type.toString()}
              label="Member Type"
              onChange={(e) => handleInputChange('type', parseInt(e.target.value))}
            >
              {Object.entries(MEMBER_TYPE).map(([key, value]) => (
                <MenuItem key={value} value={value.toString()}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!member?.id && (
            <TextField
              label="Membership Duration (months)"
              type="number"
              value={formData.months.toString()}
              onChange={(e) => handleInputChange('months', parseInt(e.target.value))}
              slotProps={{ htmlInput: { min: 1, max: 60 } }}
              helperText="Number of months for this membership"
              fullWidth
            />
          )}
        </Box>
      </Paper>

      {/* Address */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center' }}>
          <MapPin size={18} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Address</Typography>
        </Stack>
        <TextField
          label="Address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          error={!!errors.address}
          helperText={errors.address}
          placeholder="Enter member's full address"
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
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? 'Saving...' : member?.id ? 'Update Member' : 'Create Member'}
        </Button>
      </Stack>
    </Box>
  );
};
