import React, { useState, useEffect } from 'react';
import AdminButton from '../common/AdminButton';
import { Tag, FileText } from 'lucide-react';

export default function CategoryForm({ category, onSubmit, isSaving }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
    }
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  const previewSlug = (formData.name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs text-slate-300">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
          Category Title *
        </label>
        <div className="relative">
          <input
            type="text"
            required
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white font-bold focus:border-indigo-500 focus:outline-none transition-colors text-xs"
            placeholder="e.g. Matte Privacy Glass, UV Armor..."
          />
        </div>
        {previewSlug && (
          <div className="mt-2 p-2.5 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-semibold">Generated Slug:</span>
            <span className="font-mono text-indigo-400 font-bold">{previewSlug}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
          Description (Optional)
        </label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors resize-none text-xs"
          placeholder="Detailed notes regarding this product category line..."
        />
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-800">
        <AdminButton type="submit" isLoading={isSaving} className="px-6 py-2.5">
          {category?.id ? 'Update Category' : 'Create Category'}
        </AdminButton>
      </div>
    </form>
  );
}
