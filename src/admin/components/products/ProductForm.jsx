import React, { useState, useEffect } from 'react';
import ProductImageUpload from './ProductImageUpload';
import AdminButton from '../common/AdminButton';

// Quick-pick preset swatches for common product colors
const PRESET_COLORS = [
  { label: 'Sky Blue',    hex: '#3b82f6' },
  { label: 'Indigo',      hex: '#6366f1' },
  { label: 'Purple',      hex: '#a855f7' },
  { label: 'Rose',        hex: '#f43f5e' },
  { label: 'Orange',      hex: '#f97316' },
  { label: 'Amber',       hex: '#f59e0b' },
  { label: 'Emerald',     hex: '#10b981' },
  { label: 'Teal',        hex: '#14b8a6' },
  { label: 'Cyan',        hex: '#06b6d4' },
  { label: 'Slate',       hex: '#64748b' },
];

export default function ProductForm({ product, onSubmit, isSaving }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    description: '',
    images: [],
    stock: 0,
    theme_color: '#3b82f6',
  });

  useEffect(() => {
    if (product) {
      // Normalize old preset names (e.g. "blue") to hex equivalents
      const normalizeColor = (c) => {
        const nameToHex = { blue: '#3b82f6', orange: '#f97316', pink: '#f43f5e', green: '#10b981', purple: '#a855f7' };
        if (c && c.startsWith('#')) return c;
        return nameToHex[c] || '#3b82f6';
      };
      setFormData({
        name: product.name || '',
        price: product.price || '',
        original_price: product.original_price || '',
        description: product.description || '',
        images: product.images || [],
        stock: product.stock || 0,
        theme_color: normalizeColor(product.theme_color),
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock: parseInt(formData.stock, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs text-slate-350">
      <div>
        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Product Title *</label>
        <input
          type="text"
          required
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
          placeholder="e.g. Sync EZ Fit Glass Screenguard"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Sale Price (₹) *</label>
          <input
            type="number"
            required
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
            placeholder="640"
          />
        </div>

        <div>
          <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Original Price (₹)</label>
          <input
            type="number"
            name="original_price"
            value={formData.original_price}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
            placeholder="999"
          />
        </div>

        <div>
          <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Stock Count *</label>
          <input
            type="number"
            required
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
            placeholder="120"
          />
        </div>
      </div>

      {/* Theme Color Picker */}
      <div>
        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
          Home Page Theme Color
        </label>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
          {/* Color preview + native picker */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/10 flex-shrink-0"
              style={{ backgroundColor: formData.theme_color }}
            />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-300 mb-1">Pick any colour</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="theme_color"
                  value={formData.theme_color}
                  onChange={handleInputChange}
                  className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                  title="Open full colour picker"
                />
                <input
                  type="text"
                  name="theme_color"
                  value={formData.theme_color}
                  onChange={handleInputChange}
                  placeholder="#3b82f6"
                  maxLength={7}
                  className="w-28 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-primary-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">This colour fills the homepage background</span>
              </div>
            </div>
          </div>

          {/* Quick preset swatches */}
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  title={preset.label}
                  onClick={() => setFormData((prev) => ({ ...prev, theme_color: preset.hex }))}
                  className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: preset.hex,
                    borderColor: formData.theme_color === preset.hex ? 'white' : 'transparent',
                    boxShadow: formData.theme_color === preset.hex ? `0 0 0 2px ${preset.hex}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Description</label>
        <textarea
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-white focus:border-primary-500 focus:outline-none transition-colors resize-none"
          placeholder="Product descriptions..."
        />
      </div>

      <div>
        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Product Images</label>
        <ProductImageUpload 
          images={formData.images} 
          onImagesChange={handleImagesChange} 
        />
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-800">
        <AdminButton type="submit" isLoading={isSaving}>
          Save Product Configuration
        </AdminButton>
      </div>
    </form>
  );
}
