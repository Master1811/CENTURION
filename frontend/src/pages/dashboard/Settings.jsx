// Comprehensive Settings Dashboard
// ================================
// Features: Profile, Billing & Subscription, Support & Help Center
// Design: Glassmorphism with subtle 3D elements and animations

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  HelpCircle, 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Building,
  Mail,
  Phone,
  Globe,
  Trash2,
  Check,
  Crown,
  FileText,
  MessageCircle,
  Book,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  Zap,
  Receipt,
  Calendar,
  Download,
  Loader2,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/lib/api/dashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { BackgroundPaths } from '@/components/ui/BackgroundPaths';
import { GlassAccountSettingsCard } from '@/components/ui/GlassAccountSettingsCard';

// ============================================================================
// PROFILE SETTINGS TAB
// ============================================================================

const ProfileSettings = ({ user, profile, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    company: profile?.company_name || '',
    stage: profile?.funding_stage || 'pre-seed',
    phone: profile?.phone || '',
    website: profile?.website || '',
    timezone: profile?.timezone || 'Asia/Kolkata',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Personal Information */}
      <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <User className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-[#09090B]">Personal Information</h3>
            <p className="text-xs text-[#71717A]">Your profile details visible to the platform</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-[#52525B] flex items-center gap-1">
              Full Name
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your name as it appears in reports</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g., Priya Sharma"
              className="w-full h-11 px-4 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-[#52525B]">Email Address</Label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full h-11 px-4 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm bg-[#F9FAFB] text-[#71717A] cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Badge variant="outline" className="text-xs">Verified</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-[#52525B]">Phone Number</Label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full h-11 px-4 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-[#52525B]">Timezone</Label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] bg-white"
            >
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="America/New_York">US Eastern</option>
              <option value="America/Los_Angeles">US Pacific</option>
              <option value="Europe/London">UK (GMT)</option>
              <option value="Asia/Singapore">Singapore</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100">
            <Building className="w-5 h-5 text-violet-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-[#09090B]">Company Information</h3>
            <p className="text-xs text-[#71717A]">Details about your startup</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-[#52525B]">Company Name</Label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Your Startup Name"
              className="w-full h-11 px-4 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-[#52525B]">Funding Stage</Label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] bg-white"
            >
              <option value="bootstrapped">Bootstrapped</option>
              <option value="pre-seed">Pre-Seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
              <option value="series-b">Series B+</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm text-[#52525B]">Website</Label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourstartup.com"
              className="w-full h-11 px-4 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "h-11 px-6 rounded-xl bg-[#09090B] text-white font-medium",
            "hover:bg-[#18181B] transition-all",
            "disabled:opacity-50",
            "flex items-center gap-2"
          )}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// BILLING & SUBSCRIPTION TAB
// ============================================================================

const BillingSettings = ({ subscription, onUpgrade }) => {
  const [invoices] = useState([
    { id: 'INV-001', date: '2026-03-01', amount: '₹899', status: 'paid' },
    { id: 'INV-002', date: '2025-03-01', amount: '₹899', status: 'paid' },
  ]);

  const currentPlan = subscription?.plan || 'free';
  const isPaid = currentPlan !== 'free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Plan Overview */}
      <div className="relative rounded-2xl border border-[rgba(0,0,0,0.06)] bg-gradient-to-br from-white to-[#FAFAFA] overflow-hidden">
        <BackgroundPaths title="">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn(
                    "rounded-full px-3 py-1",
                    isPaid 
                      ? "bg-amber-100 text-amber-700 border-amber-200" 
                      : "bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]"
                  )}>
                    {isPaid ? <Crown className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} /> : null}
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-[#09090B] mb-1">
                  {isPaid ? '₹899' : 'Free'}<span className="text-sm font-normal text-[#71717A]">{isPaid ? '/year' : ''}</span>
                </h2>
                <p className="text-sm text-[#71717A]">
                  {isPaid 
                    ? `Renews on ${subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'March 1, 2027'}`
                    : 'Upgrade to unlock all features'
                  }
                </p>
              </div>
              
              {!isPaid && (
                <Button
                  onClick={onUpgrade}
                  className={cn(
                    "h-12 px-6 rounded-xl bg-[#09090B] text-white font-medium",
                    "shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)]",
                    "hover:-translate-y-0.5 hover:bg-[#18181B]",
                    "transition-all duration-300",
                    "flex items-center gap-2"
                  )}
                >
                  <Zap className="w-4 h-4" strokeWidth={1.5} />
                  Upgrade to Founder Plan
                </Button>
              )}
            </div>

            {/* Plan Features */}
            <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Projections', value: isPaid ? 'Unlimited' : '3/month', included: true },
                { label: 'AI Coach', value: isPaid ? 'Full Access' : 'Limited', included: isPaid },
                { label: 'Board Reports', value: isPaid ? '2/month' : '0', included: isPaid },
                { label: 'Connectors', value: isPaid ? 'Unlimited' : '1', included: true },
              ].map((feature) => (
                <div 
                  key={feature.label}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/80 border border-[rgba(0,0,0,0.04)]"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    feature.included ? "bg-emerald-100 text-emerald-600" : "bg-[#F4F4F5] text-[#A1A1AA]"
                  )}>
                    {feature.included ? (
                      <Check className="w-3 h-3" strokeWidth={2} />
                    ) : (
                      <XCircle className="w-3 h-3" strokeWidth={1.5} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-[#71717A]">{feature.label}</p>
                    <p className="text-sm font-medium text-[#09090B]">{feature.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BackgroundPaths>
      </div>

      {/* Usage Stats */}
      <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
            <Sparkles className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-[#09090B]">Usage This Month</h3>
            <p className="text-xs text-[#71717A]">Your feature usage resets on the 1st</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Projections', used: 2, total: isPaid ? '∞' : 3, percent: isPaid ? 0 : 67 },
            { label: 'AI Insights', used: 5, total: isPaid ? 20 : 5, percent: isPaid ? 25 : 100 },
            { label: 'API Calls', used: 142, total: isPaid ? 1000 : 100, percent: isPaid ? 14 : 100 },
          ].map((usage) => (
            <div key={usage.label} className="p-4 rounded-xl bg-[#FAFAFA]">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#52525B]">{usage.label}</span>
                <span className="text-sm font-mono font-medium text-[#09090B]">
                  {usage.used}/{usage.total}
                </span>
              </div>
              <div className="h-2 bg-[#E4E4E7] rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    usage.percent >= 90 ? "bg-red-500" : usage.percent >= 70 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${usage.percent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method & Invoices */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Method */}
        <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <CreditCard className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-[#09090B]">Payment Method</h3>
              <p className="text-xs text-[#71717A]">Manage your payment details</p>
            </div>
          </div>

          {isPaid ? (
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  R
                </div>
                <div>
                  <p className="font-medium text-[#09090B]">Razorpay</p>
                  <p className="text-xs text-[#71717A]">**** **** **** 4242</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#71717A] mb-4">No payment method on file</p>
          )}

          <Button
            variant="outline"
            className="w-full h-10 rounded-xl border-[rgba(0,0,0,0.1)]"
          >
            {isPaid ? 'Update Payment Method' : 'Add Payment Method'}
          </Button>
        </div>

        {/* Invoices */}
        <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
              <Receipt className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-[#09090B]">Invoices</h3>
              <p className="text-xs text-[#71717A]">Download your billing history</p>
            </div>
          </div>

          {invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-medium text-[#09090B]">{invoice.id}</p>
                      <p className="text-xs text-[#71717A]">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{invoice.amount}</span>
                    <Download className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#71717A]">No invoices yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// SUPPORT & HELP CENTER TAB
// ============================================================================

const SupportSettings = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: "How do I update my monthly revenue?",
      answer: "Go to the Command Centre and click 'Monthly Check-in'. Enter your actual revenue for the month and any notes. This updates your projection and tracks your progress."
    },
    {
      question: "What does the Health Score mean?",
      answer: "Your Health Score (0-100) is calculated based on growth consistency, revenue quality, check-in frequency, and benchmark performance. A score above 70 indicates you're on track."
    },
    {
      question: "How do I connect my payment provider?",
      answer: "Navigate to API Connectors in the sidebar. Click 'Connect' on your payment provider (Razorpay, Stripe, etc.) and enter your API keys. Your revenue will sync automatically."
    },
    {
      question: "Can I export my data?",
      answer: "Yes! Go to Reporting Engine to generate board reports, investor updates, or data room exports. All reports can be downloaded as PDF."
    },
    {
      question: "How accurate are the projections?",
      answer: "Projections are based on your current growth rate and historical data. Regular check-ins improve accuracy. The AI coach provides insights on factors that may affect your timeline."
    },
  ];

  const resources = [
    { title: "Getting Started Guide", icon: Book, link: "#" },
    { title: "API Documentation", icon: FileText, link: "#" },
    { title: "Video Tutorials", icon: Globe, link: "#" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Contact Support */}
      <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-gradient-to-br from-violet-50/50 to-white p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-100">
            <MessageCircle className="w-6 h-6 text-violet-600" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#09090B] mb-1">Need Help?</h3>
            <p className="text-sm text-[#71717A] mb-4">
              Our support team is here to help you succeed. Average response time: 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className={cn(
                  "h-11 px-5 rounded-xl bg-[#09090B] text-white",
                  "hover:bg-[#18181B] transition-all"
                )}
              >
                <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Email Support
              </Button>
              <Button
                variant="outline"
                className="h-11 px-5 rounded-xl border-[rgba(0,0,0,0.1)]"
              >
                <MessageCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <HelpCircle className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-[#09090B]">Frequently Asked Questions</h3>
            <p className="text-xs text-[#71717A]">Quick answers to common questions</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="rounded-xl border border-[rgba(0,0,0,0.06)] overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#FAFAFA] transition-colors"
              >
                <span className="text-sm font-medium text-[#09090B]">{faq.question}</span>
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 text-[#71717A] transition-transform",
                    expandedFaq === index && "rotate-90"
                  )} 
                  strokeWidth={1.5} 
                />
              </button>
              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-sm text-[#52525B] border-t border-[rgba(0,0,0,0.06)] pt-3 bg-[#FAFAFA]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
            <Book className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-[#09090B]">Resources</h3>
            <p className="text-xs text-[#71717A]">Guides and documentation</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.link}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl",
                "border border-[rgba(0,0,0,0.06)]",
                "hover:bg-[#FAFAFA] hover:border-[rgba(0,0,0,0.1)]",
                "transition-all group"
              )}
            >
              <resource.icon className="w-5 h-5 text-[#71717A] group-hover:text-[#09090B] transition-colors" strokeWidth={1.5} />
              <span className="text-sm text-[#52525B] group-hover:text-[#09090B] flex-1">{resource.title}</span>
              <ExternalLink className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </div>

      {/* Report an Issue */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-100">
            <AlertTriangle className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#09090B] mb-1">Report an Issue</h3>
            <p className="text-sm text-[#71717A] mb-4">
              Found a bug or something not working as expected? Let us know and we'll fix it.
            </p>
            <Button
              variant="outline"
              className="h-10 px-5 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Report Bug
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN SETTINGS COMPONENT
// ============================================================================

export const Settings = () => {
  const { user, profile, subscription, getAccessToken, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const handleSaveProfile = async (data) => {
    // Transform frontend field names to backend expected field names
    const profileData = {
      name: data.fullName || data.name,
      company: data.company,
      stage: data.stage,
    };

    // Get access token for authenticated API call
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Call the API to update the profile
    const result = await updateUserProfile(accessToken, profileData);

    // Refresh the profile data in context after successful update
    if (refreshProfile) {
      await refreshProfile();
    }

    return result;
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  return (
    <div className="space-y-6" data-testid="settings">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] mb-1">Settings</h1>
          <p className="text-sm text-[#71717A]">Manage your account, subscription, and preferences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-[#F4F4F5] p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger 
            value="profile"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg",
              "data-[state=active]:bg-white data-[state=active]:shadow-sm"
            )}
          >
            <User className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg",
              "data-[state=active]:bg-white data-[state=active]:shadow-sm"
            )}
          >
            <CreditCard className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger 
            value="support"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg",
              "data-[state=active]:bg-white data-[state=active]:shadow-sm"
            )}
          >
            <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile" className="mt-0">
            <ProfileSettings 
              user={user} 
              profile={profile} 
              onSave={handleSaveProfile}
            />
          </TabsContent>

          <TabsContent value="billing" className="mt-0">
            <BillingSettings 
              subscription={subscription}
              onUpgrade={handleUpgrade}
            />
          </TabsContent>

          <TabsContent value="support" className="mt-0">
            <SupportSettings />
          </TabsContent>
        </div>
      </Tabs>

      {/* Danger Zone - Always visible at bottom */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-700 mb-1">Danger Zone</h3>
            <p className="text-sm text-red-600/80 mb-4">
              Once you delete your account, there is no going back. All your data will be permanently deleted.
            </p>
            <Button
              variant="outline"
              className="h-10 px-5 rounded-xl border-red-300 text-red-600 hover:bg-red-100"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
