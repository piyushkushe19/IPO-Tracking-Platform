import { Router } from 'express';
import {
  getPortfolio,
  addToPortfolio,
  updatePortfolioItem,
  removeFromPortfolio,
  getPortfolioStats,
} from '../controllers/portfolioController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getPortfolio);
router.get('/stats', getPortfolioStats);
router.post('/', addToPortfolio);
router.patch('/:id', updatePortfolioItem);
router.delete('/:id', removeFromPortfolio);

export default router;
