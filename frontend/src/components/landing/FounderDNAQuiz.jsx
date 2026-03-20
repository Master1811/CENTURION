// Founder DNA Quiz Component — Enhanced with Hero look & feel
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Sparkles, Target,
  TrendingUp, CheckCircle, Rocket, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitFounderQuiz } from '@/lib/api/dashboard';
import { formatCrore, CRORE } from '@/lib/engine/constants';

// ─── Brand tokens (matches HeroSection) ──────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  darkCorner2: '#0A0F14',
  midTone:     '#007BA0',
};

// ─── Questions (unchanged) ────────────────────────────────────────────────────
const questions = [
  {
    id: 'revenue_range',
    question: "What's your current monthly revenue?",
    options: [
      { value: 'less-than-1l',   label: 'Less than ₹1 Lakh',  emoji: '🌱' },
      { value: '1l-5l',          label: '₹1 – 5 Lakh',        emoji: '🌿' },
      { value: '5l-20l',         label: '₹5 – 20 Lakh',       emoji: '🌳' },
      { value: '20l-50l',        label: '₹20 – 50 Lakh',      emoji: '🚀' },
      { value: 'more-than-50l',  label: 'More than ₹50 Lakh', emoji: '🎯' },
    ],
  },
  {
    id: 'growth_speed',
    question: "How fast is your revenue growing?",
    options: [
      { value: 'declining',  label: 'Declining',          emoji: '📉' },
      { value: 'flat',       label: 'Flat (0–3%)',         emoji: '➖' },
      { value: 'slow',       label: 'Slow (3–7%)',         emoji: '🐢' },
      { value: 'moderate',   label: 'Moderate (7–12%)',    emoji: '🏃' },
      { value: 'fast',       label: 'Fast (12–20%)',       emoji: '🚀' },
      { value: 'explosive',  label: 'Explosive (20%+)',    emoji: '⚡' },
    ],
  },
  {
    id: 'startup_stage',
    question: "What stage is your startup at?",
    options: [
      { value: 'idea',               label: 'Idea / Pre-product',  emoji: '💡' },
      { value: 'mvp',                label: 'MVP / Early customers',emoji: '🔨' },
      { value: 'early-traction',     label: 'Early traction',       emoji: '📈' },
      { value: 'product-market-fit', label: 'Product-market fit',   emoji: '🎯' },
      { value: 'scaling',            label: 'Scaling',              emoji: '🚀' },
    ],
  },
  {
    id: 'biggest_challenge',
    question: "What's your biggest growth challenge?",
    options: [
      { value: 'acquisition', label: 'Customer acquisition', emoji: '🎣' },
      { value: 'retention',   label: 'Customer retention',  emoji: '🔄' },
      { value: 'pricing',     label: 'Pricing strategy',    emoji: '💰' },
      { value: 'product',     label: 'Product development', emoji: '🛠' },
      { value: 'team',        label: 'Team & hiring',       emoji: '👥' },
      { value: 'funding',     label: 'Fundraising',         emoji: '💵' },
    ],
  },
  {
    id: 'timeline',
    question: "When do you want to reach ₹100 Crore?",
    options: [
      { value: '3-years',  label: '3 years (aggressive)', emoji: '🏎' },
      { value: '5-years',  label: '5 years (ambitious)',  emoji: '🚀' },
      { value: '7-years',  label: '7 years (realistic)',  emoji: '📈' },
      { value: '10-years', label: '10+ years (steady)',   emoji: '🐢' },
    ],
  },
];

// ─── Glassmorphic card shell ──────────────────────────────────────────────────
const GlassCard = ({ children, className = '' }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    style={{
      background: 'rgba(5,15,24,0.72)',
      border: `1px solid rgba(0,191,255,0.18)`,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxShadow: `0 0 0 1px rgba(0,191,255,0.06), 0 24px 64px rgba(0,0,0,0.55), 0 0 80px rgba(0,150,200,0.06)`,
    }}
  >
    {/* inner top sheen */}
    <div
      className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.35), transparent)' }}
    />
    {children}
  </div>
);

