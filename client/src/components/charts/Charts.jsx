import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar
} from 'recharts';
import { getSectorColor, formatSubscription } from '../../utils/helpers';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#161b27', border: '1px solid #1e2535', borderRadius: 10, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e5e7eb' },
  cursor: { fill: 'rgba(30,37,53,0.5)' },
};

// ─── Subscription Trend Chart ────────────────────────────────────────────────
export function SubscriptionChart({ data = [] }) {
  if (!data.length) return <EmptyChart label="Subscription Trend" />;
  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">Subscription Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d09c" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d09c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="qibGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4c9be8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4c9be8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}x`, '']} />
          <Area type="monotone" dataKey="total" name="Total" stroke="#00d09c" fill="url(#totalGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="qib" name="QIB" stroke="#4c9be8" fill="url(#qibGrad)" strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Sector Distribution ──────────────────────────────────────────────────────
export function SectorPieChart({ data = [] }) {
  if (!data.length) return <EmptyChart label="Sector Distribution" />;
  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">Sector Distribution</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
            dataKey="count" nameKey="_id" paddingAngle={3}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getSectorColor(entry._id)} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [v, name]} />
          <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>}
            iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── IPO Performance Bar ──────────────────────────────────────────────────────
export function PerformanceChart({ data = [] }) {
  if (!data.length) return <EmptyChart label="Top Performers" />;
  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">Listing Day Performance</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="companyName" tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false} tickLine={false} width={110}
            tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + '…' : v} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v.toFixed(1)}%`, 'Listing Gain']} />
          <Bar dataKey="listingGain" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.listingGain >= 0 ? '#00d09c' : '#f05454'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Portfolio Donut ──────────────────────────────────────────────────────────
export function PortfolioDonut({ data = [] }) {
  if (!data.length) return <EmptyChart label="Portfolio Allocation" />;
  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            dataKey="value" nameKey="name" paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getSectorColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
          <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>}
            iconType="circle" iconSize={7} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Subscription Bar (IPO detail) ────────────────────────────────────────────
export function SubscriptionBar({ qib = 0, nii = 0, rii = 0, total = 0 }) {
  const data = [
    { name: 'QIB', value: qib, fill: '#4c9be8' },
    { name: 'NII', value: nii, fill: '#a78bfa' },
    { name: 'RII', value: rii, fill: '#00d09c' },
    { name: 'Total', value: total, fill: '#f5a623' },
  ];
  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">Subscription Breakdown</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v}x`} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}x`, 'Subscribed']} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="card p-5 flex flex-col items-center justify-center h-[240px] text-gray-600">
      <div className="text-3xl mb-2">📊</div>
      <p className="text-sm">{label}</p>
      <p className="text-xs mt-1">No data available</p>
    </div>
  );
}
