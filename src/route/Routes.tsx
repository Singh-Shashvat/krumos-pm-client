import React from 'react';
import { Routes as ReactRouterRoutes, Route, Navigate } from 'react-router-dom';
import { APP_ROUTES } from './index';
import { useAuth } from '../context/AuthContext';
import WorkspaceLayout from '../components/WorkspaceLayout';
import Login from '../pages/Login';
import AuthCallback from '../pages/AuthCallback';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';
import Board from '../pages/Board';
import AcceptInvite from '../pages/AcceptInvite';

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-bone text-ink select-none font-sans">
    <div className="space-y-4 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-ink mx-auto"></div>
      <p className="krumos-eyebrow text-sm">Validating Secure Session...</p>
    </div>
  </div>
);

// Protected Route Guard Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  // Handle guest invitation acceptance redirects
  const inviteToken = sessionStorage.getItem('krumos_invite_token');
  if (inviteToken) {
    return (
      <Navigate
        to={`${APP_ROUTES.ACCEPT_INVITE}?token=${inviteToken}`}
        replace
      />
    );
  }

  // Redirect to workspace creation onboarding if user doesn't belong to any
  if (!user.hasWorkspaces) {
    return <Navigate to={APP_ROUTES.ONBOARDING} replace />;
  }

  return <>{children}</>;
};

// Onboarding Route Guard Wrapper
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  if (user.hasWorkspaces) {
    return <Navigate to={APP_ROUTES.ROOT} replace />;
  }

  return <>{children}</>;
};

// Login Route Guard Wrapper
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    // If they have workspaces go home, else onboarding
    if (user.hasWorkspaces) {
      return <Navigate to={APP_ROUTES.ROOT} replace />;
    } else {
      return <Navigate to={APP_ROUTES.ONBOARDING} replace />;
    }
  }

  return <>{children}</>;
};

const Routes: React.FC = () => {
  return (
    <ReactRouterRoutes>
      {/* Public / Callback routes */}
      <Route
        path={APP_ROUTES.LOGIN}
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route path={APP_ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />

      {/* Accept invite portal (accessible when logged in or guest) */}
      <Route path={APP_ROUTES.ACCEPT_INVITE} element={<AcceptInvite />} />

      {/* Onboarding Workspace creation */}
      <Route
        path={APP_ROUTES.ONBOARDING}
        element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        }
      />

      {/* Main Workspace Workspace Layout Portal Shell */}
      <Route
        path={APP_ROUTES.ROOT}
        element={
          <ProtectedRoute>
            <WorkspaceLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="board" element={<Board />} />
        <Route path="members" element={<Members />} />
        {/* Redirect unknown routes */}
        <Route
          path={APP_ROUTES.NOT_FOUND}
          element={<Navigate to={APP_ROUTES.ROOT} replace />}
        />
      </Route>
    </ReactRouterRoutes>
  );
};

export default Routes;
