import React, { useState, useEffect } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import AdminButton from '../common/AdminButton';

export default function StockEditor({ initialStock = 0, onSave, isSaving }) {
  const [stock, setStock] = useState(initialStock);

  useEffect(() => {
    setStock(initialStock);
  }, [initialStock]);

  const handleIncrement = () => setStock((prev) => prev + 1);
  const handleDecrement = () => setStock((prev) => Math.max(0, prev - 1));

  return (
    <div className="flex items-center space-x-2 bg-slate-950/20 border border-slate-800 rounded-xl p-1.5 self-start">
      <button
        type="button"
        onClick={handleDecrement}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        disabled={stock <= 0 || isSaving}
      >
        <Minus className="h-4 w-4" />
      </button>

      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
        disabled={isSaving}
        className="w-16 text-center text-xs font-bold text-white bg-transparent focus:outline-none"
      />

      <button
        type="button"
        onClick={handleIncrement}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        disabled={isSaving}
      >
        <Plus className="h-4 w-4" />
      </button>

      <AdminButton
        variant="success"
        onClick={() => onSave(stock)}
        isLoading={isSaving}
        className="h-8 !px-3"
      >
        <Check className="h-4 w-4" />
      </AdminButton>
    </div>
  );
}
