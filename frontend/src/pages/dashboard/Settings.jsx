// Comprehensive Settings Dashboard - Enhanced with #00BFFF cyan gradient theme
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, CreditCard, HelpCircle, Shield, Building, Mail,
  Trash2, Check, Crown, FileText, MessageCircle, Book,
  ExternalLink, ChevronRight, AlertTriangle, Sparkles, Zap,
  Receipt, Download, Loader2, Info, CheckCircle, XCircle,
  Globe, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/lib/api/dashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
};

// ─── Glass card ───────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', accentColor, style = {} }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    style={{
      background: 'rgba(5,15,24,0.60)',
      border: `1px solid ${accentColor ? accentColor + '22' : 'rgba(0,191,255,0.14)'}`,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxShadow: '0 0 0 1px rgba(0,191,255,0.04), 0 16px 48px rgba(0,0,0,0.40)',
      ...style,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg, transparent, ${accentColor || C.brightCyan}30, transparent)` }} />
    {children}
  </div>
);

// ─── Glass input ──────────────────────────────────────────────────────────────
const GlassInput = ({ type = 'text', value, onChange, placeholder, disabled = false, className = '' }) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
    className={cn('w-full h-11 px-4 rounded-xl text-sm focus:outline-none transition-all', className)}
    style={{
      background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(0,191,255,0.18)',
      color: disabled ? 'rgba(255,255,255,0.35)' : '#fff',
      caretColor: C.brightCyan,
    }}
    onFocus={e => !disabled && (e.target.style.borderColor = 'rgba(0,191,255,0.50)', e.target.style.boxShadow = `0 0 0 3px rgba(0,191,255,0.08)`)}
    onBlur={e  => (e.target.style.borderColor = 'rgba(0,191,255,0.18)', e.target.style.boxShadow = 'none')}
  />
);

const GlassSelect = ({ value, onChange, children, className = '' }) => (
  <select
    value={value} onChange={onChange}
    className={cn('w-full h-11 px-4 rounded-xl text-sm focus:outline-none transition-all appearance-none', className)}
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(0,191,255,0.18)',
      color: '#fff',
    }}
    onFocus={e => (e.target.style.borderColor = 'rgba(0,191,255,0.50)')}
    onBlur={e  => (e.target.style.borderColor = 'rgba(0,191,255,0.18)')}
  >{children}</select>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, accentColor = C.brightCyan }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }}>
      <Icon className="w-5 h-5" style={{ color: accentColor }} strokeWidth={1.5} />
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{subtitle}</p>}
    </div>
  </div>
);

// ─── Cyan CTA button ──────────────────────────────────────────────────────────
const CyanButton = ({ onClick, disabled, loading, success, children, className = '' }) => (
  <motion.button
    onClick={onClick} disabled={disabled || loading}
    className={cn('h-11 px-6 rounded-xl font-semibold text-sm flex items-center gap-2 relative overflow-hidden', className)}
    style={{
      background: success
        ? 'rgba(34,197,94,0.15)'
        : disabled
          ? 'rgba(255,255,255,0.08)'
          : `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
      color: success ? '#22C55E' : disabled ? 'rgba(255,255,255,0.35)' : C.darkCorner,
      border: success ? '1px solid rgba(34,197,94,0.30)' : 'none',
      boxShadow: !disabled && !success ? `0 0 0 1px rgba(0,191,255,0.30), 0 6px 20px rgba(0,191,255,0.22)` : 'none',
    }}
    whileHover={!disabled && !loading ? { scale: 1.02, boxShadow: `0 0 0 1px rgba(0,191,255,0.45), 0 10px 28px rgba(0,191,255,0.30)` } : {}}
    whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
  >
    {!disabled && !success && !loading && (
      <motion.span className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.24) 50%, transparent 65%)', backgroundSize: '200% 100%' }}
        animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
    )}
    <span className="relative z-10 flex items-center gap-2">{children}</span>
  </motion.button>
);

