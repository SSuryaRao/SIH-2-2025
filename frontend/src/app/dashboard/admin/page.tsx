'use client';

import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  CreditCard,
  Building2,
  FileText,
  TrendingUp,
  UserPlus,
  Calendar,
  BarChart3,
} from 'lucide-react';

const quickActions = [
  {
    title: 'Manage Users',
    description: 'Add or edit user accounts',
    icon: Users,
    href: '/dashboard/admin/users',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Add Student',
    description: 'Register new student',
    icon: UserPlus,
    href: '/dashboard/admin/students/add',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Create Exam',
    description: 'Schedule new examination',
    icon: Calendar,
    href: '/dashboard/admin/exams/create',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Room Allocation',
    description: 'Manage hostel rooms',
    icon: Building2,
    href: '/dashboard/admin/hostels/rooms',
    color: 'from-orange-500 to-orange-600',
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-slate-100 dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            Monitor and manage your institution&apos;s operations
          </p>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Students"
            value="1,234"
            description="Active students enrolled"
            icon={GraduationCap}
            trend={{ value: 12, isPositive: true }}
            gradient={true}
          />
          <DashboardCard
            title="Total Staff"
            value="89"
            description="Active faculty members"
            icon={Users}
            trend={{ value: 5, isPositive: true }}
          />
          <DashboardCard
            title="Fee Collection"
            value="₹12,45,000"
            description="This month's collection"
            icon={CreditCard}
            trend={{ value: 8, isPositive: true }}
            gradient={true}
          />
          <DashboardCard
            title="Hostel Occupancy"
            value="87%"
            description="Current occupancy rate"
            icon={Building2}
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Pending Examinations"
            value="15"
            description="Upcoming exams this semester"
            icon={FileText}
          />
          <DashboardCard
            title="Fee Defaulters"
            value="23"
            description="Students with pending fees"
            icon={CreditCard}
            trend={{ value: 8, isPositive: false }}
          />
          <DashboardCard
            title="System Growth"
            value="94%"
            description="Overall system utilization"
            icon={TrendingUp}
            trend={{ value: 15, isPositive: true }}
            gradient={true}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Quick Actions
            </h2>
            <BarChart3 className="h-6 w-6 text-slate-400" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {action.description}
                      </p>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Status Footer */}
        <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  System Status
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  All systems operational
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Online
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}