
import React, { useState, useEffect } from 'react';
import { Calculator, Grid3X3, FunctionSquare, Book, Moon, Sun, ChevronUp, X, Monitor, Rocket } from 'lucide-react';
import CalculatorView from './views/CalculatorView';
import MatrixView from './views/MatrixView';
import EquationView from './views/EquationView';
import ConstantsView from './views/ConstantsView';
import LandingView from './views/LandingView';
import OnboardingTour from './components/OnboardingTour';
import { AppView } from './types';

type ThemeMode = 'light' | 'dark' | 'system';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    // Check if launched as PWA (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const urlParams = new URLSearchParams(window.location.search);
    const isPwaEntry = urlParams.get('pwa') === 'true';
    
    return (isStandalone || isPwaEntry) ? AppView.CALCULATOR : AppView.LANDING;
  });
  
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('zinc_theme');
    return (saved as ThemeMode) || 'system';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Lifted Calculator State
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('zinc_theme', theme);

    const applyTheme = (isDarkSystem: boolean) => {
      if (theme === 'dark' || (theme === 'system' && isDarkSystem)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') applyTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  // Check if tour should be shown when launching calculator
  useEffect(() => {
    if (currentView === AppView.CALCULATOR) {
      const hasSeen = localStorage.getItem('zinc_seen_tour_v2');
      if (!hasSeen) {
        setShowTour(true);
      }
    }
  }, [currentView]);

  const handleTourComplete = () => {
    setShowTour(false);
    setIsMenuOpen(false);
    localStorage.setItem('zinc_seen_tour_v2', 'true');
  };

  const handleConstantSelect = (value: string) => {
    if (result && result !== 'Error') {
      setExpression(result + '*' + value);
      setResult('');
    } else {
      setExpression(prev => prev + value);
    }
    setCurrentView(AppView.CALCULATOR);
    setIsMenuOpen(false);
  };

  const handlePwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const renderView = () => {
    switch(currentView) {
      case AppView.LANDING:
        return <LandingView 
          onLaunch={() => setCurrentView(AppView.CALCULATOR)} 
          deferredPrompt={deferredPrompt}
          onInstallPwa={handlePwaInstall}
        />;
      case AppView.CALCULATOR: 
        return <CalculatorView 
          expression={expression}
          setExpression={setExpression}
          result={result}
          setResult={setResult}
        />;
      case AppView.MATRIX: return <MatrixView />;
      case AppView.EQUATION: return <EquationView />;
      case AppView.CONSTANTS: 
        return <ConstantsView onSelect={handleConstantSelect} />;
      default: 
        return <CalculatorView 
          expression={expression}
          setExpression={setExpression}
          result={result}
          setResult={setResult}
        />;
    }
  };

  const PalateButton = ({ view, icon: Icon, label, id }: { view: AppView, icon: any, label: string, id?: string }) => (
    <button
      id={id}
      onClick={() => {
        setCurrentView(view);
        setIsMenuOpen(false);
      }}
      className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' 
          : 'bg-slate-100 dark:bg-dark-elem text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-highlight active:scale-95'
      }`}
    >
      <Icon size={28} strokeWidth={2.5} />
      <span className="text-xs mt-2 font-bold">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative bg-gray-50 dark:bg-dark-bg">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>

      {/* Floating Trigger Button: Hidden if on landing page */}
      {currentView !== AppView.LANDING && (
        <div className={`fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${isMenuOpen ? 'opacity-0 scale-50 pointer-events-none translate-y-10' : 'opacity-100 scale-100 translate-y-0'}`}>
          <button
            id="tour-menu-trigger"
            onClick={() => setIsMenuOpen(true)}
            className="glass-trigger w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shadow-xl active:scale-90 transition-transform group"
          >
            <ChevronUp 
              size={20} 
              className="text-emerald-500 animate-float group-hover:text-emerald-400 transition-colors" 
              strokeWidth={3} 
            />
          </button>
        </div>
      )}

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sliding Mode Palate */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[60] transition-transform duration-500 ease-out transform ${isMenuOpen || showTour ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="mx-auto max-w-lg bg-white dark:bg-dark-surface rounded-t-[40px] shadow-2xl p-8 border-t border-slate-200 dark:border-slate-800">
          
          {/* Drag Indicator */}
          <div className="flex justify-center -mt-4 mb-6">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Modes</h3>
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-widest">ZincCalc Pro</p>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-dark-elem text-slate-400 hover:text-red-500 transition-colors active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* Theme Selector Section */}
          <div className="mb-8">
            <h4 className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-widest">Theme Preference</h4>
            <div className="bg-slate-100 dark:bg-dark-elem p-1 rounded-2xl flex gap-1">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'Auto' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeMode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    theme === t.id 
                      ? 'bg-white dark:bg-dark-surface text-emerald-600 dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Modes */}
          <div id="tour-modes-grid" className="grid grid-cols-2 gap-4 mb-4">
            <PalateButton view={AppView.CALCULATOR} icon={Calculator} label="Calculator" />
            <PalateButton view={AppView.MATRIX} icon={Grid3X3} label="Matrix Lab" />
            <PalateButton view={AppView.EQUATION} icon={FunctionSquare} label="Equation Solver" />
            <PalateButton view={AppView.CONSTANTS} icon={Book} label="Constants" />
          </div>

          {/* Home Link */}
          <button 
             onClick={() => { setCurrentView(AppView.LANDING); setIsMenuOpen(false); }}
             className="w-full mt-2 py-4 rounded-2xl bg-slate-50 dark:bg-dark-elem text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-2 hover:text-emerald-500 transition-colors"
          >
            <Rocket size={14} /> Back to Landing Page
          </button>

          <div className="h-[calc(1rem+env(safe-area-inset-bottom))]" />
        </div>
      </div>

      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
    </div>
  );
}
