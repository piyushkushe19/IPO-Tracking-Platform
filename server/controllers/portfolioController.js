import Portfolio from '../models/Portfolio.js';
import IPO from '../models/IPO.js';
import { AppError } from '../middleware/errorHandler.js';

export const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user.id })
      .populate('ipo', 'companyName symbol sector priceBandMin priceBandMax issueSize status listingDate currentPrice listingPrice logo')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate real-time P&L
    const enriched = portfolio.map((item) => {
      if (item.ipo?.currentPrice && item.allottedShares > 0) {
        const currentValue = item.ipo.currentPrice * item.allottedShares;
        const cost = item.appliedPrice * item.allottedShares;
        const pnl = currentValue - cost;
        const pnlPercent = ((pnl / cost) * 100).toFixed(2);
        return { ...item, currentValue, pnl, pnlPercent };
      }
      return item;
    });

    const totalInvested = enriched.reduce((sum, i) => sum + (i.totalInvestment || 0), 0);
    const totalCurrentValue = enriched.reduce((sum, i) => sum + (i.currentValue || i.totalInvestment || 0), 0);
    const totalPnL = totalCurrentValue - totalInvested;

    res.status(200).json({
      success: true,
      data: enriched,
      summary: {
        totalIPOs: enriched.length,
        totalInvested,
        totalCurrentValue,
        totalPnL,
        totalPnLPercent: totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToPortfolio = async (req, res, next) => {
  try {
    const { ipoId, appliedPrice, lotsApplied, applicationId, notes } = req.body;

    const ipo = await IPO.findById(ipoId);
    if (!ipo) throw new AppError('IPO not found', 404);

    const existing = await Portfolio.findOne({ user: req.user.id, ipo: ipoId });
    if (existing) throw new AppError('IPO already in portfolio', 409);

    const totalInvestment = appliedPrice * lotsApplied * ipo.lotSize;

    const portfolioItem = await Portfolio.create({
      user: req.user.id,
      ipo: ipoId,
      appliedPrice,
      lotsApplied,
      totalInvestment,
      applicationId,
      notes,
    });

    await portfolioItem.populate('ipo', 'companyName symbol status');

    res.status(201).json({ success: true, data: portfolioItem });
  } catch (error) {
    next(error);
  }
};

export const updatePortfolioItem = async (req, res, next) => {
  try {
    const item = await Portfolio.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) throw new AppError('Portfolio item not found', 404);

    const updated = await Portfolio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('ipo', 'companyName symbol status currentPrice');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const removeFromPortfolio = async (req, res, next) => {
  try {
    const item = await Portfolio.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) throw new AppError('Portfolio item not found', 404);

    res.status(200).json({ success: true, message: 'Removed from portfolio' });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioStats = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user.id })
      .populate('ipo', 'sector status currentPrice listingPrice')
      .lean();

    const sectorBreakdown = {};
    const statusBreakdown = {};

    portfolio.forEach((item) => {
      const sector = item.ipo?.sector || 'Unknown';
      const status = item.applicationStatus;

      sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + item.totalInvestment;
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        sectorBreakdown: Object.entries(sectorBreakdown).map(([name, value]) => ({ name, value })),
        statusBreakdown: Object.entries(statusBreakdown).map(([name, count]) => ({ name, count })),
        totalItems: portfolio.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
