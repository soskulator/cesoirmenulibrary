import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function LazyImage({ src, alt, className, containerClassName }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Gray placeholder background with blur effect */}
      <div
        className={cn(
          "absolute inset-0 bg-muted/50 transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      >
        {/* Optional shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent animate-pulse" />
      </div>

      {/* Actual image with native lazy loading */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-all duration-150",
          isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
          className
        )}
      />
    </div>
  );
}
