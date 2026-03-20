// Privacy Policy Page
// ====================
// DPDP Act 2023 compliant privacy policy
// Covers the six required disclosures

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, UserCheck, Clock, Mail, AlertCircle } from 'lucide-react';

const PrivacyPage = () => {
  const lastUpdated = 'March 20, 2026';
  const dpoEmail = 'dpo@centurion.in';
  const companyName = 'Centurion Technologies Private Limited';
  
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#09090B]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-zinc-400">
            Last updated: {lastUpdated}
          </p>
          <p className="text-zinc-300 mt-4">
            This Privacy Policy describes how {companyName} ("we", "us", "our") 
            collects, uses, and protects your personal data in compliance with the 
            Digital Personal Data Protection Act, 2023 (DPDP Act).
          </p>
        </div>

        {/* DPDP Disclosure Sections */}
        <div className="space-y-10">
          
          {/* 1. Identity of Data Fiduciary */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold">1. Identity of Data Fiduciary</h2>
            </div>
            <div className="pl-11 text-zinc-300 space-y-2">
              <p>
                <strong>Data Fiduciary:</strong> {companyName}
              </p>
              <p>
                Centurion is the data fiduciary responsible for processing your personal data. 
                We determine the purpose and means of processing personal data collected 
                through our platform.
              </p>
              <p>
                <strong>Registered Address:</strong> Bangalore, Karnataka, India
              </p>
            </div>
          </section>

          {/* 2. Categories of Personal Data Collected */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">2. Categories of Personal Data Collected</h2>
            </div>
            <div className="pl-11 text-zinc-300">
              <p className="mb-4">We collect the following categories of personal data:</p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400">
                <li>
                  <strong className="text-zinc-200">Identity Data:</strong> Name, email address, company name
                </li>
                <li>
                  <strong className="text-zinc-200">Business Data:</strong> Revenue figures, growth metrics, 
                  business stage, funding information (voluntarily provided)
                </li>
                <li>
                  <strong className="text-zinc-200">Technical Data:</strong> IP address, browser type, 
                  device information, usage logs
                </li>
                <li>
                  <strong className="text-zinc-200">Consent Records:</strong> Timestamps and records of your 
                  consent for data processing
                </li>
                <li>
                  <strong className="text-zinc-200">Payment Data:</strong> Transaction IDs, subscription 
                  status (actual card details are processed by Razorpay)
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Purpose of Processing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">3. Purpose of Processing</h2>
            </div>
            <div className="pl-11 text-zinc-300">
              <p className="mb-4">Your personal data is processed for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400">
                <li>Providing revenue projection and business intelligence services</li>
                <li>User authentication and account management</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Sending service-related notifications and updates</li>
                <li>Improving our services through analytics (with consent)</li>
                <li>Complying with legal obligations</li>
                <li>Beta waitlist management and early access notifications</li>
              </ul>
            </div>
          </section>

          {/* 4. Retention Period */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">4. Retention Period</h2>
            </div>
            <div className="pl-11 text-zinc-300">
              <p className="mb-4">We retain your personal data for the following periods:</p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400">
                <li>
                  <strong className="text-zinc-200">Active accounts:</strong> Data is retained as long as 
                  your account is active and for 3 years after account deletion
                </li>
                <li>
                  <strong className="text-zinc-200">Waitlist data:</strong> Until you are onboarded or 
                  request deletion, whichever is earlier
                </li>
                <li>
                  <strong className="text-zinc-200">Payment records:</strong> 7 years as required by 
                  Indian tax law
                </li>
                <li>
                  <strong className="text-zinc-200">Consent records:</strong> 5 years from the date of 
                  consent for audit purposes
                </li>
              </ul>
            </div>
          </section>

          {/* 5. User Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold">5. Your Rights Under DPDP Act</h2>
            </div>
            <div className="pl-11 text-zinc-300">
              <p className="mb-4">As a Data Principal, you have the following rights:</p>
              <div className="space-y-4">
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-semibold text-white mb-2">Right to Access</h3>
                  <p className="text-zinc-400 text-sm">
                    You can request a summary of your personal data being processed and 
                    the processing activities being undertaken.
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-semibold text-white mb-2">Right to Correction</h3>
                  <p className="text-zinc-400 text-sm">
                    You can request correction of inaccurate or misleading personal data, 
                    and completion of incomplete data.
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-semibold text-white mb-2">Right to Erasure</h3>
                  <p className="text-zinc-400 text-sm">
                    You can request erasure of your personal data when the purpose for 
                    which it was collected has been served, subject to legal requirements.
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-semibold text-white mb-2">Right to Grievance Redressal</h3>
                  <p className="text-zinc-400 text-sm">
                    You can lodge complaints with us or with the Data Protection Board 
                    of India if you believe your data rights have been violated.
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="font-semibold text-white mb-2">Right to Nominate</h3>
                  <p className="text-zinc-400 text-sm">
                    You can nominate another person to exercise your rights in the event 
                    of your death or incapacity.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Contact Details (DPO) */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold">6. Contact Details</h2>
            </div>
            <div className="pl-11 text-zinc-300">
              <p className="mb-4">
                For any queries regarding this Privacy Policy or to exercise your rights, 
                please contact our Data Protection Officer:
              </p>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
                <p className="mb-2">
                  <strong>Data Protection Officer</strong>
                </p>
                <p className="text-cyan-400 mb-2">
                  <a href={`mailto:${dpoEmail}`} className="hover:underline">
                    {dpoEmail}
                  </a>
                </p>
                <p className="text-sm text-zinc-400">
                  Response time: Within 7 working days
                </p>
              </div>
            </div>
          </section>

          {/* Cookie Policy */}
          <section>
            <h2 className="text-xl font-semibold mb-4">7. Cookie Policy</h2>
            <div className="text-zinc-300 space-y-4">
              <p>
                We use cookies and similar technologies to enhance your experience. 
                You can manage your cookie preferences through the cookie consent banner 
                that appears on your first visit.
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-400">
                <li>
                  <strong className="text-zinc-200">Essential cookies:</strong> Required for 
                  the platform to function properly
                </li>
                <li>
                  <strong className="text-zinc-200">Analytics cookies:</strong> Help us 
                  understand how you use our service (only with your consent)
                </li>
              </ul>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-xl font-semibold mb-4">8. Changes to This Policy</h2>
            <div className="text-zinc-300">
              <p>
                We may update this Privacy Policy from time to time. We will notify you 
                of any material changes by email or through a notice on our platform. 
                The "Last updated" date at the top of this policy indicates when it was 
                last revised.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm text-center">
            This Privacy Policy is compliant with the Digital Personal Data Protection Act, 2023 (India).
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
