// OnboardingModal Component
// ==========================
// 3-step onboarding flow for new users
// Collects company info, stage/sector, and current MRR

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { submitOnboarding } from '@/lib/api/dashboard'

const STAGES = [
  { value: 'pre-seed', label: 'Pre-seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series-a', label: 'Series A' },
  { value: 'series-b', label: 'Series B+' },
]

const SECTORS = [
  'B2B SaaS',
  'D2C',
  'EdTech',
  'FinTech',
  'HealthTech',
  'Other',
]

const stepVariants = {
  enter: {
    x: 24,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    x: -24,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export function OnboardingModal({ onComplete }) {
  const { getAccessToken, refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    company_name: '',
    website: '',
    stage: '',
    sector: '',
    current_mrr: 100000,
  })

  const updateData = (field, value) =>
    setData(prev => ({ ...prev, [field]: value }))

  const handleComplete = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getAccessToken()
      await submitOnboarding(token, {
        company_name: data.company_name,
        website: data.website?.trim() ? data.website.trim() : null,
        stage: data.stage,
        sector: data.sector,
        current_mrr: data.current_mrr,
      })
      await refreshProfile()
      onComplete()
    } catch (err) {
      setError(
        'Something went wrong. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 glass-backdrop"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-modal w-full max-w-md overflow-hidden"
      >
        {/* Progress bar */}
        <div className="flex">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="h-1 flex-1 transition-all duration-500 ease-out"
              style={{
                background: s <= step
                  ? 'linear-gradient(90deg, #C9A961, #B8962E)'
                  : 'rgba(0,0,0,0.04)',
              }}
            />
          ))}
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-1">
                  Step 1 of 3
                </p>
                <h2 className="font-heading text-xl font-bold text-[#09090B] mb-1">
                  What's your company called?
                </h2>
                <p className="text-sm text-zinc-500 mb-6">
                  This personalises your dashboard.
                </p>
                <input
                  type="text"
                  placeholder="Acme Technologies"
                  value={data.company_name}
                  onChange={e =>
                    updateData('company_name', e.target.value)
                  }
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8962E] mb-3"
                />
                <input
                  type="text"
                  placeholder="Website (optional)"
                  value={data.website}
                  onChange={e =>
                    updateData('website', e.target.value)
                  }
                  className="w-full h-11 px-4 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8962E]"
                />
                <button
                  onClick={() => setStep(2)}
                  disabled={!data.company_name.trim()}
                  className="w-full h-11 bg-[#09090B] text-white text-sm font-medium rounded-xl mt-6 disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                >
                  Continue →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-1">
                  Step 2 of 3
                </p>
                <h2 className="font-heading text-xl font-bold text-[#09090B] mb-1">
                  Where are you right now?
                </h2>
                <p className="text-sm text-zinc-500 mb-6">
                  Matches you to the right benchmarks.
                </p>

                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Stage
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {STAGES.map(s => (
                    <button
                      key={s.value}
                      onClick={() =>
                        updateData('stage', s.value)
                      }
                      className={`h-10 rounded-xl text-sm border transition-colors
                        ${data.stage === s.value
                          ? 'bg-[#FDF8EE] border-[#B8962E] text-[#09090B] font-medium'
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Sector
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SECTORS.map(s => (
                    <button
                      key={s}
                      onClick={() =>
                        updateData('sector', s)
                      }
                      className={`h-10 rounded-xl text-sm border transition-colors
                        ${data.sector === s
                          ? 'bg-[#FDF8EE] border-[#B8962E] text-[#09090B] font-medium'
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 h-11 border border-zinc-200 text-sm rounded-xl text-zinc-600 hover:border-zinc-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!data.stage || !data.sector}
                    className="flex-1 h-11 bg-[#09090B] text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:bg-zinc-800 transition-colors"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-1">
                  Step 3 of 3
                </p>
                <h2 className="font-heading text-xl font-bold text-[#09090B] mb-1">
                  What's your current MRR?
                </h2>
                <p className="text-sm text-zinc-500 mb-6">
                  Pre-fills your projection engine. Change it anytime.
                </p>

                <p className="font-mono text-3xl font-medium text-[#B8962E] mb-4">
                  ₹{data.current_mrr.toLocaleString('en-IN')}
                </p>

                <input
                  type="range"
                  min={10000}
                  max={10000000}
                  step={10000}
                  value={data.current_mrr}
                  onChange={e =>
                    updateData('current_mrr', Number(e.target.value))
                  }
                  className="w-full mb-2 accent-[#B8962E]"
                />
                <div className="flex justify-between text-xs text-zinc-400 mb-6">
                  <span>₹10K</span>
                  <span>₹1Cr</span>
                </div>

                {error && (
                  <p className="text-sm text-red-600 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 h-11 border border-zinc-200 text-sm rounded-xl text-zinc-600 disabled:opacity-40 hover:border-zinc-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1 h-11 bg-[#B8962E] text-[#09090B] text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-[#D4A853] transition-colors"
                  >
                    {loading ? 'Setting up...' : 'Go to dashboard →'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default OnboardingModal

