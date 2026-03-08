
import React from 'react';

interface KeypadButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'action' | 'scientific' | 'destructive' | 'active';
  className?: string;
  colSpan?: number;
  id?: string;
}

const KeypadButton: React.FC<KeypadButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'default',
  className = '',
  colSpan = 1,
  id
}) => {
  
  const baseStyles = "relative overflow-hidden rounded-2xl text-xl font-medium transition-all duration-150 active:scale-95 flex items-center justify-center select-none w-full h-full";
  
  const variantStyles = {
    // Default (Numbers): White in light, Slate-800 in dark
    default: "bg-white dark:bg-dark-elem text-slate-800 dark:text-slate-100 shadow-sm active:bg-slate-100 dark:active:bg-dark-highlight",
    
    // Scientific: Slate-100 in light, Slate-950 (darker) in dark
    scientific: "bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-400 text-lg active:bg-slate-200 dark:active:bg-dark-surface border border-slate-200/50 dark:border-slate-800/50",
    
    // Active Toggle State
    active: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",

    // Operators: Amber background tint
    operator: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 active:bg-amber-200 dark:active:bg-amber-900/60 font-semibold border border-transparent dark:border-amber-900/20",
    
    // Primary Action (Equals): Emerald filled
    action: "bg-emerald-600 text-white shadow-emerald-500/30 shadow-lg active:bg-emerald-700",

    // Destructive (Clear/Delete): Red background tint
    destructive: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 active:bg-red-100 dark:active:bg-red-900/60 font-semibold border border-transparent dark:border-red-900/20"
  };

  const spanClass = colSpan === 4 ? 'col-span-4' : colSpan === 3 ? 'col-span-3' : colSpan === 2 ? 'col-span-2' : 'col-span-1';

  return (
    <div id={id} className={`${spanClass} ${className} h-full`}>
      <button
        onClick={onClick}
        className={`
          ${baseStyles} 
          ${variantStyles[variant]}
        `}
      >
        {label}
      </button>
    </div>
  );
};

export default KeypadButton;
