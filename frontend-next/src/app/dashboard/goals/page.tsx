'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, CheckCircle, Circle, Edit2, Trash2 } from 'lucide-react';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  target: string;
  progress: number;
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'completed';
}

const MOCK_GOALS: Goal[] = [
  { id: '1', title: 'Reach ₹10L MRR', target: '₹10,00,000', progress: 75, dueDate: '2026-06-30', status: 'on-track' },
  { id: '2', title: 'Reduce Churn to <3%', target: '3%', progress: 60, dueDate: '2026-04-30', status: 'at-risk' },
  { id: '3', title: 'Launch Enterprise Tier', target: 'Complete', progress: 100, dueDate: '2026-03-15', status: 'completed' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', dueDate: '' });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      target: newGoal.target,
      progress: 0,
      dueDate: newGoal.dueDate,
      status: 'on-track',
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', target: '', dueDate: '' });
    setShowAddModal(false);
    toast.success('Goal added!');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    toast.success('Goal deleted');
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'on-track': return 'text-green-400';
      case 'at-risk': return 'text-amber-400';
      case 'completed': return 'text-cyan-400';
    }
  };

  const getStatusBg = (status: Goal['status']) => {
    switch (status) {
      case 'on-track': return 'bg-green-500/10 border-green-500/20';
      case 'at-risk': return 'bg-amber-500/10 border-amber-500/20';
      case 'completed': return 'bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goal Architecture</h1>
          <p className="text-white/60 mt-1">Set and track your business objectives</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-400">On Track</p>
          <p className="text-2xl font-bold text-white">{goals.filter(g => g.status === 'on-track').length}</p>
        </div>
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-400">At Risk</p>
          <p className="text-2xl font-bold text-white">{goals.filter(g => g.status === 'at-risk').length}</p>
        </div>
        <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-sm text-cyan-400">Completed</p>
          <p className="text-2xl font-bold text-white">{goals.filter(g => g.status === 'completed').length}</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <CenturionCard className={`border ${getStatusBg(goal.status)}`}>
              <CenturionCardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 ${getStatusColor(goal.status)}`}>
                      {goal.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{goal.title}</h3>
                      <p className="text-sm text-white/50">Target: {goal.target}</p>
                      <p className="text-xs text-white/40">Due: {new Date(goal.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusBg(goal.status)} ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('-', ' ')}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/50">Progress</span>
                    <span className="text-white font-semibold">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        goal.status === 'completed' ? 'bg-cyan-500' :
                        goal.status === 'at-risk' ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                    />
                  </div>
                </div>
              </CenturionCardContent>
            </CenturionCard>
          </motion.div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Add New Goal</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Reach ₹10L MRR"
                  className="centurion-input"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Target</label>
                <input
                  type="text"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  placeholder="e.g., ₹10,00,000"
                  className="centurion-input"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Due Date</label>
                <input
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                  className="centurion-input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAddGoal}>
                Add Goal
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

