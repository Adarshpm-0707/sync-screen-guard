import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { getAdminAuthHeaders } from '../utils/adminAuth';
import { filterDeletedOrders } from '../../utils/orderManager';

export default function useCustomers(initialFilters = {}) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    registeredCount: 0,
    guestCount: 0,
    totalCustomerRevenue: 0,
    repeatCustomersCount: 0,
    avgOrderValue: 0,
  });

  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [customerType, setCustomerType] = useState(initialFilters.customerType || 'all');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAdminAuthHeaders();

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        customerType: customerType,
        sort: sortBy,
      });

      let fetchedData = null;

      // 1. Try Backend API
      try {
        const res = await fetch(`http://localhost:5000/api/admin/customers?${params}`, {
          headers,
        });
        if (res.ok) {
          fetchedData = await res.json();
        }
      } catch (apiErr) {
        console.warn('API fetchCustomers fallback:', apiErr);
      }

      if (fetchedData && fetchedData.customers) {
        setCustomers(fetchedData.customers || []);
        if (fetchedData.stats) setStats(fetchedData.stats);
        setTotalPages(fetchedData.totalPages || 1);
        setTotalItems(fetchedData.totalItems || 0);
      } else {
        // 2. Direct Supabase / LocalStorage Fallback Aggregation
        let dbOrders = [];
        try {
          const { data, error: dbErr } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          if (!dbErr && data) {
            dbOrders = data;
          }
        } catch (e) {
          console.warn('Direct supabase orders fetch error:', e);
        }

        // Include any locally placed orders from localStorage
        let allOrders = [...dbOrders];
        try {
          const localSaved = JSON.parse(localStorage.getItem('customer_orders') || '[]');
          if (localSaved.length > 0) {
            const existingIds = new Set(allOrders.map(o => o.id));
            const newLocals = localSaved.filter(o => !existingIds.has(o.id));
            allOrders = [...newLocals, ...allOrders];
          }
        } catch (e) {}

        // Exclude deleted orders
        allOrders = filterDeletedOrders(allOrders);

        // Group orders by unique customer identifier
        const customerMap = new Map();

        allOrders.forEach((order) => {
          const key = (order.customer_email || order.user_id || order.phone || order.customer_name || 'unknown').toLowerCase().trim();
          const isGuest = order.is_guest === true || (!order.user_id && order.is_guest !== false);

          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: order.user_id || `cust-${key.replace(/[^a-z0-9]/gi, '') || Date.now()}`,
              user_id: order.user_id || null,
              name: order.customer_name || 'Customer',
              email: order.customer_email || '',
              phone: order.phone || '',
              is_guest: isGuest,
              total_orders: 0,
              total_spent: 0,
              first_seen: order.created_at || new Date().toISOString(),
              last_active: order.created_at || new Date().toISOString(),
              addresses: [],
              orders: []
            });
          }

          const cust = customerMap.get(key);
          cust.total_orders += 1;
          cust.total_spent += parseFloat(order.total || 0);

          if (order.user_id || order.is_guest === false) {
            cust.is_guest = false;
            if (order.user_id) cust.user_id = order.user_id;
          }

          if (new Date(order.created_at) < new Date(cust.first_seen)) {
            cust.first_seen = order.created_at;
          }
          if (new Date(order.created_at) > new Date(cust.last_active)) {
            cust.last_active = order.created_at;
          }

          const addrKey = `${order.address || ''}_${order.city || ''}_${order.pincode || ''}`;
          if (order.address && !cust.addresses.some(a => a._key === addrKey)) {
            cust.addresses.push({
              _key: addrKey,
              address: order.address,
              city: order.city || '',
              state: order.state || '',
              pincode: order.pincode || ''
            });
          }

          cust.orders.push({
            id: order.id,
            created_at: order.created_at,
            status: order.status,
            total: order.total,
            payment_type: order.payment_type,
            payment_status: order.payment_status || 'pending',
            city: order.city,
            state: order.state,
          });
        });

        // Also check if local registered user is present but hasn't placed an order yet
        try {
          const localCustomerStr = localStorage.getItem('local_customer_user');
          if (localCustomerStr) {
            const parsed = JSON.parse(localCustomerStr);
            if (parsed && parsed.email) {
              const key = parsed.email.toLowerCase().trim();
              if (!customerMap.has(key)) {
                customerMap.set(key, {
                  id: parsed.id || `cust-${Date.now()}`,
                  user_id: parsed.id || null,
                  name: parsed.name || parsed.user_metadata?.full_name || parsed.email.split('@')[0],
                  email: parsed.email,
                  phone: parsed.phone || '',
                  is_guest: Boolean(parsed.is_guest),
                  total_orders: 0,
                  total_spent: 0,
                  first_seen: parsed.created_at || new Date().toISOString(),
                  last_active: new Date().toISOString(),
                  addresses: [],
                  orders: []
                });
              }
            }
          }
        } catch (e) {}

        let list = Array.from(customerMap.values()).map(c => ({
          ...c,
          primary_address: c.addresses.length > 0 ? `${c.addresses[0].address}, ${c.addresses[0].city} ${c.addresses[0].pincode}` : 'No address provided',
          total_spent: Math.round(c.total_spent * 100) / 100
        }));

        // Compute global summary metrics
        const totalCustomers = list.length;
        const registeredCount = list.filter(c => !c.is_guest).length;
        const guestCount = list.filter(c => c.is_guest).length;
        const totalCustomerRevenue = list.reduce((sum, c) => sum + c.total_spent, 0);
        const repeatCustomersCount = list.filter(c => c.total_orders > 1).length;
        const avgOrderValue = totalCustomers > 0 ? (totalCustomerRevenue / (allOrders.length || 1)) : 0;

        setStats({
          totalCustomers,
          registeredCount,
          guestCount,
          totalCustomerRevenue: Math.round(totalCustomerRevenue * 100) / 100,
          repeatCustomersCount,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        });

        // Filter: customerType
        if (customerType === 'registered') {
          list = list.filter(c => !c.is_guest);
        } else if (customerType === 'guest') {
          list = list.filter(c => c.is_guest);
        }

        // Filter: search
        if (searchTerm && searchTerm.trim()) {
          const q = searchTerm.trim().toLowerCase();
          list = list.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.addresses.some(a => a.city.toLowerCase().includes(q) || a.state.toLowerCase().includes(q) || a.pincode.includes(q))
          );
        }

        // Sort
        if (sortBy === 'spent') {
          list.sort((a, b) => b.total_spent - a.total_spent);
        } else if (sortBy === 'orders') {
          list.sort((a, b) => b.total_orders - a.total_orders);
        } else if (sortBy === 'name') {
          list.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          list.sort((a, b) => new Date(b.last_active) - new Date(a.last_active));
        }

        const filteredTotal = list.length;
        const offset = (currentPage - 1) * itemsPerPage;
        const paginated = list.slice(offset, offset + itemsPerPage);

        setCustomers(paginated);
        setTotalItems(filteredTotal);
        setTotalPages(Math.ceil(filteredTotal / itemsPerPage) || 1);
      }
    } catch (err) {
      console.error('Error in useCustomers:', err);
      setError(err.message || 'Failed to load customer registry');
    } finally {
      setLoading(false);
    }
  }, [currentPage, customerType, sortBy, searchTerm]);

  useEffect(() => {
    fetchCustomers();

    const handleOrdersUpdated = () => {
      fetchCustomers();
    };
    window.addEventListener('orders_updated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('orders_updated', handleOrdersUpdated);
    };
  }, [fetchCustomers]);

  return {
    customers,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm: (term) => {
      setSearchTerm(term);
      setCurrentPage(1);
    },
    customerType,
    setCustomerType: (type) => {
      setCustomerType(type);
      setCurrentPage(1);
    },
    sortBy,
    setSortBy: (sort) => {
      setSortBy(sort);
      setCurrentPage(1);
    },
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    refresh: fetchCustomers,
  };
}
