'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Users,
  GraduationCap,
  CreditCard,
  Building2,
  FileText,
  LayoutDashboard,
  User,
  Menu,
  Home,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { User as UserType } from '@/services/api';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  user: UserType;
  className?: string;
}

interface SidebarContentProps {
  user: UserType;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
}

const roleNavItems: Record<string, NavItem[]> = {
  admin: [
    { title: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { title: 'Profile', href: '/dashboard/admin/profile', icon: User },
    { title: 'Users', href: '/dashboard/admin/users', icon: Users },
    { title: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
    { title: 'Fees', href: '/dashboard/admin/fees', icon: CreditCard },
    { title: 'Hostels', href: '/dashboard/admin/hostels', icon: Building2 },
    { title: 'Exams', href: '/dashboard/admin/exams', icon: FileText },
  ],
  staff: [
    { title: 'Dashboard', href: '/dashboard/staff', icon: LayoutDashboard },
    { title: 'Profile', href: '/dashboard/staff/profile', icon: User },
    { title: 'Students', href: '/dashboard/staff/students', icon: GraduationCap },
    { title: 'Fees', href: '/dashboard/staff/fees', icon: CreditCard },
    { title: 'Exams', href: '/dashboard/staff/exams', icon: FileText },
  ],
  warden: [
    { title: 'Dashboard', href: '/dashboard/warden', icon: LayoutDashboard },
    { title: 'Profile', href: '/dashboard/warden/profile', icon: User },
    { title: 'Hostels', href: '/dashboard/warden/hostels', icon: Building2 },
  ],
  student: [
    { title: 'Dashboard', href: '/dashboard/student', icon: Home },
    { title: 'Profile', href: '/dashboard/student/profile', icon: User },
    { title: 'My Details', href: '/dashboard/student/my-details', icon: GraduationCap },
    { title: 'My Fees', href: '/dashboard/student/my-fees', icon: CreditCard },
    { title: 'My Exams', href: '/dashboard/student/my-exams', icon: BookOpen },
    { title: 'My Hostel', href: '/dashboard/student/my-hostel', icon: Building2 },
  ],
};

function SidebarContent({ user, onNavigate, isCollapsed = false, onToggleCollapse, isMobile = false }: SidebarContentProps) {
  const pathname = usePathname();
  const navItems = roleNavItems[user.role] || [];
  const [searchQuery, setSearchQuery] = useState('');

  // Filter nav items based on search
  const filteredNavItems = navItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "flex h-full flex-col bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800",
      "border-r border-slate-200/80 dark:border-slate-700/60 backdrop-blur-xl",
      "shadow-xl shadow-slate-200/20 dark:shadow-slate-900/40",
      "transition-all duration-300 ease-in-out",
      isCollapsed && !isMobile ? "w-20" : "w-64"
    )}>
      {/* Logo Header */}
      <div className={cn(
        "flex h-16 items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60",
        "bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm",
        "px-4 transition-all duration-300",
        isCollapsed && !isMobile ? "px-2" : "px-6"
      )}>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200",
            "hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200",
            "group"
          )}
        >
          <div className="relative">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-lg bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              College ERP
            </span>
          )}
        </Link>

        {/* Collapse Toggle for Desktop */}
        {!isMobile && onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-slate-200/40 dark:border-slate-700/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2.5 text-sm",
                "bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60",
                "rounded-xl backdrop-blur-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40",
                "transition-all duration-200",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500"
              )}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600",
        "transition-all duration-300",
        isCollapsed && !isMobile ? "p-2 pt-4" : "p-4 pt-6"
      )}>
        {filteredNavItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <div
              key={item.href}
              className="relative"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl transition-all duration-300 relative overflow-hidden',
                  'hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5',
                  isCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3.5',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02] font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 hover:scale-[1.01] font-medium'
                )}
                title={isCollapsed && !isMobile ? item.title : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/40 rounded-r-full" />
                )}

                {/* Icon container */}
                <div className={cn(
                  'relative flex items-center justify-center transition-all duration-300',
                  isCollapsed && !isMobile ? 'p-0' : 'p-2',
                  isActive
                    ? 'bg-white/20 rounded-xl shadow-sm'
                    : 'bg-slate-100/80 dark:bg-slate-700/60 rounded-xl group-hover:bg-slate-200/80 dark:group-hover:bg-slate-600/80 group-hover:shadow-sm'
                )}>
                  <Icon className={cn(
                    "transition-all duration-200",
                    isCollapsed && !isMobile ? "h-5 w-5" : "h-4 w-4",
                    isActive && "drop-shadow-sm"
                  )} />

                  {/* Notification badge for some items */}
                  {item.title === 'Dashboard' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Text label */}
                {(!isCollapsed || isMobile) && (
                  <span className="font-medium transition-all duration-200 text-sm">
                    {item.title}
                  </span>
                )}

                {/* Hover effect background */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50/30 to-indigo-50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-indigo-950/20 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 rounded-2xl" />
                )}

                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                </div>
              </Link>
            </div>
          );
        })}

        {/* No results message */}
        {searchQuery && filteredNavItems.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No navigation items found</p>
          </div>
        )}
      </nav>

      {/* Quick Actions */}
      {(!isCollapsed || isMobile) && (
        <div className="px-4 py-2 border-t border-slate-200/40 dark:border-slate-700/40">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-9 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-9 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User Profile Section */}
      <div className={cn(
        "border-t border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm",
        "transition-all duration-300",
        isCollapsed && !isMobile ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-100/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80",
          "hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 hover:scale-[1.02]",
          "border border-slate-200/50 dark:border-slate-700/50",
          isCollapsed && !isMobile ? "p-2 justify-center" : "p-3"
        )}>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white text-sm font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>

          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
                {user.role}
              </p>
            </div>
          )}

          {(!isCollapsed || isMobile) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 hover:bg-red-100/50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors rounded-lg"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ user, className }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Save collapse state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "lg:hidden fixed top-4 left-4 z-50 h-12 w-12 rounded-xl shadow-lg",
              "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
              "border-slate-200/60 dark:border-slate-700/60",
              "hover:bg-white dark:hover:bg-slate-900",
              "hover:shadow-xl hover:scale-105 transition-all duration-200"
            )}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn(
            "p-0 w-80 border-r-0",
            "bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50",
            "dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"
          )}
        >
          <SidebarContent
            user={user}
            onNavigate={() => setOpen(false)}
            isMobile={true}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        'hidden lg:block lg:shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0',
        isCollapsed ? 'lg:w-20' : 'lg:w-64',
        className
      )}>
        <SidebarContent
          user={user}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          isMobile={false}
        />
      </div>

      {/* Hover Overlay for Collapsed Sidebar */}
      {isCollapsed && (
        <div className="hidden lg:block fixed left-20 top-0 h-screen w-64 z-40 pointer-events-none group">
          <div
            className={cn(
              "h-full w-full pointer-events-auto",
              "bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50",
              "dark:from-slate-950 dark:via-slate-900 dark:to-slate-800",
              "border-r border-slate-200/80 dark:border-slate-700/60",
              "shadow-2xl shadow-slate-200/40 dark:shadow-slate-900/60",
              "transform -translate-x-full transition-all duration-300 ease-out",
              "opacity-0 group-hover:opacity-100 group-hover:translate-x-0",
              "backdrop-blur-xl"
            )}
          >
            <SidebarContent
              user={user}
              isCollapsed={false}
              onToggleCollapse={toggleCollapse}
              isMobile={false}
            />
          </div>
        </div>
      )}
    </>
  );
}