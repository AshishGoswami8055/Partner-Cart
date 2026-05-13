import { Providers } from '@/app/Providers';
import { AppRouter } from '@/routes/AppRouter';

export default function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
