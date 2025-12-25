import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-serif">Ce Soir • Staff Training Portal</p>
          <p className="text-xs mt-1">© {new Date().getFullYear()} Ce Soir Restaurant</p>
        </div>
      </footer>
    </div>
  );
}
