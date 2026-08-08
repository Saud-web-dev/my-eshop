import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { authAPI } from '@services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  accessToken: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload.user, accessToken: action.payload.accessToken, isAuthenticated: true, loading: false };
    case 'CLEAR_USER':
      return { ...state, user: null, accessToken: null, isAuthenticated: false, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Bootstrap: load user on app start ────────────────────────────────────
  const loadUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('accessToken');

      if (storedToken) {
        // Token exists — try to get user directly
        try {
          const { data } = await authAPI.getMe();
          dispatch({ type: 'SET_USER', payload: { user: data.user, accessToken: storedToken } });
          return;
        } catch {
          // Token is invalid/expired — remove it and fall through to refresh
          localStorage.removeItem('accessToken');
        }
      }

      // No valid token — silently try refresh cookie (only if user had previously logged in)
      // We don't want to spam 401 on every page load for guest visitors,
      // so we check for the refreshToken cookie existence first via a flag
      const hadSession = sessionStorage.getItem('hadSession');
      if (!hadSession) {
        dispatch({ type: 'CLEAR_USER' });
        return;
      }

      try {
        const { data } = await authAPI.refreshToken();
        if (data.success) {
          localStorage.setItem('accessToken', data.accessToken);
          const meRes = await authAPI.getMe();
          dispatch({ type: 'SET_USER', payload: { user: meRes.data.user, accessToken: data.accessToken } });
          return;
        }
      } catch {
        // Refresh failed — clear session flag and treat as guest
        sessionStorage.removeItem('hadSession');
      }

      dispatch({ type: 'CLEAR_USER' });
    } catch {
      localStorage.removeItem('accessToken');
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    return data;
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOTP = async (payload) => {
    const { data } = await authAPI.verifyOTP(payload);
    if (data.success && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('hadSession', '1');
      dispatch({ type: 'SET_USER', payload: { user: data.user, accessToken: data.accessToken } });
    }
    return data;
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    if (data.success) {
      localStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('hadSession', '1'); // enable refresh on next load
      dispatch({ type: 'SET_USER', payload: { user: data.user, accessToken: data.accessToken } });
    }
    return data;
  };

  // ── Google Auth ───────────────────────────────────────────────────────────
  const googleAuth = async (credential, role = 'user') => {
    const { data } = await authAPI.googleAuth({ credential, role });
    if (data.success) {
      localStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('hadSession', '1');
      dispatch({ type: 'SET_USER', payload: { user: data.user, accessToken: data.accessToken } });
    }
    return data;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('hadSession');
    dispatch({ type: 'CLEAR_USER' });
    toast.success('Logged out successfully');
  };

  // ── Update user in state ──────────────────────────────────────────────────
  const updateUser = (payload) => dispatch({ type: 'UPDATE_USER', payload });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isAdmin = state.user?.role === 'admin';
  const isUser  = state.user?.role === 'user';

  return (
    <AuthContext.Provider value={{
      ...state,
      isAdmin,
      isUser,
      register,
      verifyOTP,
      login,
      googleAuth,
      logout,
      updateUser,
      loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
