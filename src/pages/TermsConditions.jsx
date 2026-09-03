import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, ShieldCheck, CreditCard, Truck, RefreshCw, AlertCircle, 
  HelpCircle, ArrowLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';

export default function TermsConditions() {
  const [activeSection, setActiveSection] = useState('all');

  const sections = [
    {
      id: 'general',
      title: '1. Acceptance of Terms',
      icon: FileText,
      content: `By accessing, browsing, or purchasing products from Sync ("the Website", "We", "Us", "Our"), operating https://syncforall.com, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. Sync is an electronics, accessories, and gadgets brand. If you do not agree with any part of these terms, you must refrain from using our store services.`
    },
    {
      id: 'products',
      title: '2. Product Specifications & Usage',
      icon: ShieldCheck,
      content: `Sync offers a wide range of consumer electronics, smart gadgets, and high-performance accessories including but not limited to earphones, chargers, cables, smart devices, phone cases, and more. All product specifications, compatibility details, voltage ratings, and dimensions listed on our store are verified. Customers are responsible for verifying compatibility with their specific device prior to completing orders.`
    },
    {
      id: 'pricing',
      title: '3. Pricing & Payment Terms',
      icon: CreditCard,
      content: `All prices listed on the store are shown in Indian Rupees (INR) and are inclusive of applicable taxes. We accept online payments via Razorpay (UPI, Credit/Debit Cards, Net Banking) and Cash On Delivery (COD). We reserve the right to revise prices or cancel orders affected by technical pricing errors.`
    },
    {
      id: 'shipping',
      title: '4. Shipping & Delivery Guidelines',
      icon: Truck,
      content: `Orders are processed within 24 to 48 business hours. Standard delivery timeline ranges from 2 to 5 business days depending on the shipping destination. Real-time courier tracking IDs are provided upon dispatch via our Track Order portal.`
    },
    {
      id: 'returns',
      title: '5. Brand Warranty & Replacement Policy',
      icon: RefreshCw,
      content: `Sync offers a direct brand warranty and transit protection guarantee for all electronics and accessories that are damaged during transit or affected by manufacturing defects. To report a defect or claim warranty support, contact syncallfyp@gmail.com or message our official WhatsApp support within 48 hours of delivery with unboxing proof.`
    },
    {
      id: 'liability',
      title: '6. Limitation of Liability',
      icon: AlertCircle,
      content: `Sync shall not be liable for any indirect, incidental, or consequential damages resulting from improper third-party product installation, unauthorized modifications, extreme physical force, liquid damage, or misuse outside specified electrical/operational guidelines.`
    },
    {
      id: 'contact',
      title: '7. Customer Support & Inquiries',
      icon: HelpCircle,
      content: `For any legal inquiries, policy questions, or order support, reach out to our team at syncallfyp@gmail.com or call our helpline +91 98465 45949. Our support team is available Mon–Sat, 10 AM to 7 PM IST.`
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
            <span className="text-zinc-900">Terms & Conditions</span>
          </nav>
          <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Please review the terms and usage guidelines for Sync. Last updated: September 2026.
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
            <h3 className="text-base font-bold text-white">Have questions about our terms?</h3>
            <p className="text-xs text-zinc-400">Our customer support specialists are ready to help.</p>
          </div>
          <a
            href="mailto:syncallfyp@gmail.com"
            className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
}
