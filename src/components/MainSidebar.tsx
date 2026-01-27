import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  UtensilsCrossed,
  Wine,
  GlassWater,
  Martini,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  Settings,
  LogIn,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import logoImage from '@/assets/cesoir-logo.png';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { title: 'Home', icon: Home, path: '/' },
  { title: 'Menu', icon: UtensilsCrossed, path: '/categories' },
  { title: 'Wine', icon: Wine, path: '/wine-list' },
  { title: 'Spirits', icon: GlassWater, path: '/spirits' },
  { title: 'Cocktails', icon: Martini, path: '/cocktails' },
];

const studyNavItems: NavItem[] = [
  { title: 'Study', icon: BookOpen, path: '/flashcards' },
  { title: 'Tests', icon: ClipboardCheck, path: '/quiz' },
  { title: 'Allergy', icon: AlertTriangle, path: '/allergy' },
];

const adminNavItems: NavItem[] = [
  { title: 'Admin', icon: Settings, path: '/admin', adminOnly: true },
];

export function MainSidebar() {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem) => {
    if (item.adminOnly && !isAdmin) return null;
    
    const active = isActive(item.path);
    
    return (
      <SidebarMenuItem key={item.path}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              asChild
              isActive={active}
              className={cn(
                'transition-colors',
                active && 'bg-copper/10 text-copper font-medium'
              )}
            >
              <Link to={item.path}>
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="bg-card border shadow-lg">
              {item.title}
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-cream">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-border/50 p-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logoImage}
            alt="Ce Soir"
            className={cn(
              'transition-all duration-200',
              isCollapsed ? 'h-8 w-8 object-contain object-left' : 'h-10'
            )}
          />
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="my-2 mx-2 border-t border-border/50" />

        {/* Study Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyNavItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="my-2 mx-2 border-t border-border/50" />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map(renderNavItem)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer with Login/Logout */}
      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => signOut()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="bg-card border shadow-lg">
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild className="text-copper hover:text-copper-light">
                    <Link to="/auth">
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="bg-card border shadow-lg">
                    Login
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Mobile bottom navigation
export function MobileBottomNav() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const mobileNavItems = [
    { title: 'Home', icon: Home, path: '/' },
    { title: 'Menu', icon: UtensilsCrossed, path: '/categories' },
    { title: 'Study', icon: BookOpen, path: '/flashcards' },
    { title: 'Tests', icon: ClipboardCheck, path: '/quiz' },
    { title: 'More', icon: Menu, path: '/allergy' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors',
                active
                  ? 'text-copper'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
