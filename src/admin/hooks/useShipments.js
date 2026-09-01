import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getAdminAuthHeaders } from '../utils/adminAuth';

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
        setShipments(data || []);
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
  }, []);

  return {
    shipments,
    loading,
    error,
    refresh: fetchShipments,
  };
}
