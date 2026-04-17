import React from 'react';
import { useRouter } from 'next/router';
import { Avatar, Box, Button, Card, CardContent, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { AlertTriangle, ArrowRight, CalendarDays, CircleDollarSign, Clock, CreditCard, History, Layers3, Phone, Sparkles, TrendingDown, TrendingUp, Users2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/store/hooks';
import { useContributions, useOrganization, usePayments, useSeasons } from '@/hooks';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/format';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { seasons, fetchSeasons } = useSeasons();
  const { seasonStatus, nextMember, payoutHistory, fetchSeasonStatus, fetchNextMember, fetchPaymentHistory } = usePayments();
  const { statistics, getOrganizationStatistics } = useOrganization();
  const { topDefaulters, fetchTopDefaulters } = useContributions();

  React.useEffect(() => {
    fetchSeasons();
    getOrganizationStatistics({ topPerformersLimit: 5 });
    fetchTopDefaulters({ limit: 5 });
  }, [fetchSeasons, getOrganizationStatistics, fetchTopDefaulters]);

  const activeSeason = seasons.find((season) => season.status === 'ACTIVE');

  React.useEffect(() => {
    if (activeSeason) {
      fetchSeasonStatus(activeSeason.id);
      fetchNextMember(activeSeason.id);
      fetchPaymentHistory(activeSeason.id);
    }
  }, [activeSeason, fetchSeasonStatus, fetchNextMember, fetchPaymentHistory]);

  const currency = statistics?.primaryCurrency || 'RWF';
  const totalMembers = statistics?.totalMembers ?? 0;
  const activeMembers = statistics?.activeMembers ?? 0;
  const totalContributions = statistics?.totalContributionAmount ?? 0;
  const seasonProgress = statistics?.seasonProgress ?? 0;
  const complianceRate = statistics?.overallComplianceRate ?? 0;
  const collectionEfficiency = statistics?.collectionEfficiency ?? 0;
  const completedWeeks = statistics?.completedWeeks ?? 0;
  const seasonWeeks = statistics?.seasonWeeks ?? 0;
  const remainingWeeks = statistics?.remainingWeeks ?? 0;
  const activeSeasonCount = seasons.filter((s) => s.status === 'ACTIVE').length;
  const scheduledSeasonCount = seasons.filter((s) => s.status === 'SCHEDULED').length;

  const recentPayouts = payoutHistory.slice(0, 5);

  const statCards = [
    {
      label: 'Members in network',
      value: totalMembers.toString(),
      detail: `${activeMembers} active · ${statistics?.inactiveMembers ?? 0} inactive`,
      icon: Users2,
      tone: 'primary.main',
      bg: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(255,237,213,0.7))',
    },
    {
      label: 'Active seasons',
      value: activeSeasonCount.toString(),
      detail: `${scheduledSeasonCount} scheduled · Wk ${completedWeeks}/${seasonWeeks}`,
      icon: Layers3,
      tone: 'secondary.main',
      bg: 'linear-gradient(135deg, rgba(251,146,60,0.14), rgba(255,244,237,0.9))',
    },
    {
      label: 'Total contributions',
      value: formatCurrency(totalContributions, currency),
      detail: `${statistics?.totalContributions ?? 0} entries · Avg ${formatCurrency(statistics?.averageContributionPerMember ?? 0, currency)}/member`,
      icon: CircleDollarSign,
      tone: 'warning.main',
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.16), rgba(255,247,237,0.9))',
    },
    {
      label: 'Compliance rate',
      value: formatPercentage(complianceRate),
      detail: `Collection ${formatPercentage(collectionEfficiency)} · Retention ${formatPercentage(statistics?.memberRetentionRate ?? 0)}`,
      icon: TrendingUp,
      tone: 'text.primary',
      bg: 'linear-gradient(135deg, rgba(43,33,24,0.08), rgba(255,255,255,0.84))',
    },
  ];

  const payoutStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'SCHEDULED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <DashboardLayout title="Operations overview" subtitle="Dashboard">
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {/* ── Hero + Pulse sidebar ── */}
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', xl: 'minmax(0,1.35fr) 340px' } }}>
          <Paper
            sx={{
              borderRadius: '24px',
              p: { xs: 3.5, sm: 4.5 },
              color: 'white',
              background: 'linear-gradient(150deg, #2f1d11 0%, #9a3412 42%, #f97316 100%)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, gap: 3, justifyContent: 'space-between' }}>
              <Box sx={{ maxWidth: 760 }}>
                <Chip
                  icon={<Sparkles size={15} />}
                  label="Live circle overview"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.18)', bgcolor: 'rgba(255,255,255,0.1)' }}
                  variant="outlined"
                />
                <Typography variant="h3" sx={{ mt: 3 }}>
                  Welcome back, {user?.firstName || user?.username || 'User'}.
                </Typography>
                <Typography sx={{ mt: 2, maxWidth: 560, fontSize: 15, lineHeight: 1.9, color: 'rgba(255,255,255,0.78)' }}>
                  Track your ROSCA cycle, manage members, and monitor payouts from one central hub.
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gap: 1.5, minWidth: { xl: 190 }, alignContent: 'start' }}>
                <Button variant="contained" startIcon={<CalendarDays size={16} />} onClick={() => router.push('/seasons')}>
                  Create season
                </Button>
                <Button variant="outlined" startIcon={<CreditCard size={16} />} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.25)' }} onClick={() => router.push('/seasons')}>
                  Review payouts
                </Button>
                <Button variant="text" startIcon={<Users2 size={16} />} sx={{ color: 'white' }} onClick={() => router.push('/members')}>
                  Add member
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
              {[
                {
                  label: 'Season progress',
                  value: formatPercentage(seasonProgress),
                  detail: `${completedWeeks} of ${seasonWeeks} weeks · ${remainingWeeks} remaining`,
                  Icon: CalendarDays,
                },
                {
                  label: 'Next payout',
                  value: seasonStatus?.nextPayoutDate ? formatDate(seasonStatus.nextPayoutDate, 'MMM dd') : 'Pending',
                  detail: seasonStatus?.nextMemberName || 'No member queued yet',
                  Icon: ArrowRight,
                },
                {
                  label: 'Working days',
                  value: `${statistics?.totalActualWorkingDays ?? 0}/${statistics?.totalExpectedWorkingDays ?? 0}`,
                  detail: `${statistics?.totalWorkingDays ?? 0} days this month`,
                  Icon: TrendingUp,
                },
              ].map(({ label, value, detail, Icon }) => (
                <Paper key={label} sx={{ borderRadius: '18px', p: 3, bgcolor: 'rgba(255,255,255,0.10)', color: 'white' }}>
                  <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'rgba(255,255,255,0.65)' }}>
                    <Icon size={14} />
                    {label}
                  </Typography>
                  <Typography sx={{ mt: 1.5, fontSize: 28, fontWeight: 800 }}>{value}</Typography>
                  <Typography sx={{ mt: 1, fontSize: 14, color: 'rgba(255,255,255,0.72)' }}>{detail}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>

          {/* Season pulse sidebar */}
          <Paper sx={{ borderRadius: '24px', p: 3 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'text.secondary' }}>
                  Season pulse
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>Progress tracker</Typography>
              </Box>
              <Chip label={activeSeason ? 'Active' : 'Standby'} size="small" color="primary" variant="outlined" />
            </Stack>

            <Paper sx={{ mt: 2.5, p: 2.5, borderRadius: '16px', bgcolor: 'background.warm', boxShadow: 'none' }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Season progress</Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{formatPercentage(seasonProgress)}</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={Math.min(100, Math.max(0, seasonProgress))} sx={{ mt: 1.5, height: 7, borderRadius: 4 }} />
            </Paper>

            <Box sx={{ mt: 1.5, display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
              <Paper sx={{ p: 2.5, borderRadius: '16px', boxShadow: 'none', bgcolor: 'success.soft', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: 'success.main' }}>{seasonStatus?.membersPaid ?? 0}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Paid</Typography>
              </Paper>
              <Paper sx={{ p: 2.5, borderRadius: '16px', boxShadow: 'none', bgcolor: 'background.warm', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{seasonStatus?.membersRemaining ?? 0}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Remaining</Typography>
              </Paper>
            </Box>

            {/* Next member spotlight */}
            <Paper
              sx={{
                mt: 2,
                p: 2.5,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #7c2d12, #f97316)',
                color: 'white',
                boxShadow: 'none',
              }}
            >
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <ArrowRight size={13} />
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.8 }}>
                  Next to receive
                </Typography>
              </Stack>
              <Typography sx={{ mt: 1.5, fontSize: 18, fontWeight: 800 }}>
                {nextMember?.memberNames || seasonStatus?.nextMemberName || 'Waiting...'}
              </Typography>
              {nextMember && (
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 12, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Phone size={11} /> {nextMember.memberPhone}
                  </Typography>
                  <Typography sx={{ fontSize: 12, opacity: 0.85 }}>
                    Ranking #{nextMember.ranking}
                  </Typography>
                </Stack>
              )}
              {seasonStatus?.nextPayoutDate && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, alignItems: 'center', opacity: 0.8 }}>
                  <Clock size={12} />
                  <Typography sx={{ fontSize: 12 }}>
                    Expected {formatDate(seasonStatus.nextPayoutDate)}
                  </Typography>
                </Stack>
              )}
              <Button
                size="small"
                onClick={() => router.push('/seasons')}
                sx={{ mt: 1.5, color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
              >
                Go to seasons
              </Button>
            </Paper>
          </Paper>
        </Box>

        {/* ── Stat cards ── */}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' } }}>
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} sx={{ borderRadius: '20px', background: card.bg }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{card.label}</Typography>
                      <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 800 }}>{card.value}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.84)', color: card.tone }}>
                      <Icon size={18} />
                    </Box>
                  </Box>
                  <Typography sx={{ mt: 1.5, fontSize: 13, color: 'text.secondary' }}>{card.detail}</Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* ── Debit Overview ── */}
        {statistics && statistics.totalDebitAmount > 0 && (
          <Paper sx={{ borderRadius: '24px', p: 3.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'text.secondary' }}>
                  Debit overview
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.75 }}>Outstanding balances</Typography>
              </Box>
              <Button variant="text" size="small" startIcon={<TrendingDown size={14} />} onClick={() => router.push('/contributions')}>
                Full analysis
              </Button>
            </Stack>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
              <Paper sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'error.soft', boxShadow: 'none', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Total Debit</Typography>
                <Typography sx={{ mt: 0.75, fontSize: 22, fontWeight: 800, color: 'error.main' }}>
                  {formatCurrency(statistics.totalDebitAmount, currency)}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'warning.soft', boxShadow: 'none', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Members in Debt</Typography>
                <Typography sx={{ mt: 0.75, fontSize: 22, fontWeight: 800, color: 'warning.main' }}>
                  {statistics.membersWithDebit} / {statistics.totalMembers}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'success.soft', boxShadow: 'none', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Zero Debit</Typography>
                <Typography sx={{ mt: 0.75, fontSize: 22, fontWeight: 800, color: 'success.main' }}>
                  {statistics.membersWithZeroDebit}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'background.warm', boxShadow: 'none', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>Debit %</Typography>
                <Typography sx={{ mt: 0.75, fontSize: 22, fontWeight: 800 }}>
                  {formatPercentage(statistics.debitPercentage)}
                </Typography>
              </Paper>
            </Box>

            {/* Top defaulters from actual /top-defaulters endpoint */}
            {topDefaulters.length > 0 && (
              <Box sx={{ mt: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <AlertTriangle size={14} /> Top defaulters
                </Typography>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {topDefaulters.slice(0, 5).map((d, idx) => (
                    <Paper key={d.memberId} sx={{ p: 2, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 800, bgcolor: idx < 3 ? 'error.main' : 'warning.main', color: '#fff' }}>
                          #{idx + 1}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.memberNames}</Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                            {d.memberPhone} · {d.debitDays}/{d.expectedWorkingDays} days
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'error.main', whiteSpace: 'nowrap' }}>
                          {formatCurrency(d.debitAmount, d.memberCurrency)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {/* Top contributors from statistics */}
            {statistics.topContributors && statistics.topContributors.length > 0 && (
              <Box sx={{ mt: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <TrendingUp size={14} /> Top contributors
                </Typography>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {statistics.topContributors.slice(0, 5).map((c, idx) => (
                    <Paper key={c.memberId} sx={{ p: 2, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 800, bgcolor: idx < 3 ? 'success.main' : 'primary.main', color: '#fff' }}>
                          #{idx + 1}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.memberNames}</Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{c.memberPhone}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'success.main', whiteSpace: 'nowrap' }}>
                          {formatCurrency(c.amount, currency)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* ── Monthly Trends ── */}
        {statistics?.monthlyTrends && statistics.monthlyTrends.length > 0 && (
          <Paper sx={{ borderRadius: '24px', p: 3.5 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'text.secondary' }}>
                Trends
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.75 }}>Monthly performance</Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 1.25 }}>
              {statistics.monthlyTrends.map((trend) => {
                const maxAmount = Math.max(...statistics.monthlyTrends.map((t) => t.contributionAmount), 1);
                const barWidth = (trend.contributionAmount / maxAmount) * 100;
                return (
                  <Paper key={`${trend.year}-${trend.month}`} sx={{ p: 2, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                          {trend.monthName.charAt(0) + trend.monthName.slice(1).toLowerCase()} {trend.year}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                          {trend.memberCount} members · {trend.contributionCount} contributions · {formatPercentage(trend.complianceRate)} compliance
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{formatCurrency(trend.contributionAmount, currency)}</Typography>
                        {trend.debitAmount > 0 && (
                          <Typography sx={{ fontSize: 11, color: 'error.main' }}>-{formatCurrency(trend.debitAmount, currency)}</Typography>
                        )}
                      </Box>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={barWidth}
                      sx={{ height: 5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.06)' }}
                    />
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        )}

        {/* ── Recent Payouts + Recent Seasons ── */}
        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
          {/* Recent payouts */}
          <Paper sx={{ borderRadius: '24px', p: 3.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'text.secondary' }}>
                  Payouts
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.75 }}>Recent activity</Typography>
              </Box>
              <Button variant="text" size="small" startIcon={<History size={14} />} onClick={() => router.push('/seasons')}>
                View all
              </Button>
            </Stack>

            <Box sx={{ mt: 2.5, display: 'grid', gap: 1.25 }}>
              {recentPayouts.length === 0 ? (
                <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.warm', boxShadow: 'none', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>No payout activity yet.</Typography>
                </Paper>
              ) : (
                recentPayouts.map((payout) => (
                  <Paper key={payout.id} sx={{ p: 2, borderRadius: '14px', bgcolor: 'background.warm', boxShadow: 'none' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: 12,
                          fontWeight: 800,
                          bgcolor: payout.status === 'PAID' ? 'success.main' : payout.status === 'CANCELLED' ? 'error.main' : 'info.main',
                          color: '#fff',
                        }}
                      >
                        W{payout.weekNumber}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{payout.memberNames}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {formatDate(payout.expectedPayoutDate)}
                          {payout.amount != null && ` · ${formatCurrency(payout.amount, payout.currency)}`}
                        </Typography>
                      </Box>
                      <Chip label={payout.status} size="small" color={payoutStatusColor(payout.status) as any} sx={{ fontSize: 10, height: 22 }} />
                    </Stack>
                  </Paper>
                ))
              )}
            </Box>
          </Paper>

          {/* Recent seasons */}
          <Paper sx={{ borderRadius: '24px', p: 3.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'text.secondary' }}>
                  Timeline
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.75 }}>Recent seasons</Typography>
              </Box>
              <Button variant="text" size="small" onClick={() => router.push('/seasons')}>View all</Button>
            </Stack>

            <Box sx={{ mt: 2.5, display: 'grid', gap: 1.25 }}>
              {seasons.slice(0, 5).map((season) => (
                <Paper
                  key={season.id}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: season.status === 'ACTIVE' ? 'primary.soft' : 'background.warm',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'background.soft' },
                  }}
                  onClick={() => router.push('/seasons')}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{formatDate(season.startDate, 'MMM yyyy')}</Typography>
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
              ))}
              {seasons.length === 0 && (
                <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.warm', boxShadow: 'none', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>No seasons created yet.</Typography>
                </Paper>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
