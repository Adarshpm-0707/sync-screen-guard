import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CustomerThemeContext = createContext();

const COLOR_NAME_MAP = {
  blue:   '#3b82f6',
  orange: '#f97316',
  pink:   '#f43f5e',
  green:  '#10b981',
  purple: '#a855f7',
  teal:   '#14b8a6',
  amber:  '#f59e0b',
  indigo: '#6366f1',
  red:    '#ef4444',
  cyan:   '#06b6d4',
};

function normalizeColorToHex(color) {
  if (!color) return '#3b82f6';
  if (color.startsWith('#')) return color;
  return COLOR_NAME_MAP[color.toLowerCase()] || '#3b82f6';
}

function buildThemeFromRgb(r, g, b) {
  const nr = r / 255, ng = g / 255, nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case nr: h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6; break;
      case ng: h = ((nb - nr) / d + 2) / 6; break;
      case nb: h = ((nr - ng) / d + 4) / 6; break;
    }
  }
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(Math.min(s * 100, 75));

  return {
    bgFrom: `hsl(${hDeg}, ${Math.min(sPct + 10, 80)}%, 72%)`,
    bgMid:  `hsl(${hDeg}, ${Math.min(sPct, 60)}%, 84%)`,
    bgTo:   `hsl(${hDeg}, ${Math.min(sPct, 30)}%, 96%)`,
    glow1: `hsla(${hDeg}, ${Math.min(sPct + 10, 90)}%, 60%, 0.65)`,
    glow2: `hsla(${(hDeg + 30) % 360}, ${Math.max(sPct, 40)}%, 65%, 0.45)`,
    glow3: `hsla(${hDeg}, ${Math.min(sPct, 50)}%, 80%, 0.60)`,
    gradFrom: `hsl(${hDeg}, ${Math.min(sPct, 80)}%, 20%)`,
    gradMid:  `hsl(${(hDeg + 20) % 360}, ${Math.min(sPct, 80)}%, 16%)`,
    gradTo:   `hsl(${hDeg}, ${Math.min(sPct, 80)}%, 12%)`,
  };
}

export function CustomerThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(() => buildThemeFromRgb(59, 130, 246));

  const updateThemeByColor = (colorHexOrName) => {
    const hex = normalizeColorToHex(colorHexOrName);
    const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      setActiveTheme(buildThemeFromRgb(r, g, b));
    }
  };

  useEffect(() => {
    async function initTheme() {
      try {
        const { data } = await supabase.from('products').select('theme_color').limit(1).maybeSingle();
        if (data?.theme_color) {
          updateThemeByColor(data.theme_color);
        }
      } catch (e) {
        console.warn('Theme init exception:', e);
      }
    }
    initTheme();
  }, []);

  return (
    <CustomerThemeContext.Provider value={{ activeTheme, updateThemeByColor }}>
      {children}
    </CustomerThemeContext.Provider>
  );
}

export function useCustomerTheme() {
  return useContext(CustomerThemeContext);
}
