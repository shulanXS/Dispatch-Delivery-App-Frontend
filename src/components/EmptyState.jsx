export default function EmptyState({
  icon = '📭',
  title = '暂无内容',
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-2 px-6 py-12 text-gray-500 ${className}`}
    >
      <div className="text-5xl floaty" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-base font-medium text-gray-700">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
