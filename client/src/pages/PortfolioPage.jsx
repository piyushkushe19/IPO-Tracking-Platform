import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { portfolioService } from '../services/api';
import { formatDate, formatCurrency, formatCrores, getStatusConfig, getGainClass, formatGain, getSectorColor } from '../utils/helpers';
import { ChartSkeleton, CardSkeleton } from '../components/common/Skeleton';
import StatCard from '../components/dashboard/StatCard';
import toast from 'react-hot-toast';

const PortfolioDonut = lazy(() => import('../components/charts/Charts').then(m => ({ default: m.PortfolioDonut })));

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const [portRes, statsRes] = await Promise.all([
        portfolioService.getAll(),
        portfolioService.getStats(),
      ]);
      setPortfolio(portRes.data.data);
      setSummary(portRes.data.summary);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const handleRemove = async (id, name) => {
    if (!confirm(`Remove ${name} from portfolio?`)) return;
    setRemoving(id);
    try {
      await portfolioService.remove(id);
      setPortfolio(p => p.filter(i => i._id !== id));
      toast.success('Removed from portfolio');
      fetchPortfolio();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(null);
    }
  };

  const handleStatusUpdate = async (id, applicationStatus) => {
    try {
      await portfolioService.update(id, { applicationStatus });
      fetchPortfolio();
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <PortfolioSkeleton />;

  if (portfolio.length === 0) return <EmptyPortfolio />;

  const pnlClass = summary?.totalPnL >= 0 ? 'positive' : 'negative';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Portfolio</h1>
          <p className="text-sm text-gray-500 mt-0.5">{portfolio.length} IPO{portfolio.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <Link to="/ipos" className="btn-primary text-sm self-start sm:self-auto">+ Add IPO</Link>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard index={0} label="Total Invested" icon="💰" color="#4c9be8"
            value={`₹${(summary.totalInvested / 100000).toFixed(1)}L`} subValue={formatCurrency(summary.totalInvested)} />
          <StatCard index={1} label="Current Value" icon="📈" color="#00d09c"
            value={`₹${(summary.totalCurrentValue / 100000).toFixed(1)}L`} />
          <StatCard index={2} label="Total P&L" icon={summary.totalPnL >= 0 ? '🟢' : '🔴'}
            color={summary.totalPnL >= 0 ? '#00d09c' : '#f05454'}
            value={formatCurrency(summary.totalPnL)}
            subValue={`${summary.totalPnL >= 0 ? '+' : ''}${summary.totalPnLPercent}%`}
            subClass={pnlClass} />
          <StatCard index={3} label="Total IPOs" icon="📋" color="#a78bfa"
            value={summary.totalIPOs} subValue="Applications tracked" />
        </div>
      )}

      {/* Chart + Table row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Suspense fallback={<ChartSkeleton height={220} />}>
          <PortfolioDonut data={stats?.sectorBreakdown || []} />
        </Suspense>

        {/* Status breakdown */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="section-title mb-4">Application Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Applied', status: 'applied', color: '#4c9be8', icon: '📝' },
              { label: 'Allotted', status: 'allotted', color: '#00d09c', icon: '✅' },
              { label: 'Not Allotted', status: 'not_allotted', color: '#f05454', icon: '❌' },
              { label: 'Pending', status: 'pending', color: '#f5a623', icon: '⏳' },
            ].map((s) => {
              const count = stats?.statusBreakdown?.find(b => b.name === s.status)?.count || 0;
              return (
                <div key={s.status} className="bg-surface-hover rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-xl font-display font-bold" style={{ color: s.color }}>{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Portfolio items */}
      <div>
        <h2 className="section-title mb-4">IPO Applications</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Company', 'Applied Price', 'Lots', 'Investment', 'Status', 'Listing Gain', 'P&L', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {portfolio.map((item, idx) => (
                    <PortfolioRow key={item._id} item={item} idx={idx}
                      onRemove={handleRemove} onStatusUpdate={handleStatusUpdate}
                      removing={removing === item._id} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioRow({ item, idx, onRemove, onStatusUpdate, removing }) {
  const ipo = item.ipo;
  if (!ipo) return null;
  const statusCfg = getStatusConfig(ipo.status);
  const sectorColor = getSectorColor(ipo.sector);

  const appStatuses = ['applied', 'allotted', 'not_allotted', 'pending', 'refunded'];
  const appStatusColors = {
    applied: 'text-accent-blue',
    allotted: 'text-accent-green',
    not_allotted: 'text-accent-red',
    pending: 'text-accent-yellow',
    refunded: 'text-gray-400',
  };

  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
      transition={{ delay: idx * 0.04 }}
      className={`table-row ${removing ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3 whitespace-nowrap">
        <Link to={`/ipos/${ipo._id}`} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: `${sectorColor}22`, color: sectorColor }}>
            {ipo.symbol?.slice(0,2)}
          </div>
          <div>
            <p className="font-medium text-white group-hover:text-brand-400 transition-colors text-sm leading-tight">{ipo.companyName}</p>
            <span className={`text-[10px] ${statusCfg.class}`}>{statusCfg.label}</span>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-200">₹{item.appliedPrice}</td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-300">{item.lotsApplied}</td>
      <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-200">₹{item.totalInvestment?.toLocaleString('en-IN')}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <select value={item.applicationStatus}
          onChange={(e) => onStatusUpdate(item._id, e.target.value)}
          className={`text-xs bg-transparent font-medium ${appStatusColors[item.applicationStatus] || 'text-gray-400'} cursor-pointer focus:outline-none`}>
          {appStatuses.map(s => <option key={s} value={s} className="bg-surface-card text-white">{s.replace('_', ' ')}</option>)}
        </select>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {ipo.listingGain != null ? (
          <span className={`font-mono font-medium text-sm ${getGainClass(ipo.listingGain)}`}>{formatGain(ipo.listingGain)}</span>
        ) : <span className="text-gray-600 text-sm">—</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {item.pnl != null ? (
          <div>
            <span className={`font-mono font-medium text-sm ${getGainClass(item.pnl)}`}>
              {item.pnl >= 0 ? '+' : ''}₹{Math.abs(item.pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <p className={`text-[10px] ${getGainClass(item.pnlPercent)}`}>{formatGain(item.pnlPercent)}</p>
          </div>
        ) : <span className="text-gray-600 text-sm">—</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button onClick={() => onRemove(item._id, ipo.companyName)} disabled={removing}
          className="text-xs text-accent-red hover:bg-accent-red/10 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40">
          Remove
        </button>
      </td>
    </motion.tr>
  );
}

function EmptyPortfolio() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="text-5xl mb-4">💼</div>
      <h2 className="font-display text-xl font-bold text-white">Portfolio is empty</h2>
      <p className="text-gray-500 text-sm mt-2 mb-6">Start tracking your IPO applications here</p>
      <Link to="/ipos" className="btn-primary">Browse IPOs →</Link>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="card p-5 space-y-2"><div className="skeleton h-3 w-20"/><div className="skeleton h-7 w-28"/></div>)}
      </div>
      <ChartSkeleton height={220} />
    </div>
  );
}
