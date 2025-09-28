'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import { toast } from 'sonner';

const roleRoutes = {
  admin: '/dashboard/admin',
  staff: '/dashboard/staff',
  warden: '/dashboard/warden',
  student: '/dashboard/student',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      // Check if user is on the correct dashboard for their role
      const currentPath = window.location.pathname;
      const expectedPath = roleRoutes[user.role as keyof typeof roleRoutes];

      // If user is on /dashboard (root) or wrong role dashboard, redirect to correct one
      if (currentPath === '/dashboard' ||
          (!currentPath.startsWith(expectedPath) &&
           currentPath.startsWith('/dashboard/'))) {
        router.push(expectedPath);
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}