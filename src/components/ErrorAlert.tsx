import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  title?: string;
  message: string;
  className?: string;
  onRetry?: () => void;
}

export function ErrorAlert({
  title = 'Ha ocurrido un error',
  message,
  className,
  onRetry,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive',
        className
      )}
    >
      <p className="font-semibold">{title}</p>
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 self-start text-sm font-medium underline underline-offset-4 hover:no-underline"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
