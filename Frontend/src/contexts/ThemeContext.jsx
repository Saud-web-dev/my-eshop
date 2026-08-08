import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsAPI } from '@services/api';

const ThemeContext = createContext(null);

// Detect system preference
const getSystemMode = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const THEME_PREF_KEY = 'zf_theme_mode';

const DEFAULT_THEME = {
  mode: getSystemMode(), // resolved mode (light/dark) applied to the DOM
  primaryColor: '#1a1a2e',
  secondaryColor: '#16213e',
  accentColor: '#e94560',
  fontFamily: 'Inter',
  borderRadius: 'md',
  buttonStyle: 'rounded',
};

// Read stored preference ('system' | 'light' | 'dark') — defaults to 'system'
const getStoredMode = () => {
  try {
    const stored = localStorage.getItem(THEME_PREF_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
};

const hexToRgb = (hex) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? `${parseInt(r[1], 16)} ${parseInt(r[2], 16)} ${parseInt(r[3], 16)}`
    : null;
};

export const applyTheme = (theme) => {
  const root = document.documentElement;

  if (theme.mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');

  if (theme.accentColor) {
    const rgb = hexToRgb(theme.accentColor);
    if (rgb) {
      root.style.setProperty('--color-accent', rgb);
      const darken = theme.accentColor
        .replace(/^#/, '')
        .match(/.{2}/g)
        .map(c => Math.max(0, parseInt(c, 16) - 20).toString(16).padStart(2, '0'))
        .join('');
      root.style.setProperty('--color-accent-hover', hexToRgb(`#${darken}`) || rgb);
    }
  }

  if (theme.fontFamily)
    root.style.setProperty('--font-sans', `'${theme.fontFamily}', system-ui, sans-serif`);

  const radii = { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' };
  if (theme.borderRadius) {
    root.style.setProperty('--radius-btn',  radii[theme.borderRadius] ?? '0.5rem');
    root.style.setProperty('--radius-card', radii[theme.borderRadius] ?? '0.75rem');
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme]               = useState({ ...DEFAULT_THEME, mode: getSystemMode() });
  const [modePref, setModePref]         = useState(getStoredMode); // 'system' | 'light' | 'dark'
  const [storeSettings, setStoreSettings] = useState(null);
  const [loading, setLoading]           = useState(true);

  const resolveMode = useCallback((pref = modePref) => {
    if (pref === 'system') return getSystemMode();
    return pref;
  }, [modePref]);

  // Apply the resolved theme mode to the DOM
  const applyCurrent = useCallback((pref) => {
    setTheme(prev => {
      const next = { ...prev, mode: resolveMode(pref) };
      applyTheme(next);
      return next;
    });
  }, [resolveMode]);

  // Apply system theme immediately on mount (before paint if possible)
  useEffect(() => {
    applyCurrent(modePref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for system dark mode changes — auto-detect when in 'system' mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (modePref === 'system') applyCurrent('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [modePref, applyCurrent]);

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await settingsAPI.getSettings();
      if (data.success && data.data) {
        setStoreSettings(data.data);
        // Merge stored theme with current default — mode always follows system
        // unless the visitor manually chose a preference.
        const serverTheme = data.data.theme || {};
        const merged = { ...DEFAULT_THEME, ...serverTheme, mode: resolveMode() };
        setTheme(merged);
        applyTheme(merged);

        // Update document title to store name
        if (data.data.storeName) {
          document.title = data.data.storeName;
        }

        // Set favicon if configured
        if (data.data.favicon?.url) {
          const link = document.getElementById('favicon');
          if (link) link.href = data.data.favicon.url;
        }
      }
    } catch {
      // Backend not ready — use defaults silently
    } finally {
      setLoading(false);
    }
  }, [resolveMode]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const updateTheme = useCallback((updates) => {
    setTheme(prev => {
      const next = { ...prev, ...updates };
      applyTheme(next);
      return next;
    });
  }, []);

  const setMode = useCallback((pref) => {
    localStorage.setItem(THEME_PREF_KEY, pref);
    setModePref(pref);
    applyCurrent(pref);
  }, [applyCurrent]);

  const toggleDarkMode = useCallback(() => {
    // Cycle: system → dark → light
    if (modePref === 'system') setMode('dark');
    else if (modePref === 'dark') setMode('light');
    else setMode('system');
  }, [modePref, setMode]);

  return (
    <ThemeContext.Provider value={{
      theme,
      storeSettings,
      loading,
      isDark: theme.mode === 'dark',
      modePref,
      updateTheme,
      setMode,
      toggleDarkMode,
      loadSettings,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
