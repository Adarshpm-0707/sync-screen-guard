import React, { useState, useEffect } from 'react';
import AdminButton from '../common/AdminButton';

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
    <form onSubmit={handleSubmit} className="space-y-5 text-left text-xs text-slate-350">
      <div>
        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
          Category Name *
        </label>
        <input
          type="text"
          required
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
          placeholder="e.g. UV Tempered Glass, Camera Protector..."
        />
        {previewSlug && (
          <p className="text-[10px] text-slate-500 font-mono mt-1.5">
            System ID Slug: <span className="text-primary-400 font-bold">{previewSlug}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
          Description (Optional)
        </label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-white focus:border-primary-500 focus:outline-none transition-colors resize-none"
          placeholder="Brief description of products under this category..."
        />
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-800">
        <AdminButton type="submit" isLoading={isSaving}>
          {category?.id ? 'Update Category' : 'Create Category'}
        </AdminButton>
      </div>
    </form>
  );
}
