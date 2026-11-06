import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from './App';

// Global logout event (fired by axios interceptor on 401)
window.addEventListener('auth:logout', () => {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('hadSession');
  window.location.href = '/login';
});

// StrictMode stays disabled to avoid development-only remounts of OAuth widgets.
createRoot(document.getElementById('root')).render(<App />);
