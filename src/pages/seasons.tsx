import React from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowRight,
  Ban,
  CalendarDays,
  Clock,
  CreditCard,
  Crown,
  Edit3,
  Eye,
  Hash,
  History,
  Phone,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SeasonForm } from '@/components/seasons/SeasonForm';
import { useSeasons, useMembers, usePayments } from '@/hooks';
import { MemberDTO, MemberRankingDTO, MemberPayoutDTO, PaymentProcessRequestDTO } from '@/types/api';
import { formatCurrency, formatDate } from '@/utils/format';

export default function SeasonsPage() {
  const {
    seasons,
    seasonMembers,
    fetchSeasons,
    fetchSeasonMembers,
    addMembersToSeason,
    removeMemberFromSeason,
    recalculateRankings,
    endSeason,
    isLoading: seasonsLoading,
    error: seasonsError,
  } = useSeasons();
  const { searchMembers } = useMembers();
  const {
    nextMember,
    payoutHistory,
    seasonStatus,
    payoutDetail,
    processPayment,
    schedulePayouts,
    fetchNextMember,
    fetchPaymentHistory,
    fetchSeasonStatus,
    fetchPayoutDetails,
    cancelPayout,
    updatePayout,
    isLoading: paymentsLoading,
  } = usePayments();

  const isLoading = seasonsLoading || paymentsLoading;

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState(0);

  // Add member state
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<MemberDTO[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [membersToAdd, setMembersToAdd] = React.useState<MemberDTO[]>([]);
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Process payment state
  const [paymentTarget, setPaymentTarget] = React.useState<MemberRankingDTO | null>(null);
  const [paymentForm, setPaymentForm] = React.useState<PaymentProcessRequestDTO>({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    processedBy: 'System Admin',
    comments: '',
  });

  // Payout detail dialog
  const [detailPayout, setDetailPayout] = React.useState<MemberPayoutDTO | null>(null);

  // Update payout dialog
  const [editPayout, setEditPayout] = React.useState<MemberPayoutDTO | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<PaymentProcessRequestDTO>>({});

  React.useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  React.useEffect(() => {
    if (selectedSeasonId) {
      fetchSeasonMembers(selectedSeasonId);
      fetchNextMember(selectedSeasonId);
      fetchSeasonStatus(selectedSeasonId);
      fetchPaymentHistory(selectedSeasonId);
    }
  }, [selectedSeasonId, fetchSeasonMembers, fetchNextMember, fetchSeasonStatus, fetchPaymentHistory]);

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId) || seasons[0] || null;

  React.useEffect(() => {
    if (!selectedSeasonId && seasons.length > 0) {
      setSelectedSeasonId(seasons[0].id);
    }
  }, [selectedSeasonId, seasons]);

  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleSearchInput = React.useCallback(
    (_: React.SyntheticEvent, value: string) => {
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
    },
    [searchMembers],
  );

  const availableMembers = React.useMemo(() => {
    const existingIds = new Set(seasonMembers.map((m) => m.memberId));
    const queuedIds = new Set(membersToAdd.map((m) => m.id));
    return searchResults.filter((m) => !existingIds.has(m.id) && !queuedIds.has(m.id));
  }, [searchResults, seasonMembers, membersToAdd]);

  const handleAddMembersToSeason = async () => {
    if (!selectedSeasonId || membersToAdd.length === 0) return;
    const success = await addMembersToSeason(selectedSeasonId, membersToAdd.map((m) => m.id));
    if (success) {
      setMembersToAdd([]);
      setIsAddMemberOpen(false);
      fetchSeasonMembers(selectedSeasonId);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedSeasonId) return;
    const success = await removeMemberFromSeason(selectedSeasonId, memberId);
    if (success) fetchSeasonMembers(selectedSeasonId);
  };

  const handleRecalculate = async () => {
    if (!selectedSeasonId) return;
    await recalculateRankings(selectedSeasonId);
    fetchSeasonMembers(selectedSeasonId);
  };

  const handleProcessPayment = async () => {
    if (!selectedSeasonId || !paymentTarget) return;
    const result = await processPayment(selectedSeasonId, paymentForm);
    if (result) {
      setPaymentTarget(null);
      setPaymentForm({
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        processedBy: 'System Admin',
        comments: '',
      });
      fetchSeasonMembers(selectedSeasonId);
      fetchPaymentHistory(selectedSeasonId);
      fetchNextMember(selectedSeasonId);
      fetchSeasonStatus(selectedSeasonId);
    }
  };

  const handleSchedulePayouts = async () => {
    if (!selectedSeasonId) return;
    const success = await schedulePayouts(selectedSeasonId);
    if (success) {
      fetchPaymentHistory(selectedSeasonId);
      fetchSeasonStatus(selectedSeasonId);
    }
  };

  const handleViewPayoutDetails = async (payout: MemberPayoutDTO) => {
    const detail = await fetchPayoutDetails(payout.id);
    if (detail) setDetailPayout(detail);
    else setDetailPayout(payout);
  };

  const handleCancelPayout = async (payoutId: string) => {
    const success = await cancelPayout(payoutId);
    if (success && selectedSeasonId) {
      setDetailPayout(null);
      fetchPaymentHistory(selectedSeasonId);
      fetchSeasonStatus(selectedSeasonId);
      fetchNextMember(selectedSeasonId);
    }
  };

  const handleOpenEditPayout = (payout: MemberPayoutDTO) => {
    setEditPayout(payout);
    setEditForm({
      paymentDate: payout.expectedPayoutDate || new Date().toISOString().split('T')[0],
      paymentMethod: '',
      processedBy: '',
      comments: '',
    });
  };

  const handleUpdatePayout = async () => {
    if (!editPayout) return;
    const result = await updatePayout(editPayout.id, editForm);
    if (result && selectedSeasonId) {
      setEditPayout(null);
      fetchPaymentHistory(selectedSeasonId);
    }
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const totalMembers = seasonMembers.length;
  const paidCount = seasonMembers.filter((m) => m.paymentStatus === 'PAID').length;
  const pendingCount = totalMembers - paidCount;
  const topThreeCount = seasonMembers.filter((m) => m.isTopThree || m.topThree).length;
  const completionPct = totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0;

  const payoutStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'SCHEDULED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const refreshAll = () => {
    if (!selectedSeasonId) return;
    fetchSeasonMembers(selectedSeasonId);
    fetchNextMember(selectedSeasonId);
    fetchSeasonStatus(selectedSeasonId);
    fetchPaymentHistory(selectedSeasonId);
  };

  return (
    <DashboardLayout title="Seasons" subtitle="Manage cycles, members, and payouts">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>
          Create season
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {seasonsError && <Alert severity="error">{seasonsError}</Alert>}

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', xl: '320px minmax(0,1fr)' } }}>
          {/* ── Season sidebar ── */}
          <Paper sx={{ borderRadius: '24px', p: 3, alignSelf: 'start', position: { xl: 'sticky' }, top: { xl: 108 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Seasons</Typography>
            <Typography sx={{ mt: 0.75, fontSize: 13, color: 'text.secondary' }}>
              Active, scheduled, and completed cycles.
            </Typography>

            <Box sx={{ mt: 2, display: 'grid', gap: 1.25 }}>
              {seasons.map((season) => {
                const isActive = selectedSeason?.id === season.id;
                return (
                  <Paper
                    key={season.id}
                    onClick={() => setSelectedSeasonId(season.id)}
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      bgcolor: isActive ? 'background.soft' : 'background.warm',
                      cursor: 'pointer',
                      boxShadow: 'none',
                      border: isActive ? '1.5px solid' : '1.5px solid transparent',
                      borderColor: isActive ? 'primary.main' : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                  >
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                          {formatDate(season.startDate, 'MMM yyyy')}
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
                          {formatDate(season.startDate, 'dd MMM')} — {formatDate(season.endDate, 'dd MMM yyyy')}
                        </Typography>
                      </Box>
                      <Chip
                        label={season.status}
                        size="small"
                        color={season.status === 'ACTIVE' ? 'success' : season.status === 'SCHEDULED' ? 'primary' : 'default'}
                        sx={{ fontSize: 10, height: 22 }}
                      />
                    </Stack>
                  </Paper>
                );
              })}
              {seasons.length === 0 && (
                <Typography sx={{ p: 2, fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
                  No seasons yet. Create one to get started.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* ── Main content ── */}
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            {/* Season overview + Next member spotlight */}
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 320px' } }}>
              {/* Season header */}
              <Paper sx={{ borderRadius: '24px', p: 3.5 }}>
                <Chip
                  icon={<CalendarDays size={15} />}
                  label={selectedSeason ? selectedSeason.status : 'No season'}
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="h4" sx={{ mt: 2 }}>
                  {selectedSeason ? formatDate(selectedSeason.startDate, 'MMMM yyyy') : 'Season overview'}
                </Typography>
                <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
                  {selectedSeason
                    ? `${formatDate(selectedSeason.startDate)} to ${formatDate(selectedSeason.endDate)}`
                    : 'Create a season to begin organizing members into a payout cycle.'}
                </Typography>

                {/* Stats row */}
                {selectedSeason && (
                  <Box sx={{ mt: 2.5, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                    {[
                      { label: 'Members', value: totalMembers, color: 'text.primary', bg: 'background.warm' },
                      { label: 'Paid', value: paidCount, color: 'success.main', bg: 'success.soft' },
                      { label: 'Pending', value: pendingCount, color: 'text.primary', bg: 'background.warm' },
                      { label: 'Top 3', value: topThreeCount, color: 'warning.main', bg: 'warning.soft' },
                    ].map((s) => (
                      <Paper key={s.label} sx={{ p: 1.5, borderRadius: '12px', bgcolor: s.bg, boxShadow: 'none', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{s.label}</Typography>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Progress */}
                {selectedSeason && totalMembers > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Payout progress</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{paidCount}/{totalMembers} ({completionPct}%)</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={completionPct} sx={{ height: 7, borderRadius: 4, bgcolor: 'action.hover' }} />
                  </Box>
                )}

                {/* Actions */}
                {selectedSeason && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedSeason.status === 'ACTIVE' && (
                      <>
                        <Button variant="contained" size="small" startIcon={<UserPlus size={14} />} onClick={() => setIsAddMemberOpen(true)}>
                          Add members
                        </Button>
                        <Button variant="outlined" size="small" startIcon={<RefreshCw size={14} />} onClick={handleRecalculate} disabled={isLoading}>
                          Recalculate
                        </Button>
                        <Button variant="outlined" size="small" startIcon={<PlayCircle size={14} />} onClick={handleSchedulePayouts} disabled={isLoading}>
                          Schedule payouts
                        </Button>
                        <Button variant="contained" color="warning" size="small" onClick={async () => { await endSeason(selectedSeason.id); fetchSeasons(); }}>
                          End season
                        </Button>
                      </>
                    )}
                    <Button variant="text" size="small" startIcon={<RefreshCw size={14} />} onClick={refreshAll}>
                      Refresh
                    </Button>
                  </Box>
                )}
              </Paper>

              {/* Next member spotlight */}
              <Paper
                sx={{
                  borderRadius: '24px',
                  p: 3.5,
                  background: 'linear-gradient(150deg, #7c2d12 0%, #f97316 100%)',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <ArrowRight size={16} />
                    <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', opacity: 0.8 }}>
                      Next to receive
                    </Typography>
                  </Stack>
                  <Typography sx={{ mt: 2, fontSize: 26, fontWeight: 800 }}>
                    {nextMember?.memberNames || seasonStatus?.nextMemberName || 'Waiting...'}
                  </Typography>
                  {nextMember && (
                    <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                      <Typography sx={{ fontSize: 13, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Phone size={12} /> {nextMember.memberPhone}
                      </Typography>
                      <Typography sx={{ fontSize: 13, opacity: 0.85 }}>
                        Ranking #{nextMember.ranking}
                        {(nextMember.isTopThree || nextMember.topThree) && nextMember.topThreePriority
                          ? ` · Priority #${nextMember.topThreePriority}`
                          : ''}
                      </Typography>
                    </Stack>
                  )}
                </Box>
                <Box sx={{ mt: 2.5 }}>
                  {seasonStatus?.nextPayoutDate && (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', opacity: 0.85 }}>
                      <Clock size={13} />
                      <Typography sx={{ fontSize: 13 }}>
                        Expected {formatDate(seasonStatus.nextPayoutDate)}
                      </Typography>
                    </Stack>
                  )}
                  {selectedSeason?.status === 'ACTIVE' && nextMember && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CreditCard size={14} />}
                      onClick={() => setPaymentTarget(nextMember)}
                      sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                    >
                      Process payment now
                    </Button>
                  )}
                </Box>
              </Paper>
            </Box>

            {/* Tabs: Members / Payment History */}
            <Paper sx={{ borderRadius: '24px', overflow: 'hidden' }}>
              <Box sx={{ px: 3.5, pt: 2.5 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ minHeight: 40 }}>
                  <Tab label={`Members (${totalMembers})`} sx={{ minHeight: 40, textTransform: 'none', fontWeight: 700 }} />
                  <Tab label={`Payment History (${payoutHistory.length})`} sx={{ minHeight: 40, textTransform: 'none', fontWeight: 700 }} />
                </Tabs>
              </Box>
              <Divider />

              {/* ── Members Tab ── */}
              {activeTab === 0 && (
                <Box sx={{ p: 3.5 }}>
                  <Box sx={{ display: 'grid', gap: 1.25 }}>
                    {seasonMembers.map((member) => {
                      const isPaid = member.paymentStatus === 'PAID';
                      const isTop3 = member.isTopThree || member.topThree;
                      const isNext = nextMember?.memberId === member.memberId;

                      return (
                        <Paper
                          key={member.seasonMemberId}
                          sx={{
                            p: 2.5,
                            borderRadius: '16px',
                            bgcolor: isPaid ? 'success.soft' : isNext ? 'primary.soft' : 'background.warm',
                            boxShadow: 'none',
                            border: isTop3 ? '1px solid' : isNext ? '1.5px solid' : '1px solid transparent',
                            borderColor: isTop3 ? 'warning.light' : isNext ? 'primary.main' : 'transparent',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                fontSize: 15,
                                fontWeight: 800,
                                bgcolor: isTop3 ? 'warning.main' : isPaid ? 'success.main' : isNext ? 'primary.main' : 'action.selected',
                                color: isTop3 || isPaid || isNext ? '#fff' : 'text.primary',
                              }}
                            >
                              {member.ranking}
                            </Avatar>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{member.memberNames}</Typography>
                                {isTop3 && (
                                  <Chip
                                    icon={<Crown size={12} />}
                                    label={member.topThreePriority ? `Priority #${member.topThreePriority}` : 'Top 3'}
                                    size="small"
                                    color="warning"
                                    sx={{ height: 22, fontSize: 11 }}
                                  />
                                )}
                                {isNext && !isPaid && (
                                  <Chip label="Next" size="small" color="primary" sx={{ height: 22, fontSize: 11, fontWeight: 700 }} />
                                )}
                              </Stack>
                              <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Phone size={11} /> {member.memberPhone}
                                </Typography>
                                {member.memberStartDate && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarDays size={11} /> Joined {formatDate(member.memberStartDate)}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>

                            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
                              <Chip
                                label={isPaid ? 'PAID' : member.paymentStatus}
                                size="small"
                                color={isPaid ? 'success' : 'default'}
                                variant={isPaid ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 600, fontSize: 11 }}
                              />
                              {isPaid && member.amountPaid != null && (
                                <Chip label={formatCurrency(member.amountPaid)} size="small" color="success" variant="outlined" sx={{ fontWeight: 700, fontSize: 11 }} />
                              )}
                              {selectedSeason?.status === 'ACTIVE' && !isPaid && (
                                <Tooltip title="Process payment">
                                  <IconButton size="small" color="primary" onClick={() => setPaymentTarget(member)}>
                                    <CreditCard size={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {selectedSeason?.status === 'ACTIVE' && (
                                <Tooltip title="Remove from season">
                                  <IconButton size="small" color="error" onClick={() => handleRemoveMember(member.memberId)}>
                                    <UserMinus size={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </Box>

                          {isPaid && (member.paidAt || member.paymentReference) && (
                            <Stack direction="row" spacing={2} sx={{ mt: 1.5, pl: 7, flexWrap: 'wrap' }}>
                              {member.paidAt && (
                                <Typography variant="caption" color="text.secondary">Paid on {formatDate(member.paidAt)}</Typography>
                              )}
                              {member.paymentReference && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Hash size={10} /> {member.paymentReference}
                                </Typography>
                              )}
                            </Stack>
                          )}
                        </Paper>
                      );
                    })}
                  </Box>

                  {!isLoading && seasonMembers.length === 0 && (
                    <Paper sx={{ mt: 1, borderRadius: '18px', p: 4.5, bgcolor: 'background.warm', textAlign: 'center', boxShadow: 'none' }}>
                      <Typography sx={{ fontSize: 18, fontWeight: 800 }}>No members yet</Typography>
                      <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
                        Create a season and add members to start the payout cycle.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}

              {/* ── Payment History Tab ── */}
              {activeTab === 1 && (
                <Box sx={{ p: 3.5 }}>
                  {payoutHistory.length === 0 ? (
                    <Paper sx={{ borderRadius: '18px', p: 4.5, bgcolor: 'background.warm', textAlign: 'center', boxShadow: 'none' }}>
                      <History size={32} style={{ opacity: 0.3 }} />
                      <Typography sx={{ mt: 1.5, fontSize: 18, fontWeight: 800 }}>No payout history</Typography>
                      <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
                        Process payments or schedule payouts to see history here.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box sx={{ display: 'grid', gap: 1.25 }}>
                      {payoutHistory.map((payout) => (
                        <Paper
                          key={payout.id}
                          sx={{
                            p: 2.5,
                            borderRadius: '16px',
                            bgcolor: payout.status === 'PAID' ? 'success.soft' : payout.status === 'CANCELLED' ? 'error.soft' : 'background.warm',
                            boxShadow: 'none',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                fontSize: 13,
                                fontWeight: 800,
                                bgcolor: payout.status === 'PAID' ? 'success.main' : payout.status === 'CANCELLED' ? 'error.main' : 'info.main',
                                color: '#fff',
                              }}
                            >
                              W{payout.weekNumber}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{payout.memberNames}</Typography>
                              <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Week {payout.weekNumber} · {formatDate(payout.expectedPayoutDate)}
                                </Typography>
                                {payout.amount != null && (
                                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(payout.amount, payout.currency)}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
                              <Chip
                                label={payout.status}
                                size="small"
                                color={payoutStatusColor(payout.status) as any}
                                sx={{ fontWeight: 600, fontSize: 11 }}
                              />
                              <Tooltip title="View details">
                                <IconButton size="small" onClick={() => handleViewPayoutDetails(payout)}>
                                  <Eye size={15} />
                                </IconButton>
                              </Tooltip>
                              {(payout.status === 'SCHEDULED' || payout.status === 'PENDING') && (
                                <>
                                  <Tooltip title="Edit payout">
                                    <IconButton size="small" color="primary" onClick={() => handleOpenEditPayout(payout)}>
                                      <Edit3 size={15} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancel payout">
                                    <IconButton size="small" color="error" onClick={() => handleCancelPayout(payout.id)}>
                                      <Ban size={15} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Stack>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>

        {/* ── Create Season Dialog ── */}
        <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Create season</DialogTitle>
          <DialogContent>
            <SeasonForm onSuccess={() => { setIsCreateOpen(false); fetchSeasons(); }} onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* ── Add Members Dialog ── */}
        <Dialog
          open={isAddMemberOpen}
          onClose={() => { setIsAddMemberOpen(false); setMembersToAdd([]); setSearchResults([]); }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add members to season</DialogTitle>
          <DialogContent>
            <Autocomplete
              options={availableMembers}
              getOptionLabel={(option) => `${option.names} — ${option.phone}`}
              filterOptions={(x) => x}
              onInputChange={handleSearchInput}
              onChange={(_, value) => { if (value) setMembersToAdd((prev) => [...prev, value]); }}
              value={null}
              blurOnSelect
              sx={{ mt: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by name or phone..."
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
                      <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: 'primary.soft', color: 'primary.dark' }}>
                        {initials(option.names)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.names}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.phone}</Typography>
                      </Box>
                    </Stack>
                  </li>
                );
              }}
              noOptionsText={isSearching ? 'Searching...' : 'Type to search members'}
            />

            {membersToAdd.length > 0 && (
              <Box sx={{ mt: 2, display: 'grid', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Members to add ({membersToAdd.length})</Typography>
                {membersToAdd.map((m) => (
                  <Stack key={m.id} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '12px', bgcolor: 'background.warm' }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'primary.soft', color: 'primary.dark' }}>{initials(m.names)}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.names}</Typography>
                    </Stack>
                    <IconButton size="small" onClick={() => setMembersToAdd((prev) => prev.filter((x) => x.id !== m.id))}>
                      <Trash2 size={14} />
                    </IconButton>
                  </Stack>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => { setIsAddMemberOpen(false); setMembersToAdd([]); setSearchResults([]); }}>Cancel</Button>
            <Button variant="contained" disabled={membersToAdd.length === 0 || isLoading} onClick={handleAddMembersToSeason}>
              {isLoading ? 'Adding...' : `Add ${membersToAdd.length} member${membersToAdd.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Process Payment Dialog ── */}
        <Dialog open={!!paymentTarget} onClose={() => setPaymentTarget(null)} fullWidth maxWidth="xs">
          <DialogTitle>Process payment</DialogTitle>
          <DialogContent>
            {paymentTarget && (
              <Box sx={{ display: 'grid', gap: 2.5, pt: 1 }}>
                <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{paymentTarget.memberNames}</Typography>
                  <Typography variant="caption" color="text.secondary">Ranking #{paymentTarget.ranking} · {paymentTarget.memberPhone}</Typography>
                </Paper>
                <TextField
                  label="Payment date"
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Payment method</InputLabel>
                  <Select value={paymentForm.paymentMethod} label="Payment method" onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}>
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Processed by" value={paymentForm.processedBy} onChange={(e) => setPaymentForm((prev) => ({ ...prev, processedBy: e.target.value }))} fullWidth />
                <TextField label="Custom amount (optional)" type="number" value={paymentForm.customAmount ?? ''} onChange={(e) => setPaymentForm((prev) => ({ ...prev, customAmount: e.target.value ? Number(e.target.value) : undefined }))} fullWidth />
                <TextField label="Comments (optional)" value={paymentForm.comments} onChange={(e) => setPaymentForm((prev) => ({ ...prev, comments: e.target.value }))} multiline rows={2} fullWidth />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setPaymentTarget(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleProcessPayment} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Process payment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Payout Details Dialog ── */}
        <Dialog open={!!detailPayout} onClose={() => setDetailPayout(null)} fullWidth maxWidth="xs">
          <DialogTitle>Payout details</DialogTitle>
          <DialogContent>
            {detailPayout && (
              <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
                <Paper sx={{ p: 2.5, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{detailPayout.memberNames}</Typography>
                  <Chip label={detailPayout.status} size="small" color={payoutStatusColor(detailPayout.status) as any} sx={{ mt: 1 }} />
                </Paper>
                {[
                  { label: 'Week', value: `Week ${detailPayout.weekNumber}` },
                  { label: 'Expected date', value: formatDate(detailPayout.expectedPayoutDate) },
                  { label: 'Amount', value: detailPayout.amount != null ? formatCurrency(detailPayout.amount, detailPayout.currency) : 'N/A' },
                  { label: 'Currency', value: detailPayout.currency || 'N/A' },
                ].map((row) => (
                  <Stack key={row.label} direction="row" sx={{ justifyContent: 'space-between', px: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.value}</Typography>
                  </Stack>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            {detailPayout && (detailPayout.status === 'SCHEDULED' || detailPayout.status === 'PENDING') && (
              <>
                <Button color="error" startIcon={<Ban size={14} />} onClick={() => { handleCancelPayout(detailPayout.id); }}>
                  Cancel payout
                </Button>
                <Button variant="outlined" startIcon={<Edit3 size={14} />} onClick={() => { setDetailPayout(null); handleOpenEditPayout(detailPayout); }}>
                  Edit
                </Button>
              </>
            )}
            <Button onClick={() => setDetailPayout(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ── Update Payout Dialog ── */}
        <Dialog open={!!editPayout} onClose={() => setEditPayout(null)} fullWidth maxWidth="xs">
          <DialogTitle>Update payout</DialogTitle>
          <DialogContent>
            {editPayout && (
              <Box sx={{ display: 'grid', gap: 2.5, pt: 1 }}>
                <Paper sx={{ p: 2, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{editPayout.memberNames}</Typography>
                  <Typography variant="caption" color="text.secondary">Week {editPayout.weekNumber} · {editPayout.status}</Typography>
                </Paper>
                <TextField
                  label="Payment date"
                  type="date"
                  value={editForm.paymentDate || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Payment method</InputLabel>
                  <Select value={editForm.paymentMethod || ''} label="Payment method" onChange={(e) => setEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}>
                    <MenuItem value="">Not set</MenuItem>
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
                    <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Processed by" value={editForm.processedBy || ''} onChange={(e) => setEditForm((prev) => ({ ...prev, processedBy: e.target.value }))} fullWidth />
                <TextField label="Comments (optional)" value={editForm.comments || ''} onChange={(e) => setEditForm((prev) => ({ ...prev, comments: e.target.value }))} multiline rows={2} fullWidth />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEditPayout(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdatePayout} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
