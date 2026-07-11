import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Secondary sticky header that sits below the global Header.
 * Use this on any page that has its own title row with a back button.
 * Override the height of the parent via `--header-h` (default 56px).
 */
export default function PageHeader({
  title,
  subtitle,
  back,
  backTo = -1,
  right,
  className = '',
}) {
  const TitleTag = typeof title === 'string' ? 'h1' : 'div';
  return (
    <div
      className={`sticky top-[var(--header-h)] z-30 bg-white/95 backdrop-blur px-4 py-3 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        {back && (
          <Link to={backTo} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <TitleTag className="font-bold text-gray-800 truncate text-base">
            {title}
          </TitleTag>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </div>
  );
}
