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
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  CheckCircle,
  Download,
  Edit,
  Award,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

export default function StaffProfilePage() {
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
            Staff Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Teaching and academic administration overview
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
            <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <CardContent className="pt-0">
              <div className="flex flex-col items-center -mt-10">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg mb-4">
                  <User className="h-10 w-10 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-center">{user.name}</h2>
                <p className="text-muted-foreground text-center">
                  Faculty • {user.email}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle className="h-4 w-4" />
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    <GraduationCap className="mr-1 h-3 w-3" />
                    Faculty Member
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Stats */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Teaching Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Students Taught</span>
                <span className="font-semibold">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Courses Active</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Exams Conducted</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Rating</span>
                <span className="font-semibold">4.8/5</span>
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
                    <GraduationCap className="h-4 w-4" />
                    Role
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    <GraduationCap className="mr-1 h-3 w-3" />
                    Faculty Member
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Employee ID
                  </div>
                  <p className="font-medium">FAC{user.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
              <CardDescription>
                Your qualifications and teaching assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    Highest Qualification
                  </div>
                  <p className="font-medium">Ph.D. in Computer Science</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Specialization
                  </div>
                  <p className="font-medium">Data Structures & Algorithms</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    Designation
                  </div>
                  <p className="font-medium">Assistant Professor</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Department
                  </div>
                  <p className="font-medium">Computer Science & Engineering</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-sm mb-3">Current Courses</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <h5 className="font-medium text-sm">Data Structures</h5>
                    <p className="text-xs text-muted-foreground">CSE-3A • 45 Students</p>
                    <p className="text-xs text-muted-foreground">Mon, Wed, Fri 10:00-11:00</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <h5 className="font-medium text-sm">Algorithm Analysis</h5>
                    <p className="text-xs text-muted-foreground">CSE-5B • 38 Students</p>
                    <p className="text-xs text-muted-foreground">Tue, Thu 14:00-15:30</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <h5 className="font-medium text-sm">Database Management</h5>
                    <p className="text-xs text-muted-foreground">CSE-4A • 42 Students</p>
                    <p className="text-xs text-muted-foreground">Mon, Wed 15:30-17:00</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <h5 className="font-medium text-sm">Programming Lab</h5>
                    <p className="text-xs text-muted-foreground">CSE-2B • 35 Students</p>
                    <p className="text-xs text-muted-foreground">Fri 14:00-17:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Frequently used teaching and administrative functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">My Courses</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Grade Assignments</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Student List</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-sm">Evaluations</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Reports</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Award className="h-6 w-6" />
                  <span className="text-sm">Achievements</span>
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