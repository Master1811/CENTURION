// Monthly Check-in Modal Component
// =================================
// Modal for submitting monthly revenue check-ins

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { submitCheckIn } from '@/lib/api/dashboard';
import { formatCrore, LAKH } from '@/lib/engine/constants';

export const CheckInModal = ({ isOpen, onClose, onSuccess }) => {
  const { getAccessToken } = useAuth();
  const [revenue, setRevenue] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const [month, setMonth] = useState(getCurrentMonth());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!revenue) return;

    setLoading(true);
    setError('');

    try {
      const token = getAccessToken();
      const result = await submitCheckIn(token, {
        month,
        actual_revenue: parseFloat(revenue),
        note: note || null,
        source: 'manual',
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(result);
        onClose();
        // Reset form
        setRevenue('');
        setNote('');
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  // Generate last 12 months for dropdown
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center glass-backdrop p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md glass-modal overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-[#71717A]" strokeWidth={1.5} />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#F4F4F5]">
                <Calendar className="w-5 h-5 text-[#09090B]" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-[#09090B]">Monthly Check-in</h2>
            </div>
            <p className="text-sm text-[#71717A]">
              Record your actual revenue for the month
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-[#09090B] mb-2">Check-in Recorded!</h3>
                <p className="text-sm text-[#71717A]">Your revenue has been saved.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Month Selector */}
                <div>
                  <label className="text-sm font-medium text-[#09090B] mb-1.5 block">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] bg-white"
                    disabled={loading}
                  >
                    {getMonthOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Revenue Input */}
                <div>
                  <label className="text-sm font-medium text-[#09090B] mb-1.5 block">
                    Actual Revenue (MRR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]">₹</span>
                    <input
                      type="number"
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
                      placeholder="420000"
                      required
                      disabled={loading}
                      className="w-full h-11 pl-7 pr-16 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] font-mono disabled:opacity-50"
                    />
                    {revenue && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71717A]">
                        {formatCrore(parseFloat(revenue))}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Enter your Monthly Recurring Revenue
                  </p>
                </div>

                {/* Note Input */}
                <div>
                  <label className="text-sm font-medium text-[#09090B] mb-1.5 block">
                    Notes (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What contributed to this month's performance?"
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] resize-none disabled:opacity-50"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !revenue}
                  className={cn(
                    'w-full h-11 rounded-xl',
                    'bg-[#09090B] text-white text-sm font-medium',
                    'flex items-center justify-center gap-2',
                    'hover:bg-[#18181B] transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                      </motion.div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                      Submit Check-in
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckInModal;
