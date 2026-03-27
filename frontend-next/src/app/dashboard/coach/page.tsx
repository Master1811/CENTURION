'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, Send, Loader2, Lightbulb, Zap } from 'lucide-react';
import { useDailyPulse, useWeeklyQuestion, useGenerateStrategyBrief, useAIUsage } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AICoachPage() {
  const { profile, isSaaS } = useAuth();
  const { data: dailyPulse, isLoading: pulseLoading } = useDailyPulse();
  const { data: weeklyQuestion, isLoading: weeklyLoading } = useWeeklyQuestion();
  const { data: aiUsage } = useAIUsage();
  const generateBrief = useGenerateStrategyBrief();

  const [userResponse, setUserResponse] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [strategyBrief, setStrategyBrief] = useState<string | null>(null);

  const title = isSaaS ? 'AI Growth Coach' : 'AI Business Coach';

  const handleSendMessage = async () => {
    if (!userResponse.trim()) return;

    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', content: userResponse }]);

    // Simulate AI response (in production, this would call the AI endpoint)
    setTimeout(() => {
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: `Thank you for sharing. Based on your response about "${userResponse.slice(0, 50)}...", I'd recommend focusing on your highest-impact growth lever this week. What's one specific metric you could improve by 10%?`
      }]);
    }, 1000);

    setUserResponse('');
  };

  const handleGenerateBrief = async () => {
    try {
      const result = await generateBrief.mutateAsync();
      setStrategyBrief(result.brief);
      toast.success('Strategy brief generated!');
    } catch (error) {
      toast.error('Failed to generate brief');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-white/60 mt-1">Get personalized AI-powered business guidance</p>
      </div>

      {/* AI Usage Stats */}
      {aiUsage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50">Daily Pulse</p>
            <p className="text-lg font-bold text-white">{aiUsage.daily_pulses_used || 0}/{aiUsage.daily_pulses_limit || 30}</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50">Board Reports</p>
            <p className="text-lg font-bold text-white">{aiUsage.board_reports_used || 0}/{aiUsage.board_reports_limit || 2}</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50">Strategy Briefs</p>
            <p className="text-lg font-bold text-white">{aiUsage.strategy_briefs_used || 0}/{aiUsage.strategy_briefs_limit || 1}</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50">AI Budget</p>
            <p className="text-lg font-bold text-white">₹{aiUsage.remaining_inr?.toFixed(0) || 25}/{aiUsage.budget_inr || 25}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Pulse */}
        <CenturionCard className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
          <CenturionCardHeader>
            <CenturionCardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Daily Pulse
            </CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            {pulseLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {dailyPulse?.greeting && (
                  <p className="text-sm text-cyan-400">{dailyPulse.greeting}</p>
                )}
                <p className="text-lg text-white">
                  {dailyPulse?.content || dailyPulse?.question || "What's the single most important thing you need to accomplish today to move your business forward?"}
                </p>
                {dailyPulse?.highlights && dailyPulse.highlights.length > 0 && (
                  <ul className="space-y-1 text-sm text-white/70">
                    {dailyPulse.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-cyan-400">•</span> {h}
                      </li>
                    ))}
                  </ul>
                )}
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Type your response..."
                  className="centurion-input min-h-[100px] resize-none"
                />
                <Button onClick={handleSendMessage} className="w-full">
                  <Send className="w-4 h-4" />
                  Submit Response
                </Button>
              </div>
            )}
          </CenturionCardContent>
        </CenturionCard>

        {/* Weekly Strategic Question */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Weekly Strategic Question
            </CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            {weeklyLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg text-white">
                  {weeklyQuestion?.question || "If you could only focus on one growth initiative this quarter, what would have the highest ROI?"}
                </p>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60">
                    💡 Tip: Take 10 minutes to write a thoughtful response. This reflection
                    helps the AI provide more personalized guidance.
                  </p>
                </div>
              </div>
            )}
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Strategy Brief Generator */}
      <CenturionCard>
        <CenturionCardHeader>
          <div className="flex items-center justify-between">
            <CenturionCardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Strategy Brief
            </CenturionCardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateBrief}
              loading={generateBrief.isPending}
            >
              Generate Brief
            </Button>
          </div>
        </CenturionCardHeader>
        <CenturionCardContent>
          {strategyBrief ? (
            <div className="p-6 rounded-lg bg-white/5 border border-white/10 prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-white/80 font-sans">
                {strategyBrief}
              </pre>
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Generate a personalized strategy brief</p>
              <p className="text-sm">Based on your company's data and industry benchmarks</p>
            </div>
          )}
        </CenturionCardContent>
      </CenturionCard>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              Conversation
            </CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="space-y-4">
              {conversation.map((message, i) => (
                <motion.div
                  key={i}
                  className={`p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-cyan-500/10 border border-cyan-500/20 ml-8'
                      : 'bg-white/5 border border-white/10 mr-8'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-white/50 mb-1">
                    {message.role === 'user' ? 'You' : 'AI Coach'}
                  </p>
                  <p className="text-white">{message.content}</p>
                </motion.div>
              ))}
            </div>
          </CenturionCardContent>
        </CenturionCard>
      )}
    </div>
  );
}



