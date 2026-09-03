import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Eye, Server, Cookie, UserCheck, 
  HelpCircle, ArrowLeft, ChevronRight, CheckCircle2,
  FileText, Database, Key, Trash2, Globe
} from 'lucide-react';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('all');

  const sections = [
    {
      id: 'overview',
      title: '1. Overview & Application Identity',
      icon: Globe,
      content: `This Privacy Policy outlines how Sync ("Sync", "we", "us", or "our"), operating the official website https://syncforall.com ("the Site"), collects, uses, protects, and discloses personal information when you access our store, browse our electronics, gadgets, and accessories, or use our authentication and purchasing services. We are dedicated to ensuring customer data privacy and transparency in accordance with global data protection standards and Google API Services policies.`
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      icon: Eye,
      content: `We collect information necessary to fulfill orders and provide secure account functionality:
• Account & Contact Data: Your name, email address, shipping and billing address, and phone number for delivery coordination.
• Order & Transaction Details: Products purchased (electronics, gadgets, accessories), payment transaction references (processed securely via Razorpay), and order fulfillment history.
• Device & Technical Telemetry: Browser type, IP address, device model, operating system, and anonymous usage telemetry to optimize page performance and device compatibility.`
    },
    {
      id: 'google-oauth',
      title: '3. Google OAuth & Google User Data',
      icon: Key,
      content: `When you choose to sign in or register using Google Sign-In (OAuth 2.0), Sync requests access only to basic profile information:
• Data Accessed: Your Google primary email address, full name, and profile picture URL.
• Purpose of Access: To authenticate your identity securely, create or link your customer account on https://syncforall.com, and send real-time order confirmations and dispatch tracking updates.
• No Sale or Marketing Sharing: We do NOT sell, rent, or trade Google user data. Google user data is NEVER shared with third-party advertisers or external data brokers.
• Google Limited Use Disclosure: Sync's use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements.`
    },
    {
      id: 'usage',
      title: '4. How We Use Your Information',
      icon: UserCheck,
      content: `Your data is utilized strictly for legitimate business and transactional purposes:
• Processing, packing, and dispatching your electronics, gadgets, and accessories orders.
• Sending transaction receipts, GST invoices, and automated courier tracking links.
• Providing customer support, warranty assistance for products, and addressing inquiry tickets.
• Maintaining website security, preventing fraudulent transactions, and verifying authenticated access.`
    },
    {
      id: 'security',
      title: '5. Data Security & Storage',
      icon: Lock,
      content: `We implement enterprise-grade security controls to safeguard your personal data:
• Encryption: 256-bit SSL/TLS encryption for all in-transit web traffic.
• Secure Infrastructure: Customer authentication records and order details are stored in Supabase cloud databases with role-based access control (RLS) and encrypted database backups.
• Payment Protection: Financial credentials (credit cards, UPI PINs, banking info) are processed directly by certified Level 1 PCI-DSS compliant payment gateways (Razorpay). Sync never stores payment card numbers.`
    },
    {
      id: 'thirdparty',
      title: '6. Third-Party Services & Subprocessors',
      icon: Server,
      content: `We share only strictly necessary information with trusted third-party service providers:
• Authentication & Database: Supabase & Google Identity Services for user sign-in and account management.
• Payment Processing: Razorpay for secure checkout and payment settlement.
• Courier & Fulfillment: Verified logistics partners (e.g. Shiprocket, BlueDart, Delhivery) receiving only shipping address and phone number for parcel transit.`
    },
    {
      id: 'retention-deletion',
      title: '7. Data Retention & Account Deletion Rights',
      icon: Trash2,
      content: `You have complete ownership and control over your personal data:
• Data Retention: We retain user profile data as long as your account remains active. Transaction and tax records are retained only as required by statutory law.
• Account & Data Deletion: You can request immediate and permanent deletion of your account, including all Google OAuth linked profile data and contact records, at any time by sending an email with the subject "Data Deletion Request" to syncallfyp@gmail.com. Requests are fulfilled within 30 business days.`
    },
    {
      id: 'cookies',
      title: '8. Cookies & Local Browser Storage',
      icon: Cookie,
      content: `Sync uses essential cookies and local storage tokens exclusively to maintain your active shopping session, persist items in your cart, and preserve your sign-in state securely. We do not use intrusive cross-site tracking cookies.`
    },
    {
      id: 'contact',
      title: '9. Privacy Inquiries & Contact Info',
      icon: HelpCircle,
      content: `If you have questions, concerns, or requests regarding this Privacy Policy or our data handling practices, please contact our Data Protection Officer:
• Brand / App: Sync
• Email: syncallfyp@gmail.com
• Official Support Helpline: +91 98465 45949`
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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
              Privacy Policy
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
              Sync Official Policy
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-2">
            Official privacy notice for <strong>Sync</strong> (<a href="https://syncforall.com" className="text-zinc-800 underline">https://syncforall.com</a>). Detailing our customer data protection, Google OAuth integration, and privacy controls. Last updated: September 2026.
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
                className="rounded-3xl bg-white border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-4"
              >
                <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100">
                  <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900">{sec.title}</h2>
                </div>
                <div className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Google API Limited Use Highlight Card */}
        <div className="rounded-3xl bg-emerald-950 text-emerald-100 p-6 sm:p-8 border border-emerald-800 space-y-3">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-white">Google API Services User Data Policy Compliance</h3>
          </div>
          <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
            Sync strictly adheres to the <strong>Google API Services User Data Policy</strong>, including the Limited Use requirements. Information received from Google APIs is never utilized for advertising, user profiling outside the store, or transferred to unauthorized third parties.
          </p>
        </div>

        {/* Support Box */}
        <div className="rounded-3xl bg-zinc-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Need privacy or data deletion assistance?</h3>
            <p className="text-xs text-zinc-400">Reach out to our privacy compliance officer at syncallfyp@gmail.com.</p>
          </div>
          <a
            href="mailto:syncallfyp@gmail.com"
            className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            Contact Privacy Support
          </a>
        </div>

      </div>
    </div>
  );
}

