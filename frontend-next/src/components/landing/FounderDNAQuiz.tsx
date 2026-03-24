'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useJoinWaitlist } from '@/hooks/useApi';
import { toast } from 'sonner';

const questions = [
  {
    id: 'revenue_range',
    question: "What's your current monthly revenue?",
    options: [
      { value: 'less-than-1l', label: 'Less than ₹1 Lakh', emoji: '🌱' },
      { value: '1l-5l', label: '₹1 – 5 Lakh', emoji: '🌿' },
      { value: '5l-20l', label: '₹5 – 20 Lakh', emoji: '🌳' },
      { value: '20l-50l', label: '₹20 – 50 Lakh', emoji: '🚀' },
      { value: 'more-than-50l', label: 'More than ₹50 Lakh', emoji: '🎯' },
    ],
  },
  {
    id: 'growth_speed',
    question: "How fast is your revenue growing?",
    options: [
      { value: 'declining', label: 'Declining', emoji: '📉' },
      { value: 'flat', label: 'Flat (0–3%)', emoji: '➖' },
      { value: 'slow', label: 'Slow (3–7%)', emoji: '🐢' },
      { value: 'moderate', label: 'Moderate (7–12%)', emoji: '🏃' },
      { value: 'fast', label: 'Fast (12–20%)', emoji: '🚀' },
      { value: 'explosive', label: 'Explosive (20%+)', emoji: '⚡' },
    ],
  },
  {
    id: 'startup_stage',
    question: "What stage is your startup at?",
    options: [
      { value: 'idea', label: 'Idea / Pre-product', emoji: '💡' },
      { value: 'mvp', label: 'MVP / Early customers', emoji: '🔨' },
      { value: 'early-traction', label: 'Early traction', emoji: '📈' },
      { value: 'product-market-fit', label: 'Product-market fit', emoji: '🎯' },
      { value: 'scaling', label: 'Scaling', emoji: '🚀' },
    ],
  },
  {
    id: 'biggest_challenge',
    question: "What's your biggest growth challenge?",
    options: [
      { value: 'acquisition', label: 'Customer acquisition', emoji: '🎣' },
      { value: 'retention', label: 'Customer retention', emoji: '🔄' },
      { value: 'pricing', label: 'Pricing strategy', emoji: '💰' },
      { value: 'product', label: 'Product development', emoji: '🛠' },
      { value: 'team', label: 'Team & hiring', emoji: '👥' },
      { value: 'funding', label: 'Fundraising', emoji: '💵' },
    ],
  },
  {
    id: 'timeline',
    question: "When do you want to reach ₹100 Crore?",
    options: [
      { value: '3-years', label: '3 years (aggressive)', emoji: '🏎' },
      { value: '5-years', label: '5 years (ambitious)', emoji: '🚀' },
      { value: '7-years', label: '7 years (realistic)', emoji: '📈' },
      { value: '10-years', label: '10+ years (steady)', emoji: '🐢' },
    ],
  },
];

interface QuizResult {
  monthsToGoal: number;
  growthNeeded: number;
  readinessScore: number;
  stage: string;
}

function calculateResult(answers: Record<string, string>): QuizResult {
  // Simple calculation based on answers
  const revenueScore: Record<string, number> = {
    'less-than-1l': 1,
    '1l-5l': 2,
    '5l-20l': 3,
    '20l-50l': 4,
    'more-than-50l': 5,
  };

  const growthScore: Record<string, number> = {
    declining: 0,
    flat: 1,
    slow: 2,
    moderate: 3,
    fast: 4,
    explosive: 5,
  };

  const rev = revenueScore[answers.revenue_range] || 2;
  const growth = growthScore[answers.growth_speed] || 2;
  const readinessScore = Math.min(100, Math.round((rev + growth) * 10 + 20));

  const timelineYears: Record<string, number> = {
    '3-years': 36,
    '5-years': 60,
    '7-years': 84,
    '10-years': 120,
  };

  return {
    monthsToGoal: timelineYears[answers.timeline] || 60,
    growthNeeded: Math.round(15 - growth * 2),
    readinessScore,
    stage: answers.startup_stage || 'early-traction',
  };
}

export function FounderDNAQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const joinWaitlist = useJoinWaitlist();

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleOptionSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });

    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email) return;

    try {
      await joinWaitlist.mutateAsync({
        email,
        startup_stage: answers.startup_stage,
        revenue_range: answers.revenue_range,
        key_problem: answers.biggest_challenge,
      });
      setEmailSubmitted(true);
      toast.success('You\'re on the waitlist!');
    } catch (error) {
      toast.error('Failed to join waitlist');
    }
  };

  const result = calculateResult(answers);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[#050A10] to-[#0A0F14]">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles className="w-4 h-4" />
            FREE ASSESSMENT
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Founder DNA Quiz
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Discover your path to ₹100 Crore in 2 minutes
          </p>
        </div>

        {/* Quiz Card */}
        <div
          className="relative rounded-2xl overflow-hidden p-8 md:p-10"
          style={{
            background: 'rgba(5,15,24,0.72)',
            border: '1px solid rgba(0,191,255,0.18)',
            backdropFilter: 'blur(18px)',
          }}
        >
          {/* Progress bar */}
          {!showResult && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-white/50 mb-2">
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-6">
                  {currentQuestion.question}
                </h3>

                <div className="grid gap-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        answers[currentQuestion.id] === option.value
                          ? 'bg-cyan-500/20 border-cyan-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      } border`}
                    >
                      <span className="text-xl mr-3">{option.emoji}</span>
                      <span className="text-white">{option.label}</span>
                    </button>
                  ))}
                </div>

                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 mt-6 text-white/50 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {!emailSubmitted ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-cyan-400" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      Your Readiness Score
                    </h3>
                    <p className="text-5xl font-bold text-cyan-400 mb-4">
                      {result.readinessScore}/100
                    </p>
                    <p className="text-white/60 mb-8">
                      Based on your answers, you need approximately {result.growthNeeded}% monthly growth
                      to reach ₹100 Crore in {result.monthsToGoal} months.
                    </p>

                    {/* Email capture */}
                    <div className="max-w-md mx-auto">
                      <p className="text-white mb-4">
                        Get your detailed growth roadmap:
                      </p>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="centurion-input pl-11"
                          />
                        </div>
                        <Button onClick={handleEmailSubmit} loading={joinWaitlist.isPending}>
                          Get Roadmap
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      You're in! 🎉
                    </h3>
                    <p className="text-white/60">
                      Check your email for your personalized growth roadmap.
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

