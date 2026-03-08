
import React, { useState } from 'react';
import { Search, Info, Settings2, Thermometer } from 'lucide-react';
import { SCIENTIFIC_CONSTANTS } from '../constants';

interface ConstantsViewProps {
  onSelect: (value: string) => void;
}

type ConstantMode = 'SCIENTIFIC' | 'ENGINEERING';

const ConstantsView: React.FC<ConstantsViewProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mode, setMode] = useState<ConstantMode>('SCIENTIFIC');

  const categories = ['All', 'Universal', 'Physics', 'Chemistry', 'Mechanical', 'Earth', 'Astronomy', 'Math'];

  const filtered = SCIENTIFIC_CONSTANTS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const vibrate = () => {
    try { if (navigator.vibrate) navigator.vibrate(5); } catch(e) {}
  };

  const handleToggleMode = (newMode: ConstantMode) => {
    vibrate();
    setMode(newMode);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Header Section */}
      <div className="flex-none p-6 pb-0 bg-gray-50 dark:bg-dark-bg z-10">
        <div className="flex justify-between items-end mb-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Library</h2>
                <p className="text-xs text-slate-500 font-medium">Science & Engineering Constants</p>
            </div>
            {/* Mode Switcher */}
            <div className="bg-slate-200/60 dark:bg-dark-surface p-1 rounded-xl flex gap-1 border border-slate-300/20">
                <button 
                    onClick={() => handleToggleMode('SCIENTIFIC')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${mode === 'SCIENTIFIC' ? 'bg-white dark:bg-dark-elem text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                    SCI (SI)
                </button>
                <button 
                    onClick={() => handleToggleMode('ENGINEERING')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${mode === 'ENGINEERING' ? 'bg-white dark:bg-dark-elem text-amber-600 shadow-sm' : 'text-slate-500'}`}
                >
                    ENG
                </button>
            </div>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search constants..."
            className="w-full bg-white dark:bg-dark-surface pl-10 pr-4 py-3.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 ring-emerald-500/20 dark:text-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { vibrate(); setSelectedCategory(cat); }}
              className={`flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6">
        <div className="grid grid-cols-1 gap-3 pb-32">
          {filtered.map((item, idx) => {
            const displayValue = (mode === 'ENGINEERING' && item.engValue !== undefined) ? item.engValue : item.value;
            const displayUnit = (mode === 'ENGINEERING' && item.engUnit !== undefined) ? item.engUnit : item.unit;
            
            return (
              <button
                key={idx}
                onClick={() => { vibrate(); onSelect(displayValue.toString()); }}
                className="group flex items-center bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 active:scale-[0.98] transition-all text-left gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-dark-elem flex items-center justify-center text-slate-900 dark:text-white font-serif italic text-2xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 transition-colors flex-none">
                  {item.symbol}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate pr-2">{item.name}</h3>
                    <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter bg-slate-100 dark:bg-dark-bg px-1.5 py-0.5 rounded">
                        {item.category}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {displayValue > 10000 || displayValue < 0.001 
                            ? displayValue.toExponential(4) 
                            : displayValue.toString().length > 10 
                                ? displayValue.toPrecision(7) 
                                : displayValue}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                        {displayUnit}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Info size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">No constants found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstantsView;
