import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { getAdminAuthHeaders } from '../utils/adminAuth';
import useAdminAuth from './useAdminAuth';

const DEFAULT_ROOT_ADMINS = [
  {
    id: 'admin-root-001',
    email: 'syncallfyp@gmail.com',
    name: 'Sync Superadmin',
    role: 'superadmin',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    last_sign_in_at: new Date().toISOString(),
    is_root: true,
  },
  {
    id: 'admin-sec-002',
    email: 'adarshpm0707@gmail.com',
    name: 'Adarsh P M',
    role: 'superadmin',
    status: 'active',
    created_at: '2025-01-15T00:00:00.000Z',
    last_sign_in_at: new Date().toISOString(),
    is_root: false,
  },
  {
    id: 'admin-sec-003',
    email: 'admin@syncarmor.in',
    name: 'Sync Security Admin',
    role: 'admin',
    status: 'active',
    created_at: '2025-01-20T00:00:00.000Z',
    last_sign_in_at: new Date().toISOString(),
    is_root: false,
  }
];

export default function useAdmins() {
  const { adminUser } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load admins from local storage and default records
  const getLocalAdminRecords = useCallback(() => {
    let list = [...DEFAULT_ROOT_ADMINS];

    try {
      const localUsers = JSON.parse(localStorage.getItem('local_admin_users') || '[]');
      localUsers.forEach((u, idx) => {
        const email = (u.email || '').toLowerCase().trim();
        if (!email) return;

        const existingIdx = list.findIndex(a => a.email.toLowerCase() === email);
        if (existingIdx >= 0) {
          list[existingIdx] = {
            ...list[existingIdx],
            name: u.name || list[existingIdx].name,
            role: u.role || list[existingIdx].role,
            status: u.status || list[existingIdx].status,
          };
        } else {
          list.push({
            id: u.id || `local-admin-${idx + 1}-${Date.now()}`,
            email,
            name: u.name || email.split('@')[0],
            role: u.role || 'admin',
            status: u.status || 'active',
            created_at: u.created_at || new Date().toISOString(),
            last_sign_in_at: u.last_sign_in_at || null,
            is_root: false,
          });
        }
      });
    } catch (e) {
      console.warn('Error reading local_admin_users:', e);
    }

    // Ensure current active logged-in admin is in the list
    if (adminUser?.email) {
      const activeEmail = adminUser.email.toLowerCase().trim();
      const currentIdx = list.findIndex(a => a.email.toLowerCase() === activeEmail);
      const activeName = adminUser.user_metadata?.name || adminUser.user_metadata?.display_name || activeEmail.split('@')[0];
      const activeRole = adminUser.user_metadata?.role || (activeEmail === 'admin@syncarmor.in' ? 'superadmin' : 'admin');

      if (currentIdx >= 0) {
        list[currentIdx] = {
          ...list[currentIdx],
          name: activeName || list[currentIdx].name,
          role: list[currentIdx].is_root ? 'superadmin' : (activeRole || list[currentIdx].role),
          last_sign_in_at: new Date().toISOString(),
          status: 'active',
        };
      } else {
        list.push({
          id: adminUser.id || `active-admin-${Date.now()}`,
          email: activeEmail,
          name: activeName,
          role: activeRole,
          status: 'active',
          created_at: adminUser.created_at || new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          is_root: false,
        });
      }
    }

    return list;
  }, [adminUser]);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);

    let apiAdmins = null;

    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch('http://localhost:5000/api/admin/admins', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.admins) {
          apiAdmins = data.admins;
        }
      }
    } catch (apiErr) {
      // Backend not running or in offline dev mode
    }

    if (apiAdmins && Array.isArray(apiAdmins) && apiAdmins.length > 0) {
      // Merge with local records so no newly created local admin is lost
      const localList = getLocalAdminRecords();
      const merged = [...apiAdmins];

      localList.forEach(loc => {
        if (!merged.some(m => m.email?.toLowerCase() === loc.email?.toLowerCase())) {
          merged.push(loc);
        }
      });

      setAdmins(merged);
    } else {
      setAdmins(getLocalAdminRecords());
    }

    setLoading(false);
  }, [getLocalAdminRecords]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Create new admin
  const createAdmin = async ({ name, email, role, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();
    const adminRole = role || 'admin';

    // 1. Check duplicate
    if (admins.some(a => a.email.toLowerCase() === cleanEmail)) {
      throw new Error('An administrator with this email address already exists.');
    }

    // 2. Persist to local admin database
    const localUsers = JSON.parse(localStorage.getItem('local_admin_users') || '[]');
    const existingIndex = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
    const newRecord = {
      id: `admin-${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      role: adminRole,
      password: password.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
      is_root: false,
    };

    if (existingIndex >= 0) {
      localUsers[existingIndex] = { ...localUsers[existingIndex], ...newRecord };
    } else {
      localUsers.push(newRecord);
    }
    localStorage.setItem('local_admin_users', JSON.stringify(localUsers));

    // 3. Try Supabase Auth Sign Up if keys configured
    const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const isPlaceholder = !rawUrl || rawUrl.includes('placeholder-url') || rawUrl.includes('your_supabase_url');
    if (!isPlaceholder) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: password.trim(),
          options: {
            data: {
              name: cleanName,
              role: adminRole,
              is_admin: true,
            },
          },
        });
      } catch (err) {
        console.warn('Supabase direct signUp note:', err);
      }
    }

    // 4. Try Backend API
    try {
      const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
      await fetch('http://localhost:5000/api/admin/admins', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: cleanEmail,
          password: password.trim(),
          name: cleanName,
          role: adminRole,
        }),
      });
    } catch (e) {
      // Backend unavailable, fallback is already stored
    }

    await fetchAdmins();
    return { success: true };
  };

  // Update admin role or status
  const updateAdmin = async (id, updates) => {
    // 1. Update in local storage
    const localUsers = JSON.parse(localStorage.getItem('local_admin_users') || '[]');
    const userIndex = localUsers.findIndex(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
    if (userIndex >= 0) {
      localUsers[userIndex] = { ...localUsers[userIndex], ...updates };
      localStorage.setItem('local_admin_users', JSON.stringify(localUsers));
    }

    // 2. Try Backend API
    try {
      const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
      await fetch(`http://localhost:5000/api/admin/admins/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });
    } catch (e) {
      // Backend error fallback
    }

    await fetchAdmins();
    return { success: true };
  };

  // Delete admin
  const deleteAdmin = async (adminToDelete) => {
    const targetEmail = adminToDelete.email?.toLowerCase();
    const activeEmail = adminUser?.email?.toLowerCase();

    if (adminToDelete.is_root || targetEmail === 'admin@syncarmor.in') {
      throw new Error('Primary root administrator account cannot be deleted.');
    }

    if (targetEmail === activeEmail) {
      throw new Error('You cannot delete your own active administrator account.');
    }

    // 1. Remove from local storage
    const localUsers = JSON.parse(localStorage.getItem('local_admin_users') || '[]');
    const filtered = localUsers.filter(
      u => u.id !== adminToDelete.id && u.email.toLowerCase() !== targetEmail
    );
    localStorage.setItem('local_admin_users', JSON.stringify(filtered));

    // 2. Try Backend API
    try {
      const headers = await getAdminAuthHeaders();
      await fetch(`http://localhost:5000/api/admin/admins/${encodeURIComponent(adminToDelete.id)}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {
      // Ignored
    }

    await fetchAdmins();
    return { success: true };
  };

  // Filtered admins list
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const search = searchTerm.toLowerCase().trim();
      const matchSearch = !search ||
        (admin.name && admin.name.toLowerCase().includes(search)) ||
        (admin.email && admin.email.toLowerCase().includes(search));

      const matchRole = roleFilter === 'all' || (admin.role && admin.role.toLowerCase() === roleFilter.toLowerCase());
      const matchStatus = statusFilter === 'all' || (admin.status && admin.status.toLowerCase() === statusFilter.toLowerCase());

      return matchSearch && matchRole && matchStatus;
    });
  }, [admins, searchTerm, roleFilter, statusFilter]);

  // Derived KPI Stats
  const stats = useMemo(() => {
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter(a => a.status === 'active' || !a.status).length;
    const superAdminsCount = admins.filter(a => a.role === 'superadmin' || a.is_root).length;
    const managerCount = admins.filter(a => a.role === 'manager' || a.role === 'moderator').length;

    return {
      totalAdmins,
      activeAdmins,
      superAdminsCount,
      managerCount,
    };
  }, [admins]);

  return {
    admins: filteredAdmins,
    allAdmins: admins,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    refresh: fetchAdmins,
  };
}
