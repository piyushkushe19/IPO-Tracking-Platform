import { useWebSocket } from '../../hooks/useWebSocket';
import { formatSubscription, getGainClass } from '../../utils/helpers';

export default function LiveTicker() {
  const { liveData, connected } = useWebSocket();

  if (!liveData.length) return null;

  const doubled = [...liveData, ...liveData];

  return (
    <div className="border-b border-surface-border bg-surface-card/50">
      <div className="ticker-wrap py-2">
        <div className="ticker-content gap-8">
          {doubled.map((ipo, i) => (
            <div key={`${ipo._id}-${i}`} className="inline-flex items-center gap-3 px-4">
              <span className="text-xs font-mono font-medium text-white">{ipo.symbol}</span>
              {ipo.subscriptionTotal > 0 && (
                <span className="text-xs text-gray-400">
                  Sub: <span className="text-accent-green font-medium">{formatSubscription(ipo.subscriptionTotal)}</span>
                </span>
              )}
              {ipo.gmp !== 0 && (
                <span className={`text-xs font-medium ${ipo.gmp > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  GMP: {ipo.gmp > 0 ? '+' : ''}₹{ipo.gmp}
                </span>
              )}
              <span className="text-surface-border">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
