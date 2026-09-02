import DOMPurify from 'dompurify';

/**
 * Client-Side Security Suite & Application Hardening
 */

/**
 * 1. Initialize Client Security Protections
 */
export function initClientSecurity() {
  if (typeof window === 'undefined') return;

  // Anti-Clickjacking: Break out of unauthorized iframes
  try {
    if (window.top && window.top !== window.self) {
      const allowedParents = ['https://syncforall.com', 'https://www.syncforall.com', 'http://localhost:5173'];
      const parentOrigin = document.referrer ? new URL(document.referrer).origin : '';
      
      if (!allowedParents.includes(parentOrigin)) {
        window.top.location = window.self.location.href;
      }
    }
  } catch (e) {
    // Cross-origin iframe framebusting fallback
    try {
      if (window.top) {
        window.top.location = window.self.location.href;
      }
    } catch (err) {
      // Handled by CSP frame-ancestors
    }
  }

  // Production Security Notice & Anti-Tampering Console Message
  if (import.meta.env.PROD) {
    const bannerStyle = 'font-size: 24px; font-weight: bold; color: #DC2626; -webkit-text-stroke: 1px black;';
    const textStyle = 'font-size: 14px; font-weight: 500; color: #374151;';
    
    setTimeout(() => {
      console.log('%c⚠️ SECURITY WARNING', bannerStyle);
      console.log(
        '%cThis browser console is intended for developers only. Do NOT paste or run unknown scripts here. Unauthorized tampering with Sync Screen Guard client mechanisms violates store terms.',
        textStyle
      );
    }, 1000);
  }
}

/**
 * 2. Sanitize User Inputs & HTML strings (XSS Defense)
 */
export function sanitizeText(input) {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip ALL HTML tags by default for simple text inputs
    ALLOWED_ATTR: []
  }).trim();
}

/**
 * 3. Sanitize Rich HTML (allows safe formatting like bold, breaks)
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}

/**
 * 4. Mask Sensitive Identifiers (Emails, Phones, Transaction IDs)
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const maskedName = name.length > 2 
    ? `${name.slice(0, 2)}***${name.slice(-1)}` 
    : `${name.slice(0, 1)}***`;
  return `${maskedName}@${domain}`;
}

export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return phone;
  return `${cleaned.slice(0, 2)}******${cleaned.slice(-2)}`;
}

/**
 * 5. Secure Local Storage Wrapper
 */
export const secureStorage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};
