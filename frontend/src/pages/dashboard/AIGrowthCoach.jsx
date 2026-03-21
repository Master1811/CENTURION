// AI Growth Coach Dashboard - Light theme with #00BFFF cyan accents
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Sun, Brain, AlertTriangle,
  RefreshCw, Loader2, ChevronDown, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { useAuth } from '@/context/AuthContext';
import { getDailyPulse, getWeeklyQuestion } from '@/lib/api/dashboard';

// ─── Cyan accent tokens ────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  cyanBg:      'rgba(0,191,255,0.06)',
  cyanBorder:  'rgba(0,191,255,0.20)',
};

// ─── Fallback data ─────────────────────────────────────────────────────────────
const fallbackPulse = {
  greeting: "Good morning! Here's your startup pulse for today.",
  highlights: [
    { type: 'positive', text: 'Revenue is tracking 15% ahead of baseline' },
    { type: 'neutral',  text: '3 new signups yesterday, 1 churned customer' },
    { type: 'action',   text: 'Consider reaching out to high-value customers for testimonials' },
  ],
  timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
};

const fallbackQuestion = {
  question: "What's the biggest obstacle preventing you from doubling your growth rate this quarter?",
  hint:     "Think about: sales cycle length, marketing channels, pricing, product gaps, or team capacity.",
  date:     new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }),
};

const deviationAlerts = [
  {
    id: 1, metric: 'Churn Rate', expected: '5%', actual: '7.2%', deviation: '+44%', severity: 'high',
    insight: 'Churn increased significantly this month. Review recent cancellations for common themes.',
  },
];

const coachingHistory = [
  { date: 'Jan 2025', summary: 'Focus areas: Reduce churn, improve onboarding. Action taken: Added email sequence.' },
  { date: 'Dec 2024', summary: 'Highlighted pricing opportunity. Result: Raised prices 20%, no churn impact.' },
  { date: 'Nov 2024', summary: 'Suggested targeting enterprise segment. Started conversations with 3 leads.' },
];

// ─── Highlight pill ───────────────────────────────────────────────────────────
const HighlightPill = ({ type, text, index }) => {
  const config = {
    positive: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.20)', dot: '#10B981', textColor: '#065F46' },
    neutral:  { bg: '#F9FAFB',               border: 'rgba(0,0,0,0.07)',       dot: '#9CA3AF', textColor: '#374151' },
    action:   { bg: C.cyanBg,                border: C.cyanBorder,             dot: C.midCyan,  textColor: C.tealEdge },
  };
  const { bg, border, dot, textColor } = config[type] || config.neutral;

  return (
    <motion.div
      className="flex items-start gap-3 p-3.5 rounded-xl"
      style={{ background: bg, border: `1px solid ${border}` }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.10 }}
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: dot }} />
      <span className="text-sm leading-relaxed" style={{ color: textColor }}>{text}</span>
    </motion.div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Card = ({ children, className = '', style = {} }) => (
  <div
    className={cn('rounded-2xl bg-white border border-[rgba(0,0,0,0.06)] overflow-hidden', className)}
    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)', ...style }}
  >
    {children}
  </div>
);

