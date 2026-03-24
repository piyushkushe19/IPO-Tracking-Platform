import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';
import { ipoService } from '../services/api';
import IPOCard from '../components/ipo/IPOCard';
import { CardSkeleton } from '../components/common/Skeleton';
import toast from 'react-hot-toast';

export default function WatchlistPage() {
  const { user, isAuthenticated, refreshUser } = useAuthStore();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) { setLoading(false); return; }
      setLoading(true);
      try {
        await refreshUser();
      } catch (err) {
        toast.error('Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.watchlist) setWatchlist(user.watchlist.filter(w => w._id));
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-display text-xl font-bold text-white">Login required</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">Please login to view your watchlist</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="skeleton h-8 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Watchlist</h1>
          <p className="text-sm text-gray-500 mt-0.5">{watchlist.length} IPO{watchlist.length !== 1 ? 's' : ''} watched</p>
        </div>
        <Link to="/ipos" className="btn-secondary text-sm">+ Add More</Link>
      </div>

      {watchlist.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card flex flex-col items-center py-20 text-center">
          <div className="text-5xl mb-4">⭐</div>
          <h3 className="font-semibold text-white text-lg">Watchlist is empty</h3>
          <p className="text-gray-500 text-sm mt-1 mb-5">Star IPOs from listings to track them here</p>
          <Link to="/ipos" className="btn-primary text-sm">Browse IPOs</Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {watchlist.map((ipo, i) => (
              <IPOCard key={ipo._id} ipo={ipo} index={i} onWatchlistToggle={refreshUser} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
