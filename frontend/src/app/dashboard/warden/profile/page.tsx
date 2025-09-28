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
  Building2,
  Users,
  Shield,
  CheckCircle,
  Download,
  Edit,
  Bed,
  Wrench,
  FileText,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

export default function WardenProfilePage() {
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
            Warden Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Hostel management and resident supervision overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Reports
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
            <div className="h-20 bg-gradient-to-r from-green-500 to-teal-600" />
            <CardContent className="pt-0">
              <div className="flex flex-col items-center -mt-10">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg mb-4">
                  <User className="h-10 w-10 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-center">{user.name}</h2>
                <p className="text-muted-foreground text-center">
                  Hostel Warden • {user.email}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle className="h-4 w-4" />
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Building2 className="mr-1 h-3 w-3" />
                    Hostel Warden
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Stats */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Management Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Residents</span>
                <span className="font-semibold">234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hostels Managed</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                <span className="font-semibold">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Issues</span>
                <span className="font-semibold">7</span>
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
                Your basic personal and employment details
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
                    <Building2 className="h-4 w-4" />
                    Role
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Building2 className="mr-1 h-3 w-3" />
                    Hostel Warden
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Employee ID
                  </div>
                  <p className="font-medium">WRD{user.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hostel Management */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Hostel Management Details
              </CardTitle>
              <CardDescription>
                Your assigned hostels and responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Primary Assignment
                  </div>
                  <p className="font-medium">Boys Hostel Complex</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Years of Experience
                  </div>
                  <p className="font-medium">5 years</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Backup Warden
                  </div>
                  <p className="font-medium">Mr. Rajesh Kumar</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Office Location
                  </div>
                  <p className="font-medium">Boys Hostel Block A, Ground Floor</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-sm mb-3">Managed Hostels</h4>
                <div className="grid gap-3 md:grid-cols-1">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">Boys Hostel Block A</h5>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        95% Occupied
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <span>120 Rooms</span>
                      <span>114 Occupied</span>
                      <span>6 Available</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">Boys Hostel Block B</h5>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        89% Occupied
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <span>80 Rooms</span>
                      <span>71 Occupied</span>
                      <span>9 Available</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">Boys Hostel Block C</h5>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        97% Occupied
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <span>100 Rooms</span>
                      <span>97 Occupied</span>
                      <span>3 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Frequently used hostel management functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Resident List</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Bed className="h-6 w-6" />
                  <span className="text-sm">Room Allocation</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Wrench className="h-6 w-6" />
                  <span className="text-sm">Maintenance</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Security</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Reports</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Visitor Logs</span>
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