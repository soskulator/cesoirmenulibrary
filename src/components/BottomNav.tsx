import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Search, CreditCard, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { HeaderSearch } from './HeaderSearch';

const items = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/categories', label: 'Menu', icon: Layers },
  { path: '__search__', label: 'Search', icon: Search },
  { path: '/flashcards', label: 'Cards', icon: CreditCard },
  { path: '/allergy', label: 'Allergy', icon: AlertTriangle },
];

const hidePaths = ['/auth', '/reset-password'];

export function BottomNav() {
  const location = useLocation();

  if (hidePaths.includes(location.pathname)) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border h-16 flex items-center justify-around px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 min-w-[60px]',
              isActive ? 'text-copper' : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] tracking-wide font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
