import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, Bell } from 'lucide-react';
import { removeToast } from '@/store/slices/toastSlice';
import { cn } from '@/lib/cn';

const tones = {
  default: { icon: Bell, ring: 'ring-border', accent: 'bg-foreground/5' },
  success: { icon: CheckCircle2, ring: 'ring-success/30', accent: 'bg-success/10' },
  destructive: { icon: XCircle, ring: 'ring-destructive/30', accent: 'bg-destructive/10' },
  info: { icon: Info, ring: 'ring-info/30', accent: 'bg-info/10' },
};

const ToastItem = ({ toast }) => {
  const dispatch = useDispatch();
  const { icon: Icon, ring, accent } = tones[toast.tone] || tones.default;

  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      className={cn(
        'flex w-80 items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-elevated ring-1',
        ring
      )}
    >
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', accent)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
        {toast.description && (
          <div className="text-xs text-muted-foreground">{toast.description}</div>
        )}
      </div>
    </motion.div>
  );
};

export const Toaster = () => {
  const items = useSelector((s) => s.toast.items);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
