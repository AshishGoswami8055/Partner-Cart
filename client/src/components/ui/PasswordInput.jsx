import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from './Input';

export const PasswordInput = forwardRef(function PasswordInput(
  { withLockIcon = true, ...props },
  ref
) {
  const [show, setShow] = useState(false);
  return (
    <Input
      ref={ref}
      type={show ? 'text' : 'password'}
      leftIcon={withLockIcon ? <Lock className="h-4 w-4" /> : null}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
});
