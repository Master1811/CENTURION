'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Founder, TechScale India',
    avatar: '👩‍💻',
    content: 'The 100Cr Engine gave us clarity on our growth trajectory. We hit our ₹10Cr milestone 3 months ahead of schedule.',
    rating: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'CEO, CloudBase',
    avatar: '👨‍💼',
    content: 'Finally, a tool built for Indian founders. The benchmark comparisons helped us understand where we stand against peers.',
    rating: 5,
  },
  {
    name: 'Sneha Krishnan',
    role: 'Co-founder, FinTech Pro',
    avatar: '👩‍🔬',
    content: 'The AI growth coach identified blind spots in our strategy that we had missed for months. Invaluable insights.',
    rating: 5,
  },
];

const logos = [
  'YCombinator', 'Sequoia', 'Accel', 'Peak XV', 'Lightspeed', 'Kalaari',
];

export function SocialProofSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="text-cyan-600 text-sm font-semibold tracking-wider">
            TRUSTED BY FOUNDERS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#09090B] mt-4 mb-4">
            Join 500+ founders tracking their ₹100Cr journey
          </h2>
          <p className="text-[#52525B] max-w-2xl mx-auto">
            From pre-seed to Series B, founders across India use 100Cr Engine to visualize and achieve their revenue milestones.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative p-6 rounded-2xl bg-[#F8F9FC] border border-[#E4E4E7]"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-cyan-500/20" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-[#52525B] mb-6 text-sm leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{testimonial.avatar}</span>
                <div>
                  <p className="font-semibold text-[#09090B]">{testimonial.name}</p>
                  <p className="text-xs text-[#71717A]">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logo Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-[#71717A] text-sm mb-6">
            Founders backed by top VCs use 100Cr Engine
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            {logos.map((logo) => (
              <span key={logo} className="text-[#09090B] font-semibold text-lg">
                {logo}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function LogoCarousel() {
  const logos = [
    'Razorpay', 'Zoho', 'Freshworks', 'Postman', 'Chargebee', 'BrowserStack',
  ];

  return (
    <section className="py-12 bg-[#F8F9FC] border-y border-[#E4E4E7]">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-[#71717A] text-sm mb-8">
          Inspired by India's best SaaS companies
        </p>
        <div className="flex flex-wrap justify-center gap-12">
          {logos.map((logo) => (
            <motion.span
              key={logo}
              className="text-[#71717A] font-medium text-lg hover:text-[#09090B] transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {logo}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