// ─── Section icon ─────────────────────────────────────────────────────────────
const SectionIcon = ({ icon: Icon, accentColor = C.midCyan }) => (
  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
    style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}28` }}>
    <Icon className="w-5 h-5" style={{ color: accentColor }} strokeWidth={1.5} />
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const AIGrowthCoach = () => {
  const { getAccessToken } = useAuth();
  const [expandedAlert,   setExpandedAlert]   = useState(null);
  const [dailyPulse,      setDailyPulse]      = useState(fallbackPulse);
  const [weeklyQuestion,  setWeeklyQuestion]  = useState(fallbackQuestion);
  const [loadingPulse,    setLoadingPulse]    = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [reflection,      setReflection]      = useState('');
  const [submitted,       setSubmitted]       = useState(false);

  const loadPulse = async () => {
    try {
      setLoadingPulse(true);
      const token = getAccessToken();
      if (token) {
        const res = await getDailyPulse(token);
        setDailyPulse({
          greeting: res.greeting || fallbackPulse.greeting,
          highlights: res.insights?.map((text, i) => ({
            type: i === 0 ? 'positive' : i === res.insights.length - 1 ? 'action' : 'neutral', text,
          })) || fallbackPulse.highlights,
          timestamp: res.generated_at || fallbackPulse.timestamp,
        });
      }
    } catch { /* use fallback */ }
    finally { setLoadingPulse(false); }
  };

  const loadQuestion = async () => {
    try {
      setLoadingQuestion(true);
      const token = getAccessToken();
      if (token) {
        const res = await getWeeklyQuestion(token);
        setWeeklyQuestion({
          question: res.question || fallbackQuestion.question,
          hint: res.hint || fallbackQuestion.hint,
          date: res.week_of || fallbackQuestion.date,
        });
      }
    } catch { /* use fallback */ }
    finally { setLoadingQuestion(false); }
  };

  useEffect(() => { loadPulse(); loadQuestion(); }, []);

  return (
    <div className="min-h-full" style={{ background: '#FAFAFA' }} data-testid="ai-growth-coach">
      <div className="space-y-6 p-6 md:p-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="flex items-center gap-3 mb-1">
            <SectionIcon icon={Sparkles} accentColor={C.midCyan} />
            <h1 className="text-2xl md:text-3xl font-bold text-[#09090B]">
              {copy.dashboard.aiCoach.title}
            </h1>
          </div>
          <p className="text-sm text-[#71717A] ml-[52px]">{copy.dashboard.aiCoach.subtitle}</p>
        </motion.div>

        {/* ── Daily Pulse ── amber-accented, white card ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
          <Card>
            {/* Amber top stripe */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <SectionIcon icon={Sun} accentColor='#F59E0B' />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#09090B]">{copy.dashboard.aiCoach.dailyPulse}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#A1A1AA]">{dailyPulse.timestamp}</span>
                      <motion.button
                        onClick={loadPulse}
                        disabled={loadingPulse}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: '#F9FAFB', border: '1px solid rgba(0,0,0,0.07)' }}
                        whileHover={{ background: '#F4F4F5' }}
                        whileTap={{ scale: 0.94 }}
                      >
                        <RefreshCw className={cn('w-3.5 h-3.5 text-[#71717A]', loadingPulse && 'animate-spin')} strokeWidth={1.5} />
                      </motion.button>
                    </div>
                  </div>

                  {loadingPulse ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#F59E0B' }} strokeWidth={1.5} />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-[#52525B] mb-4 leading-relaxed">{dailyPulse.greeting}</p>
                      <div className="space-y-2.5">
                        {dailyPulse.highlights.map((item, i) => (
                          <HighlightPill key={i} type={item.type} text={item.text} index={i} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Weekly Question — cyan gradient on white, NOT dark ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f0faff 55%, #e0f5ff 100%)',
              border: `1px solid ${C.cyanBorder}`,
              boxShadow: `0 0 0 1px rgba(0,191,255,0.04), 0 8px 32px rgba(0,191,255,0.10)`,
            }}
          >
            {/* Cyan top stripe */}
            <div className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${C.tealEdge}, ${C.brightCyan})` }} />
            {/* Top inner glow */}
            <div className="absolute inset-x-0 top-0 h-20 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(0,191,255,0.08) 0%, transparent 70%)' }} />

            <div className="relative z-10 p-6">
              <div className="flex items-start gap-4">
                <SectionIcon icon={Brain} accentColor={C.midCyan} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#09090B]">{copy.dashboard.aiCoach.weeklyQuestion}</h3>
                    <span className="text-xs text-[#A1A1AA]">{weeklyQuestion.date}</span>
                  </div>

                  {loadingQuestion ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.midCyan }} strokeWidth={1.5} />
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-[#09090B] mb-2 leading-snug">
                        {weeklyQuestion.question}
                      </p>
                      <p className="text-sm text-[#71717A] mb-5 leading-relaxed">{weeklyQuestion.hint}</p>

                      {submitted ? (
                        <motion.div
                          className="p-4 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', color: '#065F46' }}
                          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        >
                          ✓ Reflection submitted — see you next week!
                        </motion.div>
                      ) : (
                        <>
                          <textarea
                            value={reflection}
                            onChange={e => setReflection(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full h-24 p-4 rounded-xl text-sm resize-none focus:outline-none transition-all"
                            style={{
                              background: '#fff',
                              border: '1px solid rgba(0,191,255,0.22)',
                              color: '#09090B',
                              caretColor: C.midCyan,
                            }}
                            onFocus={e => { e.target.style.borderColor = 'rgba(0,191,255,0.45)'; e.target.style.boxShadow = `0 0 0 3px rgba(0,191,255,0.08)`; }}
                            onBlur={e  => { e.target.style.borderColor = 'rgba(0,191,255,0.22)'; e.target.style.boxShadow = 'none'; }}
                          />
                          <motion.button
                            onClick={() => { if (reflection.trim()) setSubmitted(true); }}
                            disabled={!reflection.trim()}
                            className="mt-3 h-10 px-6 rounded-xl text-sm font-semibold flex items-center gap-2 relative overflow-hidden"
                            style={{
                              background: reflection.trim()
                                ? `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`
                                : '#F4F4F5',
                              color: reflection.trim() ? '#050A10' : '#A1A1AA',
                              boxShadow: reflection.trim() ? `0 0 0 1px rgba(0,191,255,0.30), 0 4px 14px rgba(0,191,255,0.20)` : 'none',
                            }}
                            whileHover={reflection.trim() ? { scale: 1.02 } : {}}
                            whileTap={reflection.trim() ? { scale: 0.97 } : {}}
                          >
                            {reflection.trim() && (
                              <motion.span className="absolute inset-0 pointer-events-none"
                                style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.24) 50%, transparent 65%)', backgroundSize: '200% 100%' }}
                                animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                              Submit reflection
                              <ArrowRight className="w-4 h-4" strokeWidth={2} />
                            </span>
                          </motion.button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Deviation alerts — red accent on white ── */}
        {deviationAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <Card>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #EF4444, #F87171)' }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <SectionIcon icon={AlertTriangle} accentColor='#EF4444' />
                  <h3 className="font-semibold text-[#09090B]">{copy.dashboard.aiCoach.deviationAlerts}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)', color: '#EF4444' }}>
                    {deviationAlerts.length} alert{deviationAlerts.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-3">
                  {deviationAlerts.map((alert) => (
                    <div key={alert.id}>
                      <motion.div
                        className="p-4 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: 'rgba(239,68,68,0.05)',
                          border: `1px solid rgba(239,68,68,${expandedAlert === alert.id ? '0.28' : '0.14'})`,
                        }}
                        onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                        whileHover={{ background: 'rgba(239,68,68,0.08)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#09090B]">{alert.metric}</span>
                            <span className="text-xs text-[#71717A]">Expected {alert.expected}, Actual {alert.actual}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold" style={{ color: '#EF4444' }}>{alert.deviation}</span>
                            <motion.div animate={{ rotate: expandedAlert === alert.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                      <AnimatePresence>
                        {expandedAlert === alert.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="px-4 pb-3 pt-3 text-sm text-[#52525B] leading-relaxed"
                              style={{ borderLeft: '2px solid rgba(239,68,68,0.30)', marginLeft: '4px' }}>
                              {alert.insight}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Coaching history ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Card>
            {/* Cyan left-edge accent via top stripe */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${C.tealEdge}, ${C.brightCyan2})` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <SectionIcon icon={Sparkles} accentColor={C.midCyan} />
                <h3 className="font-semibold text-[#09090B]">{copy.dashboard.aiCoach.coachingSummary}</h3>
              </div>
              <div className="space-y-0">
                {coachingHistory.map((item, i) => (
                  <motion.div key={i}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.32 + i * 0.08 }}
                  >
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${C.brightCyan}, ${C.tealEdge})` }} />
                      {i < coachingHistory.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: C.cyanBorder, minHeight: 28 }} />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className="text-xs font-semibold mb-1" style={{ color: C.midCyan }}>{item.date}</p>
                      <p className="text-sm text-[#52525B] leading-relaxed">{item.summary}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default AIGrowthCoach;