import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<'loading' | 'ok' | 'unauth'>('loading');
  const location = useLocation();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (r.ok) setAuthStatus('ok');
        else setAuthStatus('unauth');
      })
      .catch(() => setAuthStatus('unauth'));
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071c2]"></div>
      </div>
    );
  }

  if (authStatus === 'unauth') {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <>{children}</>;
}

export function VendorProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to={`/vendor/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to={`/vendor/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }
    if (payload.role !== 'vendor' && payload.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem('token');
    return <Navigate to={`/vendor/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }
    if (payload.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem('token');
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
}
