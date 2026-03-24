import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LiveTicker from './LiveTicker';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <LiveTicker />
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-surface-border mt-auto">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© 2026 IPOTrack — India's Premium IPO Intelligence Platform</span>
          <span>Built with MERN Stack + WebSockets</span>
        </div>
      </footer>
    </div>
  );
}
