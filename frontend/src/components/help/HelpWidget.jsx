// HelpWidget - Floating help button + expandable panel
// Persistent bottom-right widget for documentation, FAQs, bug reports, and support

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, X, Book, MessageSquare, Bug, Mail, Sparkles,
  ChevronRight, ChevronLeft, Search, ExternalLink, Send,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { faqs, searchFaqs } from '@/lib/faqs';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan: '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan: '#0099CC',
  tealEdge: '#006080',
  darkCorner: '#050A10',
};

// ─── Menu Options ─────────────────────────────────────────────────────────────
const menuOptions = [
  {
    id: 'docs',
    icon: Book,
    label: 'Documentation',
    description: 'Guides & tutorials',
    color: '#22C55E'
  },
  {
    id: 'faqs',
    icon: MessageSquare,
    label: 'FAQs',
    description: 'Quick answers',
    color: C.brightCyan
  },
  {
    id: 'bug',
    icon: Bug,
    label: 'Report a Bug',
    description: 'Help us improve',
    color: '#F59E0B'
  },
  {
    id: 'contact',
    icon: Mail,
    label: 'Contact Support',
    description: 'Get help via email',
    color: '#8B5CF6'
  },
  {
    id: 'ai',
    icon: Sparkles,
    label: 'Ask AI',
    description: 'Coming soon',
    color: '#EC4899',
    disabled: true,
    badge: 'Soon'
  }
];

// ─── Documentation Links ──────────────────────────────────────────────────────
const docLinks = [
  { title: 'Getting Started', url: '/docs/getting-started', description: 'Quick start guide for new users' },
  { title: 'Understanding Projections', url: '/docs/projections', description: 'How revenue projections work' },
  { title: 'Connecting Payment Providers', url: '/docs/connectors', description: 'Razorpay, Stripe & Cashfree setup' },
  { title: 'AI Growth Coach', url: '/docs/ai-coach', description: 'Get the most from AI insights' },
  { title: 'Board Reports', url: '/docs/reports', description: 'Generate investor-ready reports' },
  { title: 'API Documentation', url: '/docs/api', description: 'For developers & integrations' }
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// Main Menu View
const MainMenu = ({ onSelect }) => (
  <div className="p-4 space-y-2">
    <h3 className="text-sm font-semibold text-white mb-3 px-1">How can we help?</h3>
    {menuOptions.map((option) => {
      const Icon = option.icon;
      return (
        <motion.button
          key={option.id}
          onClick={() => !option.disabled && onSelect(option.id)}
          disabled={option.disabled}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group',
            option.disabled 
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-white/5 cursor-pointer'
          )}
          whileHover={!option.disabled ? { x: 4 } : {}}
          whileTap={!option.disabled ? { scale: 0.98 } : {}}
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ 
              background: `${option.color}15`,
              border: `1px solid ${option.color}30`
            }}
          >
            <Icon className="w-5 h-5" style={{ color: option.color }} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{option.label}</span>
              {option.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                  {option.badge}
                </span>
              )}
            </div>
            <span className="text-xs text-white/50">{option.description}</span>
          </div>
          {!option.disabled && (
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" strokeWidth={1.5} />
          )}
        </motion.button>
      );
    })}
  </div>
);

