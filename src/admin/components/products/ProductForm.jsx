import React, { useState, useEffect } from 'react';
import ProductImageUpload from './ProductImageUpload';
import AdminButton from '../common/AdminButton';
import { fetchCategories } from '../../../utils/categoryStore';
import { 
  DEFAULT_SPECIFICATIONS, 
  DEFAULT_INSTALLATION_GUIDE, 
  DEFAULT_BOX_CONTENTS 
} from '../../../utils/productStore';
import { Sparkles, DollarSign, Home, Tag, Image, Palette, Lock, Layers } from 'lucide-react';

const PRESET_COLORS = [
  { label: 'Sky Blue', hex: '#3b82f6' },
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Purple', hex: '#a855f7' },
  { label: 'Rose', hex: '#f43f5e' },
  { label: 'Orange', hex: '#f97316' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Teal', hex: '#14b8a6' },
  { label: 'Slate', hex: '#64748b' },
];

export default function ProductForm({ product, onSubmit, isSaving }) {
  const [categoriesList, setCategoriesList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'glass',
    price: '',
    original_price: '',
    purchasing_price: '',
    description: '',
    specifications: DEFAULT_SPECIFICATIONS,
    installation_guide: DEFAULT_INSTALLATION_GUIDE,
    box_contents: DEFAULT_BOX_CONTENTS,
    images: [],
    stock: 100,
    theme_color: '#3b82f6',
    is_best_seller: false,
    show_on_home: true,
  });

  useEffect(() => {
    async function loadCats() {
      const list = await fetchCategories();
      setCategoriesList(list || []);
      if (!product && list && list.length > 0) {
        setFormData(prev => ({
          ...prev,
          category: prev.category === 'glass' ? list[0].id : prev.category
        }));
      }
    }
    loadCats();
  }, [product]);

  useEffect(() => {
    if (product) {
      const normalizeColor = (c) => {
        const nameToHex = { blue: '#3b82f6', orange: '#f97316', pink: '#f43f5e', green: '#10b981', purple: '#a855f7' };
        if (c && c.startsWith('#')) return c;
        return nameToHex[c] || '#3b82f6';
      };
      setFormData({
        name: product.name || '',
        category: product.category || (categoriesList[0]?.id || 'glass'),
        price: product.price || '',
        original_price: product.original_price || '',
        purchasing_price: product.purchasing_price || '',
        description: product.description || '',
        specifications: product.specifications !== undefined && product.specifications !== null ? product.specifications : DEFAULT_SPECIFICATIONS,
        installation_guide: product.installation_guide !== undefined && product.installation_guide !== null ? product.installation_guide : DEFAULT_INSTALLATION_GUIDE,
        box_contents: product.box_contents !== undefined && product.box_contents !== null ? product.box_contents : DEFAULT_BOX_CONTENTS,
        images: product.images || [],
        stock: product.stock !== undefined ? product.stock : 100,
        theme_color: normalizeColor(product.theme_color),
        is_best_seller: Boolean(product.is_best_seller),
        show_on_home: product.show_on_home !== false,
      });
    }
  }, [product, categoriesList]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLoadDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: DEFAULT_SPECIFICATIONS,
      installation_guide: DEFAULT_INSTALLATION_GUIDE,
      box_contents: DEFAULT_BOX_CONTENTS,
    }));
  };

  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      category: formData.category || 'glass',
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      purchasing_price: formData.purchasing_price ? parseFloat(formData.purchasing_price) : null,
      stock: parseInt(formData.stock, 10),
      is_best_seller: Boolean(formData.is_best_seller),
      show_on_home: Boolean(formData.show_on_home),
      description: formData.description || '',
      specifications: formData.specifications || '',
      installation_guide: formData.installation_guide || '',
      box_contents: formData.box_contents || '',
    });
  };

  const costMargin = Number(formData.price || 0) - Number(formData.purchasing_price || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left text-xs text-slate-300">
      {/* 1. Basic Info Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Tag className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white">General Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors font-bold text-xs"
              placeholder="e.g. Sync Diamond Shield Glass"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer font-bold capitalize text-xs"
            >
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#0E1322] text-white capitalize">
                  {cat.name} ({cat.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Pricing & Stock Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white">Pricing & Inventory</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Selling Price (₹) *
            </label>
            <input
              type="number"
              required
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white font-bold focus:border-indigo-500 focus:outline-none transition-colors text-xs"
              placeholder="499"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Original / MRP (₹)
            </label>
            <input
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-slate-300 focus:border-indigo-500 focus:outline-none transition-colors text-xs"
              placeholder="999"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Initial Stock Count *
            </label>
            <input
              type="number"
              required
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white font-bold focus:border-indigo-500 focus:outline-none transition-colors text-xs"
              placeholder="100"
            />
          </div>
        </div>

        {/* Admin Confidential Cost Price */}
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-violet-300">
                Cost / Procurement Price (₹)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[8px] font-black uppercase tracking-widest border border-violet-500/30">
              Admin Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <input
              type="number"
              name="purchasing_price"
              value={formData.purchasing_price}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-violet-500/30 bg-[#090D16]/90 p-2.5 text-white focus:border-violet-500 focus:outline-none font-mono text-xs"
              placeholder="Your unit procurement cost (e.g. 180)"
              min="0"
            />

            {Number(formData.purchasing_price) > 0 && Number(formData.price) > 0 && (
              <div className="text-[11px] font-bold">
                Profit Margin:{' '}
                <span className={costMargin >= 0 ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'}>
                  {costMargin >= 0 ? '+' : ''}₹{costMargin.toLocaleString()} per unit
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Flags & Homepage Display */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Home className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white">Storefront Display Options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Show on Home */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 cursor-pointer select-none">
            <input
              type="checkbox"
              name="show_on_home"
              checked={formData.show_on_home}
              onChange={handleInputChange}
              className="mt-0.5 w-4 h-4 rounded border-sky-500 text-sky-500 accent-sky-500 cursor-pointer"
            />
            <div>
              <span className="block font-black text-sky-300 uppercase tracking-wider text-xs">
                🏠 Display on Homepage
              </span>
              <span className="block text-[10px] text-sky-200/70 font-semibold mt-0.5">
                Shows in the featured homepage catalog section.
              </span>
            </div>
          </label>

          {/* Best Seller */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_best_seller"
              checked={formData.is_best_seller}
              onChange={handleInputChange}
              className="mt-0.5 w-4 h-4 rounded border-amber-500 text-amber-500 accent-amber-500 cursor-pointer"
            />
            <div>
              <span className="block font-black text-amber-300 uppercase tracking-wider text-xs">
                🔥 Best Seller Badge
              </span>
              <span className="block text-[10px] text-amber-200/70 font-semibold mt-0.5">
                Highlights product with an animated "Best Seller" chip.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 4. Product Details Page Content (4 Storefront Accordions) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Product Details Page (4 Storefront Accordions)
            </span>
          </div>
          <button
            type="button"
            onClick={handleLoadDefaults}
            className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            title="Populate standard tempered glass specifications, steps, and box contents"
          >
            ↺ Load Standard Templates
          </button>
        </div>

        {/* Accordion 1: Overview & Highlights */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              1. Overview & Key Highlights (Product Description)
            </label>
            <span className="text-[9px] text-slate-500 font-semibold">Summary & Accordion 1</span>
          </div>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none text-xs leading-relaxed"
            placeholder="e.g. Flagship 9H tempered glass featuring revolutionary auto-alignment box applicator. Dust-free, bubble-free 10-second installation..."
          />
        </div>

        {/* Accordion 2: Product Specifications */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              2. Product Specifications (1 line per spec item)
            </label>
            <span className="text-[9px] text-slate-500 font-semibold">Format: Label: Value</span>
          </div>
          <textarea
            name="specifications"
            rows="5"
            value={formData.specifications}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none text-xs font-mono leading-relaxed"
            placeholder={`Material: High-Aluminosilicate 9H Double Tempered Glass\nThickness: 0.33mm ultra-slim responsive glass\nCoating: Double electroplated oleophobic oil-repellent layer\nClarity: 99.9% optical transparency\nAdhesive: Optical grade nano-silicone`}
          />
        </div>

        {/* Accordion 3: 10-Second Installation Guide */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              3. 10-Second Installation Guide (1 line per step)
            </label>
            <span className="text-[9px] text-slate-500 font-semibold">Auto-numbered in storefront</span>
          </div>
          <textarea
            name="installation_guide"
            rows="4"
            value={formData.installation_guide}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none text-xs leading-relaxed"
            placeholder={`1. Wipe screen with the included wet alcohol wipe and microfiber cloth.\n2. Place the Sync auto-alignment box directly over your phone.\n3. Pull the arrowed dust-extraction tab until removed.\n4. Slide finger across center arrow for 5 seconds and lift off box!`}
          />
        </div>

        {/* Accordion 4: What's In The Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              4. What's In The Box (1 line per included item)
            </label>
            <span className="text-[9px] text-slate-500 font-semibold">Bullet items</span>
          </div>
          <textarea
            name="box_contents"
            rows="4"
            value={formData.box_contents}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none text-xs leading-relaxed"
            placeholder={`• 1x 9H Tempered Glass inside Auto-Alignment Box\n• 1x Wet Alcohol Prep Wipe\n• 1x Microfiber Polishing Cloth\n• 1x Dust Absorber Sticker & Guide Tabs\n• 1x Squeegee Card`}
          />
        </div>
      </div>

      {/* 5. Theme Color Picker */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Palette className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white">Homepage Theme Accent</span>
        </div>

        <div className="bg-[#090D16]/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl shadow-lg border-2 border-white/20 shrink-0"
              style={{ backgroundColor: formData.theme_color }}
            />
            <div className="flex items-center gap-2 flex-1">
              <input
                type="color"
                name="theme_color"
                value={formData.theme_color}
                onChange={handleInputChange}
                className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                name="theme_color"
                value={formData.theme_color}
                onChange={handleInputChange}
                placeholder="#3b82f6"
                maxLength={7}
                className="w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                title={preset.label}
                onClick={() => setFormData((prev) => ({ ...prev, theme_color: preset.hex }))}
                className="w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110 cursor-pointer"
                style={{
                  backgroundColor: preset.hex,
                  borderColor: formData.theme_color === preset.hex ? 'white' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Product Images Upload */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <Image className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white">Product Photography</span>
        </div>

        <ProductImageUpload 
          images={formData.images} 
          onImagesChange={handleImagesChange} 
        />
      </div>

      {/* Form Submission CTA */}
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <AdminButton type="submit" isLoading={isSaving} className="px-6 py-3">
          Save Product Configuration
        </AdminButton>
      </div>
    </form>
  );
}
