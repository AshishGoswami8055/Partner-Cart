import { Button } from '@/components/ui/Button';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
    <path
      fill="#EA4335"
      d="M12 11v3.2h5.5c-.24 1.4-1.66 4.1-5.5 4.1A6.3 6.3 0 1 1 12 5.8c1.78 0 2.97.76 3.65 1.4l2.5-2.4A9.5 9.5 0 0 0 12 2.5a9.5 9.5 0 1 0 0 19c5.48 0 9.1-3.85 9.1-9.27 0-.62-.07-1.1-.16-1.58H12z"
    />
    <path fill="#34A853" d="M3.4 7.4l2.94 2.16C7.2 7.66 9.42 6.3 12 6.3c1.78 0 2.97.76 3.65 1.4l2.5-2.4A9.5 9.5 0 0 0 12 2.5a9.5 9.5 0 0 0-8.6 4.9z" opacity="0" />
    <path fill="#4285F4" d="M21.1 12.23c0-.62-.07-1.1-.16-1.58H12V14h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.32 0-6-2.74-6-6.1s2.68-6.1 6-6.1c1.78 0 2.97.76 3.65 1.4l2.5-2.4A9.5 9.5 0 0 0 12 2.5a9.5 9.5 0 1 0 0 19c5.48 0 9.1-3.85 9.1-9.27z" opacity="0" />
    <path fill="#4285F4" d="M21.1 12.23c0-.62-.07-1.1-.16-1.58H12V14h5.16c-.22 1.18-1.5 3.46-5.16 3.46-3.1 0-5.63-2.57-5.63-5.74S8.9 5.98 12 5.98c1.76 0 2.94.75 3.62 1.4l2.46-2.36A9.27 9.27 0 0 0 12 2.5a9.5 9.5 0 0 0 0 19c5.49 0 9.1-3.86 9.1-9.27z" />
    <path fill="#FBBC05" d="M5.93 14.2A5.7 5.7 0 0 1 5.6 12c0-.77.13-1.51.34-2.21L2.99 7.59A9.5 9.5 0 0 0 2.5 12c0 1.55.36 3.02.99 4.34l2.44-2.14z" />
    <path fill="#34A853" d="M12 21.5c2.57 0 4.72-.85 6.3-2.31l-3.04-2.36c-.84.58-1.97.99-3.26.99-2.5 0-4.62-1.69-5.38-3.97l-2.5 1.94A9.5 9.5 0 0 0 12 21.5z" />
    <path fill="#EA4335" d="M12 5.98c1.4 0 2.65.48 3.63 1.42l2.7-2.7A9.27 9.27 0 0 0 12 2.5 9.5 9.5 0 0 0 3 7.59l2.95 2.2A5.71 5.71 0 0 1 12 5.98z" />
  </svg>
);

export const GoogleButton = ({ label = 'Continue with Google', className }) => {
  const apiBase = import.meta.env.VITE_API_URL || '/api/v1';
  const href = `${apiBase}/auth/google`;
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => {
        window.location.href = href;
      }}
      leftIcon={<GoogleIcon />}
    >
      {label}
    </Button>
  );
};
