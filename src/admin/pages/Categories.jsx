import React, { useEffect, useState } from 'react';
import { RefreshCw, Plus, Trash2, FolderTree, Tag, Layers, Shield } from 'lucide-react';
import AdminTable from '../components/common/AdminTable';
import AdminModal from '../components/common/AdminModal';
import CategoryForm from '../components/categories/CategoryForm';
import { fetchCategories, addCategory, deleteCategory, DEFAULT_CATEGORIES } from '../../utils/categoryStore';

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();

    const handleUpdate = () => loadCategories();
    window.addEventListener('categories_updated', handleUpdate);
    return () => window.removeEventListener('categories_updated', handleUpdate);
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const items = await fetchCategories();
      setCategories(items || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (formData) => {
    setLoading(true);
    try {
      await addCategory(formData);
      setModalOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert(`Failed to save category: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    try {
      await deleteCategory(catId);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(`Failed to delete category: ${err.message}`);
    }
  };

  const headers = ['Category Slug', 'Category Title', 'Description', 'Classification', 'Action'];

  return (
    <div className="space-y-6 text-left">
      {/* Control Box Header */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md">
              <FolderTree className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Category Directory
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Organize catalog classifications and homepage filter navigation ({categories.length} total)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => {
              setEditingCategory({ name: '', description: '' });
              setModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/25 ring-1 ring-white/10 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>

          <button
            onClick={loadCategories}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-wider">
            No categories defined
          </div>
        ) : (
          categories.map((cat) => {
            const isSystemDefault = DEFAULT_CATEGORIES.some(d => d.id === cat.id);

            return (
              <div
                key={cat.id}
                className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2 font-mono text-xs font-black text-indigo-400">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{cat.id}</span>
                  </div>

                  {isSystemDefault ? (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-black uppercase">
                      System
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase">
                      Custom
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{cat.description || 'No description provided.'}</p>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-bold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block">
        <AdminTable headers={headers} isLoading={loading} emptyMessage="No categories created yet">
          {categories.map((cat) => {
            const isSystemDefault = DEFAULT_CATEGORIES.some(d => d.id === cat.id);
            return (
              <tr key={cat.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-4 sm:px-5 py-4 font-mono text-xs font-black text-indigo-400 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 bg-[#090D16] px-2.5 py-1 rounded-xl border border-slate-800">
                    <Tag className="h-3 w-3 text-slate-500" />
                    {cat.id}
                  </span>
                </td>

                <td className="px-4 sm:px-5 py-4 font-black text-white whitespace-nowrap text-xs">
                  {cat.name}
                </td>

                <td className="px-4 sm:px-5 py-4 text-xs text-slate-400 max-w-[200px] lg:max-w-xs truncate">
                  {cat.description || '—'}
                </td>

                <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                  {isSystemDefault ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 text-[9px] font-black uppercase tracking-wider">
                      System Default
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider">
                      Custom Admin
                    </span>
                  )}
                </td>

                <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-200 transition-all cursor-pointer shadow-sm"
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </div>

      {/* Category Editor Modal */}
      {editingCategory && (
        <AdminModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingCategory(null);
          }}
          title={editingCategory.id ? "Edit Category" : "Add New Category"}
          maxWidth="max-w-md"
        >
          <CategoryForm
            category={editingCategory}
            onSubmit={handleCategorySubmit}
            isSaving={loading}
          />
        </AdminModal>
      )}
    </div>
  );
}
