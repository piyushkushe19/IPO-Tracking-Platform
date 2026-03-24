import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SECTORS, STATUSES } from '../../utils/helpers';

export default function IPOFilters({ params, onUpdate, onReset }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="card p-4 space-y-4">
      {/* Search + view toggle row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={params.search || ''}
            onChange={(e) => onUpdate({ search: e.target.value })}
            placeholder="Search company, sector..."
            className="input-field pl-9"
          />
        </div>

        {/* Advanced filters toggle */}
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn-secondary flex items-center gap-2 text-sm shrink-0 ${showAdvanced ? 'border-brand-700 text-white' : ''}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {(params.status || params.sector) && (
            <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
          )}
        </button>

        <button onClick={onReset} className="btn-ghost text-sm shrink-0">Reset</button>
      </div>

      {/* Status quick filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...STATUSES].map((s) => (
          <button key={s}
            onClick={() => onUpdate({ status: s === 'all' ? '' : s })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              (params.status === s) || (s === 'all' && !params.status)
                ? 'bg-brand-600 text-white'
                : 'bg-surface-hover text-gray-400 hover:text-white'
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-surface-border">
              {/* Sector */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Sector</label>
                <select value={params.sector || ''} onChange={(e) => onUpdate({ sector: e.target.value })}
                  className="input-field text-sm">
                  <option value="">All Sectors</option>
                  {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Min Price (₹)</label>
                <input type="number" value={params.minPrice || ''} onChange={(e) => onUpdate({ minPrice: e.target.value })}
                  placeholder="e.g. 100" className="input-field text-sm" />
              </div>

              {/* Max Price */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Max Price (₹)</label>
                <input type="number" value={params.maxPrice || ''} onChange={(e) => onUpdate({ maxPrice: e.target.value })}
                  placeholder="e.g. 1000" className="input-field text-sm" />
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Sort By</label>
                <select value={`${params.sortBy || 'openDate'}-${params.sortOrder || 'desc'}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    onUpdate({ sortBy, sortOrder });
                  }}
                  className="input-field text-sm">
                  <option value="openDate-desc">Newest First</option>
                  <option value="openDate-asc">Oldest First</option>
                  <option value="subscriptionTotal-desc">Highest Subscription</option>
                  <option value="issueSize-desc">Largest Issue Size</option>
                  <option value="priceBandMax-asc">Lowest Price</option>
                  <option value="listingGain-desc">Best Listing Gain</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
