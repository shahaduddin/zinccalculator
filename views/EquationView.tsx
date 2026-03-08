
import React, { useState, useEffect, useRef } from 'react';
import { solvePolynomial, solveLinearSystem, parsePolynomial } from '../utils/math';
import { Minus, Plus, RefreshCw, Copy, Check, XCircle, Info, CheckCircle2, Delete, Calculator, Send } from 'lucide-react';
import KeypadButton from '../components/KeypadButton';

type SolverMode = 'POLY' | 'SYSTEM';

const PolynomialDisplay: React.FC<{ expression: string; placeholder?: string }> = ({ expression, placeholder }) => {
  if (!expression) {
    return <span className="text-slate-300 dark:text-slate-700 italic text-sm sm:text-xl">{placeholder || 'x² - 5x + 6'}</span>;
  }

  const parts = expression.split(/(\^\d+)/);

  return (
    <span className="font-serif">
      {parts.map((part, i) => {
        if (part.startsWith('^')) {
          return <sup key={i} className="text-[0.6em] top-[-0.4em] relative">{part.slice(1)}</sup>;
        }
        const visual = part
          .replace(/\*/g, '×')
          .replace(/\//g, '÷')
          .replace(/\+/g, ' + ')
          .replace(/\-/g, ' - ')
          .replace(/\s{2,}/g, ' ');
        return <span key={i}>{visual}</span>;
      })}
    </span>
  );
};

const EquationView: React.FC = () => {
  const [mode, setMode] = useState<SolverMode>('POLY');
  const [polyExpression, setPolyExpression] = useState('');
  const [systemSize, setSystemSize] = useState(2);
  const [matrixA, setMatrixA] = useState<string[][]>(Array(2).fill(null).map(() => Array(2).fill('')));
  const [vectorB, setVectorB] = useState<string[]>(Array(2).fill(''));
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const vibrate = (d = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(d); } catch(e) {}
    }
  };

  useEffect(() => {
    setResult([]);
    setError('');
    if (mode === 'SYSTEM') {
        const newMatrix = Array(systemSize).fill(null).map(() => Array(systemSize).fill(''));
        const newVector = Array(systemSize).fill('');
        matrixA.forEach((row, r) => {
            if (r < systemSize) {
                row.forEach((val, c) => {
                    if (c < systemSize) newMatrix[r][c] = val;
                });
            }
        });
        vectorB.forEach((val, r) => {
            if (r < systemSize) newVector[r] = val;
        });
        setMatrixA(newMatrix);
        setVectorB(newVector);
    }
  }, [systemSize, mode]);

  useEffect(() => {
    if (result.length > 0 && resultRef.current) {
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
    }
  }, [result]);

  const handleMatrixChange = (row: number, col: number, val: string) => {
    const newM = [...matrixA];
    newM[row] = [...newM[row]];
    newM[row][col] = val;
    setMatrixA(newM);
  };

  const handleVectorChange = (row: number, val: string) => {
    const newV = [...vectorB];
    newV[row] = val;
    setVectorB(newV);
  };

  const handleSolve = () => {
    vibrate(20);
    setError('');
    setResult([]);

    if (mode === 'POLY') {
      if (!polyExpression.trim()) {
        setError('Enter an equation');
        return;
      }
      const coeffs = parsePolynomial(polyExpression);
      if (!coeffs) {
        setError('Invalid format');
        return;
      }
      const res = solvePolynomial(coeffs);
      if (res.includes('Calculation Error')) setError('Solver error');
      else setResult(res);
    } else {
      const numMatrix = matrixA.map(row => row.map(v => v === '' ? 0 : parseFloat(v)));
      const numVector = vectorB.map(v => v === '' ? 0 : parseFloat(v));
      if (numMatrix.flat().some(isNaN) || numVector.some(isNaN)) {
         setError('Check inputs');
         return;
      }
      const res = solveLinearSystem(numMatrix, numVector);
      setResult(res);
    }
  };

  const handleKeypress = (val: string) => {
    vibrate(5);
    setPolyExpression(prev => prev + val);
    setResult([]);
    setError('');
  };

  const handleClear = () => {
    vibrate(15);
    if (mode === 'POLY') setPolyExpression('');
    else {
      setMatrixA(Array(systemSize).fill(null).map(() => Array(systemSize).fill('')));
      setVectorB(Array(systemSize).fill(''));
    }
    setResult([]);
    setError('');
  };

  const handleDelete = () => {
    vibrate(5);
    if (mode === 'POLY') setPolyExpression(prev => prev.slice(0, -1));
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    vibrate(10);
  };

  const polyKeys = [
    { label: <span className="italic">x</span>, variant: 'scientific', action: () => handleKeypress('x') },
    { label: <span className="text-xs">xⁿ</span>, variant: 'operator', action: () => handleKeypress('^') },
    { label: '(', variant: 'scientific', action: () => handleKeypress('(') },
    { label: ')', variant: 'scientific', action: () => handleKeypress(')') },
    { label: '7', action: () => handleKeypress('7') },
    { label: '8', action: () => handleKeypress('8') },
    { label: '9', action: () => handleKeypress('9') },
    { label: '÷', variant: 'operator', action: () => handleKeypress('/') },
    { label: '4', action: () => handleKeypress('4') },
    { label: '5', action: () => handleKeypress('5') },
    { label: '6', action: () => handleKeypress('6') },
    { label: '×', variant: 'operator', action: () => handleKeypress('*') },
    { label: '1', action: () => handleKeypress('1') },
    { label: '2', action: () => handleKeypress('2') },
    { label: '3', action: () => handleKeypress('3') },
    { label: '-', variant: 'operator', action: () => handleKeypress('-') },
    { label: '0', action: () => handleKeypress('0') },
    { label: '.', action: () => handleKeypress('.') },
    { label: 'C', variant: 'destructive', action: handleClear },
    { label: '+', variant: 'operator', action: () => handleKeypress('+') },
    { label: <Delete size={20} />, variant: 'scientific', action: handleDelete, colSpan: 2 },
    { label: <Send size={20} />, variant: 'action', action: handleSolve, colSpan: 2 },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Reduced Header Height for Mobile */}
      <div className="flex-none pt-10 px-4 sm:px-6 pb-2 bg-gray-50 dark:bg-dark-bg z-20">
        <div className="flex justify-between items-center mb-3">
            <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Solver</h1>
                <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">Mathematical Engine</p>
            </div>
            <button onClick={handleClear} className="p-2 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400">
                <RefreshCw size={14} />
            </button>
        </div>

        <div className="bg-slate-200/60 dark:bg-dark-surface p-1 rounded-xl flex relative backdrop-blur-sm border border-slate-300/20 max-w-sm mx-auto">
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-dark-elem shadow-sm rounded-lg transition-all duration-300 ease-out ${mode === 'POLY' ? 'left-1' : 'left-[calc(50%+2px)]'}`} />
          <button onClick={() => { vibrate(); setMode('POLY'); }} className={`flex-1 relative z-10 py-1.5 text-[9px] font-bold text-center transition-colors ${mode === 'POLY' ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>Polynomial</button>
          <button onClick={() => { vibrate(); setMode('SYSTEM'); }} className={`flex-1 relative z-10 py-1.5 text-[9px] font-bold text-center transition-colors ${mode === 'SYSTEM' ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>Systems</button>
        </div>
      </div>

      {/* Main Area: Scrollable with refined padding */}
      <div ref={mainScrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6">
        {mode === 'POLY' ? (
          <div className="flex flex-col min-h-full pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <div className="py-3">
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-3 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[70px] flex flex-col justify-center items-end relative overflow-hidden">
                <div className="absolute top-2 left-3 text-[7px] uppercase font-bold text-slate-300 dark:text-slate-600 tracking-widest">Input</div>
                <div className="text-lg sm:text-2xl font-serif text-slate-800 dark:text-slate-100 break-all text-right w-full">
                  <PolynomialDisplay expression={polyExpression} />
                  {polyExpression && <span className="text-emerald-500 ml-0.5 animate-pulse">|</span>}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-[10px] font-medium flex items-center gap-2">
                  <XCircle size={12} /> {error}
              </div>
            )}

            {result.length > 0 && (
              <div ref={resultRef} className="mb-4 bg-slate-900 dark:bg-dark-surface rounded-2xl p-4 shadow-lg border border-slate-800 animate-in fade-in zoom-in-95 duration-300">
                  <h3 className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CheckCircle2 size={10} className="text-emerald-500" /> Roots
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                      {result.map((line, i) => (
                          <button key={i} onClick={() => copyToClipboard(line, i)} className="flex items-center justify-between p-3 bg-white/5 dark:bg-dark-elem rounded-xl text-xs active:scale-[0.98] transition-transform">
                              <span className="font-mono text-white text-sm sm:text-base truncate pr-2">{line}</span>
                              <div className="text-slate-500">{copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}</div>
                          </button>
                      ))}
                  </div>
              </div>
            )}

            {/* Specialized Keypad: Height sync for col-span-2 buttons */}
            <div className="mt-auto grid grid-cols-4 gap-2 py-2">
                {polyKeys.map((key, idx) => (
                  <div key={idx} className={`${key.colSpan === 2 ? 'col-span-2 aspect-[8/3]' : 'col-span-1 aspect-[4/3]'}`}>
                    <KeypadButton 
                      label={key.label} 
                      variant={(key.variant || 'default') as any}
                      onClick={key.action}
                      className="!text-sm sm:!text-lg"
                    />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          /* System Solver Content with improved sizing */
          <div className="flex flex-col min-h-full pb-[calc(3rem+env(safe-area-inset-bottom))] space-y-4 pt-3">
              <div className="bg-white dark:bg-dark-surface rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <Info size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">System Size</span>
                  </div>
                  <div className="flex items-center bg-slate-100 dark:bg-dark-bg rounded-lg p-0.5">
                    <button onClick={() => { vibrate(); setSystemSize(Math.max(2, systemSize - 1)); }} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-dark-elem rounded shadow-sm text-slate-600"><Minus size={10} /></button>
                    <span className="w-8 text-center font-bold text-xs text-slate-800 dark:text-white tabular-nums">{systemSize}</span>
                    <button onClick={() => { vibrate(); setSystemSize(Math.min(5, systemSize + 1)); }} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-dark-elem rounded shadow-sm text-slate-600"><Plus size={10} /></button>
                  </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                  <div className="min-w-max mx-auto">
                      <div className="flex gap-2 mb-2">
                          {Array.from({length: systemSize}).map((_, i) => (
                              <div key={i} className="w-10 text-center text-[7px] font-bold text-slate-400 uppercase tracking-wider">X{i+1}</div>
                          ))}
                          <div className="w-3"></div>
                          <div className="w-10 text-center text-[7px] font-bold text-slate-400 uppercase tracking-wider">= B</div>
                      </div>
                      {matrixA.map((row, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-1.5 mb-1.5">
                          {row.map((val, cIdx) => (
                          <input 
                              key={`${rIdx}-${cIdx}`}
                              type="number"
                              inputMode="decimal"
                              value={val}
                              onChange={(e) => handleMatrixChange(rIdx, cIdx, e.target.value)}
                              className="w-10 h-9 text-center bg-slate-50 dark:bg-dark-elem border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white transition-all"
                              placeholder="0"
                          />
                          ))}
                          <div className="w-3 flex justify-center text-slate-300 text-sm font-serif">=</div>
                          <input 
                          type="number"
                          inputMode="decimal"
                          value={vectorB[rIdx]}
                          onChange={(e) => handleVectorChange(rIdx, e.target.value)}
                          className="w-10 h-9 text-center bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none text-emerald-700 dark:text-emerald-300"
                          placeholder="0"
                          />
                      </div>
                      ))}
                  </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-[10px] flex items-center gap-2">
                    <XCircle size={12} /> {error}
                </div>
              )}

              <button 
                onClick={handleSolve}
                className="w-full bg-emerald-600 active:scale-[0.97] text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform"
              >
                <span>Solve System</span>
                <Calculator size={14} />
              </button>

              {result.length > 0 && (
                <div ref={resultRef} className="bg-slate-900 dark:bg-dark-surface rounded-xl p-4 border border-slate-800 animate-in slide-in-from-bottom-3 duration-300">
                    <h3 className="text-slate-500 text-[7px] font-bold uppercase tracking-widest mb-3">Solution Vector</h3>
                    <div className="grid grid-cols-1 gap-1.5">
                        {result.map((line, i) => (
                            <button key={i} onClick={() => copyToClipboard(line.split('=')[1]?.trim() || line, i)} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 active:bg-white/10 transition-colors">
                                <span className="font-mono text-white text-sm truncate pr-2">{line}</span>
                                <div className="text-slate-500">{copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}</div>
                            </button>
                        ))}
                    </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquationView;
