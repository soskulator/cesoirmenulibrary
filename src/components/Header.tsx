import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Home, Layers, CreditCard, HelpCircle, Star, Settings, AlertTriangle, Menu, X, LogIn, LogOut, Wine, GlassWater, Martini, Shield, ShieldCheck, User, Search, Pencil, Check, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { HeaderSearch } from '@/components/HeaderSearch';
import cesoirLogo from '@/assets/cesoir-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
// Items used by both desktop dropdowns and mobile menu
const navItems = [{
  path: '/',
  label: 'Home',
  icon: Home
}, {
  path: '/categories',
  label: 'Menu',
  icon: Layers
}, {
  path: '/wine-list',
  label: 'Wine',
  icon: Wine
}, {
  path: '/spirits',
  label: 'Spirits',
  icon: GlassWater
}, {
  path: '/cocktails',
  label: 'Cocktails',
  icon: Martini
}, {
  path: '/flashcards',
  label: 'Flashcards',
  icon: CreditCard
}, {
  path: '/daily-focus',
  label: 'Daily Focus',
  icon: Star
}, {
  path: '/allergy',
  label: 'Allergy Center',
  icon: AlertTriangle
}, {
  path: '/quiz',
  label: 'Test',
  icon: HelpCircle
}];

const adminItems = [{
  path: '/admin',
  label: 'Admin Center',
  icon: Settings
}];

// ─── Desktop dropdown definitions ───
const browseItems = [
  { path: '/categories', label: 'Menu', icon: Layers },
  { path: '/wine-list', label: 'Wine', icon: Wine },
  { path: '/spirits', label: 'Spirits', icon: GlassWater },
  { path: '/cocktails', label: 'Cocktails', icon: Martini },
];

