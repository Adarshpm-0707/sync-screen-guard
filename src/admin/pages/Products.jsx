import React, { useEffect, useState } from 'react';
import { RefreshCw, Edit, Trash2, Plus, Box } from 'lucide-react';
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
      } else {
        console.error('Stock update error:', error);
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
      let savedProduct = null;

      if (isNew) {
        const newObj = {
          name: formData.name,
          price: Number(formData.price),
          original_price: formData.original_price ? Number(formData.original_price) : null,
          description: formData.description || '',
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
          console.error('Supabase insert error:', dbErr);
          throw new Error(dbErr.message);
        }
        savedProduct = dbData;
      } else {
        const { data: dbData, error: dbErr } = await supabase
          .from('products')
          .update({
            name: formData.name,
            category: formData.category || 'glass',
            price: Number(formData.price),
            original_price: formData.original_price ? Number(formData.original_price) : null,
            description: formData.description || '',
            images: formData.images || [],
            stock: Number(formData.stock),
            theme_color: formData.theme_color || '#3b82f6',
            is_best_seller: Boolean(formData.is_best_seller),
            show_on_home: Boolean(formData.show_on_home),
          })
          .eq('id', editingProduct.id)
          .select()
          .single();

        if (dbErr) {
          console.error('Supabase update error:', dbErr);
          throw new Error(dbErr.message);
        }
        savedProduct = dbData || { ...editingProduct, ...formData };
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
    if (!window.confirm(`Are you sure you want to delete "${productName}" permanently from the catalog?`)) {
      return;
    }

    const deletedIds = JSON.parse(localStorage.getItem('deleted_product_ids') || '[]');
    if (!deletedIds.includes(productId)) {
      deletedIds.push(productId);
      localStorage.setItem('deleted_product_ids', JSON.stringify(deletedIds));
    }
    
    const localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
    localStorage.setItem('local_added_products', JSON.stringify(localAdded.filter((p) => p.id !== productId)));

    window.dispatchEvent(new Event('products_updated'));
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      try {
        await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {}

      await supabase.from('products').delete().eq('id', productId);
    } catch (err) {
      console.error('Error deleting product from database:', err);
    }
  };

  const headers = ['Image', 'Product Name', 'Category', 'Status / Tag', 'Home Display', 'Price', 'Original Price', 'Stock Level', 'Quick Inventory Editor', 'Action'];

  return (
    <div className="space-y-6 text-left">
      {/* Rectangular Control Panel Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 shadow-md">
              <Box className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              Products Catalog
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 sm:ml-11">
            Maintain screen guards, pricing & catalog visibility
          </p>
        </div>

        {/* All action buttons in one rectangular box */}
        <div className="flex flex-wrap items-center gap-2.5 p-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl self-start md:self-center">
          <button
            onClick={() => {
              setEditingProduct({ name: '', category: 'glass', price: '', original_price: '', description: '', images: [], stock: 0, is_best_seller: false, show_on_home: true });
              setModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-xs font-bold text-white uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
          
          <button
            onClick={fetchProducts}
            className="flex items-center space-x-2 px-3.5 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <AdminTable headers={headers} isLoading={loading} emptyMessage="No products listed in catalog">
        {products.map((product) => (
          <tr key={product.id} className="hover:bg-slate-800/25 transition-all duration-200">
            <td className="px-5 py-4 whitespace-nowrap">
              <div className="h-10 w-10 shrink-0 bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-1 shadow-inner">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'} 
                  alt={product.name} 
                  className="max-h-full object-contain rounded-md"
                />
              </div>
            </td>
            <td className="px-5 py-4 font-extrabold text-white max-w-[200px] sm:max-w-xs truncate text-xs">
              {product.name}
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-black uppercase tracking-wider">
                {product.category || 'glass'}
              </span>
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
              {product.is_best_seller ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  🔥 Best Seller
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                  Standard
                </span>
              )}
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
              <button
                onClick={() => handleToggleHome(product)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  product.show_on_home !== false
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30'
                    : 'bg-slate-800/60 text-slate-500 border-slate-700 hover:text-slate-300'
                }`}
                title="Toggle whether this product appears on the Home page"
              >
                <span>{product.show_on_home !== false ? '🏠 On Home' : '🚫 Hidden'}</span>
              </button>
            </td>
            <td className="px-5 py-4 font-black text-white text-xs whitespace-nowrap">
              ₹{product.price}
            </td>
            <td className="px-5 py-4 text-slate-500 line-through text-xs font-semibold whitespace-nowrap">
              ₹{product.original_price || '—'}
            </td>
            <td className="px-5 py-4 font-extrabold text-slate-300 whitespace-nowrap">
              {product.stock} units
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
              <StockEditor 
                initialStock={product.stock} 
                onSave={(stockVal) => handleStockSave(product.id, stockVal)}
                isSaving={updatingStockId === product.id}
              />
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-white transition-all duration-200 cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-95"
                  title="Edit Product Configuration"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 transition-all duration-200 cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-95"
                  title="Delete Product Permanently"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Product Editor Modal */}
      {editingProduct && (
        <AdminModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          title={editingProduct.id ? "Edit Product Details" : "Add New Product"}
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
