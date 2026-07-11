import { AlertTriangle } from 'lucide-react';

export default function ErrorState({
  message = '加载失败，请稍后再试',
  onRetry,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-2 px-6 ${
        compact ? 'py-4' : 'py-12'
      } ${className}`}
      role="alert"
    >
      <AlertTriangle className={`${compact ? 'w-6 h-6' : 'w-10 h-10'} text-amber-500`} />
      <p
        className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 max-w-md`}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 px-4 py-1.5 rounded-md border border-blue-100 hover:border-blue-200 transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
}
