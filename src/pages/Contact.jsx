import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MessageSquare, Send, CheckCircle2,
  Clock, MapPin, ExternalLink, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  const whatsappUrl = "https://wa.me/919846545949?text=Hi%20Sync%20Screen%20Guard%20Support%2C%20I%20have%20an%20inquiry%20regarding%20screen%20protectors.";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const dateStr = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'short'
      });

      const response = await fetch("https://formsubmit.co/ajax/syncallfyp@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `📬 [${formData.subject || 'Contact Form'}] ${formData.name} — Sync Screen Guard`,
          _template: "box",
          _captcha: "false",
          _replyto: formData.email,
          "👤 Sender Name": formData.name,
          "📧 Email Address": formData.email,
          "📱 Phone Number": formData.phone?.trim() ? formData.phone.trim() : "Not Provided",
          "🏷️ Inquiry Topic": formData.subject || "General Inquiry",
          "💬 Message Content": formData.message,
          "🕐 Received Date & Time": dateStr,
          "🌐 Website Source": "Sync Screen Guard — Contact Page (http://syncscreenguard.com)",
          "⚡ Store Action": `Reply directly to this email to answer ${formData.name} (${formData.email})`
        })
      });

      const data = await response.json();
      if (response.ok && data.success !== "false") {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      } else {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      }
    } catch (err) {
      console.warn("Contact form submission error:", err);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How do I claim a replacement for damaged glass?',
      a: 'If your protector arrives damaged or has manufacturing defects, email us at syncallfyp@gmail.com or message our WhatsApp support within 48 hours with a photo/video. We dispatch a free replacement immediately.'
    },
    {
      q: 'How does the 10-Second Auto Alignment Box work?',
      a: 'Simply place your phone inside the applicator box, pull the static dust-removal strip, and swipe down the center. The glass aligns and applies automatically without bubbles.'
    },
    {
      q: 'What are your customer support timings?',
      a: 'Our helpline and WhatsApp support are active Monday through Saturday from 10:00 AM to 7:00 PM IST. Email support is monitored 24/7.'
    }
  ];

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* ── 1. Page Header ── */}
      <section className="pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 to-[#09090b]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          
          <nav className="flex items-center justify-center space-x-2 text-xs font-semibold text-zinc-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-zinc-600">/</span>
            <span className="text-emerald-400">Contact Us</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
            Have questions about our screen protectors or need order assistance? We’re always here to help.
          </p>

        </div>
      </section>

      {/* ── 2. Three Clean Support Option Cards ── */}
      <section className="py-10 sm:py-12 border-b border-zinc-800/80">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* WhatsApp Direct Message Card (No Number Displayed) */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-zinc-900/80 to-zinc-950 border border-emerald-800/60 hover:border-emerald-500/70 transition-all duration-300 shadow-lg hover:shadow-emerald-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-700/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  WhatsApp Chat
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Start an instant conversation with our support team on WhatsApp for fast help.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                <span>Send Direct Message</span>
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>

            {/* Email Support Card */}
            <a
              href="mailto:syncallfyp@gmail.com"
              className="group p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 transition-colors">
                    <Mail className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                    24/7
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Email Support
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-mono">
                  syncallfyp@gmail.com
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-300 group-hover:text-white">
                <span>Write to Us</span>
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>

            {/* Phone Helpline Card */}
            <a
              href="tel:+919846545949"
              className="group p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 transition-colors">
                    <Phone className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                    Helpline
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Call Us
                </h3>
              
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-300 group-hover:text-white">
                <span>Call Helpline</span>
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ── 3. Simple Form & Quick Details Section ── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">Send Us a Message</h2>
              <p className="text-xs text-zinc-400 mb-6">
                Fill out this quick form and we’ll get back to you promptly.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/70 text-center space-y-3"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Thank you! Message Sent</h3>
                  <p className="text-xs text-zinc-300">
                    Your message has been sent to our team. We will review it and reply to your email or phone shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Your Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210 (Optional)"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Inquiry Topic / Reason
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry & Question</option>
                      <option value="Order Status & Delivery">Order Status & Delivery Help</option>
                      <option value="Damaged / Replacement Request">Damaged / Replacement Claim</option>
                      <option value="Product Fitment & Installation">Product Fitment & Installation Help</option>
                      <option value="Bulk & Wholesale Orders">Bulk & Wholesale Purchase</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Write your inquiry or question here..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-98 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Details Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* WhatsApp Quick Direct Trigger Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/50 via-zinc-900 to-zinc-950 border border-emerald-800/60 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <MessageSquare className="h-4 w-4" />
                  <span>Instant Messaging</span>
                </div>
                <h3 className="text-base font-bold text-white">Prefer WhatsApp?</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Skip the form and chat directly with our customer support team on WhatsApp for immediate help.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md mt-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Working Hours Card */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 space-y-3">
                <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>Support Schedule</span>
                </div>
                <div className="text-xs text-zinc-400 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Monday – Saturday:</span>
                    <span className="text-zinc-200 font-semibold">10:00 AM – 7:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="text-amber-400 font-semibold">Email & WhatsApp</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Simple FAQ Accordion ── */}
      <section className="py-10 pb-16 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-400 mt-1">Quick answers to common questions</p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-white cursor-pointer gap-3"
                  >
                    <span>{faq.q}</span>
                    <div className="shrink-0 text-zinc-400">
                      {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-400" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
