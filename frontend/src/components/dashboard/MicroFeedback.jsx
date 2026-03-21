// MicroFeedback - Lightweight feedback collection component
// Quick thumbs up/down for features with optional text feedback

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, X, Send, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan: '#00BFFF',
  midCyan: '#0099CC',
};

export const MicroFeedback = ({ 
  featureId, 
  question = "Was this helpful?",
  onSubmit,
  variant = 'inline' // 'inline' | 'card' | 'minimal'
}) => {
  const [state, setState] = useState('idle'); // idle | positive | negative | submitted
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const handleFeedback = (isPositive) => {
    setState(isPositive ? 'positive' : 'negative');
    
    // For negative feedback, show comment box
    if (!isPositive) {
      setShowComment(true);
    } else {
      // Positive feedback - submit immediately
      submitFeedback(isPositive, '');
    }
  };

  const submitFeedback = (isPositive, feedbackComment) => {
    const data = {
      featureId,
      isPositive,
      comment: feedbackComment,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    };
    
    // Store locally for now (email-only approach per user's preference)
    const existing = JSON.parse(localStorage.getItem('centurion_feedback') || '[]');
    existing.push(data);
    localStorage.setItem('centurion_feedback', JSON.stringify(existing));
    
    if (onSubmit) {
      onSubmit(data);
    }
    
    setState('submitted');
    setTimeout(() => {
      setState('idle');
      setShowComment(false);
      setComment('');
    }, 3000);
  };

  const handleCommentSubmit = () => {
    submitFeedback(state === 'positive', comment);
  };

  if (variant === 'minimal') {
    return (
      <div className="inline-flex items-center gap-2">
        <AnimatePresence mode="wait">
          {state === 'submitted' ? (
            <motion.span
              key="thanks"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-green-400 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" /> Thanks!
            </motion.span>
          ) : (
            <motion.div
              key="buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <button
                onClick={() => handleFeedback(true)}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  state === 'positive' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'hover:bg-white/10 text-white/40 hover:text-white/70'
                )}
              >
                <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  state === 'negative' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'hover:bg-white/10 text-white/40 hover:text-white/70'
                )}
              >
                <ThumbsDown className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'rounded-xl overflow-hidden transition-all',
        variant === 'card' && 'p-4',
      )}
      style={{
        background: variant === 'card' ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: variant === 'card' ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <AnimatePresence mode="wait">
        {state === 'submitted' ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-green-400"
          >
            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm">Thanks for your feedback!</span>
          </motion.div>
        ) : showComment ? (
          <motion.div
            key="comment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">What could be better?</span>
              <button
                onClick={() => { setShowComment(false); setState('idle'); }}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/40" strokeWidth={1.5} />
              </button>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your feedback helps us improve..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => submitFeedback(false, '')}
                className="text-xs text-white/50 hover:text-white/70 px-3 py-1.5"
              >
                Skip
              </button>
              <motion.button
                onClick={handleCommentSubmit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: `${C.brightCyan}15`,
                  border: `1px solid ${C.brightCyan}30`,
                  color: C.brightCyan,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-3 h-3" strokeWidth={1.5} />
                Send
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {question}
            </span>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => handleFeedback(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: 'rgba(34,197,94,0.10)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#22C55E',
                }}
                whileHover={{ background: 'rgba(34,197,94,0.20)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                Yes
              </motion.button>
              <motion.button
                onClick={() => handleFeedback(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#EF4444',
                }}
                whileHover={{ background: 'rgba(239,68,68,0.20)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ThumbsDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                No
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MicroFeedback;
