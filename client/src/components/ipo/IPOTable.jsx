import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, formatCrores, formatCurrency, formatSubscription, getStatusConfig, getGainClass, formatGain, getSectorColor } from '../../utils/helpers';
import { TableRowSkeleton } from '../common/Skeleton';

const COLS = [
  { key: 'companyName', label: 'Company',      sortable: true },
  { key: 'priceBandMax', label: 'Price Band',  sortable: true },
  { key: 'issueSize',   label: 'Issue Size',   sortable: true },
  { key: 'openDate',    label: 'Open Date',    sortable: true },
  { key: 'closeDate',   label: 'Close Date',   sortable: true },
  { key: 'subscriptionTotal', label: 'Subs.',  sortable: true },
  { key: 'listingGain', label: 'Listing Gain', sortable: true },
  { key: 'status',      label: 'Status',       sortable: true },
];

export default function IPOTable({ ipos, loading, sortBy, sortOrder, onSort }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              {COLS.map((col) => (
                <th key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap
                    ${col.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''}`}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-gray-600">
                        {sortBy === col.key ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
              : ipos.map((ipo, idx) => <IPOTableRow key={ipo._id} ipo={ipo} idx={idx} />)
            }
          </tbody>
        </table>

        {!loading && ipos.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">No IPOs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function IPOTableRow({ ipo, idx }) {
  const statusCfg = getStatusConfig(ipo.status);
  const sectorColor = getSectorColor(ipo.sector);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: idx * 0.03 }}
      className="table-row"
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <Link to={`/ipos/${ipo._id}`} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: `${sectorColor}22`, color: sectorColor }}>
            {ipo.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white group-hover:text-brand-400 transition-colors leading-tight">{ipo.companyName}</p>
            <p className="text-xs text-gray-500 font-mono">{ipo.symbol}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-mono text-sm text-gray-200">₹{ipo.priceBandMin}–{ipo.priceBandMax}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-300">{formatCrores(ipo.issueSize)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs">{formatDate(ipo.openDate)}</td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs">{formatDate(ipo.closeDate)}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {ipo.subscriptionTotal > 0 ? (
          <span className={`font-mono font-medium ${ipo.subscriptionTotal >= 10 ? 'text-accent-green' : ipo.subscriptionTotal >= 1 ? 'text-accent-blue' : 'text-gray-400'}`}>
            {formatSubscription(ipo.subscriptionTotal)}
          </span>
        ) : <span className="text-gray-600">—</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {ipo.listingGain != null ? (
          <span className={`font-medium font-mono ${getGainClass(ipo.listingGain)}`}>
            {formatGain(ipo.listingGain)}
          </span>
        ) : <span className="text-gray-600">—</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={statusCfg.class}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </td>
    </motion.tr>
  );
}
