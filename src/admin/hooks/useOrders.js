import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function useOrders(initialFilters = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters,
      });

      const res = await fetch(`http://localhost:5000/api/admin/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  return {
    orders,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    setFilters,
    refresh: fetchOrders,
  };
}
