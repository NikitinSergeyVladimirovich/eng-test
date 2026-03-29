import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [state, setState] = useState<'loading' | 'ok' | 'no'>('loading');

  useEffect(() => {
    void apiService.loadSession().then((ok) => {
      setState(ok ? 'ok' : 'no');
    });
  }, []);

  if (state === 'loading') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Загрузка...
      </div>
    );
  }

  if (state === 'no') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