// ─── Option button ────────────────────────────────────────────────────────────
const OptionButton = ({ option, selected, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.015 }}
    whileTap={{ scale: 0.985 }}
    className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200"
    style={{
      background: selected
        ? `linear-gradient(135deg, rgba(0,191,255,0.18) 0%, rgba(0,150,200,0.10) 100%)`
        : 'rgba(255,255,255,0.04)',
      border: selected
        ? `1px solid rgba(0,191,255,0.50)`
        : '1px solid rgba(255,255,255,0.08)',
      boxShadow: selected ? `0 0 16px rgba(0,191,255,0.14)` : 'none',
    }}
  >
    <span className="text-xl w-8 text-center">{option.emoji}</span>
    <span
      className="text-sm font-medium flex-1"
      style={{ color: selected ? C.brightCyan2 : 'rgba(255,255,255,0.82)' }}
    >
      {option.label}
    </span>
    {selected && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <CheckCircle className="w-5 h-5" style={{ color: C.brightCyan }} strokeWidth={1.5} />
      </motion.div>
    )}
  </motion.button>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ value }) => (
  <div>
    <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
      <span>Question {Math.ceil((value / 100) * questions.length)} of {questions.length}</span>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${C.tealEdge}, ${C.brightCyan})`,
          boxShadow: `0 0 8px ${C.brightCyan}88`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </div>
  </div>
);

// ─── Results view ─────────────────────────────────────────────────────────────
const ResultsView = ({ result, onRestart }) => (
  <section
    className="py-20 relative overflow-hidden"
    id="founder-dna-quiz"
    data-testid="founder-dna-quiz-results"
    style={{ background: C.darkCorner }}
  >
    {/* bg glow */}
    <div className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `radial-gradient(ellipse 70% 50% at 50% -5%, rgba(0,191,255,0.22) 0%, transparent 60%)` }} />

    <div className="relative z-10 max-w-2xl mx-auto px-4">
      <GlassCard>
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,191,255,0.12)', border: `1px solid rgba(0,191,255,0.30)` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: C.brightCyan }} strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 landing-heading-white-fade">
              Your Founder <span className="italic" style={{ color: C.brightCyan2 }}>DNA</span> Results
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
              Based on your answers, here's your personalized projection
            </p>
          </div>

          {/* Percentile badge */}
          <div className="text-center mb-8">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, ${C.tealEdge}88, ${C.midCyan}55)`,
                border: `1px solid rgba(0,191,255,0.30)`,
                color: C.brightCyan2,
              }}
            >
              <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
              Top {100 - result.benchmark.percentile}% of founders
            </span>
          </div>

          {/* Milestones */}
          <div className="space-y-3 mb-8">
            {result.projection.milestones.map((milestone, i) => {
              const isFinal = i === result.projection.milestones.length - 1;
              return (
                <motion.div
                  key={milestone.value}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: isFinal
                      ? `linear-gradient(135deg, rgba(0,191,255,0.18), rgba(0,150,200,0.10))`
                      : 'rgba(255,255,255,0.05)',
                    border: isFinal
                      ? `1px solid rgba(0,191,255,0.40)`
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isFinal ? `0 0 20px rgba(0,191,255,0.12)` : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5" style={{ color: isFinal ? C.brightCyan : 'rgba(255,255,255,0.5)' }} strokeWidth={1.5} />
                    <span className="font-mono font-bold" style={{ color: isFinal ? C.brightCyan2 : 'rgba(255,255,255,0.85)' }}>
                      {milestone.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm" style={{ color: isFinal ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                      {milestone.monthsToReach} months
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                      ~{Math.ceil(milestone.monthsToReach / 12)} years
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI insight */}
          <div
            className="p-4 rounded-xl mb-8 flex items-start gap-3"
            style={{
              background: 'rgba(0,191,255,0.07)',
              border: `1px solid rgba(0,191,255,0.20)`,
            }}
          >
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.brightCyan2 }} strokeWidth={1.5} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.65 }}>
              {result.insight}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={() => window.location.href = '/tools/100cr-calculator'}
              className="flex-1 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
                color: C.darkCorner,
                boxShadow: `0 0 0 1px rgba(0,191,255,0.3), 0 8px 24px rgba(0,191,255,0.22)`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Detailed Projection
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </motion.button>

            <motion.button
              onClick={onRestart}
              className="h-12 px-6 rounded-xl text-sm font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.65)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.10)', color: '#fff', scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Retake Quiz
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </div>
  </section>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const FounderDNAQuiz = () => {
  const [currentStep,      setCurrentStep]      = useState(0);
  const [answers,          setAnswers]           = useState({});
  const [email,            setEmail]             = useState('');
  const [loading,          setLoading]           = useState(false);
  const [result,           setResult]            = useState(null);
  const [showEmailCapture, setShowEmailCapture]  = useState(false);

  const progress = showEmailCapture ? 100 : ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(s => s + 1);
      } else {
        setShowEmailCapture(true);
      }
    }, 300);
  };

  const handleSubmit = async (captureEmail = false) => {
    setLoading(true);
    try {
      const response = await submitFounderQuiz(answers, captureEmail ? email : null);
      setResult(response);
    } catch {
      setResult({
        projection: {
          milestones: [
            { value: CRORE,        label: '₹1 Crore',   monthsToReach: 8  },
            { value: 10 * CRORE,   label: '₹10 Crore',  monthsToReach: 28 },
            { value: 100 * CRORE,  label: '₹100 Crore', monthsToReach: 58 },
          ],
        },
        benchmark: { percentile: 72, status: 'above-average' },
        insight: "Based on your responses, you're tracking ahead of most founders at your stage. Focus on retention to accelerate your path to ₹100 Crore.",
      });
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (showEmailCapture) setShowEmailCapture(false);
    else if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleRestart = () => {
    setCurrentStep(0); setAnswers({}); setEmail('');
    setResult(null);   setShowEmailCapture(false);
  };

  if (result) return <ResultsView result={result} onRestart={handleRestart} />;

  return (
    <section
      className="relative py-20 overflow-hidden"
      id="founder-dna-quiz"
      data-testid="founder-dna-quiz"
      style={{ background: C.darkCorner }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 65% 45% at 50% -5%, rgba(0,191,255,0.20) 0%, transparent 58%)` }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 40% 35% at 88% 80%, rgba(0,96,128,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 35% 30% at 8%  75%, rgba(0,96,128,0.28) 0%, transparent 50%)
          `,
        }}
      />
      {/* corner vignettes */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 55% at 0% 0%,   rgba(10,15,20,0.88) 0%, transparent 55%),
          radial-gradient(ellipse 50% 55% at 100% 0%, rgba(10,15,20,0.88) 0%, transparent 55%),
          radial-gradient(ellipse 55% 45% at 0% 100%, rgba(5,10,16,0.92)  0%, transparent 55%),
          radial-gradient(ellipse 55% 45% at 100% 100%, rgba(5,10,16,0.92) 0%, transparent 55%)
        `,
      }} />
      {/* dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.14]" style={{
        backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 70% 55% at 50% 25%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 25%, black 30%, transparent 80%)',
      }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4">

        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{
              background: 'rgba(0,191,255,0.10)',
              border: `1px solid rgba(0,191,255,0.28)`,
              color: `${C.brightCyan2}cc`,
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.14em',
            }}
          >
            <Rocket className="w-3 h-3" />
            Free Assessment
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3 landing-heading-white-fade"
          >
            Founder{" "}
            <span className="italic" style={{ color: C.brightCyan2 }}>
              DNA
            </span>{" "}
            Quiz
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '15px' }}>
            Discover when you'll hit ₹100 Crore in 60 seconds
          </p>
        </motion.div>

        {/* Card */}
        <GlassCard>
          <div className="p-8">
            <ProgressBar value={progress} />

            <AnimatePresence mode="wait">
              {/* ── Email capture ── */}
              {showEmailCapture ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0  }}
                  exit={{    opacity: 0, x: -24 }}
                  transition={{ duration: 0.22 }}
                  className="mt-8"
                >
                  <div className="text-center mb-8">
                    <div
                      className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,191,255,0.10)', border: `1px solid rgba(0,191,255,0.25)` }}
                    >
                      <Mail className="w-6 h-6" style={{ color: C.brightCyan }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 landing-heading-white-fade">Almost there!</h3>
                    <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '14px' }}>
                      Enter your email for a personalized projection (optional)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="founder@startup.com"
                      className="w-full h-12 px-4 rounded-xl text-sm focus:outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid rgba(0,191,255,0.22)`,
                        color: '#fff',
                        caretColor: C.brightCyan,
                      }}
                      onFocus={e => { e.target.style.borderColor = `rgba(0,191,255,0.55)`; e.target.style.boxShadow = `0 0 0 3px rgba(0,191,255,0.10)`; }}
                      onBlur={e  => { e.target.style.borderColor = `rgba(0,191,255,0.22)`; e.target.style.boxShadow = 'none'; }}
                    />

                    <motion.button
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                      className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm relative overflow-hidden disabled:opacity-60"
                      style={{
                        background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
                        color: C.darkCorner,
                        boxShadow: `0 0 0 1px rgba(0,191,255,0.3), 0 8px 24px rgba(0,191,255,0.22)`,
                      }}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.97 } : {}}
                    >
                      {loading ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <Sparkles className="w-4 h-4" />
                          </motion.span>
                          Analyzing your DNA…
                        </>
                      ) : (
                        <>
                          Get My Results
                          <ArrowRight className="w-4 h-4" strokeWidth={2} />
                        </>
                      )}
                    </motion.button>

                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={loading}
                      className="w-full h-10 text-sm transition-colors disabled:opacity-50"
                      style={{ color: 'rgba(255,255,255,0.42)' }}
                      onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.80)'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.42)'}
                    >
                      Skip and see results
                    </button>
                  </div>
                </motion.div>

              ) : (
                /* ── Question ── */
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 24  }}
                  animate={{ opacity: 1, x: 0   }}
                  exit={{    opacity: 0, x: -24  }}
                  transition={{ duration: 0.22 }}
                  className="mt-8"
                >
                  <h3 className="text-xl font-bold text-white mb-6">
                    {questions[currentStep].question}
                  </h3>

                  <div className="space-y-2.5">
                    {questions[currentStep].options.map(option => (
                      <OptionButton
                        key={option.value}
                        option={option}
                        selected={answers[questions[currentStep].id] === option.value}
                        onClick={() => handleAnswer(questions[currentStep].id, option.value)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back nav */}
            {(currentStep > 0 || showEmailCapture) && (
              <motion.button
                onClick={handleBack}
                className="mt-7 flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.38)' }}
                onMouseEnter={e => e.currentTarget.style.color = C.brightCyan2}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
                whileHover={{ x: -2 }}
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Back
              </motion.button>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default FounderDNAQuiz;