import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Layers, 
  CreditCard, 
  HelpCircle, 
  Star, 
  Settings,
  AlertTriangle,
  Menu,
  X,
  Instagram,
  Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import cesoirLogo from '@/assets/cesoir-logo.png';
import { OpenTableLogo } from './OpenTableLogo';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/categories', label: 'Categories', icon: Layers },
  { path: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { path: '/quiz', label: 'Quiz', icon: HelpCircle },
  { path: '/daily-focus', label: 'Daily Focus', icon: Star },
  { path: '/allergy-check', label: 'Allergy Check', icon: AlertTriangle },
];

const adminItems = [
  { path: '/admin', label: 'Admin', icon: Settings },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={cesoirLogo} 
            alt="Ce Soir" 
            className="h-10 w-auto"
          />
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground">Staff Training</p>
          </div>
        </Link>

        {/* Social Links - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <a 
            href="https://www.instagram.com/cesoirnaples" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-copper transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a 
            href="https://www.facebook.com/cesoirnaples" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-copper transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a 
            href="https://www.opentable.com/r/ce-soir-naples" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-copper transition-colors"
            aria-label="OpenTable Reviews"
          >
            <OpenTableLogo className="w-5 h-5" />
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "text-burgundy" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-burgundy/10 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
          <div className="w-px h-6 bg-border mx-2" />
          {adminItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location.pathname.startsWith(item.path)
                  ? "text-gold bg-gold/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <span className="flex items-center gap-1.5">
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden border-t border-border bg-background"
      >
        <nav className="container py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-burgundy/10 text-burgundy" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          <div className="h-px bg-border my-2" />
          {adminItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                location.pathname.startsWith(item.path)
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Social Links - Mobile */}
          <div className="h-px bg-border my-2" />
          <div className="flex items-center justify-center gap-6 py-3">
            <a 
              href="https://www.instagram.com/cesoirnaples" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-copper transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://www.facebook.com/cesoirnaples" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-copper transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a 
              href="https://www.opentable.com/r/ce-soir-naples" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-copper transition-colors"
              aria-label="OpenTable Reviews"
            >
              <OpenTableLogo className="w-6 h-6" />
            </a>
          </div>
        </nav>
      </motion.div>
    </header>
  );
}
