import React, { useEffect, useState, useMemo } from 'react';
import { 
  Warehouse, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  Download, 
  Plus, 
  Minus, 
  Check, 
  Search, 
  Filter, 
  Package, 
  Boxes,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import AdminTable from '../components/common/AdminTable';
import AdminModal from '../components/common/AdminModal';
import StatCard from '../components/dashboard/StatCard';
import { supabase } from '../../supabaseClient';

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'low' | 'out' | 'in'
  const [sortBy, setSortBy] = useState('stock_asc'); // 'stock_asc' | 'stock_desc' | 'price_desc' | 'name_asc'
  
  // Stock Adjustment State
  const [updatingStockId, setUpdatingStockId] = useState(null);
  const [localStockEdits, setLocalStockEdits] = useState({}); // { [productId]: number }

  // Quick Restock Modal State
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [restockMode, setRestockMode] = useState('add'); // 'add' | 'set'
  const [isRestocking, setIsRestocking] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProducts();

    const handleProductsUpdated = () => {
      fetchProducts();
    };

    window.addEventListener('products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('products_updated', handleProductsUpdated);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let result = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (result.error) {
        result = await supabase.from('products').select('*');
      }

      if (result.error) throw result.error;

      const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_product_ids') || '[]'));
      const finalProducts = (result.data || []).filter(
        p => !deletedIds.has(p.id) &&
             !p.name?.toLowerCase().includes('emrpemmrpg') &&
             Number(p.price) !== 200 &&
             Number(p.original_price) !== 5000
      );

      setProducts(finalProducts);
      
      // Initialize local stock edits
      const initialEdits = {};
      finalProducts.forEach(p => {
        initialEdits[p.id] = Number(p.stock) || 0;
      });
      setLocalStockEdits(initialEdits);
    } catch (err) {
      console.error('Error fetching inventory products:', err);
      showToast(`Failed to load inventory: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category || 'glass'));
    return Array.from(set);
  }, [products]);

  // Overall Inventory Analytics
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    products.forEach(p => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.price) || 0;

      totalUnits += stock;
      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= 5) {
        lowStockCount++;
      }

      totalValuation += stock * price;
    });

    return { totalUnits, lowStockCount, outOfStockCount, totalValuation };
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const stock = Number(p.stock) || 0;

      // Status filter
      if (statusFilter === 'low' && (stock === 0 || stock > 5)) return false;
      if (statusFilter === 'out' && stock !== 0) return false;
      if (statusFilter === 'in' && stock <= 5) return false;

      // Category filter
      if (selectedCategory !== 'all' && (p.category || 'glass') !== selectedCategory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesCategory = p.category?.toLowerCase().includes(q);
        const matchesId = p.id?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesId) return false;
      }

      return true;
    }).sort((a, b) => {
      const stockA = Number(a.stock) || 0;
      const stockB = Number(b.stock) || 0;
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;

      if (sortBy === 'stock_asc') return stockA - stockB;
      if (sortBy === 'stock_desc') return stockB - stockA;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });
  }, [products, statusFilter, selectedCategory, searchQuery, sortBy]);

  // Save Inline Stock
  const handleSaveStock = async (productId) => {
    const newStock = Math.max(0, parseInt(localStockEdits[productId], 10) || 0);
    setUpdatingStockId(productId);

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      // Update local products state
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      
      // Update fallback local storage if product exists there
      try {
        const localProducts = JSON.parse(localStorage.getItem('local_added_products') || '[]');
        const idx = localProducts.findIndex(p => p.id === productId);
        if (idx >= 0) {
          localProducts[idx].stock = newStock;
          localStorage.setItem('local_added_products', JSON.stringify(localProducts));
        }
      } catch (e) {}

      window.dispatchEvent(new Event('products_updated'));
      showToast('Stock level updated successfully!');
    } catch (err) {
      console.error('Stock update failed:', err);
      showToast(`Stock update failed: ${err.message}`, 'error');
    } finally {
      setUpdatingStockId(null);
    }
  };

  // Quick Preset Add (+5, +10, +50)
  const handleQuickAdd = (productId, delta) => {
    setLocalStockEdits(prev => ({
      ...prev,
      [productId]: Math.max(0, (parseInt(prev[productId], 10) || 0) + delta)
    }));
  };

  // Open Restock Modal
  const openRestockModal = (product = null) => {
    setSelectedProduct(product || (products.length > 0 ? products[0] : null));
    setRestockAmount(10);
    setRestockMode('add');
    setRestockModalOpen(true);
  };

  // Submit Bulk Restock
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsRestocking(true);
    const currStock = Number(selectedProduct.stock) || 0;
    const amount = Number(restockAmount) || 0;
    const finalStock = restockMode === 'add' ? Math.max(0, currStock + amount) : Math.max(0, amount);

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: finalStock })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, stock: finalStock } : p));
      setLocalStockEdits(prev => ({ ...prev, [selectedProduct.id]: finalStock }));

      window.dispatchEvent(new Event('products_updated'));
      showToast(`Restocked ${selectedProduct.name} to ${finalStock} units!`);
      setRestockModalOpen(false);
    } catch (err) {
      console.error('Restock error:', err);
      showToast(`Restock failed: ${err.message}`, 'error');
    } finally {
      setIsRestocking(false);
    }
  };

  // CSV Report Export
  const handleExportCSV = () => {
    if (products.length === 0) {
      showToast('No inventory data to export', 'error');
      return;
    }

    const headers = ['Product ID', 'Name', 'Category', 'Price (INR)', 'Stock Level', 'Status', 'Valuation (INR)'];
    const rows = products.map(p => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.price) || 0;
      const status = stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock';
      const valuation = stock * price;
      
      // Escape commas in product name
      const name = `"${(p.name || '').replace(/"/g, '""')}"`;
      return [p.id, name, p.category || 'glass', price, stock, status, valuation].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Inventory report downloaded!');
  };

  const tableHeaders = [
    'Product Details',
    'Category',
    'Unit Price',
    'Current Stock',
    'Stock Status',
    'Quick Adjuster',
    'Inventory Value',
    'Action'
  ];

  return (
    <div className="space-y-6 text-left relative">
      {/* Notification Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-bold transition-all border ${
          toast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' 
            : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header & Top Actions Control Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 shadow-md">
              <Warehouse className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              Inventory Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-wider">
              Live Stock
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 sm:ml-11">
            Monitor stock levels, configure low-stock warnings, and batch update inventory
          </p>
        </div>

        {/* All buttons neatly grouped inside one action container box */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl self-start md:self-center">
          <button
            onClick={() => openRestockModal()}
            className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-xs font-bold text-white uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
          >
            <Boxes className="h-4 w-4" />
            <span>Quick Restock</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3.5 py-2 border border-slate-800 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchProducts}
            className="flex items-center space-x-1.5 px-3 py-2 border border-slate-800 hover:bg-slate-800/80 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Refresh Inventory"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Units"
          value={loading ? '...' : metrics.totalUnits.toLocaleString()}
          description="Total items in catalog"
          icon={Warehouse}
        />
        <StatCard
          title="Low Stock Warnings"
          value={loading ? '...' : metrics.lowStockCount}
          description="Products with ≤ 5 units"
          icon={AlertTriangle}
          trendColor={metrics.lowStockCount > 0 ? 'text-amber-400 font-extrabold' : 'text-slate-400'}
        />
        <StatCard
          title="Out of Stock"
          value={loading ? '...' : metrics.outOfStockCount}
          description="Requires immediate restock"
          icon={AlertCircle}
          trendColor={metrics.outOfStockCount > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-400'}
        />
        <StatCard
          title="Inventory Valuation"
          value={loading ? '...' : `₹${metrics.totalValuation.toLocaleString()}`}
          description="Total stock worth"
          icon={TrendingUp}
          trendColor="text-emerald-400"
        />
      </div>

      {/* Alert Banner for Out of Stock or Low Stock */}
      {(metrics.outOfStockCount > 0 || metrics.lowStockCount > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">Attention: Stock Refill Required</h4>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                {metrics.outOfStockCount > 0 && <span className="font-extrabold text-rose-300">{metrics.outOfStockCount} products out of stock</span>}
                {metrics.outOfStockCount > 0 && metrics.lowStockCount > 0 && ' and '}
                {metrics.lowStockCount > 0 && <span className="font-extrabold text-amber-300">{metrics.lowStockCount} products running low</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={() => setStatusFilter(metrics.outOfStockCount > 0 ? 'out' : 'low')}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              Filter Affected Products
            </button>
          </div>
        </div>
      )}

      {/* Filters & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1 border border-slate-800/80 rounded-xl">
            {[
              { id: 'all', label: 'All Products', count: products.length },
              { id: 'low', label: 'Low Stock (≤5)', count: metrics.lowStockCount, badgeColor: 'text-amber-400 bg-amber-500/10' },
              { id: 'out', label: 'Out of Stock (0)', count: metrics.outOfStockCount, badgeColor: 'text-rose-400 bg-rose-500/10' },
              { id: 'in', label: 'In Stock (>5)', count: products.length - (metrics.lowStockCount + metrics.outOfStockCount) },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-extrabold ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Category & Sorting Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search name, category, or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-primary-500 cursor-pointer capitalize"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map(c => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="stock_asc">Sort: Stock (Lowest First)</option>
                <option value="stock_desc">Sort: Stock (Highest First)</option>
                <option value="price_desc">Sort: Price (Highest First)</option>
                <option value="name_asc">Sort: Name (A to Z)</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Main Inventory Table */}
      <AdminTable headers={tableHeaders} isLoading={loading} emptyMessage="No products match the selected inventory filters">
        {filteredProducts.map(product => {
          const stock = Number(product.stock) || 0;
          const currentEditStock = localStockEdits[product.id] !== undefined ? localStockEdits[product.id] : stock;
          const hasUnsavedChanges = currentEditStock !== stock;
          const isSavingThis = updatingStockId === product.id;
          const unitPrice = Number(product.price) || 0;
          const inventoryValuation = stock * unitPrice;

          return (
            <tr key={product.id} className="hover:bg-slate-800/20 transition-colors">
              {/* Product Info */}
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 shrink-0 bg-slate-950/60 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-1">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'}
                      alt={product.name}
                      className="max-h-full object-contain rounded-md"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-white max-w-[200px] sm:max-w-xs truncate text-xs">{product.name}</h5>
                    <span className="font-mono text-[9px] text-slate-500 font-semibold block uppercase tracking-wider">
                      ID: {product.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-extrabold uppercase tracking-wider capitalize">
                  {product.category || 'glass'}
                </span>
              </td>

              {/* Unit Price */}
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-extrabold text-white text-xs whitespace-nowrap">
                ₹{unitPrice.toLocaleString()}
              </td>

              {/* Stock Quantity */}
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-tight ${
                    stock === 0 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                      : stock <= 5 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {stock} units
                  </span>
                </div>
              </td>

              {/* Stock Status Badge */}
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                {stock === 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <AlertCircle className="h-3 w-3 text-rose-400" /> Out of Stock
                  </span>
                ) : stock <= 5 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <AlertTriangle className="h-3 w-3 text-amber-400" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> In Stock
                  </span>
                )}
              </td>

              {/* Quick Inline Adjuster */}
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1.5 bg-slate-950/40 border border-slate-800 rounded-xl p-1 max-w-fit">
                  <button
                    type="button"
                    onClick={() => setLocalStockEdits(prev => ({ ...prev, [product.id]: Math.max(0, (parseInt(prev[product.id], 10) || 0) - 1) }))}
                    disabled={isSavingThis}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={currentEditStock}
                    onChange={e => setLocalStockEdits(prev => ({ ...prev, [product.id]: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                    disabled={isSavingThis}
                    className="w-14 text-center text-xs font-extrabold text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
                  />

                  <button
                    type="button"
                    onClick={() => setLocalStockEdits(prev => ({ ...prev, [product.id]: (parseInt(prev[product.id], 10) || 0) + 1 }))}
                    disabled={isSavingThis}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    <Plus className="h-3 w-3" />
                  </button>

                  {/* Quick preset increment buttons */}
                  <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product.id, 5)}
                      className="px-1.5 py-0.5 text-[9px] font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded hover:border-slate-700 cursor-pointer"
                      title="Add 5 units"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product.id, 10)}
                      className="px-1.5 py-0.5 text-[9px] font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded hover:border-slate-700 cursor-pointer"
                      title="Add 10 units"
                    >
                      +10
                    </button>
                  </div>

                  {/* Save button */}
                  <button
                    type="button"
                    onClick={() => handleSaveStock(product.id)}
                    disabled={isSavingThis || !hasUnsavedChanges}
                    className={`h-7 px-2.5 ml-1 rounded-lg flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      hasUnsavedChanges
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md animate-pulse'
                        : 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    {isSavingThis ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </td>

              {/* Total Valuation */}
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-slate-300 text-xs whitespace-nowrap">
                ₹{inventoryValuation.toLocaleString()}
              </td>

              {/* Restock Action Modal Trigger */}
              <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                <button
                  onClick={() => openRestockModal(product)}
                  className="px-3 py-1.5 rounded-lg border border-primary-500/30 hover:border-primary-500/60 bg-primary-500/10 text-primary-300 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Restock</span>
                </button>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* Bulk Quick Restock Modal */}
      <AdminModal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title="Quick Restock Inventory"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4 text-left">
          {/* Select Product */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Product
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={e => {
                const prod = products.find(p => p.id === e.target.value);
                setSelectedProduct(prod || null);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock} units currently in stock)
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Current Stock Level:</span>
              <span className={`font-black px-2 py-0.5 rounded-md ${
                Number(selectedProduct.stock) === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {selectedProduct.stock} units
              </span>
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Restock Operation
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRestockMode('add')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  restockMode === 'add' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                + Add to Existing
              </button>
              <button
                type="button"
                onClick={() => setRestockMode('set')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  restockMode === 'set' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                = Set Exact Total
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              {restockMode === 'add' ? 'Units to Add' : 'New Total Stock'}
            </label>
            <input
              type="number"
              min="0"
              value={restockAmount}
              onChange={e => setRestockAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          {/* Quick Amount Presets */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 25, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRestockAmount(val)}
                  className={`px-3 py-1 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${
                    restockAmount === val 
                      ? 'bg-primary-500/20 border-primary-500 text-primary-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Preview */}
          {selectedProduct && (
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-200">
              <span className="font-semibold">Resulting Stock: </span>
              <span className="font-extrabold text-white">
                {restockMode === 'add' 
                  ? (Number(selectedProduct.stock) || 0) + Number(restockAmount || 0) 
                  : Number(restockAmount || 0)} units
              </span>
            </div>
          )}

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setRestockModalOpen(false)}
              className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRestocking || !selectedProduct}
              className="px-5 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              {isRestocking ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Confirm Restock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
