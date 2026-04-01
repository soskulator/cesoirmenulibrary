import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Search, CreditCard, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { HeaderSearch } from './HeaderSearch';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/categories', label: 'Menu', icon: Layers },
  { path: '__search__', label: 'Search', icon: Search },
  { path: '/flashcards', label: 'Cards', icon: CreditCard },
  { path: '/allergy', label: 'Allergy', icon: AlertTriangle },
];

const hidePaths = ['/auth', '/reset-password'];

export function BottomNav() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  if (hidePaths.includes(location.pathname)) return null;

  return (
    <>
      <HeaderSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} origin="bottom" />
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border h-16 md:h-20 flex items-center justify-around px-2 md:px-6" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map((item) => {
          if (item.path === '__search__') {
            return (
              <button
                key={item.path}
                onClick={() => setSearchOpen(true)}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-[52px] text-muted-foreground active:text-copper transition-colors"
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-[10px] md:text-xs tracking-wide font-medium">{item.label}</span>
              </button>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 min-w-[52px]',
                isActive ? 'text-copper' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-xs tracking-wide font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
