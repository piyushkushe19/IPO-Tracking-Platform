import { motion } from 'framer-motion';

export default function StatCard({ label, value, subValue, subClass = '', icon, color = '#1ea3a8', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: `${color}18` }}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-1">
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        {subValue && (
          <p className={`text-xs mt-1 ${subClass || 'text-gray-500'}`}>{subValue}</p>
        )}
      </div>
    </motion.div>
  );
}
