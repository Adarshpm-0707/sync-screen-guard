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

  useEffect(() => {
    // 1. Initial Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCustomer(session.user);
        try {
          localStorage.setItem('local_customer_user', JSON.stringify({ ...session.user, is_guest: false }));
        } catch (e) {}
      } else {
        const localUser = localStorage.getItem('local_customer_user');
        if (localUser) {
          try {
            setCustomer(JSON.parse(localUser));
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
        const userObj = { ...session.user, is_guest: false };
        setCustomer(userObj);
        try {
          localStorage.setItem('local_customer_user', JSON.stringify(userObj));
        } catch (e) {}
      } else {
        const localUser = localStorage.getItem('local_customer_user');
        if (localUser) {
          try {
            setCustomer(JSON.parse(localUser));
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
    setCustomer(user);
    if (user) {
      localStorage.setItem('local_customer_user', JSON.stringify(user));
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
