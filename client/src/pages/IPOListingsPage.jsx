import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useIPOs } from '../hooks/useIPOs';
import IPOCard from '../components/ipo/IPOCard';
import IPOTable from '../components/ipo/IPOTable';
import IPOFilters from '../components/ipo/IPOFilters';
import { CardSkeleton } from '../components/common/Skeleton';
import useAuthStore from '../hooks/useAuthStore';

const VIEW_KEY = 'ipo_view_mode';

export default function IPOListingsPage() {
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_KEY) || 'card');
  const { ipos, pagination, loading, params, updateParams, refresh } = useIPOs();
  const { refreshUser } = useAuthStore();

  const setView = (mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_KEY, mode);
  };

  const handleSort = useCallback((key) => {
    updateParams({
      sortBy: key,
      sortOrder: params.sortBy === key && params.sortOrder === 'desc' ? 'asc' : 'desc',
    });
  }, [params.sortBy, params.sortOrder, updateParams]);

  const handleReset = () => {
    updateParams({ search: '', status: '', sector: '', minPrice: '', maxPrice: '', sortBy: 'openDate', sortOrder: 'desc', page: 1 });
  };

  const handleWatchlistToggle = () => refreshUser();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">IPO Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination ? `${pagination.total} IPOs found` : 'Loading…'}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-surface-card border border-surface-border rounded-lg p-1 self-start sm:self-auto">
          <ViewBtn active={viewMode === 'card'} onClick={() => setView('card')} icon={
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
            </svg>
          } label="Cards" />
          <ViewBtn active={viewMode === 'table'} onClick={() => setView('table')} icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18"/>
            </svg>
          } label="Table" />
        </div>
      </div>

      {/* Filters */}
      <IPOFilters params={params} onUpdate={updateParams} onReset={handleReset} />

      {/* Content */}
      {viewMode === 'card' ? (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : ipos.length === 0 ? (
            <EmptyState onReset={handleReset} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {ipos.map((ipo, i) => (
                <IPOCard key={ipo._id} ipo={ipo} index={i} onWatchlistToggle={handleWatchlistToggle} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <IPOTable
          ipos={ipos}
          loading={loading}
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSort={handleSort}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={!pagination.hasPrev}
            onClick={() => updateParams({ page: params.page - 1 })}
            className="btn-secondary text-sm disabled:opacity-40">← Prev</button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.pages, 7) }).map((_, i) => {
              const pg = i + 1;
              return (
                <button key={pg}
                  onClick={() => updateParams({ page: pg })}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    params.page === pg ? 'bg-brand-600 text-white' : 'btn-ghost'
                  }`}>
                  {pg}
                </button>
              );
            })}
            {pagination.pages > 7 && <span className="text-gray-500 text-sm px-1">…{pagination.pages}</span>}
          </div>

          <button disabled={!pagination.hasNext}
            onClick={() => updateParams({ page: (params.page || 1) + 1 })}
            className="btn-secondary text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        active ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
      }`}>
      {icon}{label}
    </button>
  );
}

function EmptyState({ onReset }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="card flex flex-col items-center py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="font-semibold text-white text-lg">No IPOs found</h3>
      <p className="text-gray-500 text-sm mt-1 mb-5">Try adjusting your search or filters</p>
      <button onClick={onReset} className="btn-primary text-sm">Clear Filters</button>
    </motion.div>
  );
}
