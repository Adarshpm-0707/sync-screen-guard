import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getAdminAuthHeaders } from '../utils/adminAuth';
import { filterDeletedOrders } from '../../utils/orderManager';

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
      const headers = await getAdminAuthHeaders();

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters,
      });

      const res = await fetch(`http://localhost:5000/api/admin/orders?${params}`, {
        headers,
      });
      const data = await res.json();
      
      if (res.ok) {
        const validOrders = Array.isArray(data.orders) ? filterDeletedOrders(data.orders) : [];
        setOrders(validOrders);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems !== undefined ? data.totalItems : validOrders.length);
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

    const handleOrdersUpdated = () => {
      fetchOrders();
    };
    window.addEventListener('orders_updated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('orders_updated', handleOrdersUpdated);
    };
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