// ════════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ════════════════════════════════════════════════════════════════════════════
const ProfileSettings = ({ user, profile, onSave }) => {
  const [form, setForm] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    company: profile?.company_name || '',
    stage: profile?.funding_stage || 'pre-seed',
    phone: profile?.phone || '',
    website: profile?.website || '',
    timezone: profile?.timezone || 'Asia/Kolkata',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try { await onSave?.(form); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* Personal info */}
      <GlassCard accentColor={C.brightCyan}>
        <div className="p-6">
          <SectionHeader icon={User} title="Personal Information" subtitle="Your profile visible to the platform" accentColor={C.brightCyan} />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Full Name</Label>
              <GlassInput value={form.fullName} onChange={set('fullName')} placeholder="e.g., Priya Sharma" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Email Address</Label>
              <div className="relative">
                <GlassInput type="email" value={form.email} disabled />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.28)', color: '#22C55E' }}>
                  Verified
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Phone Number</Label>
              <GlassInput type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Timezone</Label>
              <GlassSelect value={form.timezone} onChange={set('timezone')}>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="America/New_York">US Eastern</option>
                <option value="America/Los_Angeles">US Pacific</option>
                <option value="Europe/London">UK (GMT)</option>
                <option value="Asia/Singapore">Singapore</option>
              </GlassSelect>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Company info */}
      <GlassCard accentColor={C.midCyan}>
        <div className="p-6">
          <SectionHeader icon={Building} title="Company Information" subtitle="Details about your startup" accentColor={C.midCyan} />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Company Name</Label>
              <GlassInput value={form.company} onChange={set('company')} placeholder="Your Startup Name" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Funding Stage</Label>
              <GlassSelect value={form.stage} onChange={set('stage')}>
                <option value="bootstrapped">Bootstrapped</option>
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B+</option>
              </GlassSelect>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Website</Label>
              <GlassInput type="url" value={form.website} onChange={set('website')} placeholder="https://yourstartup.com" />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <CyanButton onClick={handleSave} loading={saving} success={saved}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />Saving...</>
           : saved  ? <><CheckCircle className="w-4 h-4" strokeWidth={1.5} />Saved!</>
           : 'Save Changes'}
        </CyanButton>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// BILLING TAB
