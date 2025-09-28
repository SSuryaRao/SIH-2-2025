'use client';

import DashboardCard from '@/components/DashboardCard';
import {
  GraduationCap,
  CreditCard,
  FileText,
  Users,
  BookOpen,
  Calendar,
} from 'lucide-react';

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, Staff</h2>
        <p className="text-muted-foreground">
          Manage students, fees, and examinations efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="My Students"
          value="156"
          description="Students under supervision"
          icon={GraduationCap}
        />
        <DashboardCard
          title="Pending Fees"
          value="₹2,45,000"
          description="Outstanding fee collection"
          icon={CreditCard}
          trend={{ value: 5, isPositive: false }}
        />
        <DashboardCard
          title="Upcoming Exams"
          value="8"
          description="Exams to be conducted"
          icon={FileText}
        />
        <DashboardCard
          title="Attendance Rate"
          value="92%"
          description="Overall class attendance"
          icon={Users}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Classes Today"
          value="6"
          description="Scheduled lectures"
          icon={BookOpen}
        />
        <DashboardCard
          title="Grade Submissions"
          value="12"
          description="Pending grade entries"
          icon={Calendar}
        />
        <DashboardCard
          title="Fee Collections"
          value="₹87,500"
          description="Collected this month"
          icon={CreditCard}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm">View Students</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm">Collect Fees</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <FileText className="h-5 w-5" />
            <span className="text-sm">Create Exam</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <Users className="h-5 w-5" />
            <span className="text-sm">Take Attendance</span>
          </div>
        </div>
      </div>
    </div>
  );
}