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
  return <>{children}</>;
}

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
