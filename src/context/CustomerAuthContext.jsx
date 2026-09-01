import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import CustomerAuthModal from '../components/layout/CustomerAuthModal';

export const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const local = localStorage.getItem('local_customer_user');
      return local ? JSON.parse(local) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'signin',
    redirectTo: null,
    onAuthSuccess: null,
    title: null,
    subtitle: null,
  });

  const formatUserWithMetadata = (user) => {
    if (!user) return null;
    const meta = user.user_metadata || {};
    const resolvedName = user.name || user.full_name || meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : '');
    return {
      ...user,
      name: resolvedName,
      full_name: resolvedName,
      email: user.email || '',
      is_guest: Boolean(user.is_guest),
    };
  };

  useEffect(() => {
    // 1. Initial Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const formatted = formatUserWithMetadata({ ...session.user, is_guest: false });
        setCustomer(formatted);
        try {
          localStorage.setItem('local_customer_user', JSON.stringify(formatted));
        } catch (e) {}
      } else {
        const localUser = localStorage.getItem('local_customer_user');
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            setCustomer(formatUserWithMetadata(parsed));
          } catch (e) {}
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Listen to Supabase auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const formatted = formatUserWithMetadata({ ...session.user, is_guest: false });
        setCustomer(formatted);
        try {
          localStorage.setItem('local_customer_user', JSON.stringify(formatted));
        } catch (e) {}
      } else {
        const localUser = localStorage.getItem('local_customer_user');
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            setCustomer(formatUserWithMetadata(parsed));
          } catch (e) {}
        } else {
          setCustomer(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isLoggedIn = Boolean(customer && !customer.is_guest);

  const openAuthModal = ({
    mode = 'signin',
    redirectTo = null,
    onAuthSuccess = null,
    title = null,
    subtitle = null,
  } = {}) => {
    setAuthModal({
      isOpen: true,
      mode,
      redirectTo,
      onAuthSuccess,
      title,
      subtitle,
    });
  };

  const closeAuthModal = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  const logout = async () => {
    localStorage.removeItem('local_customer_user');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    setCustomer(null);
  };

  const setCustomerUser = (user) => {
    const formatted = formatUserWithMetadata(user);
    setCustomer(formatted);
    if (formatted) {
      localStorage.setItem('local_customer_user', JSON.stringify(formatted));
    } else {
      localStorage.removeItem('local_customer_user');
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn,
        loading,
        openAuthModal,
        closeAuthModal,
        logout,
        setCustomer: setCustomerUser,
      }}
    >
      {children}
      {authModal.isOpen && (
        <CustomerAuthModal
          isOpen={authModal.isOpen}
          onClose={closeAuthModal}
          initialMode={authModal.mode}
          redirectTo={authModal.redirectTo}
          onAuthSuccess={(user) => {
            setCustomerUser(user);
            if (authModal.onAuthSuccess) {
              authModal.onAuthSuccess(user);
            }
          }}
          customTitle={authModal.title}
          customSubtitle={authModal.subtitle}
        />
      )}
    </CustomerAuthContext.Provider>
  );
}
