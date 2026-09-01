import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getAdminAuthHeaders } from '../utils/adminAuth';
import { filterDeletedShipments } from '../../utils/orderManager';

export default function useShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAdminAuthHeaders();

      const res = await fetch('http://localhost:5000/api/admin/shipments', {
        headers,
      });
      const data = await res.json();

      if (res.ok) {
        const validShipments = Array.isArray(data) ? filterDeletedShipments(data) : [];
        setShipments(validShipments);
      } else {
        throw new Error(data.message || 'Failed to fetch shipments.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();

    const handleOrdersUpdated = () => {
      fetchShipments();
    };
    window.addEventListener('orders_updated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('orders_updated', handleOrdersUpdated);
    };
  }, []);

  return {
    shipments,
    loading,
    error,
    refresh: fetchShipments,
  };
}
