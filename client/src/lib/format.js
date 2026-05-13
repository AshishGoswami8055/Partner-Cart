export const formatCurrency = (value, currency = 'INR', locale = 'en-IN') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

export const formatNumber = (value, locale = 'en-IN') =>
  new Intl.NumberFormat(locale).format(Number(value || 0));

export const formatDate = (value, opts = {}) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', ...opts }).format(new Date(value));

export const formatRelative = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.round(sec / 86400)}d ago`;
  return formatDate(value);
};

export const truncate = (text, n = 80) =>
  !text ? '' : text.length > n ? `${text.slice(0, n).trim()}…` : text;
