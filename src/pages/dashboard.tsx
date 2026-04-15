import React from 'react';
import { useAuth, useSeasons, usePayments, useOrganization } from '@/hooks';
import { formatCurrency, formatPercentage, formatDate } from '@/utils/format';
import { Button } from '@/components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const { seasons, fetchSeasons } = useSeasons();
  const { seasonStatus, fetchSeasonStatus } = usePayments();
  const { statistics, getOrganizationStatistics } = useOrganization();

  React.useEffect(() => {
    fetchSeasons();
    getOrganizationStatistics();
  }, [fetchSeasons, getOrganizationStatistics]);

  const activeSeason = seasons.find((season) => season.status === 'ACTIVE');

  React.useEffect(() => {
    if (activeSeason) {
      fetchSeasonStatus(activeSeason.id);
    }
  }, [activeSeason, fetchSeasonStatus]);

  const activeSeasonCount = seasons.filter((season) => season.status === 'ACTIVE').length;
  const scheduledSeasonCount = seasons.filter((season) => season.status === 'SCHEDULED').length;
  const totalMembers = statistics?.totalMembers ?? seasonStatus?.totalMembers ?? 0;
  const totalContributions = statistics?.totalAmount ?? seasonStatus?.totalAmountPaid ?? 0;
  const completionRate = seasonStatus?.completionPercentage ?? statistics?.paymentCompletionRate ?? 0;
  const seasonHealth = seasonStatus?.isCircleCompleted
    ? 'Circle completed'
    : activeSeason
      ? 'In active rotation'
      : 'No active season';

  const statsCards = [
    {
      label: 'Members in network',
      value: totalMembers.toString(),
      detail: `${statistics?.activeMembers ?? 0} active contributors`,
      accent: 'from-primary-500/20 to-primary-100/20',
      dot: 'bg-primary-500',
    },
    {
      label: 'Active seasons',
      value: activeSeasonCount.toString(),
      detail: `${scheduledSeasonCount} scheduled next`,
      accent: 'from-accent-500/20 to-emerald-100/20',
      dot: 'bg-accent-500',
    },
    {
      label: 'Total paid out',
      value: formatCurrency(totalContributions || 0),
      detail: `${seasonStatus?.membersPaid ?? 0} members served`,
      accent: 'from-amber-400/25 to-orange-100/20',
      dot: 'bg-amber-500',
    },
    {
      label: 'Completion rate',
      value: formatPercentage(completionRate || 0),
      detail: seasonHealth,
      accent: 'from-ink-900/15 to-slate-100/20',
      dot: 'bg-ink-700',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[40px] border border-white/70 bg-white/55 p-4 shadow-panel backdrop-blur sm:p-6 lg:p-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent-200/50 blur-3xl" />
      </div>

      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] bg-gradient-to-br from-ink-900 via-primary-800 to-accent-700 p-8 text-white shadow-panel">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-accent-300" />
                  Live circle overview
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight">
                  Welcome back, {user?.username || 'User'}.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                  Track contributions, active seasons, and next payouts from a single control surface designed for weekly decision-making.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Button variant="secondary" className="min-w-[180px] bg-white/12 text-white hover:bg-white/18">
                  Create season
                </Button>
                <Button variant="ghost" className="min-w-[180px] border-white/15 bg-white/5 text-white hover:bg-white/12">
                  Review payouts
                </Button>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Current season</p>
                <p className="mt-3 text-2xl font-bold">{activeSeason ? formatDate(activeSeason.startDate, 'MMM yyyy') : 'No season'}</p>
                <p className="mt-2 text-sm text-white/65">
                  {activeSeason ? `${formatDate(activeSeason.startDate)} to ${formatDate(activeSeason.endDate)}` : 'Create a new cycle to begin tracking.'}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Next payout</p>
                <p className="mt-3 text-2xl font-bold">{seasonStatus?.nextPayoutDate ? formatDate(seasonStatus.nextPayoutDate, 'MMM dd') : 'Pending'}</p>
                <p className="mt-2 text-sm text-white/65">
                  {seasonStatus?.nextMemberName || 'No member queued yet'}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Circle status</p>
                <p className="mt-3 text-2xl font-bold">{formatPercentage(completionRate || 0)}</p>
                <p className="mt-2 text-sm text-white/65">{seasonHealth}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/72 p-6 shadow-panel backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-400">Operations pulse</p>
                <h2 className="mt-3 text-2xl font-bold text-ink-900">Season monitor</h2>
              </div>
              <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                {activeSeason ? 'Active' : 'Standby'}
              </span>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <div className="flex items-end justify-between">
                  <p className="text-sm font-medium text-ink-500">Payment progress</p>
                  <p className="text-2xl font-bold text-ink-900">{formatPercentage(completionRate || 0)}</p>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-500 via-primary-500 to-ink-700 transition-all duration-500"
                    style={{ width: `${Math.max(8, completionRate || 0)}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-sm text-ink-500">Members paid</p>
                  <p className="mt-2 text-2xl font-bold text-ink-900">{seasonStatus?.membersPaid ?? 0}</p>
                </div>
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <p className="text-sm text-ink-500">Remaining in queue</p>
                  <p className="mt-2 text-2xl font-bold text-ink-900">{seasonStatus?.membersRemaining ?? 0}</p>
                </div>
              </div>

              <div className="rounded-[24px] bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-800">Next to receive payment</p>
                <p className="mt-2 text-lg font-bold text-amber-950">
                  {seasonStatus?.nextMemberName || 'Waiting for member ranking'}
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  {seasonStatus?.nextPayoutDate
                    ? `Expected on ${formatDate(seasonStatus.nextPayoutDate)}`
                    : 'Set a payment schedule to generate the next payout date.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-[28px] border border-white/75 bg-gradient-to-br ${card.accent} bg-white/82 p-6 shadow-soft backdrop-blur`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink-500">{card.label}</p>
                <span className={`h-3 w-3 rounded-full ${card.dot}`} />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-ink-900">{card.value}</p>
              <p className="mt-2 text-sm text-ink-600">{card.detail}</p>
            </div>
          ))}
        </section>

        {activeSeason && seasonStatus && (
          <section className="rounded-[32px] border border-white/70 bg-white/78 p-6 shadow-panel backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-400">Live payout cycle</p>
                <h2 className="mt-3 text-3xl font-bold text-ink-900">Active season status</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">
                  Review the current season period, payout progress, and overall amount paid without leaving the dashboard.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {activeSeason.status}
              </span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[26px] bg-slate-50 p-5">
                <p className="text-sm text-ink-500">Season period</p>
                <p className="mt-3 text-base font-semibold text-ink-900">
                  {formatDate(activeSeason.startDate)} - {formatDate(activeSeason.endDate)}
                </p>
              </div>
              <div className="rounded-[26px] bg-slate-50 p-5">
                <p className="text-sm text-ink-500">Members progress</p>
                <p className="mt-3 text-base font-semibold text-ink-900">
                  {seasonStatus.membersPaid} / {seasonStatus.totalMembers} paid
                </p>
              </div>
              <div className="rounded-[26px] bg-slate-50 p-5">
                <p className="text-sm text-ink-500">Total amount paid</p>
                <p className="mt-3 text-base font-semibold text-ink-900">
                  {formatCurrency(seasonStatus.totalAmountPaid)}
                </p>
              </div>
              <div className="rounded-[26px] bg-slate-50 p-5">
                <p className="text-sm text-ink-500">Next payment date</p>
                <p className="mt-3 text-base font-semibold text-ink-900">
                  {seasonStatus.nextPayoutDate ? formatDate(seasonStatus.nextPayoutDate) : 'N/A'}
                </p>
              </div>
            </div>

            {seasonStatus.nextMemberName && (
              <div className="mt-6 rounded-[24px] bg-gradient-to-r from-amber-50 to-orange-50 p-5">
                <p className="text-sm text-amber-700">
                  <span className="font-semibold">Next to receive payment:</span> {seasonStatus.nextMemberName}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" size="sm">
                Process payment
              </Button>
              <Button variant="secondary" size="sm">
                View details
              </Button>
            </div>
          </section>
        )}

        <section className="rounded-[32px] border border-white/70 bg-white/78 p-6 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-400">Timeline</p>
              <h2 className="mt-3 text-3xl font-bold text-ink-900">Recent seasons</h2>
            </div>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>

          {seasons.length > 0 ? (
            <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200/80">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">Season</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">Period</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">Created</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {seasons.slice(0, 5).map((season) => (
                      <tr key={season.id} className="transition hover:bg-slate-50/80">
                        <td className="px-6 py-5 text-sm font-semibold text-ink-900">
                          {formatDate(season.startDate, 'MMM yyyy')}
                        </td>
                        <td className="px-6 py-5 text-sm text-ink-600">
                          {formatDate(season.startDate)} - {formatDate(season.endDate)}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            season.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : season.status === 'ENDED'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-primary-50 text-primary-700'
                          }`}>
                            {season.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-ink-600">
                          {formatDate(season.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] bg-slate-50 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-ink-900">No seasons found</p>
              <p className="mt-2 text-sm text-ink-600">
                Create your first season to begin tracking member rotations and payouts.
              </p>
              <Button variant="primary" className="mt-6">
                Create season
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
