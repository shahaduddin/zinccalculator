
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'center';
}

interface OnboardingTourProps {
  onComplete: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'root',
    title: 'Welcome to ZincCalc Pro!',
    content: 'Let\'s take a quick look at the powerful tools at your fingertips. You can skip this anytime.',
    position: 'center'
  },
  {
    targetId: 'tour-trig-area',
    title: 'Scientific Keypad',
    content: 'Full trigonometric and logarithmic functions are right here. Toggle INV to access inverse functions and powers.',
    position: 'top'
  },
  {
    targetId: 'tour-menu-trigger',
    title: 'Navigation Hub',
    content: 'Tap this button to switch between different mathematical labs.',
    position: 'top'
  },
  {
    targetId: 'tour-modes-grid',
    title: 'Specialized Labs',
    content: 'Access the Matrix Lab for linear algebra, Equation Solver for polynomials, and a complete Science Constants library.',
    position: 'top'
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const step = TOUR_STEPS[currentStep];
    if (step.targetId === 'root') {
      setTargetRect(null);
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Dimmed Backdrop with Cutout Effect */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] pointer-events-auto" onClick={onComplete}>
        {targetRect && (
          <div 
            className="absolute bg-white/10 border-2 border-emerald-500 rounded-2xl shadow-[0_0_0_9999px_rgba(2,6,23,0.7)] transition-all duration-500 ease-in-out"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        )}
      </div>

      {/* Tooltip Card */}
      <div 
        className={`relative w-[90%] max-w-sm bg-white dark:bg-dark-surface rounded-[32px] shadow-2xl p-6 pointer-events-auto border border-slate-100 dark:border-slate-800 transition-all duration-300 ${
          step.position === 'center' ? 'translate-y-0' : 'fixed bottom-32 sm:bottom-40'
        }`}
      >
        <button 
          onClick={onComplete}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Sparkles size={20} />
          </div>
          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{step.title}</h4>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
          {step.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={handleBack}
                className="p-2.5 bg-slate-100 dark:bg-dark-elem text-slate-600 dark:text-slate-300 rounded-xl active:scale-95 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
