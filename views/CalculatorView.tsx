
import React, { useRef, useEffect, useState } from 'react';
import { Delete, History, Atom, ChevronLeft, Maximize, Minimize } from 'lucide-react';
import KeypadButton from '../components/KeypadButton';
import HistorySidebar from '../components/HistorySidebar';
import { evaluateExpression, formatValue, toFraction } from '../utils/math';
import { HistoryItem } from '../types';
import { addHistoryItem, getHistoryItems, clearHistoryDB, deleteHistoryItemDB, updateHistoryNote } from '../utils/db';

interface CalculatorViewProps {
  expression: string;
  setExpression: React.Dispatch<React.SetStateAction<string>>;
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
}

type SciCategory = 'Trig' | 'Stats' | 'Math';

const CalculatorView: React.FC<CalculatorViewProps> = ({ 
  expression, 
  setExpression, 
  result, 
  setResult 
}) => {
  const [mode, setMode] = useState<'BASIC' | 'SCIENTIFIC'>('BASIC');
  const [sciCategory, setSciCategory] = useState<SciCategory>('Trig');
  const [isDegree, setIsDegree] = useState(false);
  const [isInverse, setIsInverse] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');
  const [rawResultValue, setRawResultValue] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStatsInputActive, setIsStatsInputActive] = useState(false);
  const [showFraction, setShowFraction] = useState(false);
  const [lastExpressionCalculated, setLastExpressionCalculated] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const loadHistory = async () => {
    const items = await getHistoryItems();
    setHistory(items);
  };

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  const vibrate = (duration = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(duration); } catch (e) {}
    }
  };

  const toggleFullscreen = () => {
    vibrate();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handlePress = (val: string) => {
    vibrate();
    
    if (val === ')') {
      setIsStatsInputActive(false);
    }

    if (result && result !== 'Error') {
       if (['+', '-', '×', '÷', '^', '%', ' P ', ' C '].includes(val)) {
         setExpression(result + val);
         setResult('');
         setRawResultValue(null);
       } else {
         setExpression(val);
         setResult('');
         setRawResultValue(null);
       }
    } else {
      setExpression(prev => prev + val);
    }
  };

  const handleStatsFunctionPress = (val: string) => {
    vibrate();
    setExpression(prev => prev + val);
    setMode('BASIC'); 
    setIsStatsInputActive(true); 
  };

  const handleAns = () => {
    if (!lastResult) { vibrate(50); return; }
    vibrate();
    if (result && result !== 'Error') {
      setExpression(lastResult);
      setResult('');
      setRawResultValue(null);
    } else {
      setExpression(prev => prev + lastResult);
    }
  };

  const handleClear = () => { 
    vibrate(); 
    setExpression(''); 
    setResult(''); 
    setRawResultValue(null);
    setIsStatsInputActive(false); 
    setShowFraction(false);
  };

  const handleDelete = () => { 
    vibrate(); 
    setExpression(prev => {
      const next = prev.trimEnd().slice(0, -1);
      if (!next.includes('(')) setIsStatsInputActive(false);
      return next;
    }); 
  };

  const handleInverse = () => {
    vibrate();
    setIsInverse(!isInverse);
  };

  const handleEqual = async () => {
    vibrate();
    if (!expression) return;

    // Toggle logic: If user hits equal on same expression, toggle fraction/decimal
    if (expression === lastExpressionCalculated && rawResultValue !== null && typeof rawResultValue === 'number') {
      const fractionStr = toFraction(rawResultValue);
      if (fractionStr) {
        setShowFraction(!showFraction);
        return;
      }
    }

    const raw = evaluateExpression(expression, isDegree);
    const resStr = formatValue(raw);
    
    setRawResultValue(raw);
    setResult(resStr);
    setLastExpressionCalculated(expression);
    setIsStatsInputActive(false);
    setShowFraction(false); // Default to decimal for new calculation

    if (resStr !== 'Error') {
      setLastResult(resStr);
      const newItem: Omit<HistoryItem, 'id'> = { expression, result: resStr, timestamp: Date.now() };
      try { await addHistoryItem(newItem); await loadHistory(); } catch (e) {}
    }
  };

  const displayResultValue = showFraction && typeof rawResultValue === 'number' 
    ? (toFraction(rawResultValue) || result) 
    : result;

  // 5-Column Grid Layout for Basic Mode
  const basicKeys = [
    // Row 1
    { label: 'INV', variant: isInverse ? 'active' : 'scientific', action: handleInverse, id: 'tour-inv-btn' },
    { label: isInverse ? 'asin' : 'sin', variant: 'scientific', action: () => handlePress(isInverse ? 'asin(' : 'sin(') },
    { label: isInverse ? 'acos' : 'cos', variant: 'scientific', action: () => handlePress(isInverse ? 'acos(' : 'cos(') },
    { label: isInverse ? 'atan' : 'tan', variant: 'scientific', action: () => handlePress(isInverse ? 'atan(' : 'tan(') },
    { label: <Delete size={22} />, variant: 'destructive', action: handleDelete },

    // Row 2 (Added per request)
    { label: 'π', variant: 'scientific', action: () => handlePress('π') },
    { label: 'e', variant: 'scientific', action: () => handlePress('e') },
    { label: '!', variant: 'scientific', action: () => handlePress('!') },
    { label: ',', variant: 'scientific', action: () => handlePress(',') },
    { label: '%', variant: 'scientific', action: () => handlePress('%') },

    // Row 3
    { label: isInverse ? 'eˣ' : 'ln', variant: 'scientific', action: () => handlePress(isInverse ? 'e^' : 'ln(') },
    { label: isInverse ? '10ˣ' : 'log', variant: 'scientific', action: () => handlePress(isInverse ? '10^' : 'log(') },
    { label: '(', variant: 'scientific', action: () => handlePress('(') },
    { label: ')', variant: 'scientific', action: () => handlePress(')') },
    { label: 'C', variant: 'destructive', action: handleClear },

    // Row 4
    { label: '7', variant: 'default', action: () => handlePress('7') },
    { label: '8', variant: 'default', action: () => handlePress('8') },
    { label: '9', variant: 'default', action: () => handlePress('9') },
    { label: '÷', variant: 'operator', action: () => handlePress('÷') },
    { label: '^', variant: 'scientific', action: () => handlePress('^') },

    // Row 5
    { label: '4', variant: 'default', action: () => handlePress('4') },
    { label: '5', variant: 'default', action: () => handlePress('5') },
    { label: '6', variant: 'default', action: () => handlePress('6') },
    { label: '×', variant: 'operator', action: () => handlePress('×') },
    { label: '√', variant: 'scientific', action: () => handlePress('√(') },

    // Row 6
    { label: '1', variant: 'default', action: () => handlePress('1') },
    { label: '2', variant: 'default', action: () => handlePress('2') },
    { label: '3', variant: 'default', action: () => handlePress('3') },
    { label: '-', variant: 'operator', action: () => handlePress('-') },
    { label: 'Ans', variant: 'scientific', action: handleAns },

    // Row 7
    { label: '0', variant: 'default', action: () => handlePress('0') },
    { label: '.', variant: 'default', action: () => handlePress('.') },
    { label: <Atom size={20} />, variant: 'scientific', action: () => { vibrate(); setMode('SCIENTIFIC'); } },
    { label: '+', variant: 'operator', action: () => handlePress('+') },
    { label: '=', variant: 'action', action: handleEqual },
  ];

  const trigGroups = [
    {
      title: 'Standard',
      items: [
        { label: 'sin', insert: 'sin(' }, { label: 'cos', insert: 'cos(' }, { label: 'tan', insert: 'tan(' },
        { label: 'sec', insert: 'sec(' }, { label: 'csc', insert: 'csc(' }, { label: 'cot', insert: 'cot(' }
      ]
    },
    {
      title: 'Inverse',
      items: [
        { label: 'asin', insert: 'asin(' }, { label: 'acos', insert: 'acos(' }, { label: 'atan', insert: 'atan(' },
        { label: 'asec', insert: 'asec(' }, { label: 'acsc', insert: 'acsc(' }, { label: 'acot', insert: 'acot(' }
      ]
    },
    {
      title: 'Hyperbolic',
      items: [
        { label: 'sinh', insert: 'sinh(' }, { label: 'cosh', insert: 'cosh(' }, { label: 'tanh', insert: 'tanh(' },
        { label: 'sech', insert: 'sech(' }, { label: 'csch', insert: 'csch(' }, { label: 'coth', insert: 'coth(' }
      ]
    },
    {
      title: 'Inv Hyperbolic',
      items: [
        { label: 'asinh', insert: 'asinh(' }, { label: 'acosh', insert: 'acosh(' }, { label: 'atanh', insert: 'atanh(' },
        { label: 'asech', insert: 'asech(' }, { label: 'acsch', insert: 'acsch(' }, { label: 'acoth', insert: 'acoth(' }
      ]
    }
  ];

  const statsFunctions = [
    { label: 'mean', insert: 'mean(' }, { label: 'med', insert: 'median(' }, { label: 'mode', insert: 'mode(' },
    { label: 'std', insert: 'std(' }, { label: 'var', insert: 'variance(' }, { label: 'sum', insert: 'sum(' },
    { label: 'min', insert: 'min(' }, { label: 'max', insert: 'max(' }, { label: ',', insert: ',' },
  ];

  const mathFunctions = [
    { label: 'π', insert: 'π' }, { label: 'e', insert: 'e' }, { label: '%', insert: '%' },
    { label: 'log', insert: 'log(' }, { label: 'ln', insert: 'ln(' }, { label: 'eˣ', insert: 'e^' },
    { label: 'x²', insert: '^2' }, { label: 'x³', insert: '^3' }, { label: 'abs', insert: 'abs(' },
    { label: 'n!', insert: '!' }, { label: 'mod', insert: 'mod(' }, { label: 'rand', insert: 'random()' },
    { label: 'nPr', insert: ' P ' }, { label: 'nCr', insert: ' C ' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg">
      <HistorySidebar 
        isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)}
        items={history} onSelect={(i) => { setExpression(i.expression); setResult(i.result); setRawResultValue(null); }}
        onDelete={deleteHistoryItemDB} onClear={clearHistoryDB} onUpdateNote={updateHistoryNote}
      />

      <div className="flex-1 flex flex-col justify-end p-6 pt-12 space-y-2 relative overflow-hidden">
         <div className="absolute top-8 left-4 z-10 flex items-center gap-3">
             <button onClick={() => { vibrate(); setIsHistoryOpen(true); }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full active:bg-slate-200 dark:active:bg-dark-surface">
               <History size={20} />
             </button>
             {document.fullscreenEnabled && (
               <button onClick={toggleFullscreen} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full active:bg-slate-200 dark:active:bg-dark-surface">
                 {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
               </button>
             )}
             <div className="flex bg-slate-200/50 dark:bg-dark-surface/80 rounded-lg p-1 border border-slate-300/20 dark:border-slate-700/20 backdrop-blur-sm">
               <button onClick={() => { vibrate(); setIsDegree(false); }} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${!isDegree ? 'bg-white dark:bg-dark-elem text-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}>RAD</button>
               <button onClick={() => { vibrate(); setIsDegree(true); }} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${isDegree ? 'bg-white dark:bg-dark-elem text-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}>DEG</button>
             </div>
         </div>
         <div ref={displayRef} className="text-right text-4xl sm:text-5xl font-light text-slate-800 dark:text-slate-100 overflow-x-auto no-scrollbar whitespace-nowrap tracking-wide py-2">
           {expression || '0'}
         </div>
         <div 
           onClick={() => {
              if (typeof rawResultValue === 'number' && toFraction(rawResultValue)) {
                vibrate();
                setShowFraction(!showFraction);
              }
           }}
           className={`text-right text-2xl sm:text-3xl font-medium h-10 truncate cursor-pointer transition-all duration-300 ${showFraction ? 'text-amber-600 dark:text-amber-400 scale-105 origin-right' : 'text-emerald-600 dark:text-emerald-400'}`}
         >
           {displayResultValue}
         </div>
      </div>

      <div className="bg-white dark:bg-dark-surface shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex-none z-20">
        <div className="h-[440px] sm:h-[480px] w-full">
          {mode === 'BASIC' ? (
            <div className="grid grid-cols-5 grid-rows-7 gap-2 sm:gap-3 h-full">
               {basicKeys.map((key, idx) => (
                 <KeypadButton 
                    key={idx} 
                    id={idx < 4 ? 'tour-trig-area' : undefined}
                    label={key.label} 
                    variant={key.variant as any} 
                    onClick={key.action} 
                    className={typeof key.label === 'string' && key.label.length > 2 ? '!text-sm sm:!text-base' : ''}
                 />
               ))}
            </div>
          ) : (
            <div className="flex flex-col h-full gap-3 overflow-hidden">
                <div className="flex-none h-12">
                  <button 
                    onClick={() => { vibrate(); setMode('BASIC'); }}
                    className="w-full h-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] border border-red-100 dark:border-red-900/30"
                  >
                    <ChevronLeft size={18} />
                    Back to Basic
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 h-12 flex-none">
                    {(['Trig', 'Stats', 'Math'] as SciCategory[]).map(cat => (
                        <KeypadButton 
                            key={cat} label={cat} 
                            variant={sciCategory === cat ? 'active' : 'scientific'} 
                            onClick={() => { vibrate(); setSciCategory(cat); }} 
                        />
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-1 -mr-1 no-scrollbar space-y-4 pb-4">
                    {sciCategory === 'Trig' && (
                      <div className="space-y-4">
                        {trigGroups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-3">
                            {gIdx > 0 && <hr className="border-slate-100 dark:border-slate-800 my-4" />}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                              {group.items.map((item, iIdx) => (
                                <div key={iIdx} className="h-14">
                                  <KeypadButton
                                    label={item.label}
                                    variant="scientific"
                                    onClick={() => handlePress(item.insert)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {sciCategory === 'Stats' && (
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {statsFunctions.map((item, idx) => (
                          <div key={idx} className="h-14">
                            <KeypadButton
                              label={item.label}
                              variant="scientific"
                              onClick={() => handleStatsFunctionPress(item.insert)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {sciCategory === 'Math' && (
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {mathFunctions.map((item, idx) => (
                          <div key={idx} className="h-14">
                            <KeypadButton
                              label={item.label}
                              variant="scientific"
                              onClick={() => handlePress(item.insert)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculatorView;