const trainingItems = [
  { path: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { path: '/daily-focus', label: 'Daily Focus', icon: Star },
];

const testItems = [
  { path: '/foh-test', label: 'Knowledge Test', icon: HelpCircle, separator: false },
  { path: '/foh-test?type=service_staff', label: 'Bartender / Server Test', icon: HelpCircle, separator: false },
  { path: '/foh-test?type=server_assistant', label: 'Server Assistant Test', icon: HelpCircle, separator: true },
  { path: '/wine-quiz', label: 'Wine Test', icon: Wine, separator: false },
  { path: '/spirits-quiz', label: 'Spirits Test', icon: GlassWater, separator: false },
  { path: '/quiz', label: 'Food Test', icon: HelpCircle, separator: false },
  { path: '/allergy-quiz', label: 'Allergy Test', icon: AlertTriangle, separator: false },
];

// ─── HoverDropdown — opens on hover with fade-in ───
function HoverDropdown({
  label,
  items,
  activePaths,
  isActive,
  indicator,
  pathname,
  hasPermission: hasPerm,
  navPermissionMap,
}: {
  label: string;
  items: { path: string; label: string; icon: React.ComponentType<{ className?: string }>; separator?: boolean }[];
  activePaths?: string[];
  isActive?: boolean;
  indicator?: React.ReactNode;
  pathname: string;
  hasPermission: (key: string) => boolean;
  navPermissionMap: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const triggerActive =
    isActive ??
    (activePaths
      ? activePaths.some(p => pathname === p || pathname.startsWith(p + '?'))
      : false);

  const filteredItems = items.filter(item => {
    const permKey = navPermissionMap[item.path.split('?')[0]];
    return !permKey || hasPerm(permKey);
  });

  if (filteredItems.length === 0) return null;

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={cn(
          'relative flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
          triggerActive ? 'text-burgundy' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        )}
      >
        {label}
        {indicator}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
        {triggerActive && (
          <motion.div layoutId="activeTab" className="absolute inset-0 bg-burgundy/10 rounded-md -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full pt-1 z-50"
          >
            <div className="min-w-[200px] bg-background border border-border shadow-elevated rounded-md py-1">
              {filteredItems.map((item, idx) => {
                const itemPathBase = item.path.split('?')[0];
                const itemActive = pathname === itemPathBase && (item.path.includes('?')
                  ? window.location.search === '?' + item.path.split('?')[1]
                  : !window.location.search);
                return (
                  <div key={item.path}>
                    {item.separator && idx > 0 && <div className="border-t border-border my-1" />}
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                        itemActive ? 'text-burgundy bg-burgundy/5' : 'text-foreground hover:bg-accent',
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Role display helper
const getRoleDisplay = (role: string | null, isLeadAdmin: boolean, isAdmin: boolean) => {
  if (isLeadAdmin) return { label: 'Lead Admin', icon: ShieldCheck, color: 'text-gold' };
  if (isAdmin) return { label: 'Admin', icon: Shield, color: 'text-copper' };
  if (role === 'server') return { label: 'Server', icon: User, color: 'text-muted-foreground' };
  if (role === 'bartender') return { label: 'Bartender', icon: User, color: 'text-muted-foreground' };
  if (role === 'server_assistant') return { label: 'Server Assistant', icon: User, color: 'text-muted-foreground' };
  if (role === 'employee') return { label: 'Staff', icon: User, color: 'text-muted-foreground' };
  return { label: 'Staff', icon: User, color: 'text-muted-foreground' };
};

export function Header() {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [hasTodayFocus, setHasTodayFocus] = useState(false);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const {
    user,
    isAdmin,
    isLeadAdmin,
    isServerAssistant,
    hasBeverageAccess,
    hasPermission,
    role,
    fullName,
    signOut,
    refreshRole,
    loading
  } = useAuth();
  
  // Map nav paths to permission keys
  const navPermissionMap: Record<string, string> = {
    '/wine-list': 'page:wine-list',
    '/spirits': 'page:spirits',
    '/cocktails': 'page:cocktails',
    '/flashcards': 'page:flashcards',
    '/daily-focus': 'page:daily-focus',
    '/allergy': 'page:allergy',
    '/categories': 'page:categories',
  };

  const filteredNavItems = navItems.filter(item => {
    const permKey = navPermissionMap[item.path];
    if (permKey && !hasPermission(permKey)) return false;
    return true;
  });
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const roleDisplay = getRoleDisplay(role, isLeadAdmin, isAdmin);
  
  // Fetch pending review count for admins
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!isAdmin) return;
      
      try {
        const { count, error } = await supabase
          .from('foh_test_attempts')
          .select('*', { count: 'exact', head: true })
          .not('completed_at', 'is', null)
          .eq('is_reviewed', false);
        
        if (!error && count !== null) {
          setPendingReviewCount(count);
        }
      } catch (err) {
        console.error('Error fetching pending count:', err);
      }
    };

    fetchPendingCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleStartEdit = () => {
    setNameInput(fullName || '');
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!user || !nameInput.trim()) return;
    setSavingName(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: nameInput.trim() })
      .eq('id', user.id);
    setSavingName(false);
    if (!error) {
      setEditingName(false);
      refreshRole(); // refreshes fullName from context
    }
  };

  const ProfileEditBlock = () => (
    <div className="px-2 py-1.5">
      {editingName ? (
        <div className="flex items-center gap-1.5">
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="h-7 text-sm"
            placeholder="Full name"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
          />
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleSaveName} disabled={savingName}>
            {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-jade" />}
          </Button>
        </div>
      ) : (
        <button onClick={handleStartEdit} className="flex items-center gap-2 w-full text-left hover:bg-accent rounded-md px-1 py-0.5 transition-colors">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm truncate flex-1">{fullName || 'Set your name'}</span>
          <Pencil className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
  return <>
      {/* Status bar background - extends behind notch/dynamic island */}
      <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-background z-[60]" />
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 pt-[env(safe-area-inset-top)]" style={{ WebkitBackdropFilter: 'blur(12px)' } as React.CSSProperties}>
      <div className="container flex h-[3.75rem] lg:h-[4.5rem] items-center justify-between pb-1">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 -my-1">
          <img src={cesoirLogo} alt="Ce Soir" className="h-12 lg:h-14 w-auto drop-shadow-sm" style={{ imageRendering: 'auto' }} />
          <div className="w-px h-6 bg-copper/30" />
          <p className="text-[10px] tracking-[0.25em] uppercase text-copper/70 font-semibold">Naples</p>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {filteredNavItems.map(item => {
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} className={cn("relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap", isActive ? "text-burgundy" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                <span className="flex items-center gap-1.5">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
                {isActive && <motion.div layoutId="activeTab" className="absolute inset-0 bg-burgundy/10 rounded-md -z-10" transition={{
              type: "spring",
              bounce: 0.2,
              duration: 0.6
            }} />}
              </Link>;
        })}

          {/* Search Icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="relative px-2.5 py-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          
          {isAdmin && <>
              <div className="w-px h-5 bg-border mx-1.5" />
              {adminItems.map(item => <Link key={item.path} to={item.path} className={cn("relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap", location.pathname.startsWith(item.path) ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                  <span className="flex items-center gap-1.5">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {pendingReviewCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center text-[9px] bg-destructive text-destructive-foreground p-0">
                      {pendingReviewCount}
                    </Badge>
                  )}
                </Link>)}
            </>}


          {/* Auth Section */}
          <div className="w-px h-5 bg-border mx-1.5" />
          {loading ? <div className="w-8 h-8 rounded-full bg-muted animate-pulse" /> : user ? <div className="flex items-center gap-2">
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-copper/20 text-copper text-[11px]">
                      {getInitials(fullName, user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <ProfileEditBlock />
                <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div> : <Button variant="ghost" size="sm" className="text-[13px] px-3 h-8" asChild>
              <Link to="/auth">
                Sign In
              </Link>
            </Button>}
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-1.5">
          {!loading && user && <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-7 w-7 rounded-full p-0">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-copper/20 text-copper text-[10px]">
                      {getInitials(fullName, user.email || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <ProfileEditBlock />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}
          <button
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <motion.div 
        ref={mobileMenuRef}
        initial={false} 
        animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden border-t border-border bg-background relative z-50">
        <nav className="container py-4 flex flex-col gap-0.5">
          {/* Browse Section */}
          <p className="px-4 pt-1 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Browse</p>
          <button
            onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Search className="w-5 h-5" />
            <span className="font-medium text-sm">Search</span>
          </button>
          {filteredNavItems.filter(i => ['/', '/categories', '/wine-list', '/spirits', '/cocktails'].includes(i.path)).map(item => {
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors", isActive ? "bg-copper/10 text-copper border-l-2 border-copper" : "text-muted-foreground hover:text-foreground hover:bg-accent border-l-2 border-transparent")}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>;
          })}

          {/* Training Section */}
          <div className="h-px bg-border my-2" />
          <p className="px-4 pt-1 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Training</p>
          {filteredNavItems.filter(i => ['/quiz', '/flashcards', '/daily-focus'].includes(i.path)).map(item => {
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors", isActive ? "bg-copper/10 text-copper border-l-2 border-copper" : "text-muted-foreground hover:text-foreground hover:bg-accent border-l-2 border-transparent")}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>;
          })}

          {/* Reference Section */}
          <div className="h-px bg-border my-2" />
          <p className="px-4 pt-1 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Reference</p>
          {filteredNavItems.filter(i => ['/allergy'].includes(i.path)).map(item => {
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors", isActive ? "bg-copper/10 text-copper border-l-2 border-copper" : "text-muted-foreground hover:text-foreground hover:bg-accent border-l-2 border-transparent")}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>;
          })}

          {/* Admin Section */}
          {isAdmin && <>
              <div className="h-px bg-border my-2" />
              <p className="px-4 pt-1 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Admin</p>
              {adminItems.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors", isActive ? "bg-copper/10 text-copper border-l-2 border-copper" : "text-muted-foreground hover:text-foreground hover:bg-accent border-l-2 border-transparent")}>
                    <span className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </span>
                    {pendingReviewCount > 0 && (
                      <Badge className="h-5 min-w-5 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                        {pendingReviewCount}
                      </Badge>
                    )}
                  </Link>;
              })}
            </>}

          {/* Auth Link - Mobile */}
          {!user && <>
              <div className="h-px bg-border my-2" />
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-copper hover:bg-copper/10">
                <LogIn className="w-5 h-5" />
                <span className="font-medium text-sm">Sign In</span>
              </Link>
            </>}
        </nav>
      </motion.div>
    </header>
    <HeaderSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
  </>;
}