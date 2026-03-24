import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMarketOverview, useIPOStats } from '../hooks/useIPOs';
import { useWebSocket } from '../hooks/useWebSocket';
import StatCard from '../components/dashboard/StatCard';
import MarketOverview from '../components/dashboard/MarketOverview';
import { StatSkeleton, ChartSkeleton } from '../components/common/Skeleton';
import { formatCrores, formatSubscription } from '../utils/helpers';

const SectorPieChart = lazy(() => import('../components/charts/Charts').then(m => ({ default: m.SectorPieChart })));
const PerformanceChart = lazy(() => import('../components/charts/Charts').then(m => ({ default: m.PerformanceChart })));

export default function DashboardPage() {
  const { data: overview, loading: overviewLoading } = useMarketOverview();
  const { data: stats, loading: statsLoading } = useIPOStats();
  const { connected, liveData, lastUpdated } = useWebSocket();

  const statusMap = stats?.statusBreakdown?.reduce((acc, s) => ({ ...acc, [s._id]: s }), {}) || {};
  const totalIssueSize = stats?.statusBreakdown?.reduce((sum, s) => sum + (s.totalIssueSize || 0), 0) || 0;

  // Build performance data for chart
  const perfData = overview?.topPerformers?.map(ipo => ({
    companyName: ipo.companyName,
    listingGain: ipo.listingGain,
  })) || [];

  // Build sector data for pie
  const sectorData = stats?.topSectors?.map(s => ({
    _id: s._id,
    count: s.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Market Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-accent-green animate-pulse' : 'bg-gray-600'}`} />
            {connected ? `Live · Updated ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'now'}` : 'Connecting…'}
          </p>
        </div>
        <Link to="/ipos" className="btn-primary text-sm self-start sm:self-auto">
          View All IPOs →
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard index={0} label="Total IPOs" icon="📋" color="#4c9be8"
              value={stats?.totalIPOs || '—'} subValue="All time tracked" />
            <StatCard index={1} label="Open IPOs" icon="🟢" color="#00d09c"
              value={statusMap['open']?.count || 0} subValue="Live applications" subClass="positive" />
            <StatCard index={2} label="Upcoming" icon="🔜" color="#4c9be8"
              value={statusMap['upcoming']?.count || 0} subValue="Scheduled soon" />
            <StatCard index={3} label="Total Funds" icon="💰" color="#f5a623"
              value={formatCrores(totalIssueSize)} subValue="Aggregate issue size" />
          </>
        )}
      </div>

      {/* Live updates widget */}
      {liveData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              Live Market Pulse
            </h2>
            <span className="text-xs text-gray-500">Updates every 5s</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {liveData.slice(0, 5).map((ipo) => (
              <Link key={ipo._id} to={`/ipos/${ipo._id}`}
                className="bg-surface-hover rounded-lg p-3 hover:border-brand-700 border border-transparent transition-all">
                <p className="text-xs font-mono font-medium text-white truncate">{ipo.symbol}</p>
                {ipo.subscriptionTotal > 0 && (
                  <p className="text-[11px] text-accent-green mt-1">{formatSubscription(ipo.subscriptionTotal)}</p>
                )}
                {ipo.gmp !== 0 && (
                  <p className={`text-[11px] mt-0.5 ${ipo.gmp > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    GMP: {ipo.gmp > 0 ? '+' : ''}₹{ipo.gmp}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Market overview panels */}
      <div>
        <h2 className="section-title mb-4">Market Overview</h2>
        <MarketOverview data={overview} loading={overviewLoading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={<ChartSkeleton height={240} />}>
          <PerformanceChart data={perfData} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton height={240} />}>
          <SectorPieChart data={sectorData} />
        </Suspense>
      </div>
    </div>
  );
}
