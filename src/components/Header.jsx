import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-800">派送配送</span>
        </Link>
      </div>
    </header>
  );
}
