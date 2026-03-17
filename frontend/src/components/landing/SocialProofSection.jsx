// SocialProofSection - Testimonials, metrics, and trust signals

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: "100Cr Engine changed how I think about growth. The projections are scarily accurate.",
    author: "Priya Sharma",
    role: "Founder, SaaS Startup",
    avatar: "PS",
    rating: 5,
  },
  {
    quote: "Finally, a tool that speaks Indian founder language. The benchmarks are gold.",
    author: "Rahul Mehta",
    role: "CEO, Fintech Company",
    avatar: "RM",
    rating: 5,
  },
  {
    quote: "I use the monthly check-ins religiously. It keeps me honest and focused.",
    author: "Ananya Gupta",
    role: "Co-founder, D2C Brand",
    avatar: "AG",
    rating: 5,
  },
];

const metrics = [
  { 
    value: '10,000+', 
    label: 'Projections created', 
    icon: Target,
    color: '#09090B'
  },
  { 
    value: '₹500Cr+', 
    label: 'Revenue tracked', 
    icon: TrendingUp,
    color: '#059669'
  },
  { 
    value: '2,500+', 
    label: 'Indian founders', 
    icon: Users,
    color: '#7C3AED'
  },
  { 
    value: '48hrs', 
    label: 'Avg. saved per month', 
    icon: Zap,
    color: '#D97706'
  },
];

const MetricCard = ({ metric, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = metric.icon;
  
  return (
    <motion.div
      ref={ref}
      className="text-center p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <motion.div
        className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${metric.color}10` }}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
      >
        <Icon className="w-6 h-6" style={{ color: metric.color }} strokeWidth={1.5} />
      </motion.div>
      
      <motion.p 
        className="text-3xl md:text-4xl font-bold text-[#09090B] font-mono mb-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 + index * 0.1 }}
      >
        {metric.value}
      </motion.p>
      
      <p className="text-sm text-[#71717A]">{metric.label}</p>
    </motion.div>
  );
};

const TestimonialCard = ({ testimonial, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative p-6 md:p-8 rounded-2xl',
        'bg-white border border-[rgba(0,0,0,0.06)]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.04)]',
        'hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        'transition-shadow duration-300'
      )}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6 }}
    >
      {/* Quote icon */}
      <div className="absolute -top-3 -left-2">
        <Quote className="w-8 h-8 text-[#E4E4E7] fill-[#E4E4E7]" />
      </div>
      
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-[#09090B] text-lg mb-6 leading-relaxed">
        "{testimonial.quote}"
      </p>
      
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#09090B] to-[#52525B] flex items-center justify-center text-white text-sm font-medium">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-medium text-[#09090B]">{testimonial.author}</p>
          <p className="text-sm text-[#71717A]">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const SocialProofSection = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-50px" });
  
  return (
    <section 
      className="py-20 md:py-32 bg-[#F4F4F5]"
      data-testid="social-proof-section"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-20">
          {metrics.map((metric, i) => (
            <MetricCard key={metric.label} metric={metric} index={i} />
          ))}
        </div>
        
        {/* Testimonials Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-4 bg-[#09090B] text-white">
            FOUNDER TESTIMONIALS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#09090B] mb-4">
            Trusted by serious founders
          </h2>
          <p className="text-lg text-[#52525B] max-w-2xl mx-auto">
            Join thousands of Indian founders using 100Cr Engine to track and grow their startups.
          </p>
        </motion.div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} index={i} />
          ))}
        </div>
        
        {/* Trust badges */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-[#A1A1AA] mb-4">TRUSTED INFRASTRUCTURE</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            {['Supabase', 'Razorpay', 'Stripe', 'AWS'].map((name) => (
              <span key={name} className="text-sm font-medium text-[#71717A]">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
