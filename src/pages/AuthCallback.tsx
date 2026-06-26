import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAppNavigate from '../hooks/useAppNavigate';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useAppNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('krumos_token', token);
      refreshUser().then(() => {
        navigate.toRoot();
      });
    } else {
      navigate.toLogin();
    }
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bone text-ink">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ink mx-auto"></div>
        <p className="krumos-eyebrow text-sm">Synchronizing credentials...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
