import React, { useEffect, useState, useMemo } from 'react';
import { 
  RefreshCw, 
  Edit, 
  Trash2, 
  Plus, 
  Box, 
  Search, 
  Eye, 
  EyeOff, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import AdminTable from '../components/common/AdminTable';
import StockEditor from '../components/products/StockEditor';
import ProductForm from '../components/products/ProductForm';
import AdminModal from '../components/common/AdminModal';
import { supabase } from '../../supabaseClient';
import { fetchStoreProducts } from '../../utils/productStore';

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStockId, setUpdatingStockId] = useState(null);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const items = await fetchStoreProducts();
      setProducts(items || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSave = async (productId, newStock) => {
    setUpdatingStockId(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (!error) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      }
    } catch (err) {
      console.error('Error saving product stock:', err);
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleToggleHome = async (product) => {
    const newVal = product.show_on_home === false ? true : false;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, show_on_home: newVal } : p));
    try {
      await supabase
        .from('products')
        .update({ show_on_home: newVal })
        .eq('id', product.id);
      
      const localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
      const idx = localAdded.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        localAdded[idx].show_on_home = newVal;
        localStorage.setItem('local_added_products', JSON.stringify(localAdded));
      }
      window.dispatchEvent(new Event('products_updated'));
    } catch (e) {
      console.error('Toggle show_on_home error:', e);
    }
  };

  const handleProductSubmit = async (formData) => {
    setLoading(true);
    try {
      const isNew = !editingProduct?.id;

      if (isNew) {
        const newObj = {
          name: formData.name,
          price: Number(formData.price),
          original_price: formData.original_price ? Number(formData.original_price) : null,
          purchasing_price: formData.purchasing_price ? Number(formData.purchasing_price) : null,
          description: formData.description || '',
          specifications: formData.specifications || '',
          installation_guide: formData.installation_guide || '',
          box_contents: formData.box_contents || '',
          images: formData.images && formData.images.length > 0 ? formData.images : [],
          stock: Number(formData.stock),
          theme_color: formData.theme_color || '#3b82f6',
          category: formData.category || 'glass',
          is_best_seller: Boolean(formData.is_best_seller),
          show_on_home: Boolean(formData.show_on_home),
        };

        const { data: dbData, error: dbErr } = await supabase
          .from('products')
          .insert(newObj)
          .select()
          .single();

        if (dbErr) {
          console.warn('Supabase insert warning, falling back to local store:', dbErr);
          const localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
          const localItem = {
            ...newObj,
            id: `prod_${Date.now()}`,
            created_at: new Date().toISOString()
          };
          localAdded.unshift(localItem);
          localStorage.setItem('local_added_products', JSON.stringify(localAdded));
        }
      } else {
        const updatePayload = {
          name: formData.name,
          category: formData.category || 'glass',
          price: Number(formData.price),
          original_price: formData.original_price ? Number(formData.original_price) : null,
          purchasing_price: formData.purchasing_price ? Number(formData.purchasing_price) : null,
          description: formData.description || '',
          specifications: formData.specifications || '',
          installation_guide: formData.installation_guide || '',
          box_contents: formData.box_contents || '',
          images: formData.images || [],
          stock: Number(formData.stock),
          theme_color: formData.theme_color || '#3b82f6',
          is_best_seller: Boolean(formData.is_best_seller),
          show_on_home: Boolean(formData.show_on_home),
        };

        const { error: dbErr } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', editingProduct.id);

        if (dbErr) {
          console.warn('Supabase update warning, syncing locally:', dbErr);
        }

        // Also update locally cached products if present
        const localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
        const idx = localAdded.findIndex(p => p.id === editingProduct.id);
        if (idx >= 0) {
          localAdded[idx] = { ...localAdded[idx], ...updatePayload };
          localStorage.setItem('local_added_products', JSON.stringify(localAdded));
        }
      }

      window.dispatchEvent(new Event('products_updated'));
      setModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error('Error saving product details:', err);
      alert(`Failed to save product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productName}"?`)) {
      return;
    }

    const deletedIds = JSON.parse(localStorage.getItem('deleted_product_ids') || '[]');
    if (!deletedIds.includes(productId)) {
      deletedIds.push(productId);
      localStorage.setItem('deleted_product_ids', JSON.stringify(deletedIds));
    }
    
    const localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
    localStorage.setItem('local_added_products', JSON.stringify(localAdded.filter((p) => p.id !== productId)));

    try {
      const cached = JSON.parse(localStorage.getItem('sync_store_products_cache') || '[]');
      localStorage.setItem('sync_store_products_cache', JSON.stringify(cached.filter((p) => p && p.id !== productId)));
    } catch (e) {}

    window.dispatchEvent(new Event('products_updated'));
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && (p.category || 'glass') !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category || 'glass'));
    return Array.from(set);
  }, [products]);

  const headers = ['Image', 'Product Name', 'Category', 'Badges', 'Home Display', 'Sale Price', 'Cost Price 🔒', 'Stock Level', 'Quick Adjuster', 'Actions'];

  return (
    <div className="space-y-6 text-left">
      {/* Control Box Header */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md">
              <Box className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Products Catalog
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Maintain screenguards, home catalog visibility, and secret margins ({products.length} products total)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => {
              setEditingProduct({ 
                name: '', 
                category: 'glass', 
                price: '', 
                original_price: '', 
                purchasing_price: '', 
                description: '', 
                specifications: null, 
                installation_guide: null, 
                box_contents: null, 
                images: [], 
                stock: 100, 
                is_best_seller: false, 
                show_on_home: true 
              });
              setModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/25 ring-1 ring-white/10 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
          
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090D16]/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-[#090D16]/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer capitalize"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize bg-[#0E1322]">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-wider">
            No products match search criteria
          </div>
        ) : (
          filteredProducts.map((product) => {
            const costPrice = Number(product.purchasing_price || 0);
            const salePrice = Number(product.price || 0);

            return (
              <div
                key={product.id}
                className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 space-y-3.5 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'} 
                      alt={product.name} 
                      className="max-h-full object-contain rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase">
                        {product.category || 'glass'}
                      </span>
                      {product.is_best_seller && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                          🔥 Best Seller
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-800/80 py-2.5">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Selling Price</span>
                    <span className="font-black text-white text-sm">₹{salePrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Stock Available</span>
                    <span className="font-black text-slate-200 text-sm">{product.stock} units</span>
                  </div>
                </div>

                {/* Quick Toggle Home & Quick Stock Editor */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => handleToggleHome(product)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                      product.show_on_home !== false
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {product.show_on_home !== false ? '🏠 On Home' : '🚫 Hidden'}
                  </button>

                  <StockEditor
                    initialStock={product.stock}
                    onSave={(stockVal) => handleStockSave(product.id, stockVal)}
                    isSaving={updatingStockId === product.id}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-black uppercase tracking-wider"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block">
        <AdminTable headers={headers} isLoading={loading} emptyMessage="No products listed in catalog">
          {filteredProducts.map((product) => {
            const costPrice = Number(product.purchasing_price || 0);
            const salePrice = Number(product.price || 0);

            return (
              <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="h-11 w-11 shrink-0 bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-1 shadow-inner">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'} 
                      alt={product.name} 
                      className="max-h-full object-contain rounded-lg"
                    />
                  </div>
                </td>

                <td className="px-4 py-3.5 font-black text-white max-w-[180px] lg:max-w-xs truncate text-xs">
                  {product.name}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider capitalize">
                    {product.category || 'glass'}
                  </span>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  {product.is_best_seller ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                      🔥 Best Seller
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Standard
                    </span>
                  )}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleHome(product)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      product.show_on_home !== false
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30'
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                    title="Toggle whether this product appears on the Home page"
                  >
                    <span>{product.show_on_home !== false ? '🏠 On Home' : '🚫 Hidden'}</span>
                  </button>
                </td>

                <td className="px-4 py-3.5 font-black text-white text-xs whitespace-nowrap">
                  ₹{salePrice.toLocaleString()}
                </td>

                {/* Purchasing / Cost Price - Admin Only */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {costPrice > 0 ? (
                    <div className="flex flex-col">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-black">
                        ₹{costPrice.toLocaleString()}
                      </span>
                      {salePrice > 0 && (
                        <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                          salePrice - costPrice >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {salePrice - costPrice >= 0 ? '+' : ''}₹{(salePrice - costPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-600 text-[10px] font-semibold">— not set</span>
                  )}
                </td>

                <td className="px-4 py-3.5 font-black text-slate-200 text-xs whitespace-nowrap">
                  {product.stock} units
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StockEditor 
                    initialStock={product.stock} 
                    onSave={(stockVal) => handleStockSave(product.id, stockVal)}
                    isSaving={updatingStockId === product.id}
                  />
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 hover:text-white transition-all cursor-pointer"
                      title="Edit Product Details"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-200 transition-all cursor-pointer"
                      title="Delete Product Permanently"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </div>

      {/* Product Editor Modal */}
      {editingProduct && (
        <AdminModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          title={editingProduct.id ? "Edit Product Details" : "Add New Catalog Product"}
          maxWidth="max-w-2xl"
        >
          <ProductForm
            product={editingProduct}
            onSubmit={handleProductSubmit}
            isSaving={loading}
          />
        </AdminModal>
      )}
    </div>
  );
}
