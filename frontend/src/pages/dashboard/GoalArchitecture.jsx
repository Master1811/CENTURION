// Goal Architecture Dashboard
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Circle, ArrowRight, Plus, Sparkles, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { formatCrore, CRORE, LAKH } from '@/lib/engine/constants';

// Milestone ladder
const milestoneLadder = [
  { value: 1 * CRORE, label: '₹1 Crore', date: '2025-08', status: 'upcoming', progress: 42 },
  { value: 10 * CRORE, label: '₹10 Crore', date: '2026-11', status: 'future', progress: 5 },
  { value: 50 * CRORE, label: '₹50 Crore', date: '2028-03', status: 'future', progress: 1 },
  { value: 100 * CRORE, label: '₹100 Crore', date: '2029-02', status: 'future', progress: 0.5 },
];

// Quarterly goals
const quarterlyGoals = [
  { id: 1, goal: 'Reach ₹6L MRR', target: 600000, current: 420000, deadline: 'Q1 2025', category: 'revenue' },
  { id: 2, goal: 'Reduce churn to 4%', target: 4, current: 5.2, deadline: 'Q1 2025', category: 'retention' },
  { id: 3, goal: 'Add 50 new customers', target: 50, current: 32, deadline: 'Q1 2025', category: 'growth' },
];

// Weekly commitments
const weeklyCommitments = [
  { id: 1, text: 'Contact 10 churned customers for feedback', done: true },
  { id: 2, text: 'Launch new pricing page', done: true },
  { id: 3, text: 'Set up automated onboarding emails', done: false },
  { id: 4, text: 'Review Q1 marketing spend', done: false },
];

export const GoalArchitecture = () => {
  const [commitments, setCommitments] = useState(weeklyCommitments);
  const [newCommitment, setNewCommitment] = useState('');

  const toggleCommitment = (id) => {
    setCommitments(commitments.map(c => 
      c.id === id ? { ...c, done: !c.done } : c
    ));
  };

  const addCommitment = () => {
    if (!newCommitment.trim()) return;
    setCommitments([...commitments, {
      id: Date.now(),
      text: newCommitment,
      done: false,
    }]);
    setNewCommitment('');
  };

  return (
    <div className="space-y-6" data-testid="goal-architecture">
      {/* Header */}
      <div>
        <h1 className="type-title text-[#09090B] mb-1">
          {copy.dashboard.goals.title}
        </h1>
        <p className="type-body text-[#52525B]">
          {copy.dashboard.goals.subtitle}
        </p>
      </div>

      {/* Milestone Ladder */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <h3 className="font-medium text-[#09090B] mb-6">{copy.dashboard.goals.milestoneLadder}</h3>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-[#E4E4E7]" />
            <div 
              className="absolute left-[19px] top-8 w-0.5 bg-[#09090B] transition-all duration-500"
              style={{ height: `${milestoneLadder[0].progress}%` }}
            />
            
            <div className="space-y-6">
              {milestoneLadder.map((milestone, i) => (
                <div key={milestone.value} className="flex items-start gap-4">
                  <div className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                    'border-2 transition-all duration-300',
                    milestone.status === 'completed' && 'bg-[#09090B] border-[#09090B]',
                    milestone.status === 'upcoming' && 'bg-white border-[#09090B]',
                    milestone.status === 'future' && 'bg-white border-[#E4E4E7]'
                  )}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
                    ) : (
                      <span className={cn(
                        'font-mono text-xs font-bold',
                        milestone.status === 'upcoming' ? 'text-[#09090B]' : 'text-[#A1A1AA]'
                      )}>
                        {i + 1}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={cn(
                        'font-mono text-lg font-bold tabular-nums',
                        milestone.status === 'future' ? 'text-[#A1A1AA]' : 'text-[#09090B]'
                      )}>
                        {milestone.label}
                      </h4>
                      <span className="text-sm text-[#71717A]">
                        {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {milestone.status === 'upcoming' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#71717A]">Progress</span>
                          <span className="font-mono">{milestone.progress}%</span>
                        </div>
                        <div className="h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${milestone.progress}%` }}
                            className="h-full bg-[#09090B] rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Quarterly Goals */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[#09090B]">{copy.dashboard.goals.quarterlyGoals}</h3>
            <button className="flex items-center gap-1 text-sm text-[#52525B] hover:text-[#09090B]">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              AI Suggest
            </button>
          </div>
          
          <div className="space-y-4">
            {quarterlyGoals.map((goal) => {
              const progress = goal.category === 'retention' 
                ? Math.max(0, 100 - ((goal.current - goal.target) / goal.target * 100))
                : (goal.current / goal.target) * 100;
              
              return (
                <div key={goal.id} className="p-4 rounded-lg border border-[rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#09090B]">{goal.goal}</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      goal.category === 'revenue' && 'bg-blue-50 text-blue-600',
                      goal.category === 'retention' && 'bg-amber-50 text-amber-600',
                      goal.category === 'growth' && 'bg-emerald-50 text-emerald-600'
                    )}>
                      {goal.deadline}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#09090B] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-mono tabular-nums text-[#52525B]">
                      {goal.category === 'retention' 
                        ? `${goal.current}% → ${goal.target}%`
                        : `${goal.category === 'revenue' ? formatCrore(goal.current) : goal.current} / ${goal.category === 'revenue' ? formatCrore(goal.target) : goal.target}`
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Weekly Commitments */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[#09090B]">{copy.dashboard.goals.commitmentTracker}</h3>
            <span className="text-xs text-[#71717A]">
              {commitments.filter(c => c.done).length}/{commitments.length} done
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            {commitments.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCommitment(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left',
                  'border border-[rgba(0,0,0,0.06)] transition-all duration-150',
                  item.done && 'bg-[#F4F4F5]'
                )}
              >
                {item.done ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={1.5} />
                ) : (
                  <Circle className="w-5 h-5 text-[#A1A1AA] shrink-0" strokeWidth={1.5} />
                )}
                <span className={cn(
                  'text-sm',
                  item.done ? 'text-[#71717A] line-through' : 'text-[#09090B]'
                )}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCommitment}
              onChange={(e) => setNewCommitment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCommitment()}
              placeholder="Add a commitment for this week..."
              className="flex-1 h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]"
            />
            <button
              onClick={addCommitment}
              className="h-10 px-4 rounded-lg bg-[#09090B] text-white text-sm font-medium hover:bg-[#18181B] transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
};

export default GoalArchitecture;