// Documentation View
const DocsView = ({ onBack }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-2 p-4 border-b border-white/10">
      <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <ChevronLeft className="w-5 h-5 text-white/70" strokeWidth={1.5} />
      </button>
      <h3 className="text-sm font-semibold text-white">Documentation</h3>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {docLinks.map((doc, idx) => (
        <motion.a
          key={idx}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 rounded-xl hover:bg-white/5 transition-all group"
          whileHover={{ x: 4 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
              {doc.title}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-cyan-300 transition-colors" strokeWidth={1.5} />
          </div>
          <span className="text-xs text-white/50">{doc.description}</span>
        </motion.a>
      ))}
    </div>
    <div className="p-4 border-t border-white/10">
      <a 
        href="/docs" 
        target="_blank"
        className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-medium transition-all"
        style={{ 
          background: `${C.brightCyan}15`,
          border: `1px solid ${C.brightCyan}30`,
          color: C.brightCyan
        }}
      >
        <Book className="w-4 h-4" strokeWidth={1.5} />
        View All Documentation
      </a>
    </div>
  </div>
);

// FAQs View
const FAQsView = ({ onBack }) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const filteredFaqs = searchFaqs(search);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-white/10">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-white/70" strokeWidth={1.5} />
        </button>
        <h3 className="text-sm font-semibold text-white">FAQs</h3>
      </div>
      
      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>
      
      {/* FAQ List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/50 text-sm">No FAQs match your search</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div key={faq.id} className="rounded-xl overflow-hidden border border-white/10">
              <button
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium text-white pr-2">{faq.question}</span>
                <motion.div
                  animate={{ rotate: expanded === faq.id ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" strokeWidth={1.5} />
                </motion.div>
              </button>
              <AnimatePresence>
                {expanded === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <p className="p-3 text-sm text-white/60 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Bug Report View
const BugReportView = ({ onBack }) => {
  const [form, setForm] = useState({ subject: '', description: '', email: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) return;
    
    setStatus('sending');
    
    // Create mailto link as fallback
    const mailtoBody = `Subject: Bug Report - ${form.subject}\n\nDescription:\n${form.description}\n\nReporter Email: ${form.email || 'Not provided'}\n\nPage: ${window.location.href}\nUser Agent: ${navigator.userAgent}`;
    const mailtoLink = `mailto:support@100crengine.in?subject=${encodeURIComponent('Bug Report: ' + form.subject)}&body=${encodeURIComponent(mailtoBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        setForm({ subject: '', description: '', email: '' });
        setStatus('idle');
        onBack();
      }, 2000);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-white/10">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-white/70" strokeWidth={1.5} />
        </button>
        <h3 className="text-sm font-semibold text-white">Report a Bug</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Subject *</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Brief description of the issue"
            required
            className="w-full h-10 px-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What happened? What did you expect to happen? Steps to reproduce..."
            required
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Your Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="For follow-up if needed"
            className="w-full h-10 px-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        
        <div className="pt-2">
          <motion.button
            type="submit"
            disabled={status === 'sending' || status === 'success'}
            className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: status === 'success' 
                ? 'rgba(34,197,94,0.15)'
                : `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`,
              color: status === 'success' ? '#22C55E' : '#000',
              border: status === 'success' ? '1px solid rgba(34,197,94,0.30)' : 'none'
            }}
            whileHover={status === 'idle' ? { scale: 1.02 } : {}}
            whileTap={status === 'idle' ? { scale: 0.98 } : {}}
          >
            {status === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-4 h-4" />}
            {status === 'idle' && <Send className="w-4 h-4" />}
            {status === 'sending' ? 'Opening email...' : status === 'success' ? 'Report Sent!' : 'Send Bug Report'}
          </motion.button>
        </div>
        
        <p className="text-xs text-white/40 text-center">
          This will open your email client to send the report
        </p>
      </form>
    </div>
  );
};

// Contact Support View
const ContactView = ({ onBack }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-2 p-4 border-b border-white/10">
      <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <ChevronLeft className="w-5 h-5 text-white/70" strokeWidth={1.5} />
      </button>
      <h3 className="text-sm font-semibold text-white">Contact Support</h3>
    </div>
    
    <div className="flex-1 p-4 space-y-4">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/15 border border-purple-500/30">
            <Mail className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">Email Support</h4>
            <p className="text-xs text-white/50">Avg. response: 2 hours</p>
          </div>
        </div>
        <a
          href="mailto:support@100crengine.in?subject=Support Request"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-medium transition-all bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25"
        >
          <Mail className="w-4 h-4" strokeWidth={1.5} />
          support@100crengine.in
        </a>
      </div>
      
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="text-sm font-medium text-white mb-2">Support Hours</h4>
        <p className="text-sm text-white/60">Monday - Friday</p>
        <p className="text-sm text-white/60">9:00 AM - 6:00 PM IST</p>
      </div>
      
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
        <p className="text-sm text-white/70">
          <span className="text-cyan-300 font-medium">Pro tip:</span> Check our FAQs first — most questions are answered there!
        </p>
      </div>
    </div>
  </div>
);

// Ask AI View (Coming Soon)
const AIView = ({ onBack }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-2 p-4 border-b border-white/10">
      <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <ChevronLeft className="w-5 h-5 text-white/70" strokeWidth={1.5} />
      </button>
      <h3 className="text-sm font-semibold text-white">Ask AI</h3>
    </div>
    
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-pink-500/15 border border-pink-500/30 mb-4">
        <Sparkles className="w-8 h-8 text-pink-400" strokeWidth={1.5} />
      </div>
      <h4 className="text-lg font-semibold text-white mb-2">Coming Soon</h4>
      <p className="text-sm text-white/60 max-w-[200px]">
        AI-powered support assistant to answer your questions instantly.
      </p>
      <div className="mt-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
        <span className="text-xs text-white/50">Expected: Q2 2026</span>
      </div>
    </div>
  </div>
);

// ─── Main HelpWidget Component ────────────────────────────────────────────────
export const HelpWidget = ({ variant = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('menu');
  const panelRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        const button = document.getElementById('help-widget-button');
        if (button && !button.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reset view when closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setCurrentView('menu'), 300);
    }
  }, [isOpen]);

  const handleSelect = (optionId) => {
    setCurrentView(optionId);
  };

  const handleBack = () => {
    setCurrentView('menu');
  };

  // Determine if we're on a dark background page
  const isDark = variant === 'dark' || variant === 'dashboard';

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" data-testid="help-widget">
      {/* Floating Button */}
      <motion.button
        id="help-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50'
        )}
        style={{
          background: isOpen 
            ? 'rgba(239,68,68,0.9)'
            : `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 100%)`,
          boxShadow: isOpen
            ? '0 4px 20px rgba(239,68,68,0.4)'
            : `0 4px 20px rgba(0,191,255,0.4), 0 0 0 1px rgba(0,191,255,0.2)`
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 0 : 0 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" strokeWidth={2} />
            </motion.div>
          ) : (
            <motion.div
              key="help"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HelpCircle className="w-6 h-6 text-white" strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-20 right-0 w-[340px] max-h-[480px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10,15,25,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
            }}
          >
            {/* Top shine */}
            <div 
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${C.brightCyan}40, transparent)` }}
            />
            
            {/* Content */}
            <div className="h-[480px] flex flex-col">
              <AnimatePresence mode="wait">
                {currentView === 'menu' && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    <MainMenu onSelect={handleSelect} />
                  </motion.div>
                )}
                {currentView === 'docs' && (
                  <motion.div
                    key="docs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    <DocsView onBack={handleBack} />
                  </motion.div>
                )}
                {currentView === 'faqs' && (
                  <motion.div
                    key="faqs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    <FAQsView onBack={handleBack} />
                  </motion.div>
                )}
                {currentView === 'bug' && (
                  <motion.div
                    key="bug"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    <BugReportView onBack={handleBack} />
                  </motion.div>
                )}
                {currentView === 'contact' && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    <ContactView onBack={handleBack} />
                  </motion.div>
                )}
                {currentView === 'ai' && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    <AIView onBack={handleBack} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpWidget;
