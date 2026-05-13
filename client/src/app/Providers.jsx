import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store';
import { Toaster } from '@/components/ui/Toast';
import { AuthBootstrap } from './AuthBootstrap';
import { SocketBootstrap } from './SocketBootstrap';
import { ThemeBootstrap } from './ThemeBootstrap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export const Providers = ({ children }) => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeBootstrap>
          <AuthBootstrap>
            <SocketBootstrap>
              {children}
              <Toaster />
            </SocketBootstrap>
          </AuthBootstrap>
        </ThemeBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);
