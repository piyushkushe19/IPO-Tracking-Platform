import { format, formatDistanceToNow, isPast, isFuture, isToday } from 'date-fns';

export const formatCurrency = (val, decimals = 2) => {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: decimals })}`;
};

export const formatCrores = (val) => {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN')} Cr`;
};

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateShort = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM');
};

export const timeAgo = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatSubscription = (val) => {
  if (val == null || val === 0) return '—';
  return `${Number(val).toFixed(2)}x`;
};

export const getStatusConfig = (status) => {
  const configs = {
    open:     { label: 'Open',     class: 'badge-green',  dot: 'bg-accent-green' },
    upcoming: { label: 'Upcoming', class: 'badge-blue',   dot: 'bg-accent-blue' },
    closed:   { label: 'Closed',   class: 'badge-yellow', dot: 'bg-accent-yellow' },
    listed:   { label: 'Listed',   class: 'badge-purple', dot: 'bg-accent-purple' },
  };
  return configs[status] || { label: status, class: 'badge-gray', dot: 'bg-gray-500' };
};

export const getGainClass = (val) => {
  if (val == null) return 'neutral';
  return val > 0 ? 'positive' : val < 0 ? 'negative' : 'neutral';
};

export const formatGain = (val) => {
  if (val == null) return '—';
  const sign = val > 0 ? '+' : '';
  return `${sign}${Number(val).toFixed(2)}%`;
};

export const formatGMP = (gmp, price) => {
  if (!gmp || !price) return '—';
  const pct = ((gmp / price) * 100).toFixed(1);
  return `₹${gmp} (${pct > 0 ? '+' : ''}${pct}%)`;
};

export const truncate = (str, n = 30) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
};

export const sectorColors = {
  Technology:      '#4c9be8',
  Finance:         '#00d09c',
  Healthcare:      '#a78bfa',
  'Consumer Goods':'#f5a623',
  Energy:          '#f05454',
  Manufacturing:   '#64748b',
  'Real Estate':   '#06b6d4',
  Retail:          '#ec4899',
  Telecom:         '#8b5cf6',
  Infrastructure:  '#f97316',
};

export const getSectorColor = (sector) => sectorColors[sector] || '#6b7280';

export const SECTORS = Object.keys(sectorColors);
export const STATUSES = ['upcoming', 'open', 'closed', 'listed'];
