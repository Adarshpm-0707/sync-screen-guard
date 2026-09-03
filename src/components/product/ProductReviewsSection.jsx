import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, ThumbsUp, CheckCircle, MessageSquare, 
  PenLine, Filter, Sparkles, ShieldCheck, Check, ChevronDown, User, Trash2
} from 'lucide-react';
import { 
  fetchProductReviews, 
  getInstantReviews, 
  addProductReview, 
  voteHelpfulReview, 
  deleteProductReview,
  calculateReviewStats 
} from '../../utils/reviewStore';
import useCustomerAuth from '../../hooks/useCustomerAuth';

const STAR_LABELS = {
  5: '5 Stars - Excellent!',
  4: '4 Stars - Very Good!',
  3: '3 Stars - Average',
  2: '2 Stars - Below Expectations',
  1: '1 Star - Poor'
};

export default function ProductReviewsSection({ productId, productName }) {
  const { customer } = useCustomerAuth();
  const [reviews, setReviews] = useState(() => getInstantReviews(productId));
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [starFilter, setStarFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [votedMap, setVotedMap] = useState({});

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(customer?.email ? customer.email.split('@')[0] : '');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch updated reviews
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchProductReviews(productId).then(data => {
      setReviews(data || []);
      setLoading(false);
    });

    const handleReviewsUpdated = (e) => {
      if (!e.detail?.productId || e.detail.productId === String(productId)) {
        if (e.detail?.deletedReviewId) {
          setReviews(prev => (prev || []).filter(r => String(r.id) !== String(e.detail.deletedReviewId)));
        } else {
          fetchProductReviews(productId).then(data => setReviews(data || []));
        }
      }
    };

    window.addEventListener('reviews_updated', handleReviewsUpdated);
    return () => {
      window.removeEventListener('reviews_updated', handleReviewsUpdated);
    };
  }, [productId]);

  // If customer changes, prefill name if empty
  useEffect(() => {
    if (customer?.email && !name) {
      setName(customer.email.split('@')[0]);
    }
  }, [customer, name]);

  const stats = useMemo(() => {
    return calculateReviewStats(reviews);
  }, [reviews]);

  // Strictly deduplicated and filtered list
  const filteredReviews = useMemo(() => {
    const seen = new Set();
    const unique = [];

    (reviews || []).forEach(r => {
      if (!r) return;
      const key = r.id ? String(r.id) : `${(r.customer_name || '').trim()}:::${(r.comment || '').trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    });

    let list = unique;

    if (starFilter !== 'all') {
      const targetStar = Number(starFilter);
      list = list.filter(r => Math.round(Number(r.rating)) === targetStar);
    }

    if (sortBy === 'latest') {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortBy === 'highest') {
      list.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === 'helpful') {
      list.sort((a, b) => (Number(b.helpful_count) || 0) - (Number(a.helpful_count) || 0));
    }

    return list;
  }, [reviews, starFilter, sortBy]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!comment.trim()) {
      setFormError('Please write your review comment.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await addProductReview(productId, {
        customer_name: name.trim() || 'Verified Customer',
        rating,
        title: title.trim() || `${rating} Star Product Review`,
        comment: comment.trim()
      });

      if (result.review) {
        setReviews(prev => {
          const current = prev || [];
          const exists = current.some(r => r.id === result.review.id || (r.comment === result.review.comment && r.customer_name === result.review.customer_name));
          return exists ? current : [result.review, ...current];
        });
      }

      setSubmitSuccess(true);
      setTitle('');
      setComment('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 2000);
    } catch (err) {
      setFormError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = async (reviewId) => {
    if (votedMap[reviewId]) return;
    setVotedMap(prev => ({ ...prev, [reviewId]: true }));
    await voteHelpfulReview(productId, reviewId);
  };

  const handleDeleteClick = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this customer comment?')) {
      return;
    }

    // Optimistically remove from state immediately
    setReviews(prev => (prev || []).filter(r => String(r.id) !== String(reviewId)));
    await deleteProductReview(productId, reviewId);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div id="customer-reviews-section" className="mt-14 sm:mt-20 pt-8 sm:pt-12 border-t border-zinc-200">
      
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verified Customer Feedback</span>
          </div>
          <h2 className="font-display text-xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
            Customer Reviews & Comments
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Real experiences from users who installed Sync on {productName || 'their device'}
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 self-start md:self-auto"
        >
          <PenLine className="h-4 w-4" />
          <span>{showForm ? 'Cancel Review' : 'Write a Review'}</span>
        </button>
      </div>

      {/* ── 1. Rating Summary Box & Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        
        {/* Left: Overall Score Card (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center text-center p-4 border-b lg:border-b-0 lg:border-r border-zinc-100">
          <span className="font-display text-5xl sm:text-6xl font-black text-zinc-900 tracking-tight">
            {stats.averageRating}
          </span>
          <div className="flex items-center gap-1 my-2 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(stats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 fill-zinc-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            {stats.totalReviews > 0 ? `Based on ${stats.totalReviews} ${stats.totalReviews === 1 ? 'Review' : 'Customer Reviews'}` : 'No Reviews Yet'}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mt-3">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Verified Purchases</span>
          </span>
        </div>

        {/* Right: Star Distribution Bars (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-center space-y-2.5 sm:px-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const pct = stats.percentages[star] || 0;
            const isFilterActive = starFilter === String(star);

            return (
              <button
                key={star}
                type="button"
                onClick={() => setStarFilter(isFilterActive ? 'all' : String(star))}
                className={`flex items-center gap-3 w-full group text-left cursor-pointer p-1 rounded-xl transition-colors ${
                  isFilterActive ? 'bg-zinc-100' : 'hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-1 w-12 sm:w-14 text-xs font-bold text-zinc-700 shrink-0">
                  <span>{star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="w-16 text-right text-[11px] font-bold text-zinc-500 shrink-0">
                  {pct}% ({count})
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* ── 2. Animated Write a Review Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                    <PenLine className="h-5 w-5 text-emerald-400" />
                    <span>Write Your Review</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Share your experience with Sync products to help other buyers.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Verified Buyer
                </span>
              </div>

              {submitSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-center space-y-2">
                  <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white uppercase">Thank you for your review!</h4>
                  <p className="text-xs text-emerald-300">Your review comment has been submitted and added below.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  
                  {/* Rating Selector */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`h-7 w-7 ${
                                star <= (hoverRating || rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-emerald-400 ml-2">
                        {STAR_LABELS[hoverRating || rating]}
                      </span>
                    </div>
                  </div>

                  {/* Name & Headline Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                        Review Headline / Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Perfect auto alignment, zero bubbles!"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Review Comments Text Area */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                      Your Comments & Review Text *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the 10-second installation tray, glass clarity, edge coverage, anti-fingerprint coating, or delivery experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs font-bold text-rose-400">{formError}</p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-7 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Reviews Filter & Sort Bar ── */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white border border-zinc-200 rounded-2xl p-3 sm:p-4 shadow-xs">
          
          {/* Star Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All (${reviews.length})` },
              { id: '5', label: `5 ★ (${stats.distribution[5] || 0})` },
              { id: '4', label: `4 ★ (${stats.distribution[4] || 0})` },
              { id: '3', label: `3 ★ (${stats.distribution[3] || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStarFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  starFilter === tab.id
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              <option value="latest">Newest First</option>
              <option value="highest">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

        </div>
      )}

      {/* ── 4. Customer Review Comments List ── */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => {
            const hasVoted = Boolean(votedMap[rev.id]);
            const initialLetter = rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'C';

            return (
              <div
                key={rev.id}
                className="bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs hover:border-zinc-300 transition-colors space-y-3 relative group"
              >
                
                {/* Header: Customer Info, Rating & Delete Button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-emerald-500/20">
                      {initialLetter}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-zinc-900">
                          {rev.customer_name || 'Verified Customer'}
                        </span>
                        {rev.is_verified_buyer !== false && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                        {formatDate(rev.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Stars & Delete Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(Number(rev.rating))
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-200 fill-zinc-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Delete Comment Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(rev.id)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200 ml-1"
                      title="Delete Comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Review Title */}
                {rev.title && (
                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 tracking-tight">
                    {rev.title}
                  </h4>
                )}

                {/* Review Text Comments */}
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                  {rev.comment}
                </p>

                {/* Footer: Helpful Vote Counter */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs text-zinc-500">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Sync Guaranteed Quality & Fit</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleHelpfulClick(rev.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        hasVoted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>Helpful ({Number(rev.helpful_count || 0) + (hasVoted ? 1 : 0)})</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center space-y-3">
            <MessageSquare className="h-8 w-8 text-zinc-400 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-800 uppercase">No reviews yet for this product</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Be the first customer to review this item and share your experience!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer mt-2"
            >
              Write First Review
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
