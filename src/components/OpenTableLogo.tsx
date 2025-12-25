import { cn } from '@/lib/utils';

interface OpenTableLogoProps {
  className?: string;
}

export function OpenTableLogo({ className }: OpenTableLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-5 h-5", className)}
      aria-label="OpenTable"
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}
