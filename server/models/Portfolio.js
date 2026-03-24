import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IPO',
      required: true,
    },
    appliedPrice: {
      type: Number,
      required: true,
    },
    lotsApplied: {
      type: Number,
      required: true,
      min: 1,
    },
    totalInvestment: {
      type: Number,
      required: true,
    },
    applicationStatus: {
      type: String,
      enum: ['applied', 'allotted', 'not_allotted', 'pending', 'refunded'],
      default: 'applied',
    },
    allottedLots: {
      type: Number,
      default: 0,
    },
    allottedShares: {
      type: Number,
      default: 0,
    },
    listingPrice: {
      type: Number,
      default: null,
    },
    currentValue: {
      type: Number,
      default: null,
    },
    pnl: {
      type: Number,
      default: null,
    },
    pnlPercent: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    applicationId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

portfolioItemSchema.index({ user: 1, ipo: 1 }, { unique: true });

const Portfolio = mongoose.model('Portfolio', portfolioItemSchema);
export default Portfolio;
