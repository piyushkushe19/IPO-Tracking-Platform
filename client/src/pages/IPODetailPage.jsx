import { useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIPOById } from '../hooks/useIPOs';
import { formatDate, formatCrores, formatCurrency, formatSubscription, getStatusConfig, getGainClass, formatGain, getSectorColor } from '../utils/helpers';
import { ChartSkeleton } from '../components/common/Skeleton';
import AddToPortfolioModal from '../components/portfolio/AddToPortfolioModal';
import { ipoService } from '../services/api';
import useAuthStore from '../hooks/useAuthStore';
import toast from 'react-hot-toast';

const SubscriptionChart = lazy(() => import('../components/charts/Charts').then(m => ({ default: m.SubscriptionChart })));
const SubscriptionBar = lazy(() => import('../components/charts/Charts').then(m => ({ default: m.SubscriptionBar })));

export default function IPODetailPage() {
  const { id } = useParams();
  const { ipo, loading } = useIPOById(id);
  const { isAuthenticated, user, refreshUser } = useAuthStore();
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [watchlisting, setWatchlisting] = useState(false);

  const isWatched = user?.watchlist?.some((w) => (w._id || w) === id);

  const handleWatchlist = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    setWatchlisting(true);
    try {
      await ipoService.toggleWatchlist(id);
      await refreshUser();
      toast.success(isWatched ? 'Removed from watchlist' : 'Added to watchlist');
    } catch (err) { toast.error(err.message); }
    finally { setWatchlisting(false); }
  };

  if (loading) return <DetailSkeleton />;
  if (!ipo) return (
    <div className="flex flex-col items-center py-24">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="font-display text-xl font-bold text-white">IPO not found</h2>
      <Link to="/ipos" className="btn-primary mt-5 text-sm">← Back to Listings</Link>
    </div>
  );

  const statusCfg = getStatusConfig(ipo.status);
  const sectorColor = getSectorColor(ipo.sector);

  // Build subscription history chart data
  const subChartData = ipo.subscriptionHistory?.map((h, i) => ({
    date: `Day ${i + 1}`,
    total: h.total,
    qib: h.qib,
    nii: h.nii,
    rii: h.rii,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to="/ipos" className="hover:text-white transition-colors">IPO Listings</Link>
        <span>/</span>
        <span className="text-gray-300">{ipo.companyName}</span>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${sectorColor}, ${sectorColor}44)` }} />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                style={{ background: `${sectorColor}22`, border: `1px solid ${sectorColor}44` }}>
                {ipo.companyName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-display text-2xl font-bold text-white">{ipo.companyName}</h1>
                  <span className={statusCfg.class}>
                    <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                  <span className="font-mono">{ipo.symbol}</span>
                  <span>·</span>
                  <span style={{ color: sectorColor }}>{ipo.sector}</span>
                  {ipo.registrar && <><span>·</span><span>{ipo.registrar}</span></>}
                </div>
                {ipo.description && (
                  <p className="text-sm text-gray-400 mt-2 max-w-xl">{ipo.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <button onClick={handleWatchlist} disabled={watchlisting}
                className={`btn-secondary text-sm flex items-center gap-2 ${isWatched ? 'border-accent-yellow/50 text-accent-yellow' : ''}`}>
                <span>{isWatched ? '⭐' : '☆'}</span>
                {isWatched ? 'Watching' : 'Watchlist'}
              </button>
              {isAuthenticated && (
                <button onClick={() => setShowPortfolioModal(true)} className="btn-primary text-sm">
                  + Track Application
                </button>
              )}
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-surface-border">
            <MetricBox label="Price Band" value={`₹${ipo.priceBandMin}–₹${ipo.priceBandMax}`} mono />
            <MetricBox label="Issue Size" value={formatCrores(ipo.issueSize)} />
            <MetricBox label="Lot Size" value={`${ipo.lotSize} shares`} />
            <MetricBox label="Open Date" value={formatDate(ipo.openDate)} />
            <MetricBox label="Close Date" value={formatDate(ipo.closeDate)} />
            <MetricBox label="Listing Date" value={formatDate(ipo.listingDate)} />
          </div>
        </div>
      </motion.div>

      {/* Subscription + Listing row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subscription stats */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="section-title mb-4">Subscription Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: ipo.subscriptionTotal, color: '#f5a623' },
              { label: 'QIB', value: ipo.subscriptionQIB, color: '#4c9be8' },
              { label: 'NII', value: ipo.subscriptionNII, color: '#a78bfa' },
              { label: 'RII', value: ipo.subscriptionRII, color: '#00d09c' },
            ].map((sub) => (
              <div key={sub.label} className="bg-surface-hover rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">{sub.label}</p>
                <p className="text-2xl font-display font-bold" style={{ color: sub.color }}>
                  {sub.value > 0 ? formatSubscription(sub.value) : '—'}
                </p>
                <div className="mt-2 h-1 bg-surface-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((sub.value / 100) * 100, 100)}%`, background: sub.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listing performance */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Listing Performance</h2>
          {ipo.status === 'listed' ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 mb-1">Listing Gain</p>
                <p className={`text-4xl font-display font-bold ${getGainClass(ipo.listingGain)}`}>
                  {formatGain(ipo.listingGain)}
                </p>
              </div>
              <div className="space-y-3">
                <InfoRow label="Issue Price" value={`₹${ipo.priceBandMax}`} />
                <InfoRow label="Listing Price" value={formatCurrency(ipo.listingPrice)} valueClass={getGainClass(ipo.listingGain)} />
                <InfoRow label="Current Price" value={formatCurrency(ipo.currentPrice)} />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm">Listing on {formatDate(ipo.listingDate)}</p>
              {ipo.gmp !== 0 && (
                <div className="mt-4 p-3 bg-surface-hover rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Grey Market Premium</p>
                  <p className={`text-xl font-display font-bold ${ipo.gmp > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {ipo.gmp > 0 ? '+' : ''}₹{ipo.gmp}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={<ChartSkeleton />}>
          <SubscriptionChart data={subChartData} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <SubscriptionBar
            qib={ipo.subscriptionQIB}
            nii={ipo.subscriptionNII}
            rii={ipo.subscriptionRII}
            total={ipo.subscriptionTotal}
          />
        </Suspense>
      </div>

      {/* Financials */}
      {ipo.financials && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Company Financials</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Revenue', value: formatCrores(ipo.financials.revenue) },
              { label: 'Net Profit', value: formatCrores(ipo.financials.profit) },
              { label: 'EPS', value: `₹${ipo.financials.eps?.toFixed(2)}` },
              { label: 'P/E Ratio', value: `${ipo.financials.pe?.toFixed(1)}x` },
              { label: 'ROCE', value: `${ipo.financials.roce?.toFixed(1)}%` },
            ].map((f) => (
              <div key={f.label} className="bg-surface-hover rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                <p className="text-base font-mono font-semibold text-white">{f.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IPO Details */}
      <div className="card p-5">
        <h2 className="section-title mb-4">IPO Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            { label: 'Lead Manager', value: ipo.leadManager },
            { label: 'Registrar', value: ipo.registrar },
            { label: 'Issue Type', value: 'Book Built Issue' },
            { label: 'Views', value: ipo.views?.toLocaleString('en-IN') },
          ].map(({ label, value }) => value ? (
            <InfoRow key={label} label={label} value={value} />
          ) : null)}
        </div>
      </div>

      {showPortfolioModal && (
        <AddToPortfolioModal ipo={ipo} onClose={() => setShowPortfolioModal(false)} />
      )}
    </div>
  );
}

function MetricBox({ label, value, mono }) {
  return (
    <div className="bg-surface-hover/60 rounded-lg p-3">
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold text-white leading-tight ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function InfoRow({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-surface-border/50">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${valueClass}`}>{value || '—'}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-4">
        <div className="flex gap-4">
          <div className="skeleton w-16 h-16 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-3 pt-4 border-t border-surface-border">
          {Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
        </div>
      </div>
      <ChartSkeleton height={200} />
    </div>
  );
}
