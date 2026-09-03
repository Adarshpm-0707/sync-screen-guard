import { supabase } from '../supabaseClient';

// Helper to compute summary stats from review list
export function calculateReviewStats(reviews = []) {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    counts[star] = (counts[star] || 0) + 1;
    sum += Number(r.rating) || 5;
  });

  const total = reviews.length;
  const avg = total > 0 ? (sum / total).toFixed(1) : '5.0';

  const percentages = {};
  for (let s = 1; s <= 5; s++) {
    percentages[s] = total > 0 ? Math.round((counts[s] / total) * 100) : 0;
  }

  return {
    averageRating: parseFloat(avg),
    totalReviews: total,
    distribution: counts,
    percentages
  };
}

/**
 * Deduplicate reviews list by ID and by customer_name + comment content
 */
function deduplicateReviews(list = []) {
  const seenIds = new Set();
  const seenContent = new Set();
  const result = [];

  list.forEach(r => {
    if (!r) return;
    const idKey = r.id ? String(r.id) : null;
    const contentKey = `${(r.customer_name || '').trim().toLowerCase()}:::${(r.comment || '').trim().toLowerCase()}`;

    if (idKey && seenIds.has(idKey)) return;
    if (seenContent.has(contentKey)) return;

    if (idKey) seenIds.add(idKey);
    seenContent.add(contentKey);
    result.push(r);
  });

  return result;
}

/**
 * Synchronously retrieves cached reviews for immediate 0ms render
 */
export function getInstantReviews(productId) {
  if (!productId) return [];
  try {
    const local = localStorage.getItem(`sync_reviews_${productId}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateReviews(parsed);
      }
    }
  } catch (e) {}

  return [];
}

/**
 * Fetch reviews from Supabase and sync with local storage
 * Strictly deduplicates so each review comment appears exactly once (1 time)
 */
export async function fetchProductReviews(productId) {
  if (!productId) return [];

  // Clean any old duplicate keys from previous versions
  try {
    localStorage.removeItem(`sync_user_reviews_${productId}`);
  } catch (e) {}

  let dbReviews = [];
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', String(productId))
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      dbReviews = data;
    }
  } catch (err) {
    console.warn('Error fetching reviews from Supabase:', err);
  }

  // Deduplicate completely
  const finalReviews = deduplicateReviews(dbReviews);

  // Cache in localStorage for instant 0ms retrieval next time
  try {
    localStorage.setItem(`sync_reviews_${productId}`, JSON.stringify(finalReviews));
  } catch (e) {}

  return finalReviews;
}

/**
 * Submit a single customer review (1 time submission -> 1 review displayed)
 */
export async function addProductReview(productId, reviewData) {
  if (!productId) throw new Error('Product ID is required');

  const newReview = {
    product_id: String(productId),
    customer_name: reviewData.customer_name?.trim() || 'Verified Customer',
    rating: Math.min(5, Math.max(1, Number(reviewData.rating) || 5)),
    title: reviewData.title?.trim() || 'Verified Review',
    comment: reviewData.comment?.trim() || '',
    is_verified_buyer: true,
    helpful_count: 0,
    created_at: new Date().toISOString()
  };

  // 1. Insert directly into Supabase product_reviews table
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: String(productId),
        customer_name: newReview.customer_name,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        is_verified_buyer: true,
        helpful_count: 0
      })
      .select()
      .single();

    if (!error && data) {
      newReview.id = data.id;
      newReview.created_at = data.created_at || newReview.created_at;
    } else {
      newReview.id = `rev_${Date.now()}`;
    }
  } catch (err) {
    console.warn('Supabase review insert warning, using local copy:', err);
    newReview.id = `rev_${Date.now()}`;
  }

  // 2. Update local cache with deduplication
  try {
    const currentCached = getInstantReviews(productId);
    const updated = deduplicateReviews([newReview, ...currentCached]);
    localStorage.setItem(`sync_reviews_${productId}`, JSON.stringify(updated));
  } catch (e) {}

  // Trigger event for review listeners
  window.dispatchEvent(new CustomEvent('reviews_updated', { detail: { productId, newReview } }));

  return { success: true, review: newReview };
}

/**
 * Vote helpful on a review
 */
export async function voteHelpfulReview(productId, reviewId) {
  const votedKey = `voted_helpful_${reviewId}`;
  if (localStorage.getItem(votedKey)) {
    return { alreadyVoted: true };
  }

  try {
    localStorage.setItem(votedKey, 'true');
    const cached = getInstantReviews(productId);
    const updated = cached.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpful_count: (r.helpful_count || 0) + 1 };
      }
      return r;
    });
    localStorage.setItem(`sync_reviews_${productId}`, JSON.stringify(updated));

    // Update Supabase
    try {
      const target = cached.find(r => r.id === reviewId);
      if (target) {
        await supabase
          .from('product_reviews')
          .update({ helpful_count: (target.helpful_count || 0) + 1 })
          .eq('id', reviewId);
      }
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('reviews_updated', { detail: { productId } }));
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

/**
 * Delete a customer review
 */
export async function deleteProductReview(productId, reviewId) {
  if (!productId || !reviewId) return { success: false };

  // 1. Remove from local cache immediately (optimistic removal)
  try {
    const cached = getInstantReviews(productId);
    const updated = cached.filter(r => String(r.id) !== String(reviewId));
    localStorage.setItem(`sync_reviews_${productId}`, JSON.stringify(updated));
  } catch (e) {}

  // 2. Delete from Supabase product_reviews table
  try {
    await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);
  } catch (err) {
    console.warn('Supabase review delete error:', err);
  }

  // 3. Dispatch update event
  window.dispatchEvent(new CustomEvent('reviews_updated', { detail: { productId, deletedReviewId: reviewId } }));

  return { success: true };
}

