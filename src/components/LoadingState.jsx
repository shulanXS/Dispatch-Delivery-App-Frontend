import { Loader2 } from 'lucide-react';

export default function LoadingState({
  label = '加载中…',
  size = 'md',
  className = '',
}) {
  const dim = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-10 text-gray-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={`${dim} animate-spin text-blue-500`} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
