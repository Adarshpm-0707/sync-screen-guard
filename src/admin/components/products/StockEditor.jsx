import React, { useState, useEffect } from 'react';
import { Plus, Minus, Check, RefreshCw } from 'lucide-react';
import AdminButton from '../common/AdminButton';

export default function StockEditor({ initialStock = 0, onSave, isSaving }) {
  const [stock, setStock] = useState(initialStock);

  useEffect(() => {
    setStock(initialStock);
  }, [initialStock]);

  const handleIncrement = () => setStock((prev) => prev + 1);
  const handleDecrement = () => setStock((prev) => Math.max(0, prev - 1));

  const hasChanges = stock !== initialStock;

  return (
    <div className="flex items-center space-x-1 bg-[#090D16]/90 border border-slate-800 rounded-xl p-1 max-w-fit shadow-inner">
      <button
        type="button"
        onClick={handleDecrement}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
        disabled={stock <= 0 || isSaving}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
        disabled={isSaving}
        className="w-12 text-center text-xs font-black text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
      />

      <button
        type="button"
        onClick={handleIncrement}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
        disabled={isSaving}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onSave(stock)}
        disabled={isSaving || !hasChanges}
        className={`h-7 px-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
          hasChanges 
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 animate-pulse'
            : 'bg-slate-800/40 text-slate-600 border border-slate-800/60 cursor-not-allowed'
        }`}
        title="Save stock value"
      >
        {isSaving ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
