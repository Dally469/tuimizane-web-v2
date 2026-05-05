import React from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/store/hooks';
import { useContributions, useMembers, useSeasons } from '@/hooks';
import { CONTRIBUTION_STATUS, PAYMENT_METHOD, CURRENCIES } from '@/utils/constants';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/utils/format';
import type { MemberDTO } from '@/types/api';
import {
  AlertTriangle,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  DollarSign,
  Hash,
  Phone,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  Trophy,
  Users2,
  XCircle,
  Calendar,
  Wallet,
  BarChart3,
} from 'lucide-react';

type StatusFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESET';
type TabValue = 0 | 1 | 2;

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export default function ContributionsPage() {
  const contribHook = useContributions();
  const {
    contributions,
    summary,
    isLoading,
    fetchContributions,
    fetchSummary,
    createContribution,
    approveContribution,
    rejectContribution,
    debitAnalysis,
    workingDaysCalendar,
    debitHistory,
    orgDebitStats,
    topDefaulters,
    memberDebitContributions,
    resetContributions,
    fetchMemberDebitAnalysis,
    fetchMemberContributionsWithDebit,
    fetchWorkingDaysCalendar,
    fetchDebitHistory,
    payDebit,
    bulkPayDebit,
    fetchOrgDebitStatistics,
    fetchTopDefaulters,
    page: currentPage,
    limit: currentLimit,
    total,
    setPage,
    setLimit,
  } = contribHook;

  const { members, fetchMembers, searchMembers } = useMembers();
  const { seasons } = useSeasons();
  const { user } = useAppSelector((state) => state.auth);
  const activeSeasons = seasons.filter((s) => s.status === 'ACTIVE');

  const safeContributions = Array.isArray(contributions) ? contributions : [];
  const totalPages = total ? Math.ceil(total / currentLimit) : Math.ceil(safeContributions.length / currentLimit) || 1;

  // Tab state
  const [activeTab, setActiveTab] = React.useState<TabValue>(0);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('ALL');

  // Create contribution dialog
  const [createOpen, setCreateOpen] = React.useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = React.useState('');
  const [memberOptions, setMemberOptions] = React.useState<MemberDTO[]>([]);
  const [selectedMember, setSelectedMember] = React.useState<MemberDTO | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [contribForm, setContribForm] = React.useState({
    amount: '',
    currency: 'RWF',
    days: '1',
    seasonId: '',
    paymentMethod: 'MOBILE_MONEY',
    contributionDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
  });

  // Reset dialog
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetMode, setResetMode] = React.useState<'all' | 'season' | 'member'>('all');
  const [resetSeasonId, setResetSeasonId] = React.useState('');
  const [resetMemberId, setResetMemberId] = React.useState<MemberDTO | null>(null);
  const [resetDate, setResetDate] = React.useState('');
  const [resetMemberSearch, setResetMemberSearch] = React.useState('');
  const [resetMemberOptions, setResetMemberOptions] = React.useState<MemberDTO[]>([]);

  // Debit analysis state
  const [debitMember, setDebitMember] = React.useState<MemberDTO | null>(null);
  const [debitMemberSearch, setDebitMemberSearch] = React.useState('');
  const [debitMemberOptions, setDebitMemberOptions] = React.useState<MemberDTO[]>([]);
  const [debitMonth, setDebitMonth] = React.useState(new Date().getMonth() + 1);
  const [debitYear, setDebitYear] = React.useState(new Date().getFullYear());

  // Pay debit dialog
  const [payDebitOpen, setPayDebitOpen] = React.useState(false);
  const [payDebitMode, setPayDebitMode] = React.useState<'single' | 'bulk'>('single');
  const [payDebitForm, setPayDebitForm] = React.useState({
    debitDate: '',
    amount: '',
    currency: 'RWF',
    paymentMethod: 'MOBILE_MONEY',
    referenceNumber: '',
  });
  const [bulkPayDates, setBulkPayDates] = React.useState<string[]>([]);

  // Expanded defaulter detail
  const [expandedDefaulter, setExpandedDefaulter] = React.useState<string | null>(null);

  // Member map for contribution display
  const memberMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(members)) {
      members.forEach((m: MemberDTO) => {
        map[m.id] = m.names;
      });
    }
    return map;
  }, [members]);

  // Effects
  React.useEffect(() => {
    fetchContributions();
    fetchSummary();
    fetchMembers();
  }, []);

  React.useEffect(() => {
    if (activeTab === 1) {
      fetchOrgDebitStatistics({ month: debitMonth, year: debitYear });
      fetchTopDefaulters({ month: debitMonth, year: debitYear, limit: 10 });
    }
  }, [activeTab, debitMonth, debitYear]);

  // Member search for create contribution
  React.useEffect(() => {
    if (memberSearchQuery.length < 2) {
      setMemberOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchMembers(memberSearchQuery);
        setMemberOptions(Array.isArray(results) ? results : []);
      } catch {
        setMemberOptions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearchQuery, searchMembers]);

  // Member search for reset
  React.useEffect(() => {
    if (resetMemberSearch.length < 2) {
      setResetMemberOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchMembers(resetMemberSearch);
        setResetMemberOptions(Array.isArray(results) ? results : []);
      } catch {
        setResetMemberOptions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [resetMemberSearch, searchMembers]);

  // Member search for debit analysis
  React.useEffect(() => {
    if (debitMemberSearch.length < 2) {
      setDebitMemberOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchMembers(debitMemberSearch);
        setDebitMemberOptions(Array.isArray(results) ? results : []);
      } catch {
        setDebitMemberOptions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [debitMemberSearch, searchMembers]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedMember(null);
    setMemberSearchQuery('');
    setContribForm({
      amount: '',
      currency: 'RWF',
      days: '1',
      seasonId: activeSeasons[0]?.id || '',
      paymentMethod: 'MOBILE_MONEY',
      contributionDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
    });
    setCreateOpen(true);
  };

  const handleSelectMember = (member: MemberDTO | null) => {
    setSelectedMember(member);
    if (member) {
      const dailyRate = parseFloat(member.amount) || 0;
      const days = parseInt(contribForm.days, 10) || 1;
      setContribForm((prev) => ({
        ...prev,
        amount: String(dailyRate * days),
        currency: member.currency || 'RWF',
      }));
    }
  };

  const handleSubmitContribution = async () => {
    if (!selectedMember || !contribForm.amount) return;
    const seasonId = contribForm.seasonId || activeSeasons[0]?.id;
    setSubmitting(true);
    await createContribution({
      member: { id: selectedMember.id },
      ...(seasonId ? { season: { id: seasonId } } : {}),
      amount: parseFloat(contribForm.amount),
      debitAmount: 0,
      days: parseInt(contribForm.days, 10) || 1,
      currency: contribForm.currency,
      createdBy: user?.username || '',
      status: 'ACCEPTED',
    });
    setSubmitting(false);
    setCreateOpen(false);
  };

  const handleReset = async () => {
    const params: { seasonId?: string; memberId?: string; resetDate?: string } = {};
    if (resetMode === 'season') params.seasonId = resetSeasonId;
    if (resetMode === 'member' && resetMemberId) {
      params.memberId = resetMemberId.id;
      if (resetDate) params.resetDate = resetDate;
    }
    const ok = await resetContributions(params);
    if (ok) setResetOpen(false);
  };

  const handleLoadDebitAnalysis = () => {
    if (!debitMember) return;
    fetchMemberDebitAnalysis(debitMember.id, { month: debitMonth, year: debitYear });
    fetchWorkingDaysCalendar(debitMember.id, { month: debitMonth, year: debitYear });
    fetchMemberContributionsWithDebit(debitMember.id);
    fetchDebitHistory(debitMember.id);
  };

  const handlePayDebit = async () => {
    if (!debitMember) return;
    setSubmitting(true);
    if (payDebitMode === 'single') {
      const ok = await payDebit(debitMember.id, {
        debitDate: payDebitForm.debitDate,
        amount: parseFloat(payDebitForm.amount),
        currency: payDebitForm.currency,
        paymentMethod: payDebitForm.paymentMethod,
        referenceNumber: payDebitForm.referenceNumber || undefined,
      });
      if (ok) {
        setPayDebitOpen(false);
        handleLoadDebitAnalysis();
      }
    } else {
      const ok = await bulkPayDebit(debitMember.id, {
        dates: bulkPayDates,
        amountPerDay: parseFloat(payDebitForm.amount),
        currency: payDebitForm.currency,
        paymentMethod: payDebitForm.paymentMethod,
        referenceNumber: payDebitForm.referenceNumber || undefined,
      });
      if (ok) {
        setPayDebitOpen(false);
        handleLoadDebitAnalysis();
      }
    }
    setSubmitting(false);
  };

  const handleToggleBulkDate = (date: string) => {
    setBulkPayDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const currencies = summary?.currencies || [];
  const totalContributions = summary?.summary?.totalContributions ?? 0;
  const uniqueMembers = summary?.summary?.uniqueMembers ?? 0;
  const uniqueDays = summary?.summary?.uniqueDays ?? 0;
  const currencyColors = ['primary', 'secondary', 'info', 'success', 'warning'] as const;

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  const dayStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'CONTRIBUTED': return 'success.main';
      case 'UNPAID':
      case 'MISSED': return 'error.main';
      case 'DEBIT': return 'error.main';
      case 'FUTURE': return 'text.disabled';
      case 'HOLIDAY': return 'text.disabled';
      default: return 'text.secondary';
    }
  };

  const dayStatusBg = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'CONTRIBUTED': return 'success.soft';
      case 'UNPAID':
      case 'MISSED': return 'error.soft';
      case 'DEBIT': return 'error.soft';
      case 'FUTURE': return 'action.disabledBackground';
      case 'HOLIDAY': return 'background.warm';
      default: return 'background.warm';
    }
  };

  return (
    <DashboardLayout title="Contributions" subtitle="Track payments & debits">
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {/* Overview row */}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
          <Paper sx={{ borderRadius: '20px', p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'text.secondary' }}>Total Contributions</Typography>
                <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 800 }}>{totalContributions}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.soft', width: 42, height: 42 }}><DollarSign size={20} /></Avatar>
            </Box>
          </Paper>
          <Paper sx={{ borderRadius: '20px', p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'text.secondary' }}>Members</Typography>
                <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 800 }}>{uniqueMembers}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.soft', width: 42, height: 42 }}><Users2 size={20} /></Avatar>
            </Box>
          </Paper>
          <Paper sx={{ borderRadius: '20px', p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'text.secondary' }}>Unique Days</Typography>
                <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 800 }}>{uniqueDays}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.soft', width: 42, height: 42 }}><CalendarDays size={20} /></Avatar>
            </Box>
          </Paper>
          <Paper sx={{ borderRadius: '20px', p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'text.secondary' }}>Currencies</Typography>
                <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 800 }}>{currencies.length}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.soft', width: 42, height: 42 }}><Wallet size={20} /></Avatar>
            </Box>
          </Paper>
        </Box>

        {/* Per-currency breakdown */}
        {currencies.length > 0 && (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: currencies.length === 1 ? '1fr' : 'repeat(2, 1fr)', lg: currencies.length >= 3 ? 'repeat(3, 1fr)' : currencies.length === 2 ? 'repeat(2, 1fr)' : '1fr' } }}>
            {currencies.map((cur, ci) => {
              const palette = currencyColors[ci % currencyColors.length];
              return (
                <Paper key={cur.currency} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                  {/* Currency header */}
                  <Box sx={{ px: 2.5, py: 2, bgcolor: `${palette}.soft`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: `${palette}.main`, width: 38, height: 38, fontSize: 14, fontWeight: 800, color: '#fff' }}>
                      {cur.currency}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                        {formatCurrency(cur.metrics.totalAmount, cur.currency)}
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                        {cur.metrics.totalContributions} contribution{cur.metrics.totalContributions !== 1 ? 's' : ''} · {cur.metrics.uniqueMembers} member{cur.metrics.uniqueMembers !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Metrics grid */}
                  <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'success.soft', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Accepted</Typography>
                      <Typography sx={{ mt: 0.25, fontSize: 18, fontWeight: 800, color: 'success.main' }}>{cur.metrics.acceptedContributions ?? 0}</Typography>
                    </Box>
                    <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'warning.soft', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Pending</Typography>
                      <Typography sx={{ mt: 0.25, fontSize: 18, fontWeight: 800, color: 'warning.main' }}>{cur.metrics.pendingContributions ?? 0}</Typography>
                    </Box>
                    <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'error.soft', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Debit</Typography>
                      <Typography sx={{ mt: 0.25, fontSize: 18, fontWeight: 800, color: 'error.main' }}>{formatCurrency(cur.metrics.totalDebitAmount, cur.currency)}</Typography>
                    </Box>
                    <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: 'background.warm', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Avg/Contribution</Typography>
                      <Typography sx={{ mt: 0.25, fontSize: 18, fontWeight: 800 }}>{formatCurrency(cur.metrics.averageContribution, cur.currency)}</Typography>
                    </Box>
                  </Box>

                  {/* Top contributors */}
                  {cur.topContributors && cur.topContributors.length > 0 && (
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Divider sx={{ mb: 1.5 }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Trophy size={13} /> Top contributors
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 0.75 }}>
                        {cur.topContributors.map((tc: any, ti: number) => (
                          <Stack key={tc.memberId} direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1, borderRadius: '10px', bgcolor: 'background.warm' }}>
                            <Avatar sx={{ width: 30, height: 30, bgcolor: ti === 0 ? `${palette}.main` : 'action.selected', color: ti === 0 ? '#fff' : 'text.primary', fontSize: 12, fontWeight: 800 }}>
                              {ti === 0 ? <Award size={14} /> : `#${ti + 1}`}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700 }} noWrap>{tc.name}</Typography>
                              <Typography sx={{ fontSize: 11, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                <Phone size={10} /> {tc.phone} · {tc.contributionCount} contrib.
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 800, color: `${palette}.main`, flexShrink: 0 }}>
                              {formatCurrency(tc.totalAmount, cur.currency)}
                            </Typography>
                          </Stack>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Tabs */}
        <Paper sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              px: 3,
              pt: 1,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 14 },
            }}
          >
            <Tab icon={<DollarSign size={16} />} iconPosition="start" label="Contributions" />
            <Tab icon={<BarChart3 size={16} />} iconPosition="start" label="Debit Analysis" />
            <Tab icon={<RefreshCw size={16} />} iconPosition="start" label="Reset" />
          </Tabs>
          <Divider />

          {/* ═══════════ TAB 0: Contributions List ═══════════ */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Records</Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={18} />}
                  onClick={handleOpenCreate}
                  sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700 }}
                >
                  New Contribution
                </Button>
              </Box>

              <Stack direction="row" spacing={0.75} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 0.75 }}>
                {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'RESET'] as StatusFilter[]).map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    variant={statusFilter === s ? 'filled' : 'outlined'}
                    color={
                      s === 'ACCEPTED' ? 'success'
                        : s === 'PENDING' ? 'warning'
                          : s === 'REJECTED' ? 'error'
                            : s === 'RESET' ? 'info'
                              : 'primary'
                    }
                    onClick={() => {
                      setStatusFilter(s);
                      fetchContributions(s === 'ALL' ? { page: 1, limit: currentLimit } : { status: s, page: 1, limit: currentLimit });
                    }}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                ))}
              </Stack>

              <Box sx={{ display: 'grid', gap: 1.5 }}>
                {isLoading && safeContributions.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: '18px' }} />
                    ))
                  : safeContributions.length === 0 ? (
                      <Box sx={{ py: 8, textAlign: 'center' }}>
                        <DollarSign size={48} color="#d4d4d4" />
                        <Typography sx={{ mt: 2, fontSize: 18, fontWeight: 700, color: 'text.secondary' }}>
                          {statusFilter !== 'ALL' ? 'No matching contributions' : 'No contributions yet'}
                        </Typography>
                        <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
                          {statusFilter !== 'ALL' ? 'Try a different filter.' : 'Record a new contribution to get started.'}
                        </Typography>
                      </Box>
                    )
                  : safeContributions.map((contribution: any) => {
                      const memberName = contribution.memberNames || memberMap[contribution.memberId] || 'Unknown Member';
                      return (
                        <Paper
                          key={contribution.id}
                          sx={{
                            p: 2.5,
                            borderRadius: '18px',
                            bgcolor: 'background.warm',
                            boxShadow: 'none',
                            transition: 'transform 0.12s',
                            '&:hover': { transform: 'translateY(-1px)', boxShadow: 1 },
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 800, fontSize: 14 }}>
                              {getInitials(memberName)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{memberName}</Typography>
                              <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                <Typography sx={{ fontSize: 13, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Calendar size={13} /> {formatDate(contribution.contributionDate)}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CreditCard size={13} /> {formatPaymentMethod(contribution.paymentMethod || 'OTHER')}
                                </Typography>
                                {contribution.referenceNumber && (
                                  <Typography sx={{ fontSize: 13, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Hash size={13} /> {contribution.referenceNumber}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                                  {formatCurrency(contribution.amount, contribution.currency)}
                                </Typography>
                                {contribution.debitAmount > 0 && (
                                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'error.main' }}>
                                    Debit: {formatCurrency(contribution.debitAmount, contribution.currency)}
                                  </Typography>
                                )}
                              </Box>
                              <Chip
                                label={contribution.status}
                                size="small"
                                color={
                                  contribution.status === 'ACCEPTED' ? 'success'
                                    : contribution.status === 'PENDING' ? 'warning'
                                      : contribution.status === 'RESET' ? 'info'
                                        : 'error'
                                }
                                sx={{ fontWeight: 700 }}
                              />
                              {contribution.status === 'PENDING' && (
                                <Stack direction="row" spacing={0.75}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() => void approveContribution(contribution.id)}
                                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, minWidth: 80 }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => void rejectContribution(contribution.id)}
                                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, minWidth: 80 }}
                                  >
                                    Reject
                                  </Button>
                                </Stack>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
              </Box>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, p) => {
                      setPage(p);
                      fetchContributions(statusFilter === 'ALL' ? { page: p, limit: currentLimit } : { status: statusFilter, page: p, limit: currentLimit });
                    }}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}

          {/* ═══════════ TAB 1: Debit Analysis ═══════════ */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              {/* Org Debit Summary */}
              {orgDebitStats && (
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, mb: 3 }}>
                  <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: 'error.soft', boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary' }}>
                      Total Debit
                    </Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 22, fontWeight: 800, color: 'error.main' }}>
                      {formatCurrency(orgDebitStats.totalDebitAmount, orgDebitStats.currency)}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: 'warning.soft', boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary' }}>
                      Members with Debit
                    </Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 22, fontWeight: 800, color: 'warning.main' }}>
                      {orgDebitStats.membersWithDebit} / {orgDebitStats.totalMembers}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: 'primary.soft', boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary' }}>
                      Total Paid
                    </Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 22, fontWeight: 800, color: 'primary.main' }}>
                      {formatCurrency(orgDebitStats.totalPaidAmount, orgDebitStats.currency)}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'text.secondary' }}>
                      Avg Debit / Member
                    </Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 22, fontWeight: 800 }}>
                      {formatCurrency(orgDebitStats.averageDebitPerMember, orgDebitStats.currency)}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Month/Year selector */}
              <Paper sx={{ p: 2.5, borderRadius: '18px', bgcolor: 'background.warm', boxShadow: 'none', mb: 3 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1.5 }}>Analysis Period</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <TextField
                    label="Month"
                    select
                    value={debitMonth}
                    onChange={(e) => setDebitMonth(Number(e.target.value))}
                    size="small"
                    sx={{ minWidth: 140 }}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Year"
                    type="number"
                    value={debitYear}
                    onChange={(e) => setDebitYear(Number(e.target.value))}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </Box>
              </Paper>

              {/* Member Debit Lookup */}
              <Paper sx={{ p: 3, borderRadius: '18px', mb: 3 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDown size={18} /> Member Debit Analysis
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <Autocomplete
                    options={debitMemberOptions}
                    getOptionLabel={(option: MemberDTO) => option.names}
                    value={debitMember}
                    onChange={(_, value) => setDebitMember(value)}
                    inputValue={debitMemberSearch}
                    onInputChange={(_, value) => setDebitMemberSearch(value)}
                    filterOptions={(x) => x}
                    noOptionsText={debitMemberSearch.length < 2 ? 'Type to search...' : 'No members found'}
                    sx={{ minWidth: 320 }}
                    renderOption={(props, option: MemberDTO) => (
                      <li {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700, fontSize: 12 }}>
                            {getInitials(option.names)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{option.names}</Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{option.phone}</Typography>
                          </Box>
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Member"
                        size="small"
                        placeholder="Search member..."
                        slotProps={{
                          ...params.slotProps,
                          input: {
                            ...params.slotProps.input,
                            startAdornment: (
                              <>
                                <InputAdornment position="start"><Search size={16} /></InputAdornment>
                                {params.slotProps.input.startAdornment}
                              </>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                  <Button
                    variant="contained"
                    onClick={handleLoadDebitAnalysis}
                    disabled={!debitMember || isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} /> : <BarChart3 size={16} />}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                  >
                    Analyze
                  </Button>
                </Box>

                {/* Debit Analysis Results */}
                {debitAnalysis && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2.5 }} />
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                      <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'success.soft', boxShadow: 'none', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Paid Days</Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 28, fontWeight: 800, color: 'success.main' }}>{debitAnalysis.paidDays}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>of {debitAnalysis.totalWorkingDays} working days</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'warning.soft', boxShadow: 'none', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Unpaid Days</Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 28, fontWeight: 800, color: 'warning.main' }}>{debitAnalysis.unpaidDays}</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'error.soft', boxShadow: 'none', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Debit Amount</Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 28, fontWeight: 800, color: 'error.main' }}>
                          {formatCurrency(debitAnalysis.debitAmount, debitAnalysis.currency)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{debitAnalysis.debitDays} debit days</Typography>
                      </Paper>
                    </Box>

                    {/* Contribution rate bar */}
                    <Paper sx={{ mt: 2, p: 2.5, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Contribution Rate</Typography>
                        <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{Math.round(debitAnalysis.contributionRate)}%</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(debitAnalysis.contributionRate, 100)}
                        color={debitAnalysis.contributionRate >= 80 ? 'success' : debitAnalysis.contributionRate >= 50 ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography sx={{ mt: 1, fontSize: 12, color: 'text.secondary' }}>
                        Daily rate: {formatCurrency(debitAnalysis.dailyRate, debitAnalysis.currency)}
                      </Typography>
                    </Paper>

                    {/* Pay Debit Buttons */}
                    {debitAnalysis.debitAmount > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                        <Button
                          variant="contained"
                          startIcon={<Wallet size={16} />}
                          onClick={() => {
                            setPayDebitMode('single');
                            setPayDebitForm({
                              debitDate: '',
                              amount: String(debitAnalysis.dailyRate || ''),
                              currency: debitAnalysis.currency || 'RWF',
                              paymentMethod: 'MOBILE_MONEY',
                              referenceNumber: '',
                            });
                            setBulkPayDates([]);
                            setPayDebitOpen(true);
                          }}
                          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                        >
                          Pay Debit
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CalendarDays size={16} />}
                          onClick={() => {
                            setPayDebitMode('bulk');
                            setPayDebitForm({
                              debitDate: '',
                              amount: String(debitAnalysis.dailyRate || ''),
                              currency: debitAnalysis.currency || 'RWF',
                              paymentMethod: 'MOBILE_MONEY',
                              referenceNumber: '',
                            });
                            setBulkPayDates([]);
                            setPayDebitOpen(true);
                          }}
                          sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                        >
                          Bulk Pay Debit
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Working Days Calendar — month grid */}
                {debitAnalysis?.dailyWorkingDayDetails && debitAnalysis.dailyWorkingDayDetails.length > 0 && (() => {
                  const allDays = debitAnalysis.dailyWorkingDayDetails!;
                  const DOW_LABEL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  const getWeekdayIndex = (isoDate: string) => {
                    const [year, month, day] = isoDate.split('-').map(Number);
                    const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
                    return (utcDay + 6) % 7; // Convert Sun=0..Sat=6 to Mon=0..Sun=6
                  };
                  const getDayOfMonth = (isoDate: string) => Number(isoDate.split('-')[2]);
                  const firstDow = getWeekdayIndex(allDays[0].date);
                  const slots: (typeof allDays[0] | null)[] = [
                    ...Array(firstDow).fill(null),
                    ...allDays,
                  ];
                  const weeks: (typeof allDays[0] | null)[][] = [];
                  for (let i = 0; i < slots.length; i += 7) {
                    weeks.push(slots.slice(i, i + 7));
                  }
                  return (
                    <Box sx={{ mt: 3 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarDays size={16} /> Monthly Calendar
                      </Typography>

                      {/* Legend */}
                      <Stack direction="row" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1.5 }}>
                        {[
                          { label: 'Contributed', bg: 'success.soft' },
                          { label: 'Missed', bg: 'error.soft' },
                          { label: 'Future', bg: 'action.disabledBackground' },
                          { label: 'Holiday', bg: 'background.warm' },
                        ].map((l) => (
                          <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 11, height: 11, borderRadius: '3px', bgcolor: l.bg, border: '1px solid', borderColor: 'divider' }} />
                            <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>{l.label}</Typography>
                          </Box>
                        ))}
                      </Stack>

                      {/* Day-of-week headers */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                        {DOW_LABEL.map((h) => (
                          <Typography key={h} sx={{ fontSize: 10, fontWeight: 800, textAlign: 'center', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {h}
                          </Typography>
                        ))}
                      </Box>

                      {/* Calendar weeks */}
                      {weeks.map((week, wi) => (
                        <Box key={wi} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                          {Array.from({ length: 7 }).map((_, di) => {
                            const day = week[di] ?? null;
                            if (!day) return <Box key={di} />;
                            const weekdayLabel = DOW_LABEL[getWeekdayIndex(day.date)];
                            const isMissed = day.status === 'MISSED';
                            const isClickable = payDebitOpen && payDebitMode === 'bulk' && isMissed;
                            const isSelected = bulkPayDates.includes(day.date);
                            const amount = day.contributionAmount ?? day.debitAmount;
                            return (
                              <Tooltip
                                key={day.date}
                                arrow
                                title={
                                  day.status === 'HOLIDAY'
                                    ? `${weekdayLabel}, ${formatDate(day.date, 'MMM dd')} — Holiday`
                                    : day.status === 'FUTURE'
                                    ? `${weekdayLabel}, ${formatDate(day.date, 'MMM dd')} — Future`
                                    : `${weekdayLabel}, ${formatDate(day.date, 'MMM dd')} — ${day.status}${amount ? ` · ${formatCurrency(amount, day.currency ?? debitAnalysis?.currency)}` : ''}`
                                }
                              >
                                <Paper
                                  onClick={() => isClickable && handleToggleBulkDate(day.date)}
                                  sx={{
                                    borderRadius: '8px',
                                    p: 0.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 56,
                                    bgcolor: dayStatusBg(day.status),
                                    boxShadow: 'none',
                                    cursor: isClickable ? 'pointer' : 'default',
                                    border: '1.5px solid',
                                    borderColor: isSelected ? 'primary.main' : 'transparent',
                                    transition: 'box-shadow 0.1s',
                                    '&:hover': isClickable ? { boxShadow: 2 } : {},
                                  }}
                                >
                                  <Typography sx={{ fontSize: 8, fontWeight: 700, color: 'text.secondary', lineHeight: 1, textTransform: 'uppercase' }}>
                                    {weekdayLabel}
                                  </Typography>
                                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: dayStatusColor(day.status), lineHeight: 1.2 }}>
                                    {getDayOfMonth(day.date)}
                                  </Typography>
                                  {day.status === 'CONTRIBUTED' && day.contributionAmount != null && (
                                    <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'success.main', mt: 0.25, textAlign: 'center', lineHeight: 1.1 }} noWrap>
                                      +{formatCurrency(day.contributionAmount, day.currency ?? debitAnalysis?.currency)}
                                    </Typography>
                                  )}
                                  {day.status === 'MISSED' && day.debitAmount != null && (
                                    <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'error.main', mt: 0.25, textAlign: 'center', lineHeight: 1.1 }} noWrap>
                                      -{formatCurrency(day.debitAmount, day.currency ?? debitAnalysis?.currency)}
                                    </Typography>
                                  )}
                                  {day.status === 'HOLIDAY' && (
                                    <Typography sx={{ fontSize: 9, color: 'text.disabled', mt: 0.25 }}>off</Typography>
                                  )}
                                </Paper>
                              </Tooltip>
                            );
                          })}
                        </Box>
                      ))}
                    </Box>
                  );
                })()}

                {/* Debit History */}
                {debitHistory.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1.5 }}>Debit Payment History</Typography>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                      {debitHistory.map((item: any) => (
                        <Paper key={item.id} sx={{ p: 2, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                                {formatCurrency(item.amount)} — {formatPaymentMethod(item.paymentMethod)}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                {formatDate(item.paymentDate)} {item.referenceNumber ? `· ${item.referenceNumber}` : ''}
                              </Typography>
                            </Box>
                            <Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }} />
                          </Stack>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* Top Defaulters */}
              {topDefaulters.length > 0 && (
                <Paper sx={{ p: 3, borderRadius: '18px' }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertTriangle size={18} /> Top Defaulters
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    {topDefaulters.map((defaulter: any, idx: number) => {
                      const paidPct = defaulter.expectedWorkingDays
                        ? Math.round((defaulter.actualContributedDays / defaulter.expectedWorkingDays) * 100)
                        : 0;
                      const isExpanded = expandedDefaulter === defaulter.memberId;
                      return (
                        <Paper
                          key={defaulter.memberId}
                          sx={{ borderRadius: '16px', bgcolor: 'background.warm', boxShadow: 'none', overflow: 'hidden' }}
                        >
                          {/* Main row */}
                          <Box
                            sx={{ p: 2.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            onClick={() => setExpandedDefaulter(isExpanded ? null : defaulter.memberId)}
                          >
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: idx < 3 ? 'error.main' : 'warning.main',
                                  color: '#fff',
                                  fontWeight: 800,
                                  fontSize: 15,
                                }}
                              >
                                #{idx + 1}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontSize: 15, fontWeight: 700 }} noWrap>
                                    {defaulter.memberNames}
                                  </Typography>
                                  <Chip
                                    label={defaulter.memberCurrency}
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
                                  />
                                </Stack>
                                <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, alignItems: 'center', color: 'text.secondary', fontSize: 12 }}>
                                  <Typography sx={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 0.4, color: 'text.secondary' }}>
                                    <Phone size={12} /> {defaulter.memberPhone}
                                  </Typography>
                                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                    {formatCurrency(defaulter.dailyContributionAmount, defaulter.memberCurrency)}/day
                                  </Typography>
                                </Stack>
                                <Box sx={{ mt: 1.25 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary' }}>
                                      {defaulter.actualContributedDays}/{defaulter.expectedWorkingDays} days contributed
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: paidPct > 50 ? 'success.main' : 'error.main' }}>
                                      {paidPct}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={paidPct}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: 'error.soft',
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 3,
                                        bgcolor: paidPct > 50 ? 'success.main' : paidPct > 20 ? 'warning.main' : 'error.main',
                                      },
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'error.main' }}>
                                  {formatCurrency(defaulter.debitAmount, defaulter.memberCurrency)}
                                </Typography>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>
                                  {defaulter.debitDays} debit days
                                </Typography>
                                <IconButton size="small" sx={{ mt: 0.5 }}>
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </IconButton>
                              </Box>
                            </Stack>
                          </Box>

                          {/* Expanded detail */}
                          <Collapse in={isExpanded}>
                            <Divider />
                            <Box sx={{ p: 2.5 }}>
                              {/* Amount breakdown */}
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2.5 }}>
                                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'success.soft', textAlign: 'center' }}>
                                  <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
                                    Paid
                                  </Typography>
                                  <Typography sx={{ mt: 0.5, fontSize: 16, fontWeight: 800, color: 'success.main' }}>
                                    {formatCurrency(defaulter.actualContributedAmount, defaulter.memberCurrency)}
                                  </Typography>
                                </Box>
                                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'error.soft', textAlign: 'center' }}>
                                  <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
                                    Debit
                                  </Typography>
                                  <Typography sx={{ mt: 0.5, fontSize: 16, fontWeight: 800, color: 'error.main' }}>
                                    {formatCurrency(defaulter.debitAmount, defaulter.memberCurrency)}
                                  </Typography>
                                </Box>
                                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'primary.soft', textAlign: 'center' }}>
                                  <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
                                    Expected
                                  </Typography>
                                  <Typography sx={{ mt: 0.5, fontSize: 16, fontWeight: 800, color: 'primary.main' }}>
                                    {formatCurrency(defaulter.expectedTotalAmount, defaulter.memberCurrency)}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Paid dates & Missing dates — two columns */}
                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>

                                {/* Paid Dates */}
                                <Box>
                                  <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'success.main', mb: 1.25, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CheckCircle2 size={13} />
                                    Paid Dates ({defaulter.contributions?.length ?? 0})
                                  </Typography>
                                  {defaulter.contributions && defaulter.contributions.length > 0 ? (
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 0.75,
                                        maxHeight: 220,
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': { width: 4 },
                                        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
                                      }}
                                    >
                                      {defaulter.contributions.map((c: any) => (
                                        <Box
                                          key={c.id}
                                          sx={{
                                            p: 0.75,
                                            px: 1.25,
                                            borderRadius: '10px',
                                            bgcolor: 'success.soft',
                                            border: '1px solid',
                                            borderColor: 'success.light',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 0.15,
                                          }}
                                        >
                                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'success.dark' }}>
                                            {formatDate(c.contributionDate || c.createdAt, 'MMM dd')}
                                          </Typography>
                                          {c.days > 1 && (
                                            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                                              {c.days} days
                                            </Typography>
                                          )}
                                          <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'success.main' }}>
                                            {formatCurrency(c.amount, c.currency)}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic' }}>No contributions recorded</Typography>
                                  )}
                                </Box>

                                {/* Missing Dates */}
                                <Box>
                                  <Typography sx={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'error.main', mb: 1.25, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <XCircle size={13} />
                                    Missing Dates ({defaulter.debitDayDetails?.length ?? 0})
                                  </Typography>
                                  {defaulter.debitDayDetails && defaulter.debitDayDetails.length > 0 ? (
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 0.75,
                                        maxHeight: 220,
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': { width: 4 },
                                        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
                                      }}
                                    >
                                      {defaulter.debitDayDetails.map((d: any) => (
                                        <Box
                                          key={d.debitDate}
                                          sx={{
                                            p: 0.75,
                                            px: 1.25,
                                            borderRadius: '10px',
                                            bgcolor: 'error.soft',
                                            border: '1px solid',
                                            borderColor: 'error.light',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 0.15,
                                          }}
                                        >
                                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'error.dark' }}>
                                            {formatDate(d.debitDate, 'MMM dd')}
                                          </Typography>
                                          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                                            {d.dayOfWeek.slice(0, 3)}
                                          </Typography>
                                          <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'error.main' }}>
                                            {formatCurrency(d.expectedAmount, d.expectedAmountCurrency)}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic' }}>No missing days</Typography>
                                  )}
                                </Box>

                              </Box>
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Box>
                </Paper>
              )}
            </Box>
          )}

          {/* ═══════════ TAB 2: Reset Contributions ═══════════ */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1 }}>
                Reset Accepted Contributions
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 3 }}>
                Reset contributions with ACCEPTED status back to RESET. This is typically used at the start of a new cycle.
              </Typography>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '18px',
                    bgcolor: 'error.soft',
                    boxShadow: 'none',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.12s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 1 },
                  }}
                  onClick={() => {
                    setResetMode('all');
                    setResetOpen(true);
                  }}
                >
                  <Avatar sx={{ mx: 'auto', width: 48, height: 48, bgcolor: 'error.main', mb: 2 }}>
                    <RefreshCw size={22} color="#fff" />
                  </Avatar>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Reset All</Typography>
                  <Typography sx={{ mt: 0.75, fontSize: 13, color: 'text.secondary' }}>
                    Reset all accepted contributions
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '18px',
                    bgcolor: 'warning.soft',
                    boxShadow: 'none',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.12s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 1 },
                  }}
                  onClick={() => {
                    setResetMode('season');
                    setResetSeasonId('');
                    setResetOpen(true);
                  }}
                >
                  <Avatar sx={{ mx: 'auto', width: 48, height: 48, bgcolor: 'warning.main', mb: 2 }}>
                    <CalendarDays size={22} color="#fff" />
                  </Avatar>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Reset by Season</Typography>
                  <Typography sx={{ mt: 0.75, fontSize: 13, color: 'text.secondary' }}>
                    Reset contributions for a specific season
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '18px',
                    bgcolor: 'primary.soft',
                    boxShadow: 'none',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.12s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 1 },
                  }}
                  onClick={() => {
                    setResetMode('member');
                    setResetMemberId(null);
                    setResetDate('');
                    setResetMemberSearch('');
                    setResetOpen(true);
                  }}
                >
                  <Avatar sx={{ mx: 'auto', width: 48, height: 48, bgcolor: 'primary.main', mb: 2 }}>
                    <Users2 size={22} color="#fff" />
                  </Avatar>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Reset by Member</Typography>
                  <Typography sx={{ mt: 0.75, fontSize: 13, color: 'text.secondary' }}>
                    Reset contributions for a specific member
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* ═══════════ Create Contribution Dialog ═══════════ */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 20 }}>New Contribution</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2.5, mt: 1 }}>
            <Autocomplete
              options={memberOptions}
              getOptionLabel={(option: MemberDTO) => option.names}
              value={selectedMember}
              onChange={(_, value) => handleSelectMember(value)}
              inputValue={memberSearchQuery}
              onInputChange={(_, value) => setMemberSearchQuery(value)}
              loading={searching}
              filterOptions={(x) => x}
              noOptionsText={memberSearchQuery.length < 2 ? 'Type to search members...' : 'No members found'}
              renderOption={(props, option: MemberDTO) => (
                <li {...props} key={option.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700, fontSize: 13 }}>
                      {getInitials(option.names)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{option.names}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{option.phone}</Typography>
                    </Box>
                    <Chip
                      label={`${formatCurrency(parseFloat(option.amount || '0'), option.currency)}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: 12 }}
                    />
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Member"
                  placeholder="Type member name or phone..."
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...params.slotProps.input,
                      startAdornment: (
                        <>
                          <InputAdornment position="start"><Search size={18} /></InputAdornment>
                          {params.slotProps.input.startAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />

            {selectedMember && (
              <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: 'primary.soft', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: 14 }}>
                    {getInitials(selectedMember.names)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{selectedMember.names}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{selectedMember.phone}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
                      Allowed Amount
                    </Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'primary.main' }}>
                      {formatCurrency(parseFloat(selectedMember.amount || '0'), selectedMember.currency)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            <Divider />

            <TextField
              label="Season"
              select
              value={contribForm.seasonId || activeSeasons[0]?.id || ''}
              onChange={(e) => setContribForm((prev) => ({ ...prev, seasonId: e.target.value }))}
            >
              {seasons.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {formatDate(s.startDate, 'MMM yyyy')} — {s.status}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
              <TextField
                label="Amount"
                type="number"
                value={contribForm.amount}
                onChange={(e) => setContribForm((prev) => ({ ...prev, amount: e.target.value }))}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><DollarSign size={18} /></InputAdornment>,
                  },
                }}
              />
              <TextField
                label="Currency"
                select
                value={contribForm.currency}
                onChange={(e) => setContribForm((prev) => ({ ...prev, currency: e.target.value }))}
              >
                {Object.values(CURRENCIES).map((c) => (
                  <MenuItem key={c.code} value={c.code}>{c.code}</MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Days"
              type="number"
              value={contribForm.days}
              onChange={(e) => {
                const newDays = parseInt(e.target.value, 10) || 1;
                const dailyRate = selectedMember ? (parseFloat(selectedMember.amount) || 0) : 0;
                setContribForm((prev) => ({
                  ...prev,
                  days: e.target.value,
                  amount: dailyRate ? String(dailyRate * newDays) : prev.amount,
                }));
              }}
              slotProps={{
                input: {
                  inputProps: { min: 1 },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitContribution}
            disabled={!selectedMember || !contribForm.amount || submitting}
            startIcon={submitting ? <CircularProgress size={18} /> : <Plus size={18} />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3 }}
          >
            {submitting ? 'Creating...' : 'Create Contribution'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════ Reset Confirmation Dialog ═══════════ */}
      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 20 }}>
          {resetMode === 'all' && 'Reset All Contributions'}
          {resetMode === 'season' && 'Reset Season Contributions'}
          {resetMode === 'member' && 'Reset Member Contributions'}
        </DialogTitle>
        <DialogContent>
          {resetMode === 'all' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will reset <strong>all</strong> contributions with ACCEPTED status to RESET. This action cannot be undone easily.
            </Alert>
          )}

          {resetMode === 'season' && (
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <Alert severity="info">Select the season whose accepted contributions should be reset.</Alert>
              <TextField
                label="Select Season"
                select
                value={resetSeasonId}
                onChange={(e) => setResetSeasonId(e.target.value)}
                fullWidth
              >
                {(Array.isArray(seasons) ? seasons : []).map((s: any) => (
                  <MenuItem key={s.id} value={s.id}>
                    {formatDate(s.startDate, 'MMM yyyy')} — {formatDate(s.endDate, 'MMM yyyy')} ({s.status})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}

          {resetMode === 'member' && (
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <Alert severity="info">Select the member and optional reset date.</Alert>
              <Autocomplete
                options={resetMemberOptions}
                getOptionLabel={(option: MemberDTO) => option.names}
                value={resetMemberId}
                onChange={(_, value) => setResetMemberId(value)}
                inputValue={resetMemberSearch}
                onInputChange={(_, value) => setResetMemberSearch(value)}
                filterOptions={(x) => x}
                noOptionsText={resetMemberSearch.length < 2 ? 'Type to search...' : 'No members found'}
                renderOption={(props, option: MemberDTO) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700, fontSize: 12 }}>
                        {getInitials(option.names)}
                      </Avatar>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{option.names}</Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Member"
                    placeholder="Type member name..."
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...params.slotProps.input,
                        startAdornment: (
                          <>
                            <InputAdornment position="start"><Search size={16} /></InputAdornment>
                            {params.slotProps.input.startAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />
              <TextField
                label="Reset Date (optional)"
                type="date"
                value={resetDate}
                onChange={(e) => setResetDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setResetOpen(false)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReset}
            disabled={
              isLoading ||
              (resetMode === 'season' && !resetSeasonId) ||
              (resetMode === 'member' && !resetMemberId)
            }
            startIcon={isLoading ? <CircularProgress size={18} /> : <RefreshCw size={18} />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3 }}
          >
            {isLoading ? 'Resetting...' : 'Confirm Reset'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════ Pay Debit Dialog ═══════════ */}
      <Dialog
        open={payDebitOpen}
        onClose={() => setPayDebitOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 20 }}>
          {payDebitMode === 'single' ? 'Pay Debit' : 'Bulk Pay Debit'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2.5, mt: 1 }}>
            {debitMember && (
              <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: 'error.soft', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'error.main', color: 'white', fontWeight: 700, fontSize: 14 }}>
                    {getInitials(debitMember.names)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{debitMember.names}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      Debit: {debitAnalysis ? formatCurrency(debitAnalysis.debitAmount, debitAnalysis.currency) : '—'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {payDebitMode === 'single' && (
              <TextField
                label="Debit Date"
                type="date"
                value={payDebitForm.debitDate}
                onChange={(e) => setPayDebitForm((prev) => ({ ...prev, debitDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}

            {payDebitMode === 'bulk' && (
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>
                  Selected dates: {bulkPayDates.length}
                </Typography>
                {bulkPayDates.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {bulkPayDates.map((d) => (
                      <Chip
                        key={d}
                        label={formatDate(d, 'MMM dd')}
                        size="small"
                        onDelete={() => handleToggleBulkDate(d)}
                        color="error"
                        sx={{ fontWeight: 700 }}
                      />
                    ))}
                  </Stack>
                )}
                <Typography sx={{ mt: 1, fontSize: 12, color: 'text.secondary' }}>
                  Click on DEBIT days in the calendar above to select dates, or add manually:
                </Typography>
                <TextField
                  label="Add Date"
                  type="date"
                  size="small"
                  sx={{ mt: 1 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleToggleBulkDate(e.target.value);
                    }
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
              <TextField
                label={payDebitMode === 'bulk' ? 'Amount Per Day' : 'Amount'}
                type="number"
                value={payDebitForm.amount}
                onChange={(e) => setPayDebitForm((prev) => ({ ...prev, amount: e.target.value }))}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><DollarSign size={18} /></InputAdornment>,
                  },
                }}
              />
              <TextField
                label="Currency"
                select
                value={payDebitForm.currency}
                onChange={(e) => setPayDebitForm((prev) => ({ ...prev, currency: e.target.value }))}
              >
                {Object.values(CURRENCIES).map((c) => (
                  <MenuItem key={c.code} value={c.code}>{c.code}</MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Payment Method"
              select
              value={payDebitForm.paymentMethod}
              onChange={(e) => setPayDebitForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
            >
              {Object.entries(PAYMENT_METHOD).map(([key, value]) => (
                <MenuItem key={value} value={value}>{formatPaymentMethod(value)}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Reference (optional)"
              value={payDebitForm.referenceNumber}
              onChange={(e) => setPayDebitForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
              placeholder="e.g. TXN-12345"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setPayDebitOpen(false)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handlePayDebit}
            disabled={
              submitting ||
              !payDebitForm.amount ||
              (payDebitMode === 'single' && !payDebitForm.debitDate) ||
              (payDebitMode === 'bulk' && bulkPayDates.length === 0)
            }
            startIcon={submitting ? <CircularProgress size={18} /> : <Wallet size={18} />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3 }}
          >
            {submitting ? 'Paying...' : payDebitMode === 'bulk' ? `Pay ${bulkPayDates.length} Days` : 'Pay Debit'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
