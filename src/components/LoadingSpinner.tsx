import cesoirLogo from '@/assets/cesoir-logo.png';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <img
        src={cesoirLogo}
        alt="Ce Soir"
        className="h-10 w-auto animate-[pulse-logo_1.5s_ease-in-out_infinite]"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
