import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, formatCrores, formatCurrency, formatSubscription, getStatusConfig, getGainClass, formatGain, getSectorColor, truncate } from '../../utils/helpers';
import useAuthStore from '../../hooks/useAuthStore';
import { ipoService } from '../../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function IPOCard({ ipo, index = 0, onWatchlistToggle }) {
  const { isAuthenticated, user } = useAuthStore();
  const [watchlisting, setWatchlisting] = useState(false);

  const statusCfg = getStatusConfig(ipo.status);
  const isWatched = user?.watchlist?.some((w) => (w._id || w) === ipo._id);
  const sectorColor = getSectorColor(ipo.sector);

  const handleWatchlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to use watchlist'); return; }
    setWatchlisting(true);
    try {
      await ipoService.toggleWatchlist(ipo._id);
      toast.success(isWatched ? 'Removed from watchlist' : 'Added to watchlist');
      onWatchlistToggle?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWatchlisting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/ipos/${ipo._id}`} className="block card-hover group">
        {/* Sector color accent */}
        <div className="h-0.5 rounded-t-xl" style={{ background: sectorColor }} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Company avatar */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: `${sectorColor}22`, border: `1px solid ${sectorColor}44` }}>
                {ipo.companyName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white leading-tight truncate group-hover:text-brand-400 transition-colors">
                  {ipo.companyName}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{ipo.symbol}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={statusCfg.class}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
              <button
                onClick={handleWatchlist}
                disabled={watchlisting}
                className={`p-1.5 rounded-lg transition-all duration-150 ${
                  isWatched ? 'text-accent-yellow bg-accent-yellow/10' : 'text-gray-600 hover:text-accent-yellow hover:bg-accent-yellow/10'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={isWatched ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatBox label="Price Band" value={`₹${ipo.priceBandMin}–${ipo.priceBandMax}`} small />
            <StatBox label="Issue Size" value={formatCrores(ipo.issueSize)} small />
            <StatBox label="Subscription"
              value={ipo.subscriptionTotal > 0 ? formatSubscription(ipo.subscriptionTotal) : '—'}
              valueClass={ipo.subscriptionTotal >= 1 ? 'text-accent-green' : 'text-white'}
            />
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>Open: <span className="text-gray-300">{formatDate(ipo.openDate)}</span></span>
            <span>Close: <span className="text-gray-300">{formatDate(ipo.closeDate)}</span></span>
            <span>List: <span className="text-gray-300">{formatDate(ipo.listingDate)}</span></span>
          </div>

          {/* GMP / Listing Gain */}
          {(ipo.gmp !== 0 || ipo.listingGain != null) && (
            <div className="flex items-center gap-3 pt-3 border-t border-surface-border">
              {ipo.gmp !== 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-500">GMP</span>
                  <span className={ipo.gmp > 0 ? 'text-accent-green font-medium' : 'text-accent-red font-medium'}>
                    {ipo.gmp > 0 ? '+' : ''}₹{ipo.gmp}
                  </span>
                </div>
              )}
              {ipo.listingGain != null && (
                <div className="flex items-center gap-1.5 text-xs ml-auto">
                  <span className="text-gray-500">Listing</span>
                  <span className={`font-medium ${getGainClass(ipo.listingGain)}`}>
                    {formatGain(ipo.listingGain)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sector tag */}
          <div className="mt-3">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${sectorColor}18`, color: sectorColor }}>
              {ipo.sector}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatBox({ label, value, small, valueClass = 'text-white' }) {
  return (
    <div className="bg-surface-hover/60 rounded-lg p-2.5">
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      <p className={`font-medium leading-tight ${small ? 'text-xs' : 'text-sm'} ${valueClass}`}>{value}</p>
    </div>
  );
}
