import { Outlet } from 'react-router-dom';
import Header from './components/Header';

export default function App({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20">
        <Outlet />
      </main>
    </div>
  );
}
