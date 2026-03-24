'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const previewFeatures = [
  {
    title: 'AI Growth Coach',
    description: 'Get personalized strategic advice powered by Claude AI',
    preview: 'Based on your 12% MoM growth and current churn rate, focus on...',
    locked: true,
  },
  {
    title: 'Benchmark Intelligence',
    description: 'Compare your metrics against 500+ Indian startups',
    preview: 'Your growth rate puts you in the top 25% of Seed stage companies',
    locked: true,
  },
  {
    title: 'Board Report Generator',
    description: 'Create investor-ready reports in one click',
    preview: 'Executive Summary: Q1 saw 34% ARR growth driven by...',
    locked: true,
  },
];

export function TeaserLockedSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#09090B]">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            PREMIUM FEATURES
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Unlock the full power
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            These premium features are available with the Founder Plan
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {previewFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-full">
                {/* Lock badge */}
                <div className="absolute top-4 right-4">
                  <div className="px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400">Premium</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 pr-20">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  {feature.description}
                </p>

                {/* Blurred preview */}
                <div className="relative">
                  <div className="p-4 rounded-lg bg-white/5 blur-sm select-none">
                    <p className="text-white/60 text-sm">
                      {feature.preview}
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white/30" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <Link href="/pricing">
            <Button size="lg">
              View Pricing
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

