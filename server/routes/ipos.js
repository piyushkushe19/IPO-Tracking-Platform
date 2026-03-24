import { Router } from 'express';
import {
  getAllIPOs,
  getIPOById,
  getIPOStats,
  getMarketOverview,
  toggleWatchlist,
  getLiveUpdates,
  createIPO,
  updateIPO,
} from '../controllers/ipoController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllIPOs);
router.get('/stats', getIPOStats);
router.get('/market-overview', getMarketOverview);
router.get('/live-updates', getLiveUpdates);
router.get('/:id', getIPOById);

router.use(authenticate);
router.post('/:ipoId/watchlist', toggleWatchlist);

router.use(authorize('admin'));
router.post('/', createIPO);
router.patch('/:id', updateIPO);

export default router;
