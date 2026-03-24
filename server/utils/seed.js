import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import IPO from '../models/IPO.js';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const sectors = ['Technology', 'Finance', 'Healthcare', 'Consumer Goods', 'Energy', 'Manufacturing', 'Real Estate', 'Retail', 'Telecom', 'Infrastructure'];
const registrars = ['Link Intime', 'KFin Technologies', 'MUFG Intime', 'Bigshare Services', 'Cameo Corporate'];
const leadManagers = ['Kotak Mahindra', 'ICICI Securities', 'Axis Capital', 'SBI Capital', 'HDFC Bank', 'JM Financial'];

const generateIPOs = () => {
  const ipos = [];
  const now = new Date();

  const companies = [
    { name: 'TechNova Solutions', symbol: 'TECHNOVA', sector: 'Technology' },
    { name: 'FinanceEdge Capital', symbol: 'FINEDGE', sector: 'Finance' },
    { name: 'MedCore Diagnostics', symbol: 'MEDCORE', sector: 'Healthcare' },
    { name: 'GreenPower Energy', symbol: 'GRNPWR', sector: 'Energy' },
    { name: 'RetailSmart India', symbol: 'RSMRT', sector: 'Retail' },
    { name: 'BuildCon Infrastructure', symbol: 'BLDCON', sector: 'Infrastructure' },
    { name: 'DataSpark Analytics', symbol: 'DSPRK', sector: 'Technology' },
    { name: 'HealthFirst Pharma', symbol: 'HLTFST', sector: 'Healthcare' },
    { name: 'CloudMatrix Systems', symbol: 'CLDMTX', sector: 'Technology' },
    { name: 'BankPro Financial', symbol: 'BNKPRO', sector: 'Finance' },
    { name: 'EcoSmart Packaging', symbol: 'ECOSMT', sector: 'Manufacturing' },
    { name: 'PropTech Realty', symbol: 'PRPTEK', sector: 'Real Estate' },
    { name: 'FastCommerce Hub', symbol: 'FSTCOM', sector: 'Consumer Goods' },
    { name: 'TeleLink Networks', symbol: 'TLLNK', sector: 'Telecom' },
    { name: 'AutoDrive Tech', symbol: 'ADRTK', sector: 'Technology' },
    { name: 'BioLife Sciences', symbol: 'BIOLFE', sector: 'Healthcare' },
    { name: 'SteelCore Industries', symbol: 'STLCR', sector: 'Manufacturing' },
    { name: 'UrbanEstate Developers', symbol: 'URBEST', sector: 'Real Estate' },
    { name: 'PayQuick Fintech', symbol: 'PYQCK', sector: 'Finance' },
    { name: 'AgroFresh Commodities', symbol: 'AGRFRSH', sector: 'Consumer Goods' },
    { name: 'CyberShield Security', symbol: 'CYBSHD', sector: 'Technology' },
    { name: 'NanoMed Therapeutics', symbol: 'NANMD', sector: 'Healthcare' },
    { name: 'RenewSolar Energy', symbol: 'RNWSLR', sector: 'Energy' },
    { name: 'LogiTrack Solutions', symbol: 'LGTRK', sector: 'Infrastructure' },
    { name: 'BrandKart Commerce', symbol: 'BRDKRT', sector: 'Retail' },
    { name: 'InfoSec Platforms', symbol: 'INFSC', sector: 'Technology' },
    { name: 'CreditPrime NBFC', symbol: 'CRDPME', sector: 'Finance' },
    { name: 'WellCure Hospitals', symbol: 'WLCURE', sector: 'Healthcare' },
    { name: 'WindGen Power', symbol: 'WNDGN', sector: 'Energy' },
    { name: 'QuickBuild Infra', symbol: 'QKBLD', sector: 'Infrastructure' },
    { name: 'FreshMart Retail', symbol: 'FRSHMT', sector: 'Retail' },
    { name: 'DevOps Cloud', symbol: 'DVOPS', sector: 'Technology' },
    { name: 'TrustBank Capital', symbol: 'TRSTBK', sector: 'Finance' },
    { name: 'GenoCure Biotech', symbol: 'GNCURE', sector: 'Healthcare' },
    { name: 'HydroMax Energy', symbol: 'HYDRMX', sector: 'Energy' },
    { name: 'MegaMall Retail', symbol: 'MGMLL', sector: 'Retail' },
    { name: 'RoboFactory Automation', symbol: 'ROBFCT', sector: 'Manufacturing' },
    { name: 'SmartCity Developers', symbol: 'SMTCTY', sector: 'Real Estate' },
    { name: 'ZeroLatency Networks', symbol: 'ZRLTNC', sector: 'Telecom' },
    { name: 'PixelVision AI', symbol: 'PXLVSN', sector: 'Technology' },
    { name: 'MicroLend Finance', symbol: 'MCRLND', sector: 'Finance' },
    { name: 'PharmaQuest Labs', symbol: 'PRMQST', sector: 'Healthcare' },
    { name: 'SunFarm Agro Energy', symbol: 'SNFRM', sector: 'Energy' },
    { name: 'TurboFreight Logistics', symbol: 'TRBFRT', sector: 'Infrastructure' },
    { name: 'GlamShop Beauty', symbol: 'GLMSHP', sector: 'Consumer Goods' },
    { name: 'CodeCraft Software', symbol: 'CDCRFT', sector: 'Technology' },
    { name: 'AssetGrow Wealth', symbol: 'ASTGRW', sector: 'Finance' },
    { name: 'LifeScope Medical', symbol: 'LFSCPE', sector: 'Healthcare' },
    { name: 'CleanFuel Solutions', symbol: 'CLNFL', sector: 'Energy' },
    { name: 'NexGen Materials', symbol: 'NXTGN', sector: 'Manufacturing' },
  ];

  const statusTimeline = [
    { status: 'listed', daysOffset: -60 },
    { status: 'listed', daysOffset: -45 },
    { status: 'listed', daysOffset: -30 },
    { status: 'listed', daysOffset: -20 },
    { status: 'listed', daysOffset: -15 },
    { status: 'closed', daysOffset: -5 },
    { status: 'closed', daysOffset: -3 },
    { status: 'open', daysOffset: 0 },
    { status: 'open', daysOffset: 0 },
    { status: 'upcoming', daysOffset: 7 },
    { status: 'upcoming', daysOffset: 14 },
    { status: 'upcoming', daysOffset: 21 },
  ];

  companies.forEach((company, idx) => {
    const timeline = statusTimeline[idx % statusTimeline.length];
    const openDate = new Date(now.getTime() + timeline.daysOffset * 24 * 60 * 60 * 1000);
    const closeDate = new Date(openDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const listingDate = new Date(closeDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const minPrice = Math.floor(Math.random() * 400 + 100);
    const maxPrice = minPrice + Math.floor(Math.random() * 50 + 10);
    const issueSize = Math.floor(Math.random() * 2000 + 100);
    const subscriptionTotal = timeline.status === 'upcoming' ? 0 : parseFloat((Math.random() * 80 + 0.5).toFixed(2));
    const listingGain = timeline.status === 'listed' ? parseFloat(((Math.random() - 0.3) * 60).toFixed(2)) : null;
    const listingPrice = timeline.status === 'listed' ? parseFloat((maxPrice * (1 + listingGain / 100)).toFixed(2)) : null;

    // Generate subscription history
    const subscriptionHistory = [];
    if (subscriptionTotal > 0) {
      for (let d = 0; d < 3; d++) {
        const dayDate = new Date(openDate.getTime() + d * 24 * 60 * 60 * 1000);
        const dayRatio = (d + 1) / 3;
        subscriptionHistory.push({
          date: dayDate,
          total: parseFloat((subscriptionTotal * dayRatio * (0.8 + Math.random() * 0.2)).toFixed(2)),
          qib: parseFloat((subscriptionTotal * dayRatio * 1.2 * Math.random()).toFixed(2)),
          nii: parseFloat((subscriptionTotal * dayRatio * 0.9 * Math.random()).toFixed(2)),
          rii: parseFloat((subscriptionTotal * dayRatio * 0.6 * Math.random()).toFixed(2)),
        });
      }
    }

    ipos.push({
      companyName: company.name,
      symbol: company.symbol,
      sector: company.sector,
      priceBandMin: minPrice,
      priceBandMax: maxPrice,
      issueSize,
      lotSize: Math.floor(Math.random() * 100 + 10) * 10,
      openDate,
      closeDate,
      listingDate,
      status: timeline.status,
      subscriptionTotal,
      subscriptionQIB: parseFloat((subscriptionTotal * (0.8 + Math.random() * 0.8)).toFixed(2)),
      subscriptionNII: parseFloat((subscriptionTotal * (0.4 + Math.random() * 0.6)).toFixed(2)),
      subscriptionRII: parseFloat((subscriptionTotal * (0.2 + Math.random() * 0.5)).toFixed(2)),
      listingPrice,
      listingGain,
      currentPrice: listingPrice ? parseFloat((listingPrice * (1 + (Math.random() - 0.4) * 0.1)).toFixed(2)) : null,
      gmp: Math.floor(Math.random() * 80 - 10),
      registrar: registrars[idx % registrars.length],
      leadManager: leadManagers[idx % leadManagers.length],
      description: `${company.name} is a leading ${company.sector.toLowerCase()} company offering innovative solutions to its customers. The IPO proceeds will be used for expansion and working capital requirements.`,
      financials: {
        revenue: Math.floor(Math.random() * 5000 + 500),
        profit: Math.floor(Math.random() * 500 + 50),
        eps: parseFloat((Math.random() * 30 + 5).toFixed(2)),
        pe: parseFloat((Math.random() * 40 + 15).toFixed(2)),
        roce: parseFloat((Math.random() * 25 + 10).toFixed(2)),
      },
      subscriptionHistory,
      isActive: true,
    });
  });

  return ipos;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await IPO.deleteMany({});
    await User.deleteMany({ email: 'admin@ipotrack.com' });

    const ipos = generateIPOs();
    await IPO.insertMany(ipos);
    console.log(`✅ Seeded ${ipos.length} IPOs`);

    await User.create({
      name: 'Admin User',
      email: 'admin@ipotrack.com',
      password: 'Admin@1234',
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@ipotrack.com / Admin@1234');

    await User.create({
      name: 'Demo User',
      email: 'demo@ipotrack.com',
      password: 'Demo@1234',
      role: 'user',
    });
    console.log('✅ Demo user created: demo@ipotrack.com / Demo@1234');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seedDB();
