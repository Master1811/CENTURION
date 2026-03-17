// GlassAccountSettingsCard - Premium glassmorphism settings component
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Crown, CreditCard, FileText, Shield, Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function GlassAccountSettingsCard({ 
  planName = "Pro",
  planPrice = "₹899",
  billingCycle = "yearly",
  email = "founder@startup.com",
  planFeatures = [
    "Unlimited projections",
    "Priority support",
    "AI Growth Coach access",
    "Board report generation",
  ],
  onManagePlan,
  onCancelSubscription,
  onViewInvoices,
  onUpdatePayment,
  onManage2FA,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [autoRenew, setAutoRenew] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
      }}
      className="group w-full rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.08)] bg-white/90 p-6 md:p-8 backdrop-blur-xl relative"
      aria-labelledby="glass-account-title"
    >
      {/* Gradient overlay on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[rgba(0,0,0,0.02)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10"
      />
      
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-[#F9FAFB] px-3 py-1 text-xs uppercase tracking-widest text-[#71717A]">
            Account Settings
          </div>
          <h1
            id="glass-account-title"
            className="mt-3 text-xl font-semibold text-[#09090B] sm:text-2xl"
          >
            Manage your account and subscription
          </h1>
          <p className="mt-2 text-sm text-[#71717A]">
            Update personal details, control notifications, and manage your current plan.
          </p>
        </div>
        <Badge className={cn(
          "rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-amber-700",
          "transition-colors duration-300 hover:border-amber-300 hover:bg-amber-100",
          "flex items-center gap-1.5"
        )}>
          <Crown className="w-3.5 h-3.5" strokeWidth={1.5} />
          {planName}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Security Card */}
          <div className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA]/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
              <h2 className="text-sm font-medium text-[#09090B]">Security</h2>
            </div>
            <p className="mb-4 text-xs text-[#71717A]">
              Control how you access your account.
            </p>
            <div className="space-y-4 text-sm text-[#71717A]">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-[#52525B]">
                  Email
                </Label>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {email}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[#52525B]">
                  Two-factor authentication
                </Label>
                <Button
                  variant="outline"
                  onClick={onManage2FA}
                  className="rounded-full border-[rgba(0,0,0,0.1)] px-4 py-2 text-xs h-8"
                >
                  <Smartphone className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                  Manage 2FA
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA]/80 p-5 backdrop-blur">
            <h2 className="text-sm font-medium text-[#09090B] mb-1">
              Notifications
            </h2>
            <p className="mb-4 text-xs text-[#71717A]">
              Decide what updates reach your inbox.
            </p>
            <div className="space-y-4 text-sm text-[#71717A]">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-[#52525B]">Auto-renew subscription</span>
                <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
              </label>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-[#52525B]">Product update emails</span>
                <Switch
                  checked={productUpdates}
                  onCheckedChange={setProductUpdates}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA]/80 p-5 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-[#09090B]">
                  Current plan
                </h2>
                <p className="text-xs text-[#71717A]">
                  {planName} - billed {billingCycle}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold text-[#09090B] font-mono">
                  {planPrice}
                </span>
                <p className="text-xs text-[#71717A]">
                  per year
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 text-sm text-[#71717A]">
              {planFeatures.map((feature) => (
                <p key={feature} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                    <Check className="h-3 w-3" aria-hidden strokeWidth={2} />
                  </span>
                  {feature}
                </p>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onCancelSubscription}
                className="flex-1 rounded-full border-[rgba(0,0,0,0.1)] bg-white px-6 py-2.5 text-sm text-[#71717A] hover:text-red-600 hover:border-red-200"
              >
                Cancel subscription
              </Button>
              <Button
                type="button"
                onClick={onManagePlan}
                className={cn(
                  "flex-1 rounded-full bg-[#09090B] px-6 py-2.5 text-white",
                  "shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)]",
                  "transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#18181B]"
                )}
              >
                Manage plan
              </Button>
            </div>
          </div>

          {/* Billing Card */}
          <div className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA]/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
              <h2 className="text-sm font-medium text-[#09090B]">Billing</h2>
            </div>
            <p className="mb-4 text-xs text-[#71717A]">
              Download invoices or update payment details.
            </p>
            <div className="flex flex-col gap-3 text-sm text-[#71717A] sm:flex-row">
              <Button
                variant="outline"
                onClick={onViewInvoices}
                className="flex-1 rounded-full border-[rgba(0,0,0,0.1)] px-6 py-2.5 text-sm text-[#71717A] hover:text-[#09090B]"
              >
                <FileText className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                View invoices
              </Button>
              <Button
                variant="outline"
                onClick={onUpdatePayment}
                className="flex-1 rounded-full border-[rgba(0,0,0,0.1)] px-6 py-2.5 text-sm text-[#71717A] hover:text-[#09090B]"
              >
                <CreditCard className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                Update payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default GlassAccountSettingsCard;
