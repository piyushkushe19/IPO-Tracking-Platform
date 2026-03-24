# 🚀 Real-time IPO Tracking Platform

A full-stack MERN application for real-time IPO tracking, modeled after Zerodha/Groww dashboards.
Track IPO listings, live market updates, manage portfolios & watchlists, and visualize key metrics in real-time.

---

## 🎥 Demo

Watch the live demo of the IPO Tracking Platform below:
<iframe 
  width="800" 
  height="450" 
  src="https://www.youtube.com/embed/4qx0SzIg_Rw?autoplay=1" 
  title="IPO Tracking Platform Demo" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen>
</iframe>
---

## 🏗️ Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend      | Node.js, Express.js (ESM)              |
| Database     | MongoDB + Mongoose                     |
| Auth         | JWT + bcrypt                           |
| Real-time    | WebSockets (ws library)                |
| State        | Zustand (with persistence)             |
| Logging      | Winston                                |
| Security     | Helmet, express-rate-limit, CORS, validation |

---

## 📁 Project Structure

```
ipo-platform/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── charts/        # Recharts visualizations
│   │   │   ├── common/        # Navbar, Layout, Skeleton, Ticker
│   │   │   ├── dashboard/     # StatCard, MarketOverview
│   │   │   ├── ipo/           # IPOCard, IPOTable, IPOFilters
│   │   │   └── portfolio/     # AddToPortfolioModal
│   │   ├── hooks/             # useIPOs, useWebSocket, useAuthStore
│   │   ├── pages/             # Dashboard, Listings, Detail, Portfolio, Watchlist
│   │   ├── services/          # api.js (axios), websocket.js
│   │   └── utils/             # helpers.js (formatters, constants)
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                    # Node.js + Express backend
    ├── config/                # database.js
    ├── controllers/           # authController, ipoController, portfolioController
    ├── middleware/            # auth.js, errorHandler.js
    ├── models/                # User, IPO, Portfolio
    ├── routes/                # auth.js, ipos.js, portfolio.js
    ├── utils/                 # logger.js, seed.js
    └── index.js               # Main server + WebSocket
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all

# OR manually:
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ipo_platform
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- **50 realistic IPO entries** across all statuses (open, upcoming, closed, listed)
- **Admin user**: `admin@ipotrack.com` / `Admin@1234`
- **Demo user**: `demo@ipotrack.com` / `Demo@1234`

### 4. Run Development Servers

```bash
# From root (runs both concurrently)
npm run dev

# OR separately:
cd server && npm run dev    # → http://localhost:5000
cd client && npm run dev   # → http://localhost:5173
```

### 5. Open in Browser

```
http://localhost:5173
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint              | Auth | Description         |
|--------|-----------------------|------|---------------------|
| POST   | `/api/auth/register`  | ❌   | Register new user   |
| POST   | `/api/auth/login`     | ❌   | Login               |
| POST   | `/api/auth/logout`    | ❌   | Logout              |
| GET    | `/api/auth/me`        | ✅   | Get current user    |
| PATCH  | `/api/auth/profile`   | ✅   | Update profile      |

### IPOs
| Method | Endpoint                      | Auth  | Description              |
|--------|-------------------------------|-------|--------------------------|
| GET    | `/api/ipos`                   | ❌    | List with filters/paging |
| GET    | `/api/ipos/:id`               | ❌    | IPO detail               |
| GET    | `/api/ipos/stats`             | ❌    | Market stats             |
| GET    | `/api/ipos/market-overview`   | ❌    | Dashboard overview       |
| GET    | `/api/ipos/live-updates`      | ❌    | Polled live data         |
| POST   | `/api/ipos/:ipoId/watchlist`  | ✅    | Toggle watchlist         |
| POST   | `/api/ipos`                   | Admin | Create IPO               |
| PATCH  | `/api/ipos/:id`               | Admin | Update IPO               |

**Query params for GET /api/ipos:**
```
?page=1&limit=20&status=open&sector=Technology&search=tech
&minPrice=100&maxPrice=500&sortBy=openDate&sortOrder=desc
```

### Portfolio
| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| GET    | `/api/portfolio`      | ✅   | User's portfolio      |
| GET    | `/api/portfolio/stats`| ✅   | Portfolio analytics   |
| POST   | `/api/portfolio`      | ✅   | Add IPO to portfolio  |
| PATCH  | `/api/portfolio/:id`  | ✅   | Update portfolio item |
| DELETE | `/api/portfolio/:id`  | ✅   | Remove from portfolio |

### WebSocket
Connect to `ws://localhost:5000/ws`

**Messages received:**
```json
{ "type": "connected", "message": "Real-time updates active" }
{ "type": "live_update", "data": [...ipos], "timestamp": "..." }
```

---

## 🎨 Features

### ✅ Implemented
- **JWT Authentication** — Register, Login, Logout, Protected routes
- **IPO Dashboard** — Live stats, market overview, sector charts
- **IPO Listings** — Card + Table toggle, Search, Multi-filter, Sort, Pagination
- **IPO Detail** — Full data, subscription breakdown charts, financials, GMP
- **Portfolio Tracker** — Add/remove IPOs, P&L tracking, application status, analytics
- **Watchlist** — Star any IPO, manage from dedicated page
- **Live Ticker** — Scrolling real-time data strip
- **WebSocket Updates** — Market pulse every 5 seconds
- **Dark Theme** — Zerodha-inspired dark fintech aesthetic
- **Skeleton Loaders** — On all async data states
- **Lazy Loading** — Route-level and chart-level code splitting
- **Rate Limiting** — 100 req/15min global, 10 req/15min for auth
- **Error Handling** — Centralized middleware, structured logging (Winston)
- **In-memory Cache** — 60s TTL on IPO list endpoints
- **Debounced Search** — 400ms debounce on search input

---

## 🔐 Security Checklist

- [x] JWT stored in httpOnly cookie + localStorage fallback
- [x] bcrypt password hashing (12 rounds)
- [x] Helmet HTTP headers
- [x] CORS with origin whitelist
- [x] Rate limiting per route
- [x] Input validation (express-validator)
- [x] Mongoose injection prevention (typed schemas)
- [x] Payload size limit (10kb)

---

## 🚢 Production Deployment

```bash
# Build frontend
npm run build   # outputs client/dist/

# Set environment
NODE_ENV=production

# Serve with PM2
npm install -g pm2
pm2 start server/index.js --name ipo-platform
```

For MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string.

---

## 📊 Sample IPO Data Format

```json
{
  "companyName": "TechNova Solutions",
  "symbol": "TECHNOVA",
  "sector": "Technology",
  "priceBandMin": 240,
  "priceBandMax": 260,
  "issueSize": 850,
  "lotSize": 50,
  "openDate": "2026-04-01",
  "closeDate": "2026-04-03",
  "listingDate": "2026-04-10",
  "status": "upcoming",
  "subscriptionTotal": 0,
  "gmp": 45,
  "financials": {
    "revenue": 2400,
    "profit": 320,
    "eps": 18.5,
    "pe": 28.4,
    "roce": 22.1
  }
}
```
