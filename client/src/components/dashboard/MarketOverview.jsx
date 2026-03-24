import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, formatSubscription, getStatusConfig, getGainClass, formatGain, formatCrores } from '../../utils/helpers';

function MiniIPORow({ ipo, showSub, showGain }) {
  const statusCfg = getStatusConfig(ipo.status);
  return (
    <Link to={`/ipos/${ipo._id}`}
      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-hover transition-colors group">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-md bg-brand-900/50 border border-brand-800/40 flex items-center justify-center text-[10px] font-bold text-brand-400 shrink-0">
          {ipo.symbol?.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-brand-400 transition-colors leading-tight">
            {ipo.companyName}
          </p>
          <p className="text-[10px] text-gray-500">{formatDate(ipo.openDate)}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        {showSub && ipo.subscriptionTotal > 0 && (
          <p className="text-xs font-mono font-semibold text-accent-green">{formatSubscription(ipo.subscriptionTotal)}</p>
        )}
        {showGain && ipo.listingGain != null && (
          <p className={`text-xs font-mono font-semibold ${getGainClass(ipo.listingGain)}`}>{formatGain(ipo.listingGain)}</p>
        )}
        {!showSub && !showGain && (
          <p className="text-xs text-gray-400">₹{ipo.priceBandMax}</p>
        )}
      </div>
    </Link>
  );
}

function SectionPanel({ title, items = [], badge, badgeClass, showSub, showGain, emptyMsg }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {badge && <span className={`badge ${badgeClass}`}>{badge}</span>}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-600 py-4 text-center">{emptyMsg || 'No data'}</p>
      ) : (
        <div className="space-y-0.5">
          {items.map((ipo) => (
            <MiniIPORow key={ipo._id} ipo={ipo} showSub={showSub} showGain={showGain} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketOverview({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="card p-4 space-y-3">
            <div className="skeleton h-4 w-28" />
            {[1,2,3].map(j => (
              <div key={j} className="flex items-center gap-2">
                <div className="skeleton w-7 h-7 rounded-md" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <SectionPanel title="🟢 Open Now" items={data.openIPOs} badge={`${data.openIPOs?.length}`} badgeClass="badge-green" showSub emptyMsg="No open IPOs" />
      <SectionPanel title="🔜 Upcoming" items={data.upcomingIPOs} badge={`${data.upcomingIPOs?.length}`} badgeClass="badge-blue" emptyMsg="No upcoming IPOs" />
      <SectionPanel title="📋 Recent Listings" items={data.recentListings} badge="New" badgeClass="badge-purple" showGain emptyMsg="No recent listings" />
      <SectionPanel title="🏆 Top Performers" items={data.topPerformers} badge="🔥" badgeClass="badge-yellow" showGain emptyMsg="No data" />
    </div>
  );
}
