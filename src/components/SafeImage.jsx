import { useState } from 'react';

export default function SafeImage({ src, alt, fallback = '🛒', className = '', ...rest }) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-3xl ${className}`}
        role="img"
        aria-label={alt}
        {...rest}
      >
        <span>{fallback}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={className}
      {...rest}
    />
  );
}
