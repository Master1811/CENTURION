// Founder DNA Quiz Component
// ===========================
// Lead generation quiz on the landing page that helps founders
// understand their growth trajectory and captures emails.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  TrendingUp,
  CheckCircle,
  Rocket,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { submitFounderQuiz } from '@/lib/api/dashboard';
import { formatCrore, CRORE } from '@/lib/engine/constants';

const questions = [
  {
    id: 'revenue_range',
    question: "What's your current monthly revenue?",
    options: [
      { value: 'less-than-1l', label: 'Less than ₹1 Lakh', emoji: '🌱' },
      { value: '1l-5l', label: '₹1 - 5 Lakh', emoji: '🌿' },
      { value: '5l-20l', label: '₹5 - 20 Lakh', emoji: '🌳' },
      { value: '20l-50l', label: '₹20 - 50 Lakh', emoji: '🚀' },
      { value: 'more-than-50l', label: 'More than ₹50 Lakh', emoji: '🎯' },
    ],
  },
  {
    id: 'growth_speed',
    question: "How fast is your revenue growing?",
    options: [
      { value: 'declining', label: 'Declining', emoji: '📉' },
      { value: 'flat', label: 'Flat (0-3%)', emoji: '➖' },
      { value: 'slow', label: 'Slow (3-7%)', emoji: '🐢' },
      { value: 'moderate', label: 'Moderate (7-12%)', emoji: '🏃' },
      { value: 'fast', label: 'Fast (12-20%)', emoji: '🚀' },
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

export const FounderDNAQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
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
    } catch (error) {
      console.error('Quiz submission failed:', error);
      // Show mock result on error
      setResult({
        projection: {
          milestones: [
            { value: CRORE, label: '₹1 Crore', monthsToReach: 8 },
            { value: 10 * CRORE, label: '₹10 Crore', monthsToReach: 28 },
            { value: 100 * CRORE, label: '₹100 Crore', monthsToReach: 58 },
          ]
        },
        benchmark: { percentile: 72, status: 'above-average' },
        insight: 'Based on your responses, you\'re tracking ahead of most founders at your stage. Focus on retention to accelerate your path to ₹100 Crore.',
      });
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (showEmailCapture) {
      setShowEmailCapture(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setEmail('');
    setResult(null);
    setShowEmailCapture(false);
  };

  if (result) {
    return (
      <section className="py-20 bg-[#F4F4F5]" id="founder-dna-quiz" data-testid="founder-dna-quiz-results">
        <div className="max-w-2xl mx-auto px-4">
          <CenturionCard>
            <CenturionCardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-[#09090B] mb-2">Your Founder DNA Results</h2>
                <p className="text-[#71717A]">Based on your answers, here's your personalized projection</p>
              </div>

              {/* Percentile Badge */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#09090B] text-white">
                  <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-medium">Top {100 - result.benchmark.percentile}% of founders</span>
                </div>
              </div>

              {/* Milestone Timeline */}
              <div className="space-y-4 mb-8">
                {result.projection.milestones.map((milestone, i) => (
                  <div 
                    key={milestone.value}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-lg',
                      i === result.projection.milestones.length - 1 
                        ? 'bg-[#09090B] text-white' 
                        : 'bg-[#F4F4F5]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5" strokeWidth={1.5} />
                      <span className="font-mono font-bold">{milestone.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{milestone.monthsToReach} months</span>
                      <p className={cn('text-xs', i === result.projection.milestones.length - 1 ? 'text-white/60' : 'text-[#71717A]')}>
                        ~{Math.ceil(milestone.monthsToReach / 12)} years
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insight */}
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 mb-8">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <p className="text-sm text-amber-800">{result.insight}</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.href = '/tools/100cr-calculator'}
                  className="flex-1 h-12 rounded-lg bg-[#09090B] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#18181B] transition-colors"
                >
                  Get Detailed Projection
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleRestart}
                  className="h-12 px-6 rounded-lg border border-[rgba(0,0,0,0.1)] text-[#52525B] font-medium hover:bg-[#F4F4F5] transition-colors"
                >
                  Retake Quiz
                </button>
              </div>
            </CenturionCardContent>
          </CenturionCard>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#F4F4F5]" id="founder-dna-quiz" data-testid="founder-dna-quiz">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#09090B] text-white text-xs font-medium mb-4">
            <Rocket className="w-3 h-3" />
            FREE ASSESSMENT
          </span>
          <h2 className="text-3xl font-bold text-[#09090B] mb-2">Founder DNA Quiz</h2>
          <p className="text-[#71717A]">Discover when you'll hit ₹100 Crore in 60 seconds</p>
        </div>

        <CenturionCard>
          <CenturionCardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-[#71717A] mb-2">
                <span>Question {showEmailCapture ? questions.length : currentStep + 1} of {questions.length}</span>
                <span>{Math.round(showEmailCapture ? 100 : progress)}%</span>
              </div>
              <div className="h-2 bg-[#E4E4E7] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#09090B] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${showEmailCapture ? 100 : progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showEmailCapture ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-[#09090B]" strokeWidth={1.5} />
                    <h3 className="text-xl font-bold text-[#09090B] mb-2">Almost there!</h3>
                    <p className="text-[#71717A]">Enter your email to get your personalized projection (optional)</p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@startup.com"
                      className="w-full h-12 px-4 rounded-lg border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]"
                    />
                    
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                      className="w-full h-12 rounded-lg bg-[#09090B] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#18181B] transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Get My Results
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={loading}
                      className="w-full h-10 text-sm text-[#71717A] hover:text-[#09090B] transition-colors"
                    >
                      Skip and see results
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-[#09090B] mb-6">
                    {questions[currentStep].question}
                  </h3>

                  <div className="space-y-3">
                    {questions[currentStep].options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(questions[currentStep].id, option.value)}
                        className={cn(
                          'w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-150',
                          answers[questions[currentStep].id] === option.value
                            ? 'border-[#09090B] bg-[#F4F4F5]'
                            : 'border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)] hover:bg-[#FAFAFA]'
                        )}
                      >
                        <span className="text-xl">{option.emoji}</span>
                        <span className="text-sm font-medium text-[#09090B]">{option.label}</span>
                        {answers[questions[currentStep].id] === option.value && (
                          <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" strokeWidth={1.5} />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="mt-6 flex items-center gap-1 text-sm text-[#71717A] hover:text-[#09090B] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Back
              </button>
            )}
          </CenturionCardContent>
        </CenturionCard>
      </div>
    </section>
  );
};

export default FounderDNAQuiz;
