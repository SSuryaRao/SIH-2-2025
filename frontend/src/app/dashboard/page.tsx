'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const roleRoutes = {
  admin: '/dashboard/admin',
  staff: '/dashboard/staff',
  warden: '/dashboard/warden',
  student: '/dashboard/student',
};

export default function DashboardRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role) {
      const targetRoute = roleRoutes[user.role as keyof typeof roleRoutes];
      if (targetRoute) {
        router.push(targetRoute);
      } else {
        // Fallback for unknown roles
        router.push('/login');
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading state while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}