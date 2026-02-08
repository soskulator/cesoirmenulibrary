import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        "fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-copper text-white shadow-lg flex items-center justify-center transition-opacity duration-300",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
