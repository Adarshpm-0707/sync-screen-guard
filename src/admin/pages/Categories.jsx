import React, { useEffect, useState } from 'react';
import { RefreshCw, Plus, Trash2, FolderTree, Tag } from 'lucide-react';
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
    // Prevent deletion of basic system defaults if needed, or ask confirmation
    const isDefault = DEFAULT_CATEGORIES.some(c => c.id === catId);
    
    if (!window.confirm(`Are you sure you want to delete the category "${catName}"?`)) {
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

  const headers = ['Category ID / Slug', 'Category Name', 'Description', 'Type', 'Action'];

  return (
    <div className="space-y-6 text-left">
      {/* Rectangular Control Panel Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 shadow-md">
              <FolderTree className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              Category Management
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 sm:ml-11">
            Define categories to organize products and power catalog filter options
          </p>
        </div>

        {/* All buttons in one rectangular action box */}
        <div className="flex flex-wrap items-center gap-2.5 p-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl self-start md:self-center">
          <button
            onClick={() => {
              setEditingCategory({ name: '', description: '' });
              setModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-xs font-bold text-white uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>

          <button
            onClick={loadCategories}
            className="flex items-center space-x-2 px-3.5 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <AdminTable headers={headers} isLoading={loading} emptyMessage="No categories created yet">
        {categories.map((cat) => {
          const isSystemDefault = DEFAULT_CATEGORIES.some(d => d.id === cat.id);
          return (
            <tr key={cat.id} className="hover:bg-slate-800/10 transition-colors">
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-mono text-xs font-bold text-primary-400 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Tag className="h-3 w-3 text-slate-400" />
                  {cat.id}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-white whitespace-nowrap">
                {cat.name}
              </td>
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs text-slate-400 max-w-[200px] sm:max-w-xs truncate">
                {cat.description || '—'}
              </td>
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                {isSystemDefault ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-extrabold uppercase tracking-wider">
                    System Default
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold uppercase tracking-wider">
                    Custom Admin
                  </span>
                )}
              </td>
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap sticky right-0 bg-slate-900/95 backdrop-blur-md border-l border-slate-800/80 z-10 shadow-xl">
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm"
                  title="Delete Category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* Category Editor Modal */}
      {editingCategory && (
        <AdminModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingCategory(null);
          }}
          title={editingCategory.id ? "Edit Category" : "Add New Category"}
          maxWidth="max-w-lg"
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
