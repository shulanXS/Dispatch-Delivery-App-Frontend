function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  // Backend may emit LocalDateTime as "2026-01-02T13:45:00"
  // or w/ offset "2026-01-02T13:45:00.123" — treat as local.
  const str = String(value).replace(' ', 'T');
  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(str);
  const date = hasTimezone ? new Date(str) : new Date(str);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats an ISO/LocalDateTime-like string into "HH:mm". */
export function formatTime(value) {
  const d = toDate(value);
  if (!d) return null;
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Formats an ISO/LocalDateTime-like string into "MM/dd HH:mm". */
export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Formats money values safely. */
export function formatMoney(value, fractionDigits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  return Number(value).toFixed(fractionDigits);
}

/** Returns a delta-style label: "刚刚" / "12 分钟前" / "2 小时前" / "刚刚". */
export function formatRelative(value) {
  const d = toDate(value);
  if (!d) return null;
  const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
  if (diffSec < 30) return '刚刚';
  if (diffSec < 60) return `${diffSec} 秒前`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  return `${day} 天前`;
}
