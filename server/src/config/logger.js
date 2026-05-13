const ts = () => new Date().toISOString();

const fmt = (level, args) =>
  `[${ts()}] [${level}] ${args
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ')}`;

export const logger = {
  info: (...args) => console.log(fmt('INFO', args)),
  warn: (...args) => console.warn(fmt('WARN', args)),
  error: (...args) => console.error(fmt('ERROR', args)),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') console.log(fmt('DEBUG', args));
  },
};
