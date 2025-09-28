'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EditProfileModal, ChangePasswordModal } from '@/components/profile';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  CreditCard,
  Building2,
  FileText,
  Clock,
  Download,
  CheckCircle,
  Edit,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import { studentsAPI, Student } from '@/services/api';
import { formatDate } from '@/lib/utils';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getMyDetails();
      if (response.success && response.data) {
        setStudent(response.data);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handleProfileUpdate = () => {
    // Update the user data in the parent component
    // In a real app, you might want to refresh the user context
    toast.success('Profile updated successfully!');
  };

  const handleExportData = () => {
    toast.info('Data export functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

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
            Student Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Your academic and personal information overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Transcript
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
            <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-600" />
            <CardContent className="pt-0">
              <div className="flex flex-col items-center -mt-10">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg mb-4">
                  <User className="h-10 w-10 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-center">{user.name}</h2>
                <p className="text-muted-foreground text-center">
                  {student ? `${student.academicInfo.rollNumber} • ${student.academicInfo.course}` : user.email}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle className="h-4 w-4" />
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {student?.academicInfo.status === 'active' ? 'Active' : 'Student'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current CGPA</span>
                <span className="font-semibold">8.7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Credits Completed</span>
                <span className="font-semibold">145/180</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Semester</span>
                <span className="font-semibold">{student?.academicInfo.semester || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Attendance</span>
                <span className="font-semibold">92%</span>
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
                  <p className="font-medium">{student?.personalInfo.name || user.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </div>
                  <p className="font-medium">{student?.personalInfo.email || user.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                  <p className="font-medium">{student?.personalInfo.phone || 'Not provided'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </div>
                  <p className="font-medium">
                    {formatDate(student?.personalInfo.dateOfBirth)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    Student ID
                  </div>
                  <p className="font-medium">{student?.studentId || user.id}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Gender
                  </div>
                  <p className="font-medium">
                    {student?.personalInfo.gender
                      ? student.personalInfo.gender.charAt(0).toUpperCase() + student.personalInfo.gender.slice(1)
                      : 'Not provided'}
                  </p>
                </div>
              </div>

              {student?.personalInfo.address && (
                <>
                  <Separator className="my-4" />
                  <div className="grid gap-4 md:grid-cols-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Permanent Address
                      </div>
                      <p className="font-medium text-sm leading-relaxed">
                        {student.personalInfo.address.permanent}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Current Address
                      </div>
                      <p className="font-medium text-sm leading-relaxed">
                        {student.personalInfo.address.current}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Academic Information */}
          {student && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
                <CardDescription>
                  Your course and academic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      Course
                    </div>
                    <p className="font-medium">{student.academicInfo.course}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      Branch/Specialization
                    </div>
                    <p className="font-medium">{student.academicInfo.branch}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Roll Number
                    </div>
                    <p className="font-medium">{student.academicInfo.rollNumber}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Current Year
                    </div>
                    <p className="font-medium">Year {student.academicInfo.year}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      Current Semester
                    </div>
                    <p className="font-medium">Semester {student.academicInfo.semester}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Admission Date
                    </div>
                    <p className="font-medium">
                      {formatDate(student.academicInfo.admissionDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Frequently used student functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">View Courses</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-sm">View Grades</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <CreditCard className="h-6 w-6" />
                  <span className="text-sm">Pay Fees</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Exam Registration</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Hostel Info</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Clock className="h-6 w-6" />
                  <span className="text-sm">Timetable</span>
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