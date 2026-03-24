import mongoose from 'mongoose';

const ipoSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    sector: {
      type: String,
      required: true,
      index: true,
    },
    priceBandMin: {
      type: Number,
      required: true,
    },
    priceBandMax: {
      type: Number,
      required: true,
    },
    issueSize: {
      type: Number, // in Crores
      required: true,
    },
    lotSize: {
      type: Number,
      required: true,
    },
    openDate: {
      type: Date,
      required: true,
      index: true,
    },
    closeDate: {
      type: Date,
      required: true,
    },
    listingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'open', 'closed', 'listed'],
      default: 'upcoming',
      index: true,
    },
    subscriptionTotal: {
      type: Number,
      default: 0,
    },
    subscriptionQIB: {
      type: Number,
      default: 0,
    },
    subscriptionNII: {
      type: Number,
      default: 0,
    },
    subscriptionRII: {
      type: Number,
      default: 0,
    },
    listingPrice: {
      type: Number,
      default: null,
    },
    listingGain: {
      type: Number,
      default: null,
    },
    currentPrice: {
      type: Number,
      default: null,
    },
    gmp: {
      type: Number, // Grey Market Premium
      default: 0,
    },
    registrar: {
      type: String,
      default: '',
    },
    leadManager: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    financials: {
      revenue: Number,
      profit: Number,
      eps: Number,
      pe: Number,
      roce: Number,
    },
    documents: {
      prospectus: String,
      drhp: String,
    },
    subscriptionHistory: [
      {
        date: Date,
        total: Number,
        qib: Number,
        nii: Number,
        rii: Number,
      },
    ],
    priceHistory: [
      {
        date: Date,
        price: Number,
        volume: Number,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ipoSchema.virtual('priceBand').get(function () {
  return `₹${this.priceBandMin} - ₹${this.priceBandMax}`;
});

ipoSchema.virtual('issueSizeFormatted').get(function () {
  return `₹${this.issueSize} Cr`;
});

ipoSchema.index({ companyName: 'text', sector: 'text', symbol: 'text' });
ipoSchema.index({ status: 1, openDate: -1 });

const IPO = mongoose.model('IPO', ipoSchema);
export default IPO;
