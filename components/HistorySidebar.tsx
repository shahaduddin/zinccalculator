import React, { useState, useMemo } from 'react';
import { X, Trash2, Calendar, Edit2, MessageSquare, Check, RotateCcw } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
  onClear: () => void;
  onUpdateNote: (id: number, note: string) => void;
}

type FilterType = 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK';

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onSelect, 
  onDelete, 
  onClear,
  onUpdateNote
}) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const filteredItems = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const week = today - 86400000 * 7;

    return items.filter(item => {
      if (filter === 'ALL') return true;
      if (filter === 'TODAY') return item.timestamp >= today;
      if (filter === 'YESTERDAY') return item.timestamp >= yesterday && item.timestamp < today;
      if (filter === 'WEEK') return item.timestamp >= week;
      return true;
    });
  }, [items, filter]);

  const handleEditNote = (item: HistoryItem) => {
    setEditingId(item.id!);
    setNoteText(item.note || '');
  };

  const saveNote = (id: number) => {
    onUpdateNote(id, noteText);
    setEditingId(null);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-dark-surface z-50 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-dark-surface">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <RotateCcw size={20} /> History
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-dark-elem rounded-full text-slate-500">
              <X size={24} />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800">
            {(['ALL', 'TODAY', 'YESTERDAY', 'WEEK'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === f 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 dark:bg-dark-elem text-slate-600 dark:text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center text-slate-400 mt-20">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No history found</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="bg-slate-50 dark:bg-dark-elem/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors group">
                  <div 
                    className="cursor-pointer"
                    onClick={() => {
                        onSelect(item);
                        onClose();
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(item.timestamp)}</span>
                      {item.note && editingId !== item.id && (
                        <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <MessageSquare size={10} /> {item.note}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-slate-500 dark:text-slate-400 text-sm font-mono mb-1 truncate">
                      {item.expression} =
                    </div>
                    <div className="text-right text-xl font-medium text-slate-800 dark:text-slate-100">
                      {item.result}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === item.id ? (
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="flex-1 text-xs bg-white dark:bg-dark-bg border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none text-slate-800 dark:text-slate-200"
                          placeholder="Add a note..."
                          autoFocus
                        />
                        <button onClick={() => saveNote(item.id!)} className="text-emerald-600">
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditNote(item)}
                        className="text-slate-400 hover:text-emerald-500 flex items-center gap-1 text-xs"
                      >
                        <Edit2 size={14} /> Note
                      </button>
                    )}
                    
                    <button 
                      onClick={() => item.id && onDelete(item.id)}
                      className="text-slate-400 hover:text-red-500 ml-auto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-surface">
             <button 
               onClick={onClear}
               className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium text-sm flex items-center justify-center gap-2"
             >
               <Trash2 size={18} /> Clear All History
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;