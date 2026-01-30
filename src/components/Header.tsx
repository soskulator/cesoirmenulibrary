import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Home, Layers, CreditCard, HelpCircle, Star, Settings, AlertTriangle, Menu, X, LogIn, LogOut, Wine, GlassWater, Martini, ChevronDown, ClipboardList, Users, UserCheck, UtensilsCrossed, BookOpen, Shield, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import cesoirLogo from '@/assets/cesoir-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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
  icon: Martini
}, {
  path: '/cocktails',
  label: 'Cocktails',
  icon: GlassWater
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
}];
// Knowledge Tests (was FoH)
const knowledgeTestItems = [{
  path: '/foh-test',
  label: 'Knowledge Test',
  icon: ClipboardList,
  subItems: [
    { path: '/foh-test?type=service_staff', label: 'Bartender/Server Test', icon: UserCheck },
    { path: '/foh-test?type=server_assistant', label: 'Server Assistant', icon: Users }
  ]
}];

// Menu Knowledge Tests
const menuTestItems = [{
  path: '/wine-quiz',
  label: 'Wine Test',
  icon: Wine
}, {
  path: '/spirits-quiz',
  label: 'Spirits Test',
  icon: Martini
}, {
  path: '/quiz',
  label: 'Food Test',
  icon: HelpCircle
}];

// Other Tests
const otherTestItems = [{
  path: '/allergy-quiz',
  label: 'Allergy Test',
  icon: AlertTriangle
}];
const adminItems = [{
  path: '/admin',
  label: 'Admin Center',
  icon: Settings
}];

// Role display helper
const getRoleDisplay = (role: string | null, isLeadAdmin: boolean, isAdmin: boolean) => {
  if (isLeadAdmin) return { label: 'Lead Admin', icon: ShieldCheck, color: 'text-gold' };
  if (isAdmin) return { label: 'Admin', icon: Shield, color: 'text-copper' };
  if (role === 'employee') return { label: 'Staff', icon: User, color: 'text-muted-foreground' };
  return { label: 'Staff', icon: User, color: 'text-muted-foreground' };
};

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const {
    user,
    isAdmin,
    isLeadAdmin,
    role,
    fullName,
    signOut,
    loading
  } = useAuth();
  
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
  return <>
      {/* Status bar background - extends behind notch/dynamic island */}
      <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-background z-[60]" />
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 pt-[env(safe-area-inset-top)]">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center gap-0.5">
          <img src={cesoirLogo} alt="Ce Soir" className="h-8 w-auto" />
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium">Naples</p>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} className={cn("relative px-2.5 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap", isActive ? "text-burgundy" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
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

          {/* Test Dropdown - Redesigned with submenus */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className={cn("relative px-2.5 py-1.5 text-[13px] font-medium rounded-md transition-colors flex items-center gap-1.5", 
                [...knowledgeTestItems, ...menuTestItems, ...otherTestItems].some(item => location.pathname === item.path || location.pathname.startsWith(item.path.split('?')[0])) 
                  ? "text-burgundy" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                <HelpCircle className="w-4 h-4" />
                Test
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background border shadow-lg">
              {/* Knowledge Test */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Knowledge Test</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/foh-test?type=service_staff" className={cn("flex items-center gap-2 cursor-pointer", location.pathname === '/foh-test' && "text-burgundy")}>
                  <UserCheck className="w-4 h-4" />
                  Bartender/Server Test
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/foh-test?type=server_assistant" className={cn("flex items-center gap-2 cursor-pointer", location.pathname === '/foh-test' && "text-burgundy")}>
                  <Users className="w-4 h-4" />
                  Server Assistant
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Menu Tests */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Menu Tests</DropdownMenuLabel>
              {menuTestItems.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className={cn("flex items-center gap-2 cursor-pointer", location.pathname === item.path && "text-burgundy")}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* Other Tests */}
              {otherTestItems.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className={cn("flex items-center gap-2 cursor-pointer", location.pathname === item.path && "text-burgundy")}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {isAdmin && <>
              <div className="w-px h-5 bg-border mx-1.5" />
              {adminItems.map(item => <Link key={item.path} to={item.path} className={cn("relative px-2.5 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap", location.pathname.startsWith(item.path) ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
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
              {/* Role Badge - visible next to avatar */}
              <Badge variant="outline" className={cn("hidden xl:flex items-center gap-1 text-[10px] px-1.5 py-0.5", roleDisplay.color)}>
                <roleDisplay.icon className="w-2.5 h-2.5" />
                {roleDisplay.label}
              </Badge>
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
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <roleDisplay.icon className={cn("w-4 h-4", roleDisplay.color)} />
                    <span className={cn("text-sm font-medium", roleDisplay.color)}>
                      {roleDisplay.label}
                    </span>
                  </div>
                </div>
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
          {/* Mobile Role Badge */}
          {!loading && user && (
            <Badge variant="outline" className={cn("flex items-center gap-1 text-[10px] px-1.5 py-0.5", roleDisplay.color)}>
              <roleDisplay.icon className="w-2.5 h-2.5" />
              <span className="hidden xs:inline">{roleDisplay.label}</span>
            </Badge>
          )}
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
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <roleDisplay.icon className={cn("w-4 h-4", roleDisplay.color)} />
                    <span className={cn("text-sm font-medium", roleDisplay.color)}>
                      {roleDisplay.label}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}
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
        <nav className="container py-4 flex flex-col gap-1">
          {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", isActive ? "bg-burgundy/10 text-burgundy" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>;
        })}

          {/* Test Section - Mobile (Collapsible) */}
          <div className="h-px bg-border my-2" />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className={cn("w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors", 
                [...knowledgeTestItems, ...menuTestItems, ...otherTestItems].some(item => location.pathname === item.path || location.pathname.startsWith(item.path.split('?')[0])) 
                  ? "bg-burgundy/10 text-burgundy" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Test</span>
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background border shadow-lg">
              {/* Knowledge Test */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Knowledge Test</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/foh-test?type=service_staff" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-2 cursor-pointer", location.pathname === '/foh-test' && "text-burgundy")}>
                  <UserCheck className="w-4 h-4" />
                  Bartender/Server Test
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/foh-test?type=server_assistant" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-2 cursor-pointer", location.pathname === '/foh-test' && "text-burgundy")}>
                  <Users className="w-4 h-4" />
                  Server Assistant
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Menu Tests */}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Menu Tests</DropdownMenuLabel>
              {menuTestItems.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-2 cursor-pointer", location.pathname === item.path && "text-burgundy")}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              {/* Other Tests */}
              {otherTestItems.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-2 cursor-pointer", location.pathname === item.path && "text-burgundy")}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {isAdmin && <>
              <div className="h-px bg-border my-2" />
              {adminItems.map(item => <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center justify-between px-4 py-3 rounded-lg transition-colors", location.pathname.startsWith(item.path) ? "bg-gold/10 text-gold" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                  <span className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </span>
                  {pendingReviewCount > 0 && (
                    <Badge className="h-5 min-w-5 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                      {pendingReviewCount}
                    </Badge>
                  )}
                </Link>)}
            </>}

          {/* Auth Link - Mobile */}
          {!user && <>
              <div className="h-px bg-border my-2" />
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-copper hover:bg-copper/10">
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Sign In</span>
              </Link>
            </>}
          
        </nav>
      </motion.div>
    </header>
  </>;
}