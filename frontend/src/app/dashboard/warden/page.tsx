'use client';

import DashboardCard from '@/components/DashboardCard';
import {
  Building2,
  Users,
  AlertCircle,
  Wrench,
  Bed,
  Shield,
} from 'lucide-react';

export default function WardenDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, Warden</h2>
        <p className="text-muted-foreground">
          Monitor and manage hostel operations effectively.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Rooms"
          value="240"
          description="Available hostel rooms"
          icon={Building2}
        />
        <DashboardCard
          title="Occupancy Rate"
          value="87%"
          description="Current room occupancy"
          icon={Bed}
          trend={{ value: 5, isPositive: true }}
        />
        <DashboardCard
          title="Residents"
          value="208"
          description="Students currently staying"
          icon={Users}
        />
        <DashboardCard
          title="Maintenance Issues"
          value="12"
          description="Pending maintenance requests"
          icon={AlertCircle}
          trend={{ value: 8, isPositive: false }}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Security Incidents"
          value="3"
          description="Reported this month"
          icon={Shield}
        />
        <DashboardCard
          title="Facility Requests"
          value="18"
          description="New facility requests"
          icon={Wrench}
        />
        <DashboardCard
          title="Room Inspections"
          value="45"
          description="Completed this week"
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <Building2 className="h-5 w-5" />
            <span className="text-sm">Room Allocation</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <Users className="h-5 w-5" />
            <span className="text-sm">Resident List</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <Wrench className="h-5 w-5" />
            <span className="text-sm">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-accent cursor-pointer">
            <Shield className="h-5 w-5" />
            <span className="text-sm">Security Report</span>
          </div>
        </div>
      </div>
    </div>
  );
}