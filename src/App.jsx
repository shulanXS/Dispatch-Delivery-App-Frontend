import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';

const AUTH_PATHS = new Set(['/login', '/signup']);

export default function App() {
  const { pathname } = useLocation();
  const showHeader = !AUTH_PATHS.has(pathname);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {showHeader && <Header />}
      <main className={showHeader ? 'pb-20' : ''}>
        <Outlet />
      </main>
    </div>
  );
}
