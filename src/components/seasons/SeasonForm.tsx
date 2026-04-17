import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CalendarDays,
  Crown,
  Search,
  Trash2,
  Users,
  Star,
} from 'lucide-react';
import { useSeasons, useMembers } from '@/hooks';
import { MemberDTO, SeasonCreationRequestDTO } from '@/types/api';
import { SEASON_STATUS } from '@/utils/constants';
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
  const { searchMembers } = useMembers();

  const [formData, setFormData] = useState({
    months: 0 as number,
    status: SEASON_STATUS.ACTIVE,
    createdBy: 'System Admin',
  });

  const MONTH_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

  const [selectedMembers, setSelectedMembers] = useState<MemberDTO[]>([]);
  const [topThreeMembers, setTopThreeMembers] = useState<MemberDTO[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<MemberDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = useCallback((_: React.SyntheticEvent, value: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      const results = await searchMembers(value);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, [searchMembers]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Search results excluding already-selected members
  const availableMembers = useMemo(
    () => searchResults.filter((m) => !selectedMembers.some((s) => s.id === m.id)),
    [searchResults, selectedMembers],
  );

  // Members available for top 3 (selected but not yet in top 3)
  const availableForTopThree = useMemo(
    () => selectedMembers.filter((m) => !topThreeMembers.some((t) => t.id === m.id)),
    [selectedMembers, topThreeMembers],
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddMember = (member: MemberDTO | null) => {
    if (!member) return;
    setSelectedMembers((prev) => [...prev, member]);
    if (errors.memberIds) setErrors((prev) => ({ ...prev, memberIds: '' }));
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId));
    setTopThreeMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleAddTopThree = (member: MemberDTO | null) => {
    if (!member || topThreeMembers.length >= 3) return;
    setTopThreeMembers((prev) => [...prev, member]);
    if (errors.topThreeMemberIds) setErrors((prev) => ({ ...prev, topThreeMemberIds: '' }));
  };

  const handleRemoveTopThree = (memberId: string) => {
    setTopThreeMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.months) newErrors.months = 'Please select number of months';
    if (selectedMembers.length === 0) newErrors.memberIds = 'Please add at least one member';
    if (topThreeMembers.length > 3)
      newErrors.topThreeMemberIds = 'You can only select up to 3 top-priority members';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const seasonData: SeasonCreationRequestDTO = {
        months: formData.months,
        status: formData.status,
        createdBy: formData.createdBy,
        memberIds: selectedMembers.map((m) => m.id),
        topThreeMemberIds: topThreeMembers.length > 0 ? topThreeMembers.map((m) => m.id) : undefined,
      };
      const success = await createSeasonWithMembers(seasonData);
      if (success) onSuccess?.();
    } catch (error) {
      console.error('Failed to create season:', error);
    }
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1, display: 'grid', gap: 3.5 }}>
      {/* ── Season Details Section ── */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center' }}>
          <CalendarDays size={18} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Season details</Typography>
        </Stack>

        {/* Duration cards */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Select season duration
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1.5, mb: 1 }}>
          {MONTH_OPTIONS.map((m) => {
            const selected = formData.months === m;
            return (
              <Box
                key={m}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, months: m }));
                  if (errors.months) setErrors((prev) => ({ ...prev, months: '' }));
                }}
                sx={{
                  cursor: 'pointer',
                  borderRadius: '14px',
                  border: 2,
                  borderColor: selected ? 'primary.main' : 'divider',
                  bgcolor: selected ? 'primary.soft' : 'background.paper',
                  py: 2,
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: selected ? 'primary.soft' : 'action.hover',
                    transform: 'translateY(-2px)',
                    boxShadow: 1,
                  },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: selected ? 'primary.main' : 'text.primary' }}>
                  {m}
                </Typography>
                <Typography variant="caption" sx={{ color: selected ? 'primary.dark' : 'text.secondary' }}>
                  {m === 1 ? 'month' : 'months'}
                </Typography>
              </Box>
            );
          })}
        </Box>
        {errors.months && <FormHelperText error>{errors.months}</FormHelperText>}

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 2.5 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              {Object.values(SEASON_STATUS).map((s) => (
                <MenuItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Created by"
            value={formData.createdBy}
            onChange={(e) => handleInputChange('createdBy', e.target.value)}
            fullWidth
          />
        </Box>
      </Paper>

      {/* ── Member Search & Add ── */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
        <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Users size={18} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Season members</Typography>
          </Stack>
          <Chip label={`${selectedMembers.length} selected`} size="small" color="primary" variant="outlined" />
        </Stack>
 
        <Autocomplete
          options={availableMembers}
          getOptionLabel={(option) => `${option.names} — ${option.phone}`}
          filterOptions={(x) => x}
          onInputChange={handleSearchInput}
          onChange={(_, value) => handleAddMember(value)}
          value={null}
          blurOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search by name, phone, email or ID..."
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps.input,
                  startAdornment: (
                    <>
                      <Search size={16} style={{ marginRight: 8, opacity: 0.5 }} />
                      {params.slotProps.input.startAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
          renderOption={(props, option) => {
            const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
            return (
              <li key={key} {...rest}>
                <Stack direction="row" spacing={1.5} sx={{ py: 0.5, alignItems: 'center' }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.soft', color: 'primary.dark' }}>
                    {initials(option.names)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.names}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.phone} · {formatCurrency(option.amount, option.currency)}
                    </Typography>
                  </Box>
                </Stack>
              </li>
            );
          }}
          noOptionsText={isSearching ? 'Searching...' : 'Type to search members'}
          sx={{ mb: 1.5 }}
        />

        {errors.memberIds && (
          <FormHelperText error sx={{ mb: 1 }}>{errors.memberIds}</FormHelperText>
        )}

        {/* Selected member list */}
        {selectedMembers.length > 0 && (
          <List dense sx={{ maxHeight: 240, overflow: 'auto' }}>
            {selectedMembers.map((member, idx) => (
              <ListItem
                key={member.id}
                sx={{ bgcolor: 'background.paper', borderRadius: '12px', mb: 0.75, pr: 1 }}
                secondaryAction={
                  <Tooltip title="Remove">
                    <IconButton edge="end" size="small" onClick={() => handleRemoveMember(member.id)}>
                      <Trash2 size={15} />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: 'primary.soft', color: 'primary.dark' }}>
                    {initials(member.names)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {idx + 1}. {member.names}
                    </Typography>
                  }
                  secondary={`${member.phone} · ${formatCurrency(member.amount, member.currency)}`}
                />
                {topThreeMembers.some((t) => t.id === member.id) && (
                  <Chip
                    icon={<Crown size={12} />}
                    label={`#${topThreeMembers.findIndex((t) => t.id === member.id) + 1}`}
                    size="small"
                    color="warning"
                    sx={{ mr: 1 }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* ── Top 3 Priority ── */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
        <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Star size={18} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Top 3 priority</Typography>
          </Stack>
          <Chip
            label={`${topThreeMembers.length}/3`}
            size="small"
            color={topThreeMembers.length === 3 ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pick up to 3 members from the selected list who should receive priority payouts.
        </Typography>

        <Autocomplete
          options={availableForTopThree}
          getOptionLabel={(option) => option.names}
          onChange={(_, value) => handleAddTopThree(value)}
          value={null}
          disabled={topThreeMembers.length >= 3 || selectedMembers.length === 0}
          blurOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                selectedMembers.length === 0
                  ? 'Add members first...'
                  : topThreeMembers.length >= 3
                    ? 'All 3 slots filled'
                    : 'Search selected members...'
              }
            />
          )}
          renderOption={(props, option) => {
            const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
            return (
              <li key={key} {...rest}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'warning.light', color: 'warning.dark' }}>
                    {initials(option.names)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.names}</Typography>
                </Stack>
              </li>
            );
          }}
          noOptionsText="No available members"
          sx={{ mb: 1.5 }}
        />

        {errors.topThreeMemberIds && (
          <FormHelperText error sx={{ mb: 1 }}>{errors.topThreeMemberIds}</FormHelperText>
        )}

        {/* Top 3 chips */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {[0, 1, 2].map((slot) => {
            const member = topThreeMembers[slot];
            return member ? (
              <Chip
                key={member.id}
                avatar={
                  <Avatar sx={{ bgcolor: 'warning.dark', color: '#fff !important', fontWeight: 700 }}>
                    {slot + 1}
                  </Avatar>
                }
                label={member.names}
                onDelete={() => handleRemoveTopThree(member.id)}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip
                key={`empty-${slot}`}
                avatar={<Avatar sx={{ bgcolor: 'action.disabled' }}>{slot + 1}</Avatar>}
                label="Empty slot"
                variant="outlined"
                disabled
              />
            );
          })}
        </Stack>
      </Paper>

      {/* ── Actions ── */}
      <Stack direction="row" spacing={1.5} sx={{ pt: 0.5, justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Season'}
        </Button>
      </Stack>
    </Box>
  );
};
