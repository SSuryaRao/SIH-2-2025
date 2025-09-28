'use client';

import DashboardCard from '@/components/DashboardCard';
import {
  BookOpen,
  CreditCard,
  Calendar,
  Building2,
  Award,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, Student</h2>
        <p className="text-muted-foreground">
          Track your academic progress and manage your college life.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Current Semester"
          value="6th"
          description="Computer Science Engineering"
          icon={BookOpen}
        />
        <DashboardCard
          title="CGPA"
          value="8.5"
          description="Overall academic performance"
          icon={Award}
          trend={{ value: 5, isPositive: true }}
        />
        <DashboardCard
          title="Attendance"
          value="92%"
          description="Overall attendance rate"
          icon={Clock}
          trend={{ value: 2, isPositive: true }}
        />
        <DashboardCard
          title="Pending Fees"
          value="₹15,000"
          description="Semester fee balance"
          icon={CreditCard}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Upcoming Exams"
          value="5"
          description="Exams this month"
          icon={Calendar}
        />
        <DashboardCard
          title="Library Books"
          value="3"
          description="Currently issued books"
          icon={BookOpen}
        />
        <DashboardCard
          title="Hostel Room"
          value="A-204"
          description="Current room allocation"
          icon={Building2}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <User className="h-5 w-5" />
            <span className="text-sm">My Profile</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm">Pay Fees</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Exam Schedule</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <Building2 className="h-5 w-5" />
            <span className="text-sm">Hostel Info</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-md bg-muted">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Fee Payment Reminder</p>
              <p className="text-xs text-muted-foreground">
                Semester fee payment due by March 15th
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-md bg-muted">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Exam Registration Open</p>
              <p className="text-xs text-muted-foreground">
                Register for mid-semester exams before March 10th
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-md bg-muted">
            <Award className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Grade Update</p>
              <p className="text-xs text-muted-foreground">
                Data Structures assignment grade: A+
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}