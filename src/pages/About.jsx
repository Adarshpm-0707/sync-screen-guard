import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Sparkles, Layers, Zap, CheckCircle2, 
  Award, RefreshCw, Truck, HeartHandshake, Eye, 
  Cpu, ArrowRight, Star, ChevronRight, Phone, Mail,
  Smartphone, Lock, HelpCircle, Radio, BatteryCharging
} from 'lucide-react';
import syncLogo from '../assets/sync-logo.png';

export default function About() {
  const stats = [
    { value: '50K+', label: 'Happy Customers', sub: 'Across India' },
    { value: '500+', label: 'Products Listed', sub: 'Electronics & Gadgets' },
    { value: '100%', label: 'Genuine Products', sub: 'Direct Brand Warranty' },
    { value: '4.9★', label: 'Customer Rating', sub: 'From 8,000+ Reviews' },
  ];

  const pillars = [
    {
      id: 'performance',
      icon: Cpu,
      title: 'Next-Gen Performance & Chipsets',
      tag: 'Smart Architecture',
      badgeColor: 'emerald',
      description: 'Engineered with advanced circuitry, high-efficiency power management, and optimized processing components to deliver lightning-fast response and dependable reliability.',
      features: ['Intelligent surge & thermal protection', 'Low-latency connectivity', 'Optimized energy efficiency']
    },
    {
      id: 'durability',
      icon: ShieldCheck,
      title: 'Military-Grade Durability & Materials',
      tag: 'Built to Last',
      badgeColor: 'indigo',
      description: 'Crafted from high-grade aerospace alloys, reinforced polymer housings, and shatterproof tempered composite elements that endure intense daily use and demanding conditions.',
      features: ['Impact & drop tested build', 'Corrosion-resistant gold/nickel plating', 'Reinforced strain-relief joints']
    },
    {
      id: 'design',
      icon: Sparkles,
      title: 'Minimalist & Ergonomic Aesthetics',
      tag: 'Modern Craftsmanship',
      badgeColor: 'amber',
      description: 'Designed to blend seamlessly into your daily workspace and mobile life. Sleek matte textures, clean geometric silhouettes, and intuitive tactile feedback in every product.',
      features: ['Ultra-compact pocket-ready form factor', 'Anti-slip tactile matte finishes', 'Precision CNC chamfered borders']
    },
    {
      id: 'ecosystem',
      icon: Radio,
      title: 'Universal Device Compatibility',
      tag: 'Seamless Integration',
      badgeColor: 'cyan',
      description: 'Designed with open standards to work flawlessly across iOS, Android, Windows, and macOS ecosystems without awkward adapters or compatibility bottlenecks.',
      features: ['Multi-protocol fast charging support', 'Cross-platform wireless sync', 'Universal accessory fit']
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Precision CAD & Ergonomic Modeling',
      description: 'Every product begins with meticulous 3D CAD blueprints designed around human ergonomics, thermal airflow, and everyday portability.'
    },
    {
      step: '02',
      title: 'Tier-1 Component & Material Sourcing',
      description: 'We source high-purity copper, aerospace aluminum, Grade-A silicon chipsets, and optical-grade glass blanks from certified suppliers.'
    },
    {
      step: '03',
      title: 'Thermal & Stress Benchmarking',
      description: 'Prototypes endure extreme bend tests, thermal heat chambers, drop simulations, and electrical cycle testing before passing to production.'
    },
    {
      step: '04',
      title: '100% Quality Inspection & Clean Packaging',
      description: 'Every finished gadget and accessory undergoes multi-point optical & functional checks before being sealed in premium protective packaging.'
    }
  ];

  const values = [
    {
      icon: Award,
      title: 'Zero Compromise on Quality',
      description: 'We rigorously test every gadget and accessory against real-world usage conditions before releasing any product to market.'
    },
    {
      icon: RefreshCw,
      title: '100% Genuine Brand Guarantee',
      description: 'All items are 100% authentic Sync products backed by our hassle-free replacement policy and direct brand warranty.'
    },
    {
      icon: Truck,
      title: 'Fast Express Delivery',
      description: 'Orders are processed within 24–48 hours with real-time courier tracking right to your doorstep across India.'
    },
    {
      icon: HeartHandshake,
      title: 'Customer-First Support',
      description: 'Our dedicated support team is available via email, phone helpline, and WhatsApp (Mon–Sat) for instant product assistance.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-20 font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* ── 1. Hero Banner ── */}
      <section className="relative overflow-hidden bg-black text-white border-b border-zinc-900 pt-12 pb-16 sm:pt-16 sm:pb-24">
        {/* Glow Ambient background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Breadcrumb & Chip */}
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-bold">About Us</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Sync Story & Philosophy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Empowering Modern Life with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Smart Innovation</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Sync is a consumer electronics, accessories, and gadgets brand built to bring cutting-edge technology and smart innovations directly to your everyday digital life.
          </p>

          {/* Quick CTA Buttons in Hero */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-102 cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#engineering"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Our Innovation</span>
            </a>
          </div>

        </div>

        {/* Hero Stats Ribbon */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-2 sm:p-3">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-1">{stat.label}</p>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Brand Story & Mission ── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Story Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <span>Our Brand Story</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 leading-snug">
                Why We Created <span className="text-emerald-600">Sync</span>
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                <p>
                  In a market full of overpriced electronics and low-quality accessories, finding products that balance performance, build quality, and value is a real challenge.
                </p>
                <p>
                  We built <strong>Sync</strong> to solve that. We curate, source, and deliver premium consumer electronics, smart gadgets, and must-have accessories — bringing you genuine products with honest pricing, direct brand warranty, and fast doorstep delivery across India.
                </p>
                <p>
                  From cutting-edge earbuds and fast-charging gear to smart home devices and precision-crafted accessories, every Sync product is designed to keep you connected and ahead.
                </p>
              </div>

              {/* Checkmarks list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Consumer Electronics & Smart Devices',
                  'Premium Gadgets & Tech Accessories',
                  'Fast Charging & Audio Solutions',
                  'Direct Brand Warranty & Fast Support'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 text-xs font-semibold text-zinc-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Cards: Mission & Vision */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Mission Card */}
              <div className="rounded-3xl bg-white border border-zinc-200/90 p-6 sm:p-7 shadow-xs space-y-3 relative overflow-hidden group hover:border-zinc-400 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 uppercase tracking-tight">Our Mission</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  To democratize next-generation electronics and smart accessories by delivering sleek, ultra-reliable, and high-performance tech at honest, transparent prices.
                </p>
              </div>

              {/* Vision Card */}
              <div className="rounded-3xl bg-zinc-950 text-white p-6 sm:p-7 shadow-xl space-y-3 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-emerald-400 flex items-center justify-center border border-zinc-700">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">Our Vision</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  To become India’s most trusted lifestyle tech brand, empowering modern device owners with seamless, dependable, and aesthetically stunning electronics.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Innovation & Engineering (The 4 Pillars) ── */}
      <section id="engineering" className="py-14 sm:py-20 bg-white border-y border-zinc-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Cpu className="h-4 w-4" />
              <span>Core Technology</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
              The 4 Pillars of Sync Innovation
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              Every Sync device and accessory incorporates cutting-edge technology and rigorous manufacturing precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <div 
                  key={pillar.id}
                  className="rounded-3xl bg-[#FAFAFA] border border-zinc-200/90 p-6 sm:p-8 space-y-4 hover:border-zinc-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-sm group-hover:scale-105 transition-transform">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 uppercase tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/80 space-y-2">
                    {pillar.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 4. Precision Crafting Process ── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Layers className="h-4 w-4" />
              <span>Quality Assurance</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
              4-Step Quality & Crafting Process
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              From initial architectural concept to the product in your hands, our workflow guarantees uncompromising standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step) => (
              <div 
                key={step.step}
                className="relative rounded-3xl bg-white border border-zinc-200 p-6 space-y-3 shadow-xs hover:border-zinc-400 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600/30 font-mono tracking-tighter">
                    {step.step}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 uppercase tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. Our Core Commitments & Guarantees ── */}
      <section className="py-14 sm:py-20 bg-zinc-900 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              <HeartHandshake className="h-4 w-4" />
              <span>Customer Promises</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              The Sync Brand Commitment
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              When you choose Sync, you receive complete peace of mind with our dedicated support, quality guarantee, and warranty coverage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((v, i) => {
              const VIcon = v.icon;
              return (
                <div 
                  key={i}
                  className="rounded-3xl bg-zinc-950/80 border border-zinc-800 p-6 space-y-3 hover:border-zinc-700 transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <VIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                    {v.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 6. Bottom High-Converting CTA ── */}
      <section className="pt-14 sm:pt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8 sm:p-12 lg:p-16 border border-zinc-800 shadow-2xl relative overflow-hidden text-center space-y-6">
            
            {/* Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-4 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Next-Gen Technology
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Ready to Upgrade Your Tech Lifestyle?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                Explore our catalog of premium electronics, smart gadgets, and high-performance device accessories.
              </p>
            </div>

            <div className="relative flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-102 cursor-pointer"
              >
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <span>Shop All Products</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/tracking"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Truck className="h-4 w-4 text-emerald-400" />
                <span>Track Your Order</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