// ════════════════════════════════════════════════════════════════════════════
const BillingSettings = ({ subscription, onUpgrade }) => {
  const [invoices] = useState([
    { id: 'INV-001', date: '2026-03-01', amount: '₹899', status: 'paid' },
    { id: 'INV-002', date: '2025-03-01', amount: '₹899', status: 'paid' },
  ]);
  const currentPlan = subscription?.plan || 'free';
  const isPaid = currentPlan !== 'free';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* Plan overview */}
      <GlassCard accentColor={C.brightCyan} style={{
        background: `linear-gradient(145deg, rgba(0,96,128,0.35) 0%, rgba(5,15,24,0.80) 100%)`,
        border: `1px solid rgba(0,191,255,0.28)`,
        boxShadow: `0 0 0 1px rgba(0,191,255,0.06), 0 20px 56px rgba(0,0,0,0.50), 0 0 50px rgba(0,191,255,0.06)`,
      }}>
        <div className="p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{
                  background: isPaid ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.08)',
                  border: isPaid ? '1px solid rgba(245,158,11,0.30)' : '1px solid rgba(255,255,255,0.12)',
                  color: isPaid ? '#F59E0B' : 'rgba(255,255,255,0.55)',
                }}>
                {isPaid && <Crown className="w-3.5 h-3.5" strokeWidth={1.5} />}
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
              </span>
              <p className="text-4xl font-bold font-mono text-white mb-1">
                {isPaid ? '₹899' : 'Free'}
                <span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {isPaid ? '/year' : ''}
                </span>
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {isPaid ? `Renews on March 1, 2027` : 'Upgrade to unlock all features'}
              </p>
            </div>
            {!isPaid && (
              <CyanButton onClick={onUpgrade}>
                <Zap className="w-4 h-4" strokeWidth={1.5} />
                Upgrade to Founder Plan
              </CyanButton>
            )}
          </div>

          {/* Feature pills */}
          <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-6"
            style={{ borderTop: '1px solid rgba(0,191,255,0.12)' }}>
            {[
              { label: 'Projections', value: isPaid ? 'Unlimited' : '3/month', ok: true },
              { label: 'AI Coach',    value: isPaid ? 'Full Access' : 'Limited',  ok: isPaid },
              { label: 'Board Reports',value: isPaid ? '2/month' : '0',           ok: isPaid },
              { label: 'Connectors', value: isPaid ? 'Unlimited' : '1',          ok: true },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: f.ok ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', border: f.ok ? '1px solid rgba(34,197,94,0.28)' : 'none' }}>
                  {f.ok
                    ? <Check className="w-3 h-3" style={{ color: '#22C55E' }} strokeWidth={2.5} />
                    : <XCircle className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.25)' }} strokeWidth={1.5} />
                  }
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>{f.label}</p>
                  <p className="text-sm font-medium text-white">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Usage stats */}
      <GlassCard accentColor='#22C55E'>
        <div className="p-6">
          <SectionHeader icon={Sparkles} title="Usage This Month" subtitle="Your feature usage resets on the 1st" accentColor='#22C55E' />
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Projections', used: 2, total: isPaid ? '∞' : 3, pct: isPaid ? 0 : 67 },
              { label: 'AI Insights', used: 5, total: isPaid ? 20 : 5,  pct: isPaid ? 25 : 100 },
              { label: 'API Calls',   used: 142, total: isPaid ? 1000 : 100, pct: isPaid ? 14 : 100 },
            ].map(u => (
              <div key={u.label} className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.52)' }}>{u.label}</span>
                  <span className="text-xs font-mono font-semibold text-white">{u.used}/{u.total}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{
                      background: u.pct >= 90 ? '#EF4444' : u.pct >= 70 ? '#F59E0B' : C.brightCyan,
                      boxShadow: u.pct >= 90 ? '0 0 6px #EF444466' : `0 0 6px ${C.brightCyan}55`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${u.pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Payment + Invoices */}
      <div className="grid md:grid-cols-2 gap-5">
        <GlassCard accentColor={C.midCyan}>
          <div className="p-6">
            <SectionHeader icon={CreditCard} title="Payment Method" subtitle="Manage your payment details" accentColor={C.midCyan} />
            {isPaid ? (
              <div className="p-3 rounded-xl mb-4 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${C.brightCyan}, ${C.tealEdge})` }}>R</div>
                <div>
                  <p className="font-semibold text-sm text-white">Razorpay</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>**** **** **** 4242</p>
                </div>
              </div>
            ) : <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.42)' }}>No payment method on file</p>}
            <button className="w-full h-10 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(0,191,255,0.07)',
                border: '1px solid rgba(0,191,255,0.22)',
                color: C.brightCyan2,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.07)'; }}
            >
              {isPaid ? 'Update Payment Method' : 'Add Payment Method'}
            </button>
          </div>
        </GlassCard>

        <GlassCard accentColor='#F59E0B'>
          <div className="p-6">
            <SectionHeader icon={Receipt} title="Invoices" subtitle="Download your billing history" accentColor='#F59E0B' />
            <div className="space-y-2">
              {invoices.map(inv => (
                <motion.div key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  whileHover={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(0,191,255,0.20)' }}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.45)' }} strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-medium text-white">{inv.id}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>{inv.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{inv.amount}</span>
                    <Download className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.40)' }} strokeWidth={1.5} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SUPPORT TAB
// ════════════════════════════════════════════════════════════════════════════
const SupportSettings = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: "How do I update my monthly revenue?", a: "Go to the Command Centre and click 'Monthly Check-in'. Enter your actual revenue for the month and any notes." },
    { q: "What does the Health Score mean?",    a: "Your Health Score (0-100) is calculated from growth consistency, revenue quality, check-in frequency, and benchmark performance." },
    { q: "How do I connect my payment provider?", a: "Navigate to API Connectors in the sidebar. Click 'Connect' on your provider and enter your API keys." },
    { q: "Can I export my data?",               a: "Yes! Go to Reporting Engine to generate board reports, investor updates, or data room exports as PDF." },
    { q: "How accurate are the projections?",   a: "Projections are based on your current growth rate and historical data. Regular check-ins improve accuracy significantly." },
  ];
  const resources = [
    { title: 'Getting Started Guide', icon: Book },
    { title: 'API Documentation',     icon: FileText },
    { title: 'Video Tutorials',       icon: Globe },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* Contact */}
      <GlassCard accentColor={C.brightCyan2} style={{
        background: `linear-gradient(145deg, rgba(0,96,128,0.30) 0%, rgba(5,15,24,0.75) 100%)`,
        border: `1px solid rgba(0,191,255,0.22)`,
      }}>
        <div className="p-6 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,191,255,0.12)', border: '1px solid rgba(0,191,255,0.28)' }}>
            <MessageCircle className="w-5 h-5" style={{ color: C.brightCyan }} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Need Help?</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.52)' }}>
              Our support team is here to help you succeed. Average response time: 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <CyanButton>
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                Email Support
              </CyanButton>
              <motion.button
                className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.80)' }}
                whileHover={{ background: 'rgba(255,255,255,0.10)', color: '#fff', scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                Live Chat
              </motion.button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* FAQs */}
      <GlassCard accentColor={C.midCyan}>
        <div className="p-6">
          <SectionHeader icon={HelpCircle} title="Frequently Asked Questions" subtitle="Quick answers to common questions" accentColor={C.midCyan} />
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden"
                style={{ border: openFaq === i ? '1px solid rgba(0,191,255,0.28)' : '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left transition-colors"
                  style={{ background: openFaq === i ? 'rgba(0,191,255,0.06)' : 'rgba(255,255,255,0.03)' }}
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }} strokeWidth={1.5} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden', borderTop: '1px solid rgba(0,191,255,0.12)' }}>
                      <div className="px-4 pb-4 pt-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Resources */}
      <GlassCard accentColor='#22C55E'>
        <div className="p-6">
          <SectionHeader icon={Book} title="Resources" subtitle="Guides and documentation" accentColor='#22C55E' />
          <div className="grid sm:grid-cols-3 gap-3">
            {resources.map(r => (
              <motion.a key={r.title} href="#"
                className="flex items-center gap-3 p-4 rounded-xl transition-all group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                whileHover={{ background: 'rgba(0,191,255,0.07)', borderColor: 'rgba(0,191,255,0.25)', y: -2 }}
              >
                <r.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }} strokeWidth={1.5} />
                <span className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{r.title}</span>
                <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.28)' }} strokeWidth={1.5} />
              </motion.a>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Report bug */}
      <div className="flex items-start gap-4 p-5 rounded-xl"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.28)' }}>
          <AlertTriangle className="w-5 h-5" style={{ color: '#F59E0B' }} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Report an Issue</h3>
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Found a bug? Let us know and we'll fix it.
          </p>
          <motion.button className="h-9 px-4 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.28)', color: '#F59E0B' }}
            whileHover={{ background: 'rgba(245,158,11,0.20)', scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            Report Bug
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN SETTINGS
// ════════════════════════════════════════════════════════════════════════════
export const Settings = () => {
  const { user, profile, subscription, getAccessToken, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const handleSaveProfile = async (data) => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error('Not authenticated');
    const result = await updateUserProfile(accessToken, { name: data.fullName, company: data.company, stage: data.stage });
    if (refreshProfile) await refreshProfile();
    return result;
  };

  const tabs = [
    { value: 'profile',  label: 'Profile',  Icon: User       },
    { value: 'billing',  label: 'Billing',  Icon: CreditCard },
    { value: 'support',  label: 'Support',  Icon: HelpCircle },
  ];

  return (
    <div
      className="min-h-full relative"
      style={{ background: C.darkCorner }}
      data-testid="settings"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 65% 35% at 50% 0%, rgba(0,191,255,0.10) 0%, transparent 55%),
          radial-gradient(ellipse 35% 50% at 5%  60%, rgba(0,96,128,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 35% 50% at 95% 60%, rgba(0,96,128,0.12) 0%, transparent 55%)
        `,
      }} />

      <div className="relative z-10 space-y-6 p-6 md:p-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold mb-1"
            style={{
              background: `linear-gradient(135deg, #fff 35%, ${C.brightCyan2} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
            Settings
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Manage your account, subscription, and preferences
          </p>
        </motion.div>

        {/* Tabs */}
        <div>
          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-xl mb-6"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,191,255,0.12)', width: 'fit-content' }}>
            {tabs.map(({ value, label, Icon }) => {
              const active = activeTab === value;
              return (
                <motion.button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors relative"
                  style={{
                    background: active ? `linear-gradient(135deg, rgba(0,191,255,0.18), rgba(0,153,204,0.10))` : 'transparent',
                    color: active ? C.brightCyan2 : 'rgba(255,255,255,0.50)',
                    border: active ? `1px solid rgba(0,191,255,0.28)` : '1px solid transparent',
                  }}
                  whileHover={!active ? { color: 'rgba(255,255,255,0.80)' } : {}}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">{label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              {activeTab === 'profile' && <ProfileSettings user={user} profile={profile} onSave={handleSaveProfile} />}
              {activeTab === 'billing' && <BillingSettings subscription={subscription} onUpgrade={() => window.location.href = '/pricing'} />}
              {activeTab === 'support' && <SupportSettings />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Danger zone */}
        <div className="flex items-start gap-4 p-5 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.20)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <Trash2 className="w-5 h-5" style={{ color: '#EF4444' }} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={{ color: '#EF4444' }}>Danger Zone</h3>
            <p className="text-sm mb-3" style={{ color: 'rgba(239,68,68,0.70)' }}>
              Once you delete your account, there is no going back. All your data will be permanently deleted.
            </p>
            <motion.button className="h-9 px-4 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.28)', color: '#EF4444' }}
              whileHover={{ background: 'rgba(239,68,68,0.18)', scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              Delete Account
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;