import { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/cn';

const TabsContext = createContext(null);

export const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internal, setInternal] = useState(defaultValue);
  const v = value ?? internal;
  const setV = (next) => {
    setInternal(next);
    onValueChange?.(next);
  };
  return (
    <TabsContext.Provider value={{ value: v, setValue: setV }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => (
  <div className={cn('inline-flex items-center gap-1 rounded-lg bg-muted p-1', className)}>
    {children}
  </div>
);

export const TabsTrigger = ({ value, children, className }) => {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition',
        active
          ? 'bg-card text-foreground shadow-soft'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }) => {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn('mt-4 animate-fade-in', className)}>{children}</div>;
};
