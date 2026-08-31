import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Eye, Server, Cookie, UserCheck, 
  HelpCircle, ArrowLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('all');

  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      icon: Eye,
      content: `When you visit or place an order on Sync Screen Guard, we collect necessary personal details to fulfill your transaction. This includes your name, email address, shipping destination, phone number for courier coordination, and payment transaction references.`
    },
    {
      id: 'usage',
      title: '2. How We Use Your Information',
      icon: UserCheck,
      content: `We use your information exclusively to process and ship your orders, send real-time tracking updates, handle replacement requests, and improve your store experience. We do NOT sell or rent your personal data to third parties.`
    },
    {
      id: 'security',
      title: '3. Data Security & Encryption',
      icon: Lock,
      content: `Your data protection is paramount. Sync Screen Guard utilizes 256-bit SSL encryption across all browsing and checkout pages. Sensitive credentials and order telemetry are secured using Supabase cloud infrastructure.`
    },
    {
      id: 'thirdparty',
      title: '4. Trusted Third-Party Services',
      icon: Server,
      content: `We partner with trusted industry providers: Razorpay for secure payment processing, Supabase for authentication services, and verified courier partners for delivery fulfillment. These partners only receive information strictly necessary for their services.`
    },
    {
      id: 'cookies',
      title: '5. Cookies & Local Storage',
      icon: Cookie,
      content: `Our store uses browser local storage and cookies to remember your shopping cart items, track recent order IDs, and keep you signed in securely.`
    },
    {
      id: 'rights',
      title: '6. Your Privacy Rights & Control',
      icon: ShieldCheck,
      content: `You have full control over your stored details. You can request access to your account records, ask for corrections, or request deletion at any time by contacting our support team.`
    },
    {
      id: 'contact',
      title: '7. Privacy Support Inquiries',
      icon: HelpCircle,
      content: `If you have questions regarding this Privacy Policy or wish to exercise your privacy rights, please contact us at support@syncarmor.in or call +91 98765 43210.`
    }
  ];

  const filteredSections = activeSection === 'all' 
    ? sections 
    : sections.filter(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-24 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-zinc-200 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-zinc-900">Home</Link>
            <span>/</span>
            <span className="text-zinc-900">Privacy Policy</span>
          </nav>
          <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            How Sync Screen Guard protects, manages, and respects your customer data. Last updated: August 2026.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Navigation Quick Filter Tabs */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-zinc-200 shadow-xs">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSection === 'all'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            All Clauses
          </button>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {sec.title.split('.')[1]}
            </button>
          ))}
        </div>

        {/* Legal Clauses List */}
        <div className="space-y-4">
          {filteredSections.map((sec) => {
            const IconComponent = sec.icon;
            return (
              <div 
                key={sec.id}
                className="rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-3"
              >
                <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100">
                  <div className="p-2 rounded-xl bg-zinc-100 text-zinc-800">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900">{sec.title}</h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {sec.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Support Box */}
        <div className="rounded-3xl bg-zinc-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Need privacy assistance?</h3>
            <p className="text-xs text-zinc-400">Reach out to our dedicated privacy support team.</p>
          </div>
          <a
            href="mailto:support@syncarmor.in"
            className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
}
