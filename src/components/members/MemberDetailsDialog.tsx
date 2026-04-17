import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select as MuiSelect,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  X,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Hash,
  MapPin,
  Filter,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  BarChart3,
  CalendarDays,
  Users2,
} from 'lucide-react';
import { MemberDTO, AssignCardRequest, TopDefaulterDTO, DailyWorkingDayDetail, MemberContributionDetail } from '@/types/api';
import { useMembers } from '@/hooks';
import { formatCurrency, formatDate } from '@/utils/format';
import { formatMemberType, formatPhoneNumber } from '@/utils/format';
import { MEMBER_STATUS } from '@/utils/constants';

interface MemberDetailsDialogProps {
  open: boolean;
  member: MemberDTO | null;
  onClose: () => void;
  onMemberUpdated: () => void;
}

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const dayLabel = (dow: string) => dow.charAt(0) + dow.slice(1).toLowerCase();

export const MemberDetailsDialog: React.FC<MemberDetailsDialogProps> = ({
  open,
  member,
  onClose,
  onMemberUpdated,
}) => {
  const {
    memberDetail,
    memberHistory,
    getMemberDetail,
    getMemberHistory,
    changeMemberStatus,
    assignCard,
    unassignCard,
    isLoading,
    error,
    clearError,
  } = useMembers();

  const [activeTab, setActiveTab] = useState(0);

  // Current month boundaries
  const currentMonthStart = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);
  const currentMonthEnd = useMemo(() => {
    const d = new Date();
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
  }, []);

  const [startDate, setStartDate] = useState(currentMonthStart);
  const [endDate, setEndDate] = useState(currentMonthEnd);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open && member) {
      clearError();
      setActionError(null);
      setActionSuccess(null);
      setActiveTab(0);
      setStartDate(currentMonthStart);
      setEndDate(currentMonthEnd);
      getMemberDetail(member.id);
      getMemberHistory(member.id, currentMonthStart, currentMonthEnd);
    }
  }, [open, member?.id]);

  const handleFilter = () => {
    if (!member) return;
    getMemberHistory(member.id, startDate || undefined, endDate || undefined);
  };

  const handleClearFilter = () => {
    if (!member) return;
    setStartDate(currentMonthStart);
    setEndDate(currentMonthEnd);
    getMemberHistory(member.id, currentMonthStart, currentMonthEnd);
  };

  const handleChangeStatus = async () => {
    if (!member || !selectedStatus) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const success = await changeMemberStatus(member.id, selectedStatus);
      if (success) {
        setActionSuccess(`Status changed to ${selectedStatus}`);
        setStatusDialogOpen(false);
        onMemberUpdated();
      } else {
        setActionError('Failed to change status');
      }
    } catch {
      setActionError('Failed to change status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignCard = async () => {
    if (!member || !cardNumber.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const request: AssignCardRequest = { cardNumber: cardNumber.trim() };
      const success = await assignCard(member.id, request);
      if (success) {
        setActionSuccess('Card assigned successfully');
        setCardDialogOpen(false);
        setCardNumber('');
        onMemberUpdated();
      } else {
        setActionError('Failed to assign card');
      }
    } catch {
      setActionError('Failed to assign card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassignCard = async () => {
    if (!member) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const success = await unassignCard(member.id);
      if (success) {
        setActionSuccess('Card unassigned successfully');
        setConfirmUnassignOpen(false);
        onMemberUpdated();
      } else {
        setActionError('Failed to unassign card');
      }
    } catch {
      setActionError('Failed to unassign card');
    } finally {
      setActionLoading(false);
    }
  };

  if (!member) return null;

  // Derived debit data
  const detail = memberDetail;
  const contributionRate = detail && detail.expectedWorkingDays > 0
    ? Math.round((detail.actualContributedDays / detail.expectedWorkingDays) * 100)
    : 0;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        {/* Header */}
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: member.status === 'ACTIVE' ? 'primary.main' : 'grey.400',
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {initials(member.names)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {member.names}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={member.status}
                    size="small"
                    color={member.status === 'ACTIVE' ? 'success' : member.status === 'SUSPENDED' ? 'error' : 'default'}
                    sx={{ fontWeight: 700, fontSize: 11 }}
                  />
                  <Chip label={formatMemberType(member.type)} variant="outlined" size="small" sx={{ fontSize: 11 }} />
                  <Chip
                    label={`${formatCurrency(member.amount, member.currency)}/day`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: 11 }}
                  />
                </Box>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <X size={20} />
            </IconButton>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ mt: 1.5, minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 700, fontSize: 13 } }}
          >
            <Tab label="Overview" />
            <Tab label="Debit Analysis" />
            <Tab label="Contributions" />
          </Tabs>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2.5, minHeight: 420 }}>
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess(null)}>{actionSuccess}</Alert>}
          {actionError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>{actionError}</Alert>}

          {/* ===== TAB 0: OVERVIEW ===== */}
          {activeTab === 0 && (
            <Box>
              {/* Contact & Info Grid */}
              <Paper variant="outlined" sx={{ borderRadius: '14px', p: 2.5, mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', color: 'text.secondary' }}>
                  Contact Information
                </Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.soft' }}><Phone size={16} /></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPhoneNumber(member.phone)}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'info.soft' }}><Mail size={16} /></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.email || '—'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'warning.soft' }}><Hash size={16} /></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">ID Number</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.idNumber}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'success.soft' }}><MapPin size={16} /></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.address || '—'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Membership Details */}
              <Paper variant="outlined" sx={{ borderRadius: '14px', p: 2.5, mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', color: 'text.secondary' }}>
                  Membership Details
                </Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.soft' }}><Calendar size={16} /></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Start Date</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.startDate ? formatDate(member.startDate) : 'Not set'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'grey.100' }}><Calendar size={16} /></Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">End Date</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.endDate ? formatDate(member.endDate) : '—'}</Typography>
                    </Box>
                  </Box>
                  {member.card && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: 'info.soft' }}><CreditCard size={16} /></Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Card</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{member.card}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Quick Stats from debit detail */}
              {detail && (
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, mb: 2.5 }}>
                  <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'primary.soft', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Expected</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{formatCurrency(detail.expectedTotalAmount, detail.memberCurrency)}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'success.soft', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Contributed</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.dark' }}>{formatCurrency(detail.actualContributedAmount, detail.memberCurrency)}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'error.soft', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Debit</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.dark' }}>{formatCurrency(detail.debitAmount, detail.memberCurrency)}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'warning.soft', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Rate</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{contributionRate}%</Typography>
                  </Paper>
                </Box>
              )}

              {/* Actions */}
              <Paper variant="outlined" sx={{ borderRadius: '14px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', color: 'text.secondary' }}>
                  Actions
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => { setSelectedStatus(member.status); setStatusDialogOpen(true); setActionSuccess(null); }}
                  >
                    Change Status
                  </Button>
                  {!member.card ? (
                    <Button variant="outlined" size="small" color="primary" onClick={() => { setCardDialogOpen(true); setActionSuccess(null); }}>
                      Assign Card
                    </Button>
                  ) : (
                    <Button variant="outlined" size="small" color="warning" onClick={() => { setConfirmUnassignOpen(true); setActionSuccess(null); }}>
                      Unassign Card
                    </Button>
                  )}
                </Stack>
              </Paper>
            </Box>
          )}

          {/* ===== TAB 1: DEBIT ANALYSIS ===== */}
          {activeTab === 1 && (
            <Box>
              {isLoading && !detail ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : !detail ? (
                <Alert severity="info">No debit information available for this member.</Alert>
              ) : (
                <>
                  {/* Month badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Chip
                      icon={<CalendarDays size={14} />}
                      label={`${new Date(detail.year, detail.month - 1).toLocaleString('default', { month: 'long' })} ${detail.year}`}
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      label={`${detail.memberCurrency}`}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  {/* Progress bar */}
                  <Paper variant="outlined" sx={{ borderRadius: '14px', p: 2.5, mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Contribution Progress</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: contributionRate >= 80 ? 'success.main' : contributionRate >= 50 ? 'warning.main' : 'error.main' }}>
                        {contributionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={contributionRate}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'grey.100',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          bgcolor: contributionRate >= 80 ? 'success.main' : contributionRate >= 50 ? 'warning.main' : 'error.main',
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">{detail.actualContributedDays} of {detail.expectedWorkingDays} days</Typography>
                      <Typography variant="caption" color="text.secondary">{formatCurrency(detail.dailyContributionAmount, detail.memberCurrency)}/day</Typography>
                    </Box>
                  </Paper>

                  {/* Summary metrics */}
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)' }, mb: 2.5 }}>
                    <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <BarChart3 size={16} color="#1976d2" />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Expected Days</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{detail.expectedWorkingDays}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatCurrency(detail.expectedTotalAmount, detail.memberCurrency)}</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'success.soft' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CheckCircle2 size={16} color="#2e7d32" />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Contributed Days</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.dark' }}>{detail.actualContributedDays}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatCurrency(detail.actualContributedAmount, detail.memberCurrency)}</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'error.soft' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <TrendingDown size={16} color="#d32f2f" />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Debit Days</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.dark' }}>{detail.debitDays}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatCurrency(detail.debitAmount, detail.memberCurrency)}</Typography>
                    </Paper>
                  </Box>

                  {/* Daily Calendar Grid */}
                  {detail.dailyWorkingDayDetails && detail.dailyWorkingDayDetails.length > 0 && (() => {
                    const days = detail.dailyWorkingDayDetails!;
                    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
                    const dowIndex = (dow: string) => weekDays.indexOf(dow.toUpperCase() as any);

                    // Group days into calendar weeks
                    const weeks: (DailyWorkingDayDetail | null)[][] = [];
                    let currentWeek: (DailyWorkingDayDetail | null)[] = [];

                    // Pad the first week with nulls before the first day
                    const firstDayIdx = dowIndex(days[0].dayOfWeek);
                    for (let i = 0; i < firstDayIdx; i++) currentWeek.push(null);

                    for (const day of days) {
                      currentWeek.push(day);
                      if (currentWeek.length === 7) {
                        weeks.push(currentWeek);
                        currentWeek = [];
                      }
                    }
                    // Pad final week
                    if (currentWeek.length > 0) {
                      while (currentWeek.length < 7) currentWeek.push(null);
                      weeks.push(currentWeek);
                    }

                    const statusColor = (s: string) => {
                      switch (s) {
                        case 'CONTRIBUTED': return { bg: '#e8f5e9', border: '#66bb6a', text: '#2e7d32', icon: <CheckCircle2 size={12} /> };
                        case 'MISSED': return { bg: '#ffebee', border: '#ef5350', text: '#c62828', icon: <AlertTriangle size={12} /> };
                        case 'FUTURE': return { bg: '#f5f5f5', border: '#e0e0e0', text: '#9e9e9e', icon: <Clock size={12} /> };
                        case 'HOLIDAY': return { bg: '#fff3e0', border: '#ffb74d', text: '#e65100', icon: <CalendarDays size={12} /> };
                        default: return { bg: '#f5f5f5', border: '#e0e0e0', text: '#757575', icon: null };
                      }
                    };

                    return (
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', color: 'text.secondary' }}>
                          Daily Calendar
                        </Typography>

                        {/* Legend */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                          {[
                            { label: 'Contributed', color: '#e8f5e9', border: '#66bb6a' },
                            { label: 'Missed', color: '#ffebee', border: '#ef5350' },
                            { label: 'Future', color: '#f5f5f5', border: '#e0e0e0' },
                            { label: 'Holiday', color: '#fff3e0', border: '#ffb74d' },
                          ].map((l) => (
                            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: l.color, border: `1.5px solid ${l.border}` }} />
                              <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>{l.label}</Typography>
                            </Box>
                          ))}
                        </Box>

                        <Paper variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden' }}>
                          {/* Week header */}
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                            {weekDays.map((d) => (
                              <Box key={d} sx={{ py: 0.75, textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: d === 'SAT' || d === 'SUN' ? 'text.disabled' : 'text.secondary' }}>
                                  {d}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          {/* Calendar rows */}
                          {weeks.map((week, wi) => (
                            <Box key={wi} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: wi < weeks.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                              {week.map((day, di) => {
                                if (!day) {
                                  return <Box key={di} sx={{ p: 1, minHeight: 64, bgcolor: '#fafafa' }} />;
                                }
                                const sc = statusColor(day.status);
                                const dayNum = new Date(day.date).getDate();
                                return (
                                  <Tooltip
                                    key={di}
                                    title={
                                      <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{day.date} ({dayLabel(day.dayOfWeek)})</Typography>
                                        <br />
                                        <Typography variant="caption">Status: {day.status}</Typography>
                                        {day.contributionAmount != null && <><br /><Typography variant="caption">Contributed: {formatCurrency(day.contributionAmount, day.currency || detail.memberCurrency)}</Typography></>}
                                        {day.debitAmount != null && day.debitAmount > 0 && <><br /><Typography variant="caption">Debit: {formatCurrency(day.debitAmount, day.currency || detail.memberCurrency)}</Typography></>}
                                        {day.expectedAmount != null && <><br /><Typography variant="caption">Expected: {formatCurrency(day.expectedAmount, day.currency || detail.memberCurrency)}</Typography></>}
                                      </Box>
                                    }
                                    arrow
                                  >
                                    <Box
                                      sx={{
                                        p: 0.75,
                                        minHeight: 64,
                                        bgcolor: sc.bg,
                                        borderRight: di < 6 ? '1px solid' : 'none',
                                        borderColor: 'divider',
                                        cursor: 'default',
                                        transition: 'transform 0.1s',
                                        '&:hover': { transform: 'scale(1.03)', zIndex: 1, boxShadow: 1 },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.25,
                                      }}
                                    >
                                      <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 14, color: sc.text }}>{dayNum}</Typography>
                                      <Box sx={{ color: sc.text, display: 'flex', alignItems: 'center' }}>{sc.icon}</Box>
                                      {day.contributionAmount != null && day.contributionAmount > 0 && (
                                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 9, color: 'success.dark', lineHeight: 1 }}>
                                          {formatCurrency(day.contributionAmount, day.currency || detail.memberCurrency)}
                                        </Typography>
                                      )}
                                      {day.debitAmount != null && day.debitAmount > 0 && (
                                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 9, color: 'error.dark', lineHeight: 1 }}>
                                          -{formatCurrency(day.debitAmount, day.currency || detail.memberCurrency)}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Tooltip>
                                );
                              })}
                            </Box>
                          ))}
                        </Paper>
                      </Box>
                    );
                  })()}

                  {/* Contributions from debit detail */}
                  {detail.contributions && detail.contributions.length > 0 && (
                    <Box sx={{ mt: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', color: 'text.secondary' }}>
                        This Month&apos;s Contributions
                      </Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Debit</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {detail.contributions.map((c: MemberContributionDetail, idx: number) => (
                              <TableRow key={c.id || idx}>
                                <TableCell>{formatDate(c.createdAt)}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>
                                    {c.referenceNumber || '—'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={`${c.days} day${c.days !== 1 ? 's' : ''}`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(c.amount, c.currency || detail.memberCurrency)}</TableCell>
                                <TableCell sx={{ color: c.debitAmount > 0 ? 'error.main' : 'text.secondary', fontWeight: 600 }}>
                                  {formatCurrency(c.debitAmount ?? 0, c.currency || detail.memberCurrency)}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={c.status}
                                    size="small"
                                    color={c.status === 'ACCEPTED' ? 'success' : c.status === 'PENDING' ? 'warning' : c.status === 'REJECTED' ? 'error' : 'default'}
                                    sx={{ fontWeight: 600, fontSize: 11 }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {/* ===== TAB 2: CONTRIBUTIONS (HISTORY) ===== */}
          {activeTab === 2 && (
            <Box>
              {/* Summary Cards */}
              {!isLoading && memberHistory.contributions.length > 0 && (
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)', mb: 2 }}>
                  <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Total Contributions</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>{memberHistory.totalContributions}</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Total Amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>{formatCurrency(memberHistory.totalAmount, member.currency)}</Typography>
                  </Paper>
                </Box>
              )}

              {/* Date Range Filter */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: '12px' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Filter size={16} color="#888" />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Filter by date</Typography>
                  </Box>
                  <TextField
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <Button variant="contained" size="small" onClick={handleFilter}>Apply</Button>
                  {(startDate !== currentMonthStart || endDate !== currentMonthEnd) && (
                    <Button variant="text" size="small" onClick={handleClearFilter}>Reset</Button>
                  )}
                </Box>
              </Paper>

              {/* History Table */}
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : memberHistory.contributions.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">
                    No contribution history found{(startDate || endDate) ? ' for the selected date range' : ''}.
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Debit</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {memberHistory.contributions.map((item: any, index: number) => (
                        <TableRow key={item.id || index}>
                          <TableCell>{formatDate(item.createdAt)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>
                              {item.referenceNumber || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {item.days ? (
                              <Chip label={`${item.days} day${item.days !== 1 ? 's' : ''}`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />
                            ) : '—'}
                          </TableCell>
                          <TableCell>{formatCurrency(item.amount, item.currency || member.currency)}</TableCell>
                          <TableCell sx={{ color: item.debitAmount > 0 ? 'error.main' : 'text.secondary', fontWeight: 600 }}>
                            {formatCurrency(item.debitAmount ?? 0, item.currency || member.currency)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              size="small"
                              color={
                                item.status === 'ACCEPTED' ? 'success' :
                                item.status === 'PENDING' ? 'warning' :
                                item.status === 'REJECTED' ? 'error' : 'default'
                              }
                              sx={{ fontWeight: 600, fontSize: 11 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Member Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Change status for <strong>{member.names}</strong>
          </Typography>
          <MuiSelect
            fullWidth
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            size="small"
          >
            {Object.values(MEMBER_STATUS).map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </MuiSelect>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleChangeStatus}
            disabled={actionLoading || selectedStatus === member.status}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Change Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Card Dialog */}
      <Dialog open={cardDialogOpen} onClose={() => setCardDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Card</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Assign a card to <strong>{member.names}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            size="small"
            placeholder="Enter card number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignCard}
            disabled={actionLoading || !cardNumber.trim()}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Unassign Card Dialog */}
      <Dialog open={confirmUnassignOpen} onClose={() => setConfirmUnassignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Unassign Card</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to unassign the card <strong>{member.card}</strong> from <strong>{member.names}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmUnassignOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleUnassignCard}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Unassign'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
