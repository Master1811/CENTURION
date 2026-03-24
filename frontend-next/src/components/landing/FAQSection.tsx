'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'What is the 100Cr Engine?',
    answer: 'The 100Cr Engine is a revenue milestone prediction platform built specifically for Indian SaaS founders. It helps you visualize your path to ₹100 Crore ARR with AI-powered projections, benchmarks, and growth coaching.',
  },
  {
    question: 'How accurate are the revenue projections?',
    answer: 'Our projections are based on your actual historical data and industry benchmarks from 500+ Indian startups. While no prediction is 100% accurate, our models achieve 95%+ accuracy for 12-month forecasts when updated monthly.',
  },
  {
    question: 'What data integrations do you support?',
    answer: 'We currently support Razorpay and Stripe for automatic revenue syncing. Zoho Books, Tally, and Cashfree integrations are coming soon. You can also manually log your revenue each month.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Absolutely. We use bank-grade encryption (AES-256), and your data is stored in SOC 2 compliant data centers in India. We\'re also DPDP Act 2023 compliant. We never share your data with third parties.',
  },
  {
    question: 'How does the AI Growth Coach work?',
    answer: 'The AI Growth Coach analyzes your revenue patterns, growth rate, churn, and compares them against peer benchmarks. It then provides daily insights and strategic recommendations tailored to your stage and goals.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. If you cancel, you\'ll retain access until the end of your billing period. We also offer a 30-day money-back guarantee.',
  },
  {
    question: 'Do you offer discounts for early-stage startups?',
    answer: 'Yes! We offer 50% off for beta users and special pricing for startups in recognized accelerator programs. Contact us for details.',
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}

function FAQItem({ question, answer, isOpen, onClick, index }: FAQItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'border-b border-[#E4E4E7] last:border-b-0',
        isOpen && 'bg-[#F8F9FC]'
      )}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 px-6 text-left"
      >
        <span className="font-medium text-[#09090B] pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[#71717A] flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-[#52525B] leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-cyan-600 text-sm font-semibold tracking-wider mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#09090B] mb-4">
            Frequently asked questions
          </h2>
          <p className="text-[#52525B]">
            Everything you need to know about the 100Cr Engine
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="rounded-2xl border border-[#E4E4E7] overflow-hidden">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
              index={index}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.p
          className="text-center mt-8 text-[#71717A]"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          Still have questions?{' '}
          <a href="mailto:support@100crengine.in" className="text-cyan-600 hover:underline">
            Contact us
          </a>
        </motion.p>
      </div>
    </section>
  );
}

