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
  Boxes,
  Lock,
  ArrowUpDown
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
  const [localStockEdits, setLocalStockEdits] = useState({});

  // Quick Restock Modal State
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [restockMode, setRestockMode] = useState('add');
  const [isRestocking, setIsRestocking] = useState(false);

  // Feedback Toast
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

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category || 'glass'));
    return Array.from(set);
  }, [products]);

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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const stock = Number(p.stock) || 0;

      if (statusFilter === 'low' && (stock === 0 || stock > 5)) return false;
      if (statusFilter === 'out' && stock !== 0) return false;
      if (statusFilter === 'in' && stock <= 5) return false;

      if (selectedCategory !== 'all' && (p.category || 'glass') !== selectedCategory) return false;

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

  const handleSaveStock = async (productId) => {
    const newStock = Math.max(0, parseInt(localStockEdits[productId], 10) || 0);
    setUpdatingStockId(productId);

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      
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

  const handleQuickAdd = (productId, delta) => {
    setLocalStockEdits(prev => ({
      ...prev,
      [productId]: Math.max(0, (parseInt(prev[productId], 10) || 0) + delta)
    }));
  };

  const openRestockModal = (product = null) => {
    setSelectedProduct(product || (products.length > 0 ? products[0] : null));
    setRestockAmount(10);
    setRestockMode('add');
    setRestockModalOpen(true);
  };

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

  const handleExportCSV = () => {
    if (products.length === 0) {
      showToast('No inventory data to export', 'error');
      return;
    }

    const headers = ['Product ID', 'Name', 'Category', 'Sale Price (INR)', 'Cost Price (INR)', 'Profit Margin (INR)', 'Stock Level', 'Status', 'Valuation (INR)'];
    const rows = products.map(p => {
      const stock = Number(p.stock) || 0;
      const price = Number(p.price) || 0;
      const costPrice = Number(p.purchasing_price) || 0;
      const profit = costPrice > 0 ? price - costPrice : 'N/A';
      const status = stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock';
      const valuation = stock * price;
      
      const name = `"${(p.name || '').replace(/"/g, '""')}"`;
      return [p.id, name, p.category || 'glass', price, costPrice || 'N/A', profit, stock, status, valuation].join(',');
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

    showToast('Inventory CSV exported successfully!');
  };

  const tableHeaders = [
    'Product Details',
    'Category',
    'Cost Price 🔒',
    'Sale Price',
    'Current Stock',
    'Stock Status',
    'Quick Adjuster',
    'Inventory Value',
    'Action'
  ];

  return (
    <div className="space-y-6 text-left relative">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold transition-all border backdrop-blur-md animate-fade-in ${
          toast.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' 
            : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header Box */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 shadow-md">
              <Warehouse className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Inventory Warehouse
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Realtime stock monitor, low-stock warnings & batch restock tools
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => openRestockModal()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-600/25 ring-1 ring-white/10 cursor-pointer active:scale-95"
          >
            <Boxes className="h-4 w-4" />
            <span>Quick Restock</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Stock Units"
          value={loading ? '...' : metrics.totalUnits.toLocaleString()}
          description="Units across all products"
          icon={Warehouse}
          gradient="from-indigo-600 to-blue-600"
          badgeText="Inventory"
        />
        <StatCard
          title="Low Stock Warning"
          value={loading ? '...' : metrics.lowStockCount}
          description="Items with ≤ 5 units left"
          icon={AlertTriangle}
          gradient="from-amber-600 to-orange-500"
          trendColor={metrics.lowStockCount > 0 ? 'text-amber-400 font-extrabold' : 'text-slate-400'}
          badgeText="Stock Alert"
        />
        <StatCard
          title="Out of Stock"
          value={loading ? '...' : metrics.outOfStockCount}
          description="Items with 0 units"
          icon={AlertCircle}
          gradient="from-rose-600 to-red-500"
          trendColor={metrics.outOfStockCount > 0 ? 'text-rose-400 font-extrabold' : 'text-slate-400'}
          badgeText="Depleted"
        />
        <StatCard
          title="Stock Valuation"
          value={loading ? '...' : `₹${metrics.totalValuation.toLocaleString()}`}
          description="Total retail inventory worth"
          icon={TrendingUp}
          gradient="from-emerald-600 to-teal-500"
          trendColor="text-emerald-400"
          badgeText="Valuation"
        />
      </div>

      {/* Stock Refill Warning Callout */}
      {(metrics.outOfStockCount > 0 || metrics.lowStockCount > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-inner">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">Attention: Restock Required</h4>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                {metrics.outOfStockCount > 0 && <span className="font-extrabold text-rose-300">{metrics.outOfStockCount} products out of stock</span>}
                {metrics.outOfStockCount > 0 && metrics.lowStockCount > 0 && ' and '}
                {metrics.lowStockCount > 0 && <span className="font-extrabold text-amber-300">{metrics.lowStockCount} products running low</span>}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter(metrics.outOfStockCount > 0 ? 'out' : 'low')}
            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer self-start sm:self-center"
          >
            Filter Depleted Items
          </button>
        </div>
      )}

      {/* Filters & Tabs Control Bar */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 space-y-4 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#090D16]/90 p-1 border border-slate-800 rounded-xl">
            {[
              { id: 'all', label: 'All', count: products.length },
              { id: 'low', label: 'Low Stock (≤5)', count: metrics.lowStockCount, badgeColor: 'text-amber-400 bg-amber-500/15' },
              { id: 'out', label: 'Out (0)', count: metrics.outOfStockCount, badgeColor: 'text-rose-400 bg-rose-500/15' },
              { id: 'in', label: 'In Stock (>5)', count: products.length - (metrics.lowStockCount + metrics.outOfStockCount) },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 text-[9px] rounded-md font-black ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Category & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#090D16]/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#090D16]/90 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer capitalize"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c} value={c} className="capitalize bg-[#0E1322]">
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#090D16]/90 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="stock_asc">Stock (Lowest First)</option>
              <option value="stock_desc">Stock (Highest First)</option>
              <option value="price_desc">Price (Highest First)</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Inventory Table */}
      <AdminTable headers={tableHeaders} isLoading={loading} emptyMessage="No products match inventory filters">
        {filteredProducts.map(product => {
          const stock = Number(product.stock) || 0;
          const currentEditStock = localStockEdits[product.id] !== undefined ? localStockEdits[product.id] : stock;
          const hasUnsavedChanges = currentEditStock !== stock;
          const isSavingThis = updatingStockId === product.id;
          const unitPrice = Number(product.price) || 0;
          const costPrice = Number(product.purchasing_price) || 0;
          const inventoryValuation = stock * unitPrice;

          return (
            <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
              {/* Product Info */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 shrink-0 bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-1">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'}
                      alt={product.name}
                      className="max-h-full object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-white max-w-[180px] lg:max-w-xs truncate text-xs">{product.name}</h5>
                    <span className="font-mono text-[9px] text-slate-400 font-semibold block uppercase">
                      ID: {product.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider capitalize">
                  {product.category || 'glass'}
                </span>
              </td>

              {/* Cost Price */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                {costPrice > 0 ? (
                  <div className="flex flex-col">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-black">
                      ₹{costPrice.toLocaleString()}
                    </span>
                    {unitPrice > 0 && (
                      <span className={`text-[9px] font-bold uppercase mt-0.5 ${
                        unitPrice - costPrice >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {unitPrice - costPrice >= 0 ? '+' : ''}₹{(unitPrice - costPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-600 text-[10px] font-semibold">— not set</span>
                )}
              </td>

              {/* Unit Sale Price */}
              <td className="px-4 sm:px-5 py-3.5 font-black text-white text-xs whitespace-nowrap">
                ₹{unitPrice.toLocaleString()}
              </td>

              {/* Stock Quantity */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-tight ${
                  stock === 0 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                    : stock <= 5 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}>
                  {stock} units
                </span>
              </td>

              {/* Stock Status Badge */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                {stock === 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[9px] font-black uppercase tracking-wider">
                    <AlertCircle className="h-3 w-3 text-rose-400" /> Out of Stock
                  </span>
                ) : stock <= 5 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                    <AlertTriangle className="h-3 w-3 text-amber-400" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> In Stock
                  </span>
                )}
              </td>

              {/* Quick Inline Adjuster */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                <div className="flex items-center space-x-1.5 bg-[#090D16]/90 border border-slate-800 rounded-xl p-1 max-w-fit shadow-inner">
                  <button
                    type="button"
                    onClick={() => setLocalStockEdits(prev => ({ ...prev, [product.id]: Math.max(0, (parseInt(prev[product.id], 10) || 0) - 1) }))}
                    disabled={isSavingThis}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={currentEditStock}
                    onChange={e => setLocalStockEdits(prev => ({ ...prev, [product.id]: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                    disabled={isSavingThis}
                    className="w-12 text-center text-xs font-black text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                  />

                  <button
                    type="button"
                    onClick={() => setLocalStockEdits(prev => ({ ...prev, [product.id]: (parseInt(prev[product.id], 10) || 0) + 1 }))}
                    disabled={isSavingThis}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    <Plus className="h-3 w-3" />
                  </button>

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

                  <button
                    type="button"
                    onClick={() => handleSaveStock(product.id)}
                    disabled={isSavingThis || !hasUnsavedChanges}
                    className={`h-7 px-2 ml-1 rounded-lg flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      hasUnsavedChanges
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 animate-pulse'
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
              <td className="px-4 sm:px-5 py-3.5 font-bold text-slate-200 text-xs whitespace-nowrap">
                ₹{inventoryValuation.toLocaleString()}
              </td>

              {/* Restock Action Trigger */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                <button
                  onClick={() => openRestockModal(product)}
                  className="px-3 py-1.5 rounded-xl border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 text-amber-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 shadow-sm"
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
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Select Catalog Product
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={e => {
                const prod = products.find(p => p.id === e.target.value);
                setSelectedProduct(prod || null);
              }}
              className="w-full bg-[#090D16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0E1322]">
                  {p.name} ({p.stock} units currently in stock)
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-[#090D16]/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Current Stock Level:</span>
              <span className={`font-black px-2.5 py-0.5 rounded-md ${
                Number(selectedProduct.stock) === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {selectedProduct.stock} units
              </span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Restock Operation
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#090D16] p-1 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRestockMode('add')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  restockMode === 'add' ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                + Add Units
              </button>
              <button
                type="button"
                onClick={() => setRestockMode('set')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  restockMode === 'set' ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                = Set Exact Total
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              {restockMode === 'add' ? 'Units to Add' : 'New Total Stock'}
            </label>
            <input
              type="number"
              min="0"
              value={restockAmount}
              onChange={e => setRestockAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full bg-[#090D16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-black focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Quick Quantity Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 25, 50, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRestockAmount(val)}
                  className={`px-3 py-1 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                    restockAmount === val 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                      : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={isRestocking}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:from-amber-500 hover:to-orange-400"
            >
              {isRestocking ? 'Updating...' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
