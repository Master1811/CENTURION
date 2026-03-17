// AI Growth Coach Dashboard
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Calendar, AlertTriangle, MessageSquare, Brain, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';

// Mock AI data
const dailyPulse = {
  greeting: "Good morning! Here's your startup pulse for today.",
  highlights: [
    { type: 'positive', text: 'Revenue is tracking 15% ahead of baseline' },
    { type: 'neutral', text: '3 new signups yesterday, 1 churned customer' },
    { type: 'action', text: 'Consider reaching out to high-value customers for testimonials' },
  ],
  timestamp: '8:30 AM IST',
};

const weeklyQuestion = {
  question: "What's the biggest obstacle preventing you from doubling your growth rate this quarter?",
  hint: "Think about: sales cycle length, marketing channels, pricing, product gaps, or team capacity.",
  date: 'Monday, Feb 3',
};

const deviationAlerts = [
  { 
    id: 1, 
    metric: 'Churn Rate', 
    expected: '5%', 
    actual: '7.2%', 
    deviation: '+44%',
    severity: 'high',
    insight: 'Churn increased significantly this month. Review recent cancellations for common themes.'
  },
];

const coachingHistory = [
  { date: 'Jan 2025', summary: 'Focus areas: Reduce churn, improve onboarding. Action taken: Added email sequence.' },
  { date: 'Dec 2024', summary: 'Highlighted pricing opportunity. Result: Raised prices 20%, no churn impact.' },
  { date: 'Nov 2024', summary: 'Suggested targeting enterprise segment. Started conversations with 3 leads.' },
];

export const AIGrowthCoach = () => {
  const [expandedAlert, setExpandedAlert] = useState(null);

  return (
    <div className="space-y-6" data-testid="ai-growth-coach">
      {/* Header */}
      <div>
        <h1 className="type-title text-[#09090B] mb-1">
          {copy.dashboard.aiCoach.title}
        </h1>
        <p className="type-body text-[#52525B]">
          {copy.dashboard.aiCoach.subtitle}
        </p>
      </div>

      {/* Daily Pulse */}
      <CenturionCard className="border-l-4 border-l-amber-400">
        <CenturionCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-50">
              <Sun className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-[#09090B]">{copy.dashboard.aiCoach.dailyPulse}</h3>
                <span className="text-xs text-[#A1A1AA]">{dailyPulse.timestamp}</span>
              </div>
              <p className="text-sm text-[#52525B] mb-4">{dailyPulse.greeting}</p>
              <div className="space-y-2">
                {dailyPulse.highlights.map((item, i) => (
                  <div 
                    key={i}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg',
                      item.type === 'positive' && 'bg-emerald-50',
                      item.type === 'neutral' && 'bg-[#F4F4F5]',
                      item.type === 'action' && 'bg-blue-50'
                    )}
                  >
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full mt-2',
                      item.type === 'positive' && 'bg-emerald-500',
                      item.type === 'neutral' && 'bg-[#71717A]',
                      item.type === 'action' && 'bg-blue-500'
                    )} />
                    <span className="text-sm text-[#09090B]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Weekly Question */}
      <CenturionCard className="bg-[#09090B]">
        <CenturionCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/10">
              <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">{copy.dashboard.aiCoach.weeklyQuestion}</h3>
                <span className="text-xs text-white/50">{weeklyQuestion.date}</span>
              </div>
              <p className="text-lg text-white mb-3">{weeklyQuestion.question}</p>
              <p className="text-sm text-white/60 mb-6">{weeklyQuestion.hint}</p>
              <div className="flex gap-3">
                <textarea
                  placeholder="Share your thoughts..."
                  className="flex-1 h-24 p-3 rounded-lg bg-white/10 text-white placeholder:text-white/40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <button className="mt-4 h-10 px-5 rounded-lg bg-white text-[#09090B] text-sm font-medium hover:bg-white/90 transition-colors">
                Submit reflection
              </button>
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Deviation Alerts */}
      {deviationAlerts.length > 0 && (
        <CenturionCard className="border-l-4 border-l-red-400">
          <CenturionCardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              <h3 className="font-medium text-[#09090B]">{copy.dashboard.aiCoach.deviationAlerts}</h3>
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-xs text-red-600 font-medium">
                {deviationAlerts.length} alert{deviationAlerts.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-3">
              {deviationAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-4 rounded-lg bg-red-50 cursor-pointer"
                  onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-[#09090B]">{alert.metric}</span>
                      <span className="text-sm text-[#71717A] mx-2">—</span>
                      <span className="text-sm text-[#71717A]">Expected {alert.expected}, Actual {alert.actual}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-red-600">{alert.deviation}</span>
                  </div>
                  {expandedAlert === alert.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm text-[#52525B] mt-3 pt-3 border-t border-red-100"
                    >
                      {alert.insight}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          </CenturionCardContent>
        </CenturionCard>
      )}

      {/* Coaching Summary */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <h3 className="font-medium text-[#09090B] mb-4">{copy.dashboard.aiCoach.coachingSummary}</h3>
          <div className="space-y-4">
            {coachingHistory.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-[#09090B]" />
                  {i < coachingHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-[#E4E4E7] mt-2" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-xs text-[#A1A1AA] mb-1">{item.date}</p>
                  <p className="text-sm text-[#52525B]">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
};

export default AIGrowthCoach;
