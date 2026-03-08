
import React, { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import { ArrowLeft, Minus, Plus, RefreshCw, Calculator, Variable, ChevronRight, X, Save, BookOpen, Trash2, Import, Layers } from 'lucide-react';
import { Matrix } from '../types';

type OpId = 'ADD' | 'SUB' | 'MUL' | 'DET' | 'INV' | 'TRANS';

interface OperationDef {
  id: OpId;
  label: string;
  symbol: string;
  desc: string;
  requiresB: boolean;
  isSquare?: boolean;
}

interface SavedMatrixRecord {
  id: string;
  name: string;
  data: string[][];
  rows: number;
  cols: number;
}

const OPERATIONS: OperationDef[] = [
  { id: 'ADD', label: 'Addition', symbol: 'A + B', desc: 'Add two matrices', requiresB: true },
  { id: 'SUB', label: 'Subtraction', symbol: 'A - B', desc: 'Subtract B from A', requiresB: true },
  { id: 'MUL', label: 'Multiplication', symbol: 'A × B', desc: 'Matrix product', requiresB: true },
  { id: 'DET', label: 'Determinant', symbol: '|A|', desc: 'Calculate determinant', requiresB: false, isSquare: true },
  { id: 'INV', label: 'Inverse', symbol: 'A⁻¹', desc: 'Find inverse matrix', requiresB: false, isSquare: true },
  { id: 'TRANS', label: 'Transpose', symbol: 'Aᵀ', desc: 'Swap rows and cols', requiresB: false },
];

const MatrixView: React.FC = () => {
  const [selectedOp, setSelectedOp] = useState<OperationDef | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const [dimsA, setDimsA] = useState({ r: 3, c: 3 });
  const [dimsB, setDimsB] = useState({ r: 3, c: 3 });
  
  const [matA, setMatA] = useState<string[][]>(Array(3).fill(null).map(() => Array(3).fill('')));
  const [matB, setMatB] = useState<string[][]>(Array(3).fill(null).map(() => Array(3).fill('')));
  
  const [savedMatrices, setSavedMatrices] = useState<SavedMatrixRecord[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('zinc_saved_matrices');
    if (stored) {
      try { setSavedMatrices(JSON.parse(stored)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zinc_saved_matrices', JSON.stringify(savedMatrices));
  }, [savedMatrices]);

  const vibrate = (d = 10) => {
    try { if (navigator.vibrate) navigator.vibrate(d); } catch(e) {}
  };

  const resizeMatrix = (current: string[][], newR: number, newC: number): string[][] => {
    const newMat = Array(newR).fill(null).map((_, r) => Array(newC).fill(null).map((_, c) => {
        if (current[r] && current[r][c] !== undefined) return current[r][c];
        return '';
    }));
    return newMat;
  };

  useEffect(() => {
    setMatA(prev => {
        if (prev.length === dimsA.r && prev[0]?.length === dimsA.c) return prev;
        return resizeMatrix(prev, dimsA.r, dimsA.c);
    });
  }, [dimsA]);

  useEffect(() => {
    setMatB(prev => {
        if (prev.length === dimsB.r && prev[0]?.length === dimsB.c) return prev;
        return resizeMatrix(prev, dimsB.r, dimsB.c);
    });
  }, [dimsB]);

  const handleSaveMatrix = (data: string[][], label: string) => {
    vibrate();
    const name = prompt(`Name your saved ${label}:`, `${label} ${savedMatrices.length + 1}`);
    if (!name) return;

    const newRecord: SavedMatrixRecord = {
      id: Date.now().toString(),
      name,
      data: data.map(r => [...r]),
      rows: data.length,
      cols: data[0]?.length || 0
    };
    setSavedMatrices([newRecord, ...savedMatrices]);
  };

  const deleteSavedMatrix = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(20);
    setSavedMatrices(savedMatrices.filter(m => m.id !== id));
  };

  const loadMatrix = (data: string[][], target: 'A' | 'B') => {
    vibrate();
    const rows = data.length;
    const cols = data[0].length;

    if (target === 'A') {
      setDimsA({ r: rows, c: cols });
      // We set dimensions first, then data. 
      // Using a short delay or functional update to ensure dims effect doesn't clear loaded data
      setTimeout(() => setMatA(data.map(r => [...r])), 0);
    } else {
      setDimsB({ r: rows, c: cols });
      setTimeout(() => setMatB(data.map(r => [...r])), 0);
    }
    setIsLibraryOpen(false);
  };

  const applyCommonTemplate = (type: 'IDENTITY' | 'ZEROS' | 'ONES' | 'SYMMETRIC') => {
    vibrate();
    const r = dimsA.r;
    const c = dimsA.c;
    let newData: string[][] = Array(r).fill(null).map(() => Array(c).fill('0'));

    if (type === 'IDENTITY') {
      for (let i = 0; i < Math.min(r, c); i++) newData[i][i] = '1';
    } else if (type === 'ONES') {
      newData = Array(r).fill(null).map(() => Array(c).fill('1'));
    } else if (type === 'SYMMETRIC') {
        const currentA = matA.map(row => row.map(v => v === '' ? 0 : parseFloat(v)));
        try {
            const sym = math.divide(math.add(currentA, math.transpose(currentA)), 2) as any;
            newData = sym.map((row: any) => row.map((v: number) => v.toString()));
        } catch(e) {
            setError("Symmetry requires a square matrix");
            return;
        }
    }
    setMatA(newData);
    setIsLibraryOpen(false);
  };

  const handleCalculate = () => {
    vibrate();
    setError(null);
    setResult(null);

    try {
        const parseMat = (m: string[][]) => m.map(row => row.map(v => v === '' ? 0 : parseFloat(v)));
        const numA = parseMat(matA);
        const numB = parseMat(matB);

        if (numA.flat().some(isNaN) || (selectedOp?.requiresB && numB.flat().some(isNaN))) {
            setError("Please fill all cells with valid numbers");
            return;
        }

        let res: any;
        switch (selectedOp?.id) {
            case 'ADD': res = math.add(numA, numB); break;
            case 'SUB': res = math.subtract(numA, numB); break;
            case 'MUL': res = math.multiply(numA, numB); break;
            case 'DET': res = math.det(numA); break;
            case 'INV': res = math.inv(numA); break;
            case 'TRANS': res = math.transpose(numA); break;
        }
        setResult(res);
    } catch (e: any) {
        let msg = "Calculation Error";
        if (e.message && e.message.toLowerCase().includes("singular")) msg = "Matrix is Singular (No Inverse)";
        if (e.message && e.message.toLowerCase().includes("dimension")) msg = "Dimension Mismatch";
        setError(msg);
    }
  };

  const MatrixGrid = ({ data, label, onChange, onSave }: { data: string[][], label: string, onChange: (r:number, c:number, v:string)=>void, onSave: () => void }) => (
    <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 w-full overflow-hidden">
        <div className="flex justify-between items-center mb-3 px-1">
             <div className="flex items-center gap-2">
                <Variable size={14} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</h3>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-dark-elem px-2 py-0.5 rounded-full">{data.length} × {data[0]?.length}</span>
                <button 
                  onClick={onSave}
                  className="p-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-lg transition-all active:scale-90 border border-emerald-100 dark:border-emerald-900/20"
                  title="Save to Library"
                >
                  <Save size={14} />
                </button>
             </div>
        </div>
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div 
                className="grid gap-2 min-w-max"
                style={{ gridTemplateColumns: `repeat(${data[0]?.length || 1}, minmax(3.5rem, 1fr))` }}
            >
                {data.map((row, r) => (
                    row.map((val, c) => (
                        <input
                            key={`${r}-${c}`}
                            type="number"
                            inputMode="decimal"
                            value={val}
                            placeholder="0"
                            onChange={(e) => onChange(r, c, e.target.value)}
                            className="h-10 bg-slate-50 dark:bg-dark-elem border border-slate-200 dark:border-slate-700/50 rounded-lg text-center text-slate-800 dark:text-slate-200 font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        />
                    ))
                ))}
            </div>
        </div>
    </div>
  );

  const Stepper = ({ value, onChange, min = 1, max = 10, label }: { value: number, onChange: (v:number) => void, min?:number, max?:number, label?: string }) => (
    <div className="flex flex-col items-center">
        {label && <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">{label}</span>}
        <div className="flex items-center bg-slate-100 dark:bg-dark-elem rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
            <button 
                onClick={() => { vibrate(); onChange(Math.max(min, value - 1)); }}
                disabled={value <= min}
                className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
            >
                <Minus size={14} strokeWidth={3} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {value}
            </span>
            <button 
                onClick={() => { vibrate(); onChange(Math.min(max, value + 1)); }}
                disabled={value >= max}
                className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
            >
                <Plus size={14} strokeWidth={3} />
            </button>
        </div>
    </div>
  );

  if (!selectedOp) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg p-6 pb-24 overflow-y-auto no-scrollbar">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Matrix</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">Choose an operation to begin calculation</p>
        
        <div className="grid grid-cols-1 gap-4">
          {OPERATIONS.map(op => (
            <button
              key={op.id}
              onClick={() => { vibrate(); setSelectedOp(op); }}
              className="flex items-center bg-white dark:bg-dark-surface p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/50 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 active:scale-[0.98] transition-all group text-left gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg font-mono flex-none group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {op.symbol}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1">{op.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{op.desc}</p>
              </div>
              <ChevronRight className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg relative">
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isLibraryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsLibraryOpen(false)} />
        <div className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-dark-surface z-[60] shadow-2xl transition-transform duration-300 transform ${isLibraryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="text-emerald-500" size={20} /> Library
              </h3>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-elem text-slate-400"><X size={24}/></button>
            </div>

            <div className="mb-8">
              <h4 className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-widest">Common Templates</h4>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => applyCommonTemplate('IDENTITY')} className="p-3 bg-slate-50 dark:bg-dark-elem rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all flex items-center gap-2">
                  <Layers size={14} /> Identity
                </button>
                <button onClick={() => applyCommonTemplate('ZEROS')} className="p-3 bg-slate-50 dark:bg-dark-elem rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all">Zeros</button>
                <button onClick={() => applyCommonTemplate('ONES')} className="p-3 bg-slate-50 dark:bg-dark-elem rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all">Ones</button>
                <button onClick={() => applyCommonTemplate('SYMMETRIC')} className="p-3 bg-slate-50 dark:bg-dark-elem rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all text-[10px]">Symmetrize A</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <h4 className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-widest">User Saved</h4>
              {savedMatrices.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <Save size={40} className="mx-auto mb-2" />
                  <p className="text-xs">No saved matrices yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedMatrices.map(m => (
                    <div key={m.id} className="group p-4 bg-slate-50 dark:bg-dark-elem rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.rows} × {m.cols}</p>
                        </div>
                        <button onClick={(e) => deleteSavedMatrix(m.id, e)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadMatrix(m.data, 'A')} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold active:scale-95 transition-all">Load A</button>
                        <button onClick={() => loadMatrix(m.data, 'B')} className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold active:scale-95 transition-all">Load B</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-none px-4 pt-4 pb-2 bg-gray-50 dark:bg-dark-bg z-10">
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => { vibrate(); setSelectedOp(null); setResult(null); }} className="p-3 rounded-2xl bg-white dark:bg-dark-surface shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 active:scale-95"><ArrowLeft size={20} /></button>
                <div className="text-center">
                    <h2 className="font-bold text-slate-800 dark:text-slate-100">{selectedOp.label}</h2>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">{selectedOp.symbol}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsLibraryOpen(true)} className="p-3 rounded-2xl bg-white dark:bg-dark-surface shadow-sm border border-slate-100 dark:border-slate-800 text-emerald-500 active:scale-95"><BookOpen size={20} /></button>
                  <button onClick={() => { vibrate(); setMatA(resizeMatrix([], dimsA.r, dimsA.c)); setMatB(resizeMatrix([], dimsB.r, dimsB.c)); setResult(null); }} className="p-3 rounded-2xl bg-white dark:bg-dark-surface shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 transition-colors"><RefreshCw size={20} /></button>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
            <div className="flex flex-col gap-6 mb-8 mt-2">
                {selectedOp.isSquare ? (
                    <div className="flex justify-center bg-white dark:bg-dark-surface p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <Stepper label="Size (N×N)" value={dimsA.r} onChange={(v) => { setDimsA({r: v, c: v}); }} />
                    </div>
                ) : (
                    <div className="flex justify-center gap-4 bg-white dark:bg-dark-surface p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                        {selectedOp.id === 'MUL' ? (
                            <>
                                <Stepper label="Rows A" value={dimsA.r} onChange={(v) => setDimsA(p => ({...p, r: v}))} />
                                <div className="flex items-center pt-5 text-slate-300 font-bold">×</div>
                                <Stepper label="Common" value={dimsA.c} onChange={(v) => { setDimsA(p => ({...p, c: v})); setDimsB(p => ({...p, r: v})); }} />
                                <div className="flex items-center pt-5 text-slate-300 font-bold">×</div>
                                <Stepper label="Cols B" value={dimsB.c} onChange={(v) => setDimsB(p => ({...p, c: v}))} />
                            </>
                        ) : (
                            <>
                                <Stepper label="Rows" value={dimsA.r} onChange={(v) => { setDimsA(p => ({...p, r: v})); setDimsB(p => ({...p, r: v})); }} />
                                <div className="flex items-center pt-5 text-slate-300 font-bold">×</div>
                                <Stepper label="Cols" value={dimsA.c} onChange={(v) => { setDimsA(p => ({...p, c: v})); setDimsB(p => ({...p, c: v})); }} />
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <MatrixGrid 
                  label="Matrix A" 
                  data={matA} 
                  onSave={() => handleSaveMatrix(matA, 'Matrix A')}
                  onChange={(r, c, v) => {
                    const update = [...matA];
                    update[r] = [...update[r]];
                    update[r][c] = v;
                    setMatA(update);
                  }} 
                />
                
                {selectedOp.requiresB && (
                     <div className="relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-dark-surface border-4 border-gray-50 dark:border-dark-bg flex items-center justify-center text-emerald-500 font-black text-lg z-10 shadow-sm">
                            {selectedOp.id === 'ADD' ? '+' : selectedOp.id === 'SUB' ? '-' : '×'}
                        </div>
                        <MatrixGrid 
                          label="Matrix B" 
                          data={matB} 
                          onSave={() => handleSaveMatrix(matB, 'Matrix B')}
                          onChange={(r, c, v) => {
                            const update = [...matB];
                            update[r] = [...update[r]];
                            update[r][c] = v;
                            setMatB(update);
                          }} 
                        />
                     </div>
                )}
            </div>

            {error && (
                <div className="mt-6 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold flex items-center gap-3"><X size={20} strokeWidth={3} />{error}</div>
            )}

            <button onClick={handleCalculate} className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg py-5 rounded-3xl shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"><Calculator size={22} />Calculate Result</button>

            {result !== null && (
                <div ref={resultRef} className="mt-8 mb-4 animate-in fade-in slide-in-from-bottom-6">
                    <div className="bg-slate-900 dark:bg-dark-surface rounded-[32px] p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Calculation Result</h3>
                           {Array.isArray(result) && (
                             <button 
                               onClick={() => handleSaveMatrix(result.map(r => r.map((v: any) => v.toString())), 'Result')}
                               className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg transition-all active:scale-90 border border-emerald-500/20"
                               title="Save Result to Library"
                             >
                               <Save size={14} />
                             </button>
                           )}
                        </div>
                        <div className="overflow-x-auto no-scrollbar">
                            {typeof result === 'number' ? (
                                <div className="text-4xl font-mono text-emerald-400 font-bold tabular-nums">{parseFloat(result.toPrecision(12)).toString()}</div>
                            ) : (
                                <div className="inline-block min-w-full">
                                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${(result as any[]).length > 0 ? (result as any[])[0].length : 1}, minmax(4rem, 1fr))` }}>
                                        {(result as number[][]).map((row, r) => (
                                            row.map((val, c) => (
                                                <div key={`${r}-${c}`} className="h-12 bg-white/5 dark:bg-dark-elem rounded-xl flex items-center justify-center font-mono text-white text-lg border border-white/5 dark:border-slate-800 shadow-inner tabular-nums">{Number.isInteger(val) ? val : Number(val).toFixed(3).replace(/\.?0+$/, '')}</div>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default MatrixView;
