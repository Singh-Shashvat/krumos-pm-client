import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { globalToast } from '../context/ToastContext';
import { getMessageFromError } from '../utils';
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        globalToast.error(getMessageFromError(error));
      }
    },
  }),

  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) return;
      globalToast.error(getMessageFromError(error));
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
