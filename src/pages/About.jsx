import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Sparkles, Layers, Zap, CheckCircle2, 
  Award, RefreshCw, Truck, HeartHandshake, Eye, 
  Cpu, ArrowRight, Star, ChevronRight, Phone, Mail,
  Smartphone, Lock, HelpCircle
} from 'lucide-react';
import syncLogo from '../assets/sync logo.PNG';

export default function About() {
  const [activeTab, setActiveTab] = useState('all');

  const stats = [
    { value: '150K+', label: 'Screens Protected', sub: 'Across India' },
    { value: '99.8%', label: 'Fit Accuracy', sub: '0.01mm Precision' },
    { value: '10-Sec', label: 'Fast Auto-Align', sub: 'Zero Dust & Bubbles' },
    { value: '4.9★', label: 'Customer Rating', sub: 'From 12,000+ Reviews' },
  ];

  const pillars = [
    {
      id: 'tray',
      icon: Sparkles,
      title: '10-Second Auto Alignment Box',
      tag: 'Patented Technology',
      badgeColor: 'emerald',
      description: 'Never struggle with crooked glass or trapped dust specks again. Our custom-molded applicator box snaps onto your phone, auto-cleans static particles, and seals the protector in under 10 seconds.',
      features: ['Automated dust removal pull-strip', 'Zero-misalignment guaranteed', 'Pre-cut speaker mesh alignment']
    },
    {
      id: 'hardness',
      icon: ShieldCheck,
      title: '9H Diamond Aluminosilicate Glass',
      tag: 'Military-Grade Armor',
      badgeColor: 'indigo',
      description: 'Engineered through a 4-hour thermal ion-exchange tempering bath at 400°C. Delivers 5x higher impact resistance than standard soda-lime tempered glass to withstand extreme drops and keys scratches.',
      features: ['9H scratch-resistance rating', 'Multi-layer shatterproof dispersion', 'Absorbs up to 50kg impact force']
    },
    {
      id: 'coating',
      icon: Layers,
      title: 'Electroplated Oleophobic Nano-Layer',
      tag: 'Ultra-Smooth Touch',
      badgeColor: 'amber',
      description: 'Vacuum plasma deposition infuses high-density oleophobic molecules directly into the glass surface, repelling fingerprint oils, moisture, and grime while maintaining silky glide responsiveness.',
      features: ['Anti-fingerprint & smudge resistant', 'Silky gaming-grade touch response', 'Long-lasting nano-bonded coating']
    },
    {
      id: 'clarity',
      icon: Eye,
      title: '99.99% Optical Retina Clarity',
      tag: 'HD Visual Transparency',
      badgeColor: 'cyan',
      description: 'Ultra-pure optical crystal glass delivers lossless display brightness, vivid HDR color reproduction, and seamless Dynamic Island and Face ID sensor recognition with zero camera glare.',
      features: ['True HDR & 120Hz display fidelity', 'Zero Face ID / front camera interference', 'Anti-reflective optical coating']
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Precision CNC Laser Milling',
      description: 'Every protector is mapped from real smartphone CAD schematics and precision-cut with 0.01mm edge curvature tolerances for 100% case compatibility.'
    },
    {
      step: '02',
      title: 'Thermal Ion-Exchange Tempering',
      description: 'Glass blanks undergo a rigorous 400°C molten potassium salt bath where smaller sodium ions are replaced by larger potassium ions, creating compressive surface armor.'
    },
    {
      step: '03',
      title: 'Plasma Vacuum Oleophobic Coating',
      description: 'Advanced automated vacuum chambers vaporize hydrophobic & oleophobic nano-polymers to chemically bond a microscopic frictionless surface layer.'
    },
    {
      step: '04',
      title: '100% Micro-Inspection & Clean Room Boxing',
      description: 'Every finished unit is inspected under polarized light for optical distortions and sealed in static-free cleanrooms inside the auto-alignment applicator tray.'
    }
  ];

  const values = [
    {
      icon: Award,
      title: 'Zero Compromise on Quality',
      description: 'We test our glass against real-world drop scenarios, keys, coins, and everyday abrasions before any product design gets approved.'
    },
    {
      icon: RefreshCw,
      title: '100% Quality & Protection Guarantee',
      description: 'Every screen guard is crafted to military-grade standards for ultimate clarity, flawless touch response, and total impact resistance.'
    },
    {
      icon: Truck,
      title: 'Fast Express Delivery',
      description: 'Direct dispatch across India within 24–48 hours with real-time courier tracking right to your doorstep.'
    },
    {
      icon: HeartHandshake,
      title: 'Customer-First Support',
      description: 'Our dedicated support team is available via email and phone helpline (Mon–Sat) to assist with model queries and order tracking.'
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
            <span>The Sync Story & Engineering</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Engineered for <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Uncompromising</span> Screen Defense
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Sync Screen Guard was born to end the frustration of crooked installations, trapped air bubbles, and brittle glass. We combine aerospace-grade aluminosilicate materials with effortless 10-second auto-alignment applicators.
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
              <span>Our Technology</span>
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
                <span>Our Origin Story</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 leading-snug">
                Why We Built <span className="text-emerald-600">Sync Screen Guard</span>
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                <p>
                  Like millions of smartphone owners, we were exhausted by conventional screen protectors. Traditional glass guards required surgical precision to apply, easily trapped dust particles, lifted at the curved borders, and cracked upon the slightest everyday tap.
                </p>
                <p>
                  We believed protecting an expensive flagship smartphone should be <strong>foolproof, durable, and crystal-clear</strong>. That drove us to develop Sync Screen Guard — an integrated protection ecosystem combining military-grade 9H aluminosilicate glass with our patented 10-second auto-alignment applicator box.
                </p>
                <p>
                  Today, thousands of customers across India trust Sync to safeguard their devices with zero installation stress and 100% optical fidelity.
                </p>
              </div>

              {/* Checkmarks list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Patented Auto-Align Applicator Tray',
                  'High-Purity 9H Aluminosilicate Glass',
                  'Electroplated Oleophobic Shield',
                  'Edge-to-Edge Case-Friendly Fit'
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
                  To democratize precision smartphone defense by eliminating installation failures and delivering aerospace-grade impact resistance at transparent, honest prices.
                </p>
              </div>

              {/* Vision Card */}
              <div className="rounded-3xl bg-zinc-950 text-white p-6 sm:p-7 shadow-xl space-y-3 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-emerald-400 flex items-center justify-center border border-zinc-700">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">Our Vision</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  A world where cracked phone displays and bubble-filled protectors are obsolete, with every device enjoying flawless touch sensitivity and pure optical clarity.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Engineering & Technology (The 4 Pillars) ── */}
      <section id="engineering" className="py-14 sm:py-20 bg-white border-y border-zinc-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Cpu className="h-4 w-4" />
              <span>Engineering Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
              The 4 Pillars of Sync Glass
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              Every Sync Screen Guard incorporates cutting-edge material science and manufacturing precision.
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

      {/* ── 4. Precision Manufacturing Process ── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Layers className="h-4 w-4" />
              <span>How It’s Made</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900">
              4-Step Precision Crafting
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              From raw glass blanks to your smartphone screen, here is our rigorous manufacturing workflow.
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
              The Sync Customer Commitment
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              When you choose Sync Screen Guard, you receive complete peace of mind with our dedicated support and guarantees.
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
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Screen Protection
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Ready to Upgrade Your Screen Protection?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                Find the tailored 10-second auto-align tempered glass protector for your specific iPhone, Samsung, or flagship smartphone model.
              </p>
            </div>

            <div className="relative flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-102 cursor-pointer"
              >
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <span>Shop All Protectors</span>
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
