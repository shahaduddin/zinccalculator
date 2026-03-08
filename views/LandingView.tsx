
import React, { useState } from 'react';
import { Download, Rocket, Shield, BookOpen, Scale, ChevronRight, Cpu, Layers, Globe, Github, Info, Lock, Terminal, Smartphone } from 'lucide-react';

interface LandingViewProps {
  onLaunch: () => void;
  deferredPrompt?: any;
  onInstallPwa?: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onLaunch, deferredPrompt, onInstallPwa }) => {
  const [activeTab, setActiveTab] = useState<'DOCS' | 'PRIVACY' | 'TERMS' | null>(null);

  const Section = ({ title, children, icon: Icon }: { title: string, children?: React.ReactNode, icon: any }) => (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
          <Icon size={22} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-dark-bg no-scrollbar">
      {/* Hero Section */}
      <div className="relative pt-20 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="max-w-xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-200 dark:border-emerald-800/50">
            <Cpu size={12} /> Version 2.5 Released
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            ZincCalc <span className="text-emerald-500">Pro</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-10 px-4">
            The next generation of mathematical precision for engineers, scientists, and students.
          </p>

          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/release.apk" 
                download 
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <Download size={20} className="group-hover:animate-bounce" />
                Download APK
              </a>
              <button 
                onClick={onLaunch}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Rocket size={20} />
                Launch Web App
              </button>
            </div>
            
            {deferredPrompt && (
              <button 
                onClick={onInstallPwa}
                className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 bg-white dark:bg-dark-elem text-slate-800 dark:text-white px-8 py-4 rounded-2xl font-bold border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Smartphone size={20} className="text-emerald-500" />
                Install Web App (PWA)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-xl mx-auto px-6 py-12 grid grid-cols-2 gap-4">
        {[
          { icon: Layers, label: 'Matrix Lab', desc: 'Up to 10x10 operations' },
          { icon: Shield, label: 'Offline First', desc: 'No internet required' },
          { icon: BookOpen, label: 'Constants', desc: '30+ scientific values' },
          { icon: Globe, label: 'Universal', desc: 'SI & Imperial units' },
        ].map((f, i) => (
          <div key={i} className="p-5 bg-white dark:bg-dark-surface rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <f.icon className="text-emerald-500 mb-3" size={24} />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{f.label}</h4>
            <p className="text-[10px] text-slate-400 leading-tight">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Legal & Docs Tabs */}
      <div className="max-w-xl mx-auto px-6 pb-32">
        <div className="flex bg-slate-200/50 dark:bg-dark-surface p-1 rounded-2xl mb-8 border border-slate-300/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('DOCS')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'DOCS' ? 'bg-white dark:bg-dark-elem text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            <BookOpen size={16} /> Docs
          </button>
          <button 
            onClick={() => setActiveTab('PRIVACY')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'PRIVACY' ? 'bg-white dark:bg-dark-elem text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            <Shield size={16} /> Privacy
          </button>
          <button 
            onClick={() => setActiveTab('TERMS')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'TERMS' ? 'bg-white dark:bg-dark-elem text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            <Scale size={16} /> Terms
          </button>
        </div>

        {activeTab === 'DOCS' && (
          <Section title="Full Documentation" icon={BookOpen}>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="p-2 h-fit bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-lg"><Terminal size={16} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">Scientific Keypad</h4>
                  <p>ZincCalc employs a natural entry mathematical engine. Expressions like <code>sin(π/2)</code> or <code>log(100)</code> are evaluated using high-precision logic. Use the <strong>INV</strong> key to toggle inverse trigonometric functions (asin, acos, atan) and base-e/base-10 power functions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-2 h-fit bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-lg"><Layers size={16} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">Matrix Laboratory</h4>
                  <p>Perform complex linear algebra on matrices up to 10x10. Features include Addition, Subtraction, Multiplication, Determinants, Inversion, and Transposition. Resulting matrices can be saved to your local library for future use.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-2 h-fit bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-lg"><Info size={16} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">Equation Solvers</h4>
                  <p><strong>Polynomial Solver:</strong> Find all real and complex roots for polynomials up to degree 5. <strong>System Solver:</strong> Solve linear systems with up to 5 variables using stable LUP decomposition.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-2 h-fit bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-lg"><Globe size={16} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">Scientific Constants</h4>
                  <p>Access a categorized database of 30+ fundamental constants. Switch between <strong>SI (Standard International)</strong> and <strong>Engineering (US Customary)</strong> units with a single tap. Tap a constant to inject its value directly into your current calculation.</p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {activeTab === 'PRIVACY' && (
          <Section title="Privacy & Security" icon={Shield}>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="mt-1"><Lock className="text-emerald-500" size={16} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Local-Only Data</h4>
                  <p className="mt-1">ZincCalc Pro is built on a "Privacy by Design" philosophy. All data, including your calculation history, saved matrices, and notes, is stored exclusively in your device's <strong>IndexedDB</strong> storage. No data is ever uploaded to a server.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1"><Shield className="text-emerald-500" size={16} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">No Tracking or Analytics</h4>
                  <p className="mt-1">We believe mathematical workflows are personal. ZincCalc does not include Google Analytics, Facebook SDKs, or any other third-party tracking scripts. The app operates 100% offline once loaded.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1"><Globe className="text-emerald-500" size={16} /></div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Web App Privacy</h4>
                  <p className="mt-1">When using the Vercel-hosted web app, your browser may store standard session data, but ZincCalc does not use cookies for tracking or marketing purposes.</p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {activeTab === 'TERMS' && (
          <Section title="Terms of Service" icon={Scale}>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">1. Usage License</h4>
                <p className="mt-1">ZincCalc Pro grants you a personal, non-exclusive license to use the application for educational and professional purposes. Redistribution of the APK or reverse engineering the source code for commercial gain is prohibited.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">2. Accuracy Disclaimer</h4>
                <p className="mt-1">While we utilize the industry-standard MathJS engine for precision, mathematical software can produce errors due to floating-point limitations or invalid user input. <strong>ZincCalc is not responsible for engineering or financial failures</strong> resulting from reliance on its output.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">3. "As-Is" Warranty</h4>
                <p className="mt-1">The software is provided "As Is" without warranty of any kind. ZincCalc Pro Systems does not guarantee that the app will be error-free or that it will meet all specific professional requirements without external verification.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-dark-elem rounded-2xl border border-slate-200 dark:border-slate-800 italic text-[11px]">
                Last Updated: June 2025. By using this application, you agree to these terms.
              </div>
            </div>
          </Section>
        )}

        {/* Footer */}
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-3 bg-white dark:bg-dark-surface rounded-2xl text-slate-400 hover:text-emerald-500 transition-colors border border-slate-100 dark:border-slate-800">
              <Github size={20} />
            </a>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2025 ZincCalc Pro Systems • v2.5.0</p>
        </div>
      </div>
    </div>
  );
};

export default LandingView;
