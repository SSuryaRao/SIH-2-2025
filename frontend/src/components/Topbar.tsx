'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings, User } from 'lucide-react';
import { User as UserType } from '@/services/api';

interface TopbarProps {
  user: UserType;
  onLogout: () => void;
}

export default function Topbar({ user, onLogout }: TopbarProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    const roleRoutes = {
      admin: '/dashboard/admin/profile',
      staff: '/dashboard/staff/profile',
      warden: '/dashboard/warden/profile',
      student: '/dashboard/student/profile',
    };

    const profileRoute = roleRoutes[user.role as keyof typeof roleRoutes];
    if (profileRoute) {
      router.push(profileRoute);
    }
  };

  const handleSettingsClick = () => {
    // For now, just show a toast. You can implement settings page later
    console.log('Settings clicked - functionality coming soon');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize font-medium">
            {user.role} Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all duration-200">
              <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className="cursor-pointer rounded-lg py-2.5 focus:bg-blue-50 dark:focus:bg-blue-950/50"
              onClick={handleProfileClick}
            >
              <User className="mr-3 h-4 w-4" />
              <span className="font-medium">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-lg py-2.5 focus:bg-blue-50 dark:focus:bg-blue-950/50"
              onClick={handleSettingsClick}
            >
              <Settings className="mr-3 h-4 w-4" />
              <span className="font-medium">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className="cursor-pointer rounded-lg py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}