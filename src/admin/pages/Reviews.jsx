import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Star, Trash2, Search, RefreshCw, 
  CheckCircle, ThumbsUp, ShieldCheck, Box, Filter, 
  AlertCircle, ExternalLink, ArrowRight, Check
} from 'lucide-react';
import AdminTable from '../components/common/AdminTable';
import { supabase } from '../../supabaseClient';
import { fetchStoreProducts } from '../../utils/productStore';
import { deleteProductReview } from '../../utils/reviewStore';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [deleteNotice, setDeleteNotice] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch products to map product_id to product names and images
      const prods = await fetchStoreProducts();
      const pMap = {};
      (prods || []).forEach(p => {
        if (p && p.id) {
          pMap[p.id] = p;
        }
      });
      setProductsMap(pMap);

      // 2. Fetch all customer reviews from Supabase
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review from "${review.customer_name}"? This will immediately remove it from the product details page as well.`)) {
      return;
    }

    setDeletingId(review.id);
    try {
      // Optimistic removal
      setReviews(prev => prev.filter(r => r.id !== review.id));

      await deleteProductReview(review.product_id, review.id);

      setDeleteNotice(`Review by "${review.customer_name}" was deleted successfully.`);
      setTimeout(() => setDeleteNotice(''), 3500);
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return { total: 0, avg: '5.0', fiveStars: 0, lowRatings: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = (sum / total).toFixed(1);
    const fiveStars = reviews.filter(r => Math.round(Number(r.rating)) === 5).length;
    const lowRatings = reviews.filter(r => Number(r.rating) <= 2).length;

    return { total, avg, fiveStars, lowRatings };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Rating filter
      if (selectedRating !== 'all' && Math.round(Number(r.rating)) !== Number(selectedRating)) {
        return false;
      }
      // Product filter
      if (selectedProduct !== 'all' && String(r.product_id) !== String(selectedProduct)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const prod = productsMap[r.product_id];
        const prodName = prod?.name?.toLowerCase() || '';
        const custName = (r.customer_name || '').toLowerCase();
        const comment = (r.comment || '').toLowerCase();
        const title = (r.title || '').toLowerCase();

        return custName.includes(q) || comment.includes(q) || title.includes(q) || prodName.includes(q);
      }
      return true;
    });
  }, [reviews, selectedRating, selectedProduct, searchQuery, productsMap]);

  const uniqueProductIds = useMemo(() => {
    const set = new Set(reviews.map(r => r.product_id).filter(Boolean));
    return Array.from(set);
  }, [reviews]);

  const headers = ['Product', 'Customer', 'Rating', 'Review Headline & Comment', 'Submitted Date', 'Helpful', 'Actions'];

  return (
    <div className="space-y-6 text-left">
      
      {/* ── Control Box Header ── */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-md shadow-amber-500/20">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Customer Reviews & Comments
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Monitor customer feedback, view comments, and delete reviews across all products ({reviews.length} total)
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh Reviews</span>
          </button>
        </div>
      </div>

      {/* Delete Success Toast */}
      {deleteNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{deleteNotice}</span>
        </div>
      )}

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Reviews</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{metrics.total}</span>
            <span className="text-[10px] font-bold text-slate-500">Submitted</span>
          </div>
        </div>

        <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Average Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">{metrics.avg}</span>
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">5-Star Ratings</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{metrics.fiveStars}</span>
            <span className="text-[10px] font-bold text-emerald-500/80">
              {metrics.total > 0 ? `${Math.round((metrics.fiveStars / metrics.total) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Critical (&le; 2 Stars)</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black ${metrics.lowRatings > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {metrics.lowRatings}
            </span>
            <span className="text-[10px] font-bold text-slate-500">Needs Attention</span>
          </div>
        </div>

      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer, comments, or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090D16]/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Rating Filter */}
        <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full sm:w-auto bg-[#090D16]/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars (Excellent)</option>
            <option value="4">4 Stars (Good)</option>
            <option value="3">3 Stars (Average)</option>
            <option value="2">2 Stars (Poor)</option>
            <option value="1">1 Star (Critical)</option>
          </select>

          {/* Product Filter */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full sm:w-auto bg-[#090D16]/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer max-w-xs truncate"
          >
            <option value="all">All Products ({uniqueProductIds.length})</option>
            {uniqueProductIds.map((pid) => {
              const p = productsMap[pid];
              return (
                <option key={pid} value={pid}>
                  {p?.name || `Product: ${pid}`}
                </option>
              );
            })}
          </select>
        </div>

      </div>

      {/* ── Mobile Card List View (< md) ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-wider">
            No customer reviews found matching filter criteria
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const prod = productsMap[rev.product_id];
            const initial = rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'C';

            return (
              <div
                key={rev.id}
                className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-lg"
              >
                {/* Product banner */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800/80">
                  <div className="h-9 w-9 shrink-0 bg-[#090D16] border border-slate-800 rounded-lg p-0.5 flex items-center justify-center">
                    <img
                      src={prod?.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'}
                      alt={prod?.name || 'Product'}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{prod?.name || 'Product'}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{prod?.category || 'Electronics'}</span>
                  </div>
                </div>

                {/* Customer and Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-800 text-slate-200 text-[10px] font-bold flex items-center justify-center">
                      {initial}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{rev.customer_name}</p>
                      <span className="text-[9px] text-slate-400">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">{rev.rating}</span>
                  </div>
                </div>

                {/* Comment Text */}
                <div className="space-y-1 bg-[#090D16]/60 p-3 rounded-xl border border-slate-800/60">
                  {rev.title && (
                    <p className="text-xs font-extrabold text-slate-200">{rev.title}</p>
                  )}
                  <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                </div>

                {/* Delete Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    👍 {rev.helpful_count || 0} helpful votes
                  </span>

                  <button
                    onClick={() => handleDeleteReview(rev)}
                    disabled={deletingId === rev.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{deletingId === rev.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Desktop Table View (>= md) ── */}
      <div className="hidden md:block">
        <AdminTable headers={headers} isLoading={loading} emptyMessage="No customer reviews found">
          {filteredReviews.map((rev) => {
            const prod = productsMap[rev.product_id];
            const initial = rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'C';

            return (
              <tr key={rev.id} className="hover:bg-slate-800/30 transition-colors group">
                
                {/* Product Column */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center space-x-2.5 max-w-[180px] lg:max-w-xs">
                    <div className="h-10 w-10 shrink-0 bg-[#090D16] border border-slate-800 rounded-xl p-1 flex items-center justify-center">
                      <img
                        src={prod?.images?.[0] || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=100'}
                        alt={prod?.name || 'Product'}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-xs truncate leading-tight">
                        {prod?.name || 'Screen Protector'}
                      </p>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                        {prod?.category || 'glass'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Customer Column */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs leading-tight">{rev.customer_name}</p>
                      {rev.is_verified_buyer !== false && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md uppercase">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Rating Column */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.round(Number(rev.rating))
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700 fill-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs font-black text-amber-300">
                      {rev.rating}★
                    </span>
                  </div>
                </td>

                {/* Review Headline & Comment */}
                <td className="px-4 py-3.5 max-w-[280px] lg:max-w-md">
                  {rev.title && (
                    <p className="text-xs font-bold text-slate-200 truncate mb-0.5">
                      {rev.title}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {rev.comment}
                  </p>
                </td>

                {/* Date */}
                <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-xs font-medium">
                  {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>

                {/* Helpful Count */}
                <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-400">
                  {rev.helpful_count || 0}
                </td>

                {/* Actions: Delete Review */}
                <td className="px-4 py-3.5 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDeleteReview(rev)}
                    disabled={deletingId === rev.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    title="Delete Review Permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{deletingId === rev.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </td>

              </tr>
            );
          })}
        </AdminTable>
      </div>

    </div>
  );
}
