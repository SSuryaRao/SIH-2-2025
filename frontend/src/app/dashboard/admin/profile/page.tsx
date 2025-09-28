'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditProfileModal, ChangePasswordModal } from '@/components/profile';
import {
  User,
  Mail,
  Shield,
  Settings,
  Users,
  GraduationCap,
  Building2,
  FileText,
  CreditCard,
  CheckCircle,
  Download,
  Edit,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handleProfileUpdate = () => {
    toast.success('Profile updated successfully!');
  };

  const handleExportData = () => {
    toast.info('Data export functionality coming soon!');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">User profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Administrator Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            System administration and management overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={handleChangePassword}>
            <Key className="mr-2 h-4 w-4" />
            Change Password
          </Button>
          <Button variant="outline" onClick={handleEditProfile}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Header Card */}
          <Card className="rounded-2xl shadow-md overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-red-500 to-orange-600" />
            <CardContent className="pt-0">
              <div className="flex flex-col items-center -mt-10">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg mb-4">
                  <User className="h-10 w-10 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-center">{user.name}</h2>
                <p className="text-muted-foreground text-center">
                  Administrator • {user.email}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle className="h-4 w-4" />
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    <Shield className="mr-1 h-3 w-3" />
                    Administrator
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Stats */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Management Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Students</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Staff</span>
                <span className="font-semibold">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hostels Managed</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Applications</span>
                <span className="font-semibold">23</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Full Name
                  </div>
                  <p className="font-medium">{user.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Role
                  </div>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    <Shield className="mr-1 h-3 w-3" />
                    Administrator
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    User ID
                  </div>
                  <p className="font-medium">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administrative Access */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrative Access
              </CardTitle>
              <CardDescription>
                Your system permissions and access levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">User Management</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Create Users</Badge>
                    <Badge variant="outline">Edit Users</Badge>
                    <Badge variant="outline">Delete Users</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Student Management</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Student Records</Badge>
                    <Badge variant="outline">Admissions</Badge>
                    <Badge variant="outline">Academics</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Financial Management</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Fee Management</Badge>
                    <Badge variant="outline">Reports</Badge>
                    <Badge variant="outline">Transactions</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">System Management</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">System Settings</Badge>
                    <Badge variant="outline">Backups</Badge>
                    <Badge variant="outline">Audit Logs</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Frequently used administrative functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">System Config</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-sm">Student Portal</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <CreditCard className="h-6 w-6" />
                  <span className="text-sm">Fee Management</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Hostel Admin</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}