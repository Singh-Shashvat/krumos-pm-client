import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/reactQueryConfig';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ErrorBoundary } from 'react-error-boundary';
import NetworkWrapper, { NO_INTERNET_ERROR } from './components/NetworkWrapper';
import NoInternet from './components/NoInternet';
import ErrorFallback from './components/Error';
import Routes from './route/Routes';

const App: React.FC = () => {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) =>
        error instanceof Error && error.message === NO_INTERNET_ERROR ? (
          <NoInternet handleOnClick={() => window.location.reload()} />
        ) : (
          <ErrorFallback refresh backToHome={() => resetErrorBoundary()} />
        )
      }
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <NetworkWrapper>
                <Routes />
              </NetworkWrapper>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
