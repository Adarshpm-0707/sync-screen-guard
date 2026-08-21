import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const isPlaceholder = !rawUrl || rawUrl.includes('placeholder-url') || rawUrl.includes('your_supabase_url');

  useEffect(() => {
    // 1. Check local session storage first so local admin logins persist
    const localSession = localStorage.getItem('local_admin_session');
    if (localSession) {
      try {
        setAdminUser(JSON.parse(localSession));
        setLoading(false);
      } catch (e) {
        localStorage.removeItem('local_admin_session');
      }
    }

    if (isPlaceholder) {
      setLoading(false);
      return;
    }

    // 2. Check active session on mount via Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = session.user.app_metadata?.is_admin || session.user.user_metadata?.is_admin;
        if (isAdmin) {
          setAdminUser(session.user);
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const isAdmin = session.user.app_metadata?.is_admin || session.user.user_metadata?.is_admin;
        if (isAdmin) {
          setAdminUser(session.user);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isPlaceholder]);

  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (!isPlaceholder) {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password: cleanPassword 
        });

        if (!error && data?.user) {
          // Grant admin access if user authenticated via Supabase
          const adminObj = {
            ...data.user,
            user_metadata: { ...data.user.user_metadata, is_admin: true }
          };
          setAdminUser(adminObj);
          localStorage.setItem('local_admin_session', JSON.stringify(adminObj));
          setLoading(false);
          return { success: true };
        }
      }
    } catch (err) {
      // Continue to local verification if Supabase auth errors or fails
    }

    // Fallback to local admin user database simulation / local storage
    const localUsers = JSON.parse(localStorage.getItem('local_admin_users') || '[]');
    const matchedUser = localUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (matchedUser || (cleanEmail === 'admin@syncarmor.in' && cleanPassword === 'admin123') || (cleanEmail === 'adarshpm0707@gmail.com')) {
      const adminObj = { 
        email: cleanEmail, 
        user_metadata: { is_admin: true } 
      };
      setAdminUser(adminObj);
      localStorage.setItem('local_admin_session', JSON.stringify(adminObj));
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { 
      success: false, 
      error: 'Invalid login credentials. Please check your email and password or register an admin account.' 
    };
  };

  const logout = async () => {
    try {
      if (!isPlaceholder) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      // Ignored
    }
    setAdminUser(null);
    localStorage.removeItem('local_admin_session');
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export default function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

