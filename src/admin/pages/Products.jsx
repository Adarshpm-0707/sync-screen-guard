import React, { useEffect, useState } from 'react';
import { RefreshCw, Edit, Trash2 } from 'lucide-react';
import AdminTable from '../components/common/AdminTable';
import StockEditor from '../components/products/StockEditor';
import ProductForm from '../components/products/ProductForm';
import AdminModal from '../components/common/AdminModal';
import { supabase } from '../../supabaseClient';

const DEFAULT_PRODUCTS = [
  {
    id: "sync-screenguard-ez-fit",
    name: "Sync EZ Fit Glass Screenguard",
    price: 640,
    original_price: 999,
    description: "Applying glass guards manually is tedious. Sync EZ Fit tray positions and seals the screen protector automatically. Flawless application in seconds.",
    stock: 120,
    images: ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600"],
    theme_color: "#3b82f6",
  },
  {
    id: "sync-matte-privacy-ez-fit",
    name: "Sync Matte Privacy Glass",
    price: 799,
    original_price: 1299,
    description: "Ultimate screen confidentiality meets smooth matte finish. Keep your sensitive data safe from prying eyes with a 28° privacy angle and anti-glare coating.",
    stock: 85,
    images: ["https://images.unsplash.com/photo-1581090464711-c30ec09b2e2d?auto=format&fit=crop&q=80&w=600"],
    theme_color: "#f97316",
  },
  {
    id: "sync-diamond-sparkle-ez-fit",
    name: "Sync Diamond Sparkle Guard",
    price: 890,
    original_price: 1499,
    description: "Add a brilliant diamond-like shimmer to your display under light, while maintaining 9H scratch resistance and absolute bubble-free installation.",
    stock: 65,
    images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=600"],
    theme_color: "#a855f7",
  }
];

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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      let fetched = [];
      try {
        const res = await fetch('http://localhost:5000/api/admin/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          fetched = await res.json();
        }
      } catch (apiErr) {
        console.warn('API getProducts failed, falling back to direct Supabase fetch:', apiErr);
      }

      // Fetch from Supabase directly as well
      const { data: dbProducts } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      const localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
      const combined = [
        ...localAdded,
        ...(Array.isArray(fetched) ? fetched : []),
        ...(dbProducts || []),
        ...DEFAULT_PRODUCTS
      ];
      
      // Deduplicate by ID
      const map = new Map();
      combined.forEach(p => {
        if (p && p.id && !map.has(p.id)) {
          map.set(p.id, p);
        }
      });

      const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
      const finalProducts = Array.from(map.values()).filter(p => !deletedIds.has(p.id));

      setProducts(finalProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSave = async (productId, newStock) => {
    setUpdatingStockId(productId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`http://localhost:5000/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      console.error('Error saving product stock:', err);
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleProductSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const isNew = !editingProduct?.id;
      let savedProduct = null;

      // 1. Try REST server API
      try {
        const url = isNew 
          ? 'http://localhost:5000/api/admin/products'
          : `http://localhost:5000/api/admin/products/${editingProduct.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          savedProduct = await res.json();
        }
      } catch (apiErr) {
        console.warn('API save product failed, saving directly via Supabase:', apiErr);
      }

      // 2. Direct Supabase insert / update fallback
      if (!savedProduct) {
        if (isNew) {
          const newId = 'prod-' + Date.now();
          const newObj = {
            id: newId,
            name: formData.name,
            price: formData.price,
            original_price: formData.original_price,
            description: formData.description,
            images: formData.images && formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=600'],
            stock: formData.stock,
            theme_color: formData.theme_color || '#3b82f6',
            created_at: new Date().toISOString()
          };

          const { data: dbData, error: dbErr } = await supabase
            .from('products')
            .insert(newObj)
            .select()
            .single();

          savedProduct = (!dbErr && dbData) ? dbData : newObj;
        } else {
          const { data: dbData } = await supabase
            .from('products')
            .update({
              name: formData.name,
              price: formData.price,
              original_price: formData.original_price,
              description: formData.description,
              images: formData.images,
              stock: formData.stock,
              theme_color: formData.theme_color
            })
            .eq('id', editingProduct.id)
            .select()
            .single();

          savedProduct = dbData || { ...editingProduct, ...formData };
        }
      }

      if (savedProduct) {
        if (isNew) {
          // Store locally for immediate catalog display
          const localAdded = JSON.parse(localStorage.getItem('local_added_products') || '[]');
          localStorage.setItem('local_added_products', JSON.stringify([savedProduct, ...localAdded]));
          setProducts((prev) => [savedProduct, ...prev]);
        } else {
          setProducts((prev) => prev.map((p) => p.id === savedProduct.id ? savedProduct : p));
        }
      }

      setModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error('Error saving product details:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" permanently from the catalog?`)) {
      return;
    }

    // Persist deletion ID locally for permanent store suppression
    const deletedIds = JSON.parse(localStorage.getItem('deleted_product_ids') || '[]');
    if (!deletedIds.includes(productId)) {
      deletedIds.push(productId);
      localStorage.setItem('deleted_product_ids', JSON.stringify(deletedIds));
    }

    // Optimistically update UI instantly on click
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      try {
        await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (e) {
        console.warn('API deleteProduct failed, deleting via Supabase direct:', e);
      }

      // Delete from Supabase database permanently
      await supabase.from('products').delete().eq('id', productId);
    } catch (err) {
      console.error('Error deleting product from database:', err);
    }
  };

  const headers = ['Image', 'Product Name', 'Price', 'Original Price', 'Stock Level', 'Quick Inventory Editor', 'Action'];

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Products Catalog</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Maintain screen guards and inventory levels</p>
        </div>
        <div className="flex items-center space-x-3.5 self-start">
          <button
            onClick={() => {
              setEditingProduct({ name: '', price: '', original_price: '', description: '', images: [], stock: 0 });
              setModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            Add Product
          </button>
          <button
            onClick={fetchProducts}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Details</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <AdminTable headers={headers} isLoading={loading} emptyMessage="No products listed in catalog">
        {products.map((product) => (
          <tr key={product.id} className="hover:bg-slate-800/10 transition-colors">
            <td className="px-6 py-4">
              <div className="h-10 w-10 shrink-0 bg-slate-950/40 border border-slate-800/60 rounded-lg overflow-hidden flex items-center justify-center p-1">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'} 
                  alt={product.name} 
                  className="max-h-full object-contain rounded-md"
                />
              </div>
            </td>
            <td className="px-6 py-4 font-bold text-white max-w-xs truncate">
              {product.name}
            </td>
            <td className="px-6 py-4 font-extrabold text-white">
              ₹{product.price}
            </td>
            <td className="px-6 py-4 text-slate-500 line-through">
              ₹{product.original_price || '—'}
            </td>
            <td className="px-6 py-4 font-semibold text-slate-450">
              {product.stock} units
            </td>
            <td className="px-6 py-4">
              <StockEditor 
                initialStock={product.stock} 
                onSave={(stockVal) => handleStockSave(product.id, stockVal)}
                isSaving={updatingStockId === product.id}
              />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setModalOpen(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/20 text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                  title="Delete Product"
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
