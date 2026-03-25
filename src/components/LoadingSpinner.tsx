import { useEffect, useState } from 'react';
import cesoirLogo from '@/assets/cesoir-logo.png';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ 
  message = 'Loading...' 
}: LoadingSpinnerProps) {
  const [lineStarted, setLineStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLineStarted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      {/* Logo */}
      <div className="animate-[logo-reveal_0.7s_ease-out_forwards]">
        <img
          src={cesoirLogo}
          alt="Ce Soir"
          className="h-12 w-auto"
        />
      </div>

      {/* Copper line that draws itself */}
      <div className="relative w-32 h-px bg-transparent overflow-hidden">
        <div
          className={[
            "absolute left-0 top-0 h-px",
            "bg-gradient-to-r from-transparent",
            "via-copper to-transparent",
            lineStarted
              ? "animate-[line-grow_1.2s_cubic-bezier(0.4,0,0.2,1)_forwards]"
              : "w-0 opacity-0",
          ].join(" ")}
        />
      </div>

      {/* Message */}
      {message && message !== 'Loading...' && (
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground/60 animate-[fade-in_0.5s_ease-out_0.8s_both]">
          {message}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;
