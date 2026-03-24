import IPO from '../models/IPO.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

const getCached = (key) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const getAllIPOs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sector,
      search,
      sortBy = 'openDate',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
    } = req.query;

    const cacheKey = JSON.stringify(req.query);
    const cached = getCached(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const query = { isActive: true };

    if (status) query.status = status;
    if (sector) query.sector = sector;
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.priceBandMax = {};
      if (minPrice) query.priceBandMin = { $gte: Number(minPrice) };
      if (maxPrice) query.priceBandMax = { $lte: Number(maxPrice) };
    }

    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [ipos, total] = await Promise.all([
      IPO.find(query).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
      IPO.countDocuments(query),
    ]);

    const response = {
      success: true,
      data: ipos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
        hasNext: skip + ipos.length < total,
        hasPrev: page > 1,
      },
    };

    setCache(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getIPOById = async (req, res, next) => {
  try {
    const ipo = await IPO.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!ipo) throw new AppError('IPO not found', 404);

    res.status(200).json({ success: true, data: ipo });
  } catch (error) {
    next(error);
  }
};

export const getIPOStats = async (req, res, next) => {
  try {
    const cacheKey = 'ipo_stats';
    const cached = getCached(cacheKey);
    if (cached) return res.status(200).json(cached);

    const [statusStats, sectorStats, totalIPOs] = await Promise.all([
      IPO.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalIssueSize: { $sum: '$issueSize' } } },
      ]),
      IPO.aggregate([
        { $group: { _id: '$sector', count: { $sum: 1 }, avgSubscription: { $avg: '$subscriptionTotal' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      IPO.countDocuments({ isActive: true }),
    ]);

    const response = {
      success: true,
      data: {
        totalIPOs,
        statusBreakdown: statusStats,
        topSectors: sectorStats,
        lastUpdated: new Date(),
      },
    };

    setCache(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMarketOverview = async (req, res, next) => {
  try {
    const cacheKey = 'market_overview';
    const cached = getCached(cacheKey);
    if (cached) return res.status(200).json(cached);

    const [openIPOs, upcomingIPOs, recentListings, topPerformers] = await Promise.all([
      IPO.find({ status: 'open' }).sort({ closeDate: 1 }).limit(5).lean(),
      IPO.find({ status: 'upcoming' }).sort({ openDate: 1 }).limit(5).lean(),
      IPO.find({ status: 'listed' }).sort({ listingDate: -1 }).limit(5).lean(),
      IPO.find({ status: 'listed', listingGain: { $gt: 0 } })
        .sort({ listingGain: -1 })
        .limit(5)
        .lean(),
    ]);

    const response = {
      success: true,
      data: { openIPOs, upcomingIPOs, recentListings, topPerformers, lastUpdated: new Date() },
    };

    setCache(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const toggleWatchlist = async (req, res, next) => {
  try {
    const { ipoId } = req.params;
    const user = await User.findById(req.user.id);
    const ipo = await IPO.findById(ipoId);
    if (!ipo) throw new AppError('IPO not found', 404);

    const isWatched = user.watchlist.includes(ipoId);
    if (isWatched) {
      user.watchlist.pull(ipoId);
    } else {
      user.watchlist.push(ipoId);
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: isWatched ? 'Removed from watchlist' : 'Added to watchlist',
      isWatched: !isWatched,
    });
  } catch (error) {
    next(error);
  }
};

export const getLiveUpdates = async (req, res, next) => {
  try {
    const activeIPOs = await IPO.find({
      status: { $in: ['open', 'listed'] },
    })
      .select('companyName symbol subscriptionTotal subscriptionQIB subscriptionNII subscriptionRII gmp currentPrice status')
      .lean();

    // Simulate real-time fluctuations
    const updated = activeIPOs.map((ipo) => ({
      ...ipo,
      subscriptionTotal: parseFloat((ipo.subscriptionTotal * (1 + (Math.random() - 0.49) * 0.02)).toFixed(2)),
      gmp: ipo.gmp + Math.floor((Math.random() - 0.5) * 4),
      currentPrice: ipo.currentPrice
        ? parseFloat((ipo.currentPrice * (1 + (Math.random() - 0.49) * 0.005)).toFixed(2))
        : null,
    }));

    res.status(200).json({ success: true, data: updated, timestamp: new Date() });
  } catch (error) {
    next(error);
  }
};

export const createIPO = async (req, res, next) => {
  try {
    const ipo = await IPO.create(req.body);
    cache.clear();
    logger.info(`IPO created: ${ipo.companyName}`);
    res.status(201).json({ success: true, data: ipo });
  } catch (error) {
    next(error);
  }
};

export const updateIPO = async (req, res, next) => {
  try {
    const ipo = await IPO.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ipo) throw new AppError('IPO not found', 404);
    cache.clear();
    res.status(200).json({ success: true, data: ipo });
  } catch (error) {
    next(error);
  }
};
