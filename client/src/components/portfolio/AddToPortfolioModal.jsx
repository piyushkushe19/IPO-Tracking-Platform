import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AddToPortfolioModal({ ipo, onClose, onSuccess }) {
  const [form, setForm] = useState({
    appliedPrice: ipo?.priceBandMax || '',
    lotsApplied: 1,
    applicationId: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const totalInvestment = form.appliedPrice && form.lotsApplied && ipo?.lotSize
    ? form.appliedPrice * form.lotsApplied * ipo.lotSize
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portfolioService.add({
        ipoId: ipo._id,
        appliedPrice: Number(form.appliedPrice),
        lotsApplied: Number(form.lotsApplied),
        applicationId: form.applicationId,
        notes: form.notes,
      });
      toast.success(`${ipo.companyName} added to portfolio`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to add to portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative card w-full max-w-md z-10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <div>
              <h2 className="font-display font-semibold text-white">Track IPO Application</h2>
              <p className="text-sm text-gray-500 mt-0.5">{ipo?.companyName}</p>
            </div>
            <button onClick={onClose} className="btn-ghost p-1.5 text-gray-500 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* IPO info */}
          <div className="px-5 pt-4 pb-2 flex gap-4 bg-surface-hover/40 border-b border-surface-border">
            <InfoPill label="Price Band" value={`₹${ipo?.priceBandMin}–₹${ipo?.priceBandMax}`} />
            <InfoPill label="Lot Size" value={`${ipo?.lotSize} shares`} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Applied Price (₹) *</label>
                <input type="number" required min={ipo?.priceBandMin} max={ipo?.priceBandMax * 1.2}
                  value={form.appliedPrice}
                  onChange={(e) => setForm(f => ({ ...f, appliedPrice: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Lots Applied *</label>
                <input type="number" required min={1} value={form.lotsApplied}
                  onChange={(e) => setForm(f => ({ ...f, lotsApplied: e.target.value }))}
                  className="input-field" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Application ID (optional)</label>
              <input type="text" value={form.applicationId}
                onChange={(e) => setForm(f => ({ ...f, applicationId: e.target.value }))}
                placeholder="e.g. 12345678" className="input-field" />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Notes (optional)</label>
              <textarea rows={2} value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Add any notes..." className="input-field resize-none" />
            </div>

            {/* Total Investment */}
            {totalInvestment > 0 && (
              <div className="bg-surface-hover rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Investment</span>
                <span className="font-mono font-semibold text-white">
                  ₹{totalInvestment.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Adding…' : 'Add to Portfolio'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InfoPill({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
