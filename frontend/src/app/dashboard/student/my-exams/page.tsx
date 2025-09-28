'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  UserPlus,
  Loader2,
  Download,
  Eye,
  Plus,
  CalendarDays,
  Timer,
  Award,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { examsAPI, Exam, ExamRegistration, ExamSubject } from '@/services/api';

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  registration_open: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  ongoing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

const statusIcons = {
  upcoming: Clock,
  registration_open: UserPlus,
  ongoing: PlayCircle,
  completed: CheckCircle,
};

const examTypeColors = {
  internal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  external: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  practical: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  viva: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
};

interface ExamStats {
  totalExams: number;
  upcomingExams: number;
  registeredExams: number;
  completedExams: number;
  availableRegistrations: number;
}

export default function MyExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<ExamRegistration[]>([]);
  const [mySchedule, setMySchedule] = useState<ExamSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExamStats>({
    totalExams: 0,
    upcomingExams: 0,
    registeredExams: 0,
    completedExams: 0,
    availableRegistrations: 0,
  });
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const fetchMyExams = async () => {
    try {
      setLoading(true);

      // Fetch all available exams
      const examsResponse = await examsAPI.getAll();
      const availableExams = examsResponse.success ? examsResponse.data || [] : [];
      setExams(availableExams);

      // Fetch my registrations
      const registrationsResponse = await examsAPI.getMyRegistrations();
      const registrations = registrationsResponse.success ? registrationsResponse.data || [] : [];
      setMyRegistrations(registrations);

      // Fetch my schedule
      const scheduleResponse = await examsAPI.getMySchedule();
      const scheduleData = scheduleResponse.success ? scheduleResponse.data || [] : [];

      // Transform the schedule data to flatten exam subjects into individual schedule items
      const flattenedSchedule = [];
      scheduleData.forEach(exam => {
        if (exam.registeredSubjects && exam.registeredSubjects.length > 0) {
          exam.registeredSubjects.forEach(subject => {
            // Find the corresponding subject details from exam.subjects
            const subjectDetails = exam.subjects?.find(s => s.subjectCode === subject.subjectCode) || {};

            flattenedSchedule.push({
              examId: exam.id,
              examName: exam.name,
              subjectCode: subject.subjectCode,
              subjectName: subject.subjectName,
              examDate: exam.startDate, // Use exam start date as default
              startTime: subjectDetails.startTime || '09:00',
              endTime: subjectDetails.endTime || '12:00',
              duration: subjectDetails.duration || 180,
              maxMarks: subjectDetails.maxMarks || 100,
              examType: exam.examType,
              academicYear: exam.academicYear,
              semester: exam.semester
            });
          });
        }
      });

      setMySchedule(flattenedSchedule);

      // Calculate stats - handle both old and new backend response formats
      const registeredExamIds = registrations.map((regData: any) => {
        const reg = regData.registration || regData;
        return reg.examId;
      });
      const stats = {
        totalExams: availableExams.length,
        upcomingExams: availableExams.filter((exam: Exam) => exam.status === 'upcoming' || exam.status === 'registration_open').length,
        registeredExams: registrations.length,
        completedExams: availableExams.filter((exam: Exam) => exam.status === 'completed').length,
        availableRegistrations: availableExams.filter((exam: Exam) =>
          exam.status === 'registration_open' && !registeredExamIds.includes(exam.id)
        ).length,
      };
      setStats(stats);

    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exam information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyExams();
  }, []);

  const handleRegisterForExam = async (exam: Exam) => {
    setSelectedExam(exam);
    setIsRegistrationModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedExam) return;

    try {
      const registrationData = {
        examId: selectedExam.id,
        registeredSubjects: selectedExam.subjects?.map(subject => ({
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
        })) || [],
      };

      const response = await examsAPI.register(registrationData);

      if (response.success) {
        toast.success('Successfully registered for exam');
        setIsRegistrationModalOpen(false);
        setSelectedExam(null);
        fetchMyExams(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to register for exam');
      }
    } catch (error) {
      console.error('Error registering for exam:', error);
      toast.error('Failed to register for exam');
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      const response = await examsAPI.cancelRegistration(registrationId);

      if (response.success) {
        toast.success('Registration cancelled successfully');
        fetchMyExams(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to cancel registration');
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration');
    }
  };

  const handleDownloadAdmitCard = (exam: Exam) => {
    toast.success(`Downloading admit card for ${exam.name}`);
    // Implement actual download logic here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          My Exams
        </h1>
        <p className="text-muted-foreground mt-2">
          Your exam registrations, schedules, and results
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Available Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.availableRegistrations} open for registration
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Registered</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-600">
              {stats.registeredExams}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Exam registrations
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.upcomingExams}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Scheduled exams
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedExams}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Exams finished
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Exam Schedule */}
      {mySchedule.length > 0 && (
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              My Exam Schedule
            </CardTitle>
            <CardDescription>
              Your upcoming exam timetable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySchedule.map((subject, index) => (
                    <TableRow key={`${subject.examId}-${subject.subjectCode}-${index}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{subject.subjectName}</p>
                          <p className="text-sm text-muted-foreground">
                            {subject.subjectCode}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(subject.examDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {subject.startTime} - {subject.endTime}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Timer className="h-3 w-3" />
                          {subject.duration} min
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Award className="h-3 w-3" />
                          {subject.maxMarks} marks
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Admit Card
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Registrations */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            My Exam Registrations ({myRegistrations.length})
          </CardTitle>
          <CardDescription>
            Exams you have registered for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exam registrations</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t registered for any exams yet. Check available exams below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRegistrations.map((registrationData, index) => {
                // Handle both old and new backend response formats
                const registration = registrationData.registration || registrationData;
                const exam = registrationData.exam || exams.find(e => e.id === registration.examId);

                return (
                  <div key={`registration-${registration.id || index}`} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{exam?.name || 'Unknown Exam'}</p>
                          <Badge className={examTypeColors[exam?.examType || 'internal']}>
                            {exam?.examType || 'N/A'}
                          </Badge>
                          <Badge variant="outline">
                            {registration.registeredSubjects?.length || 0} subjects
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{exam?.academicYear} - Semester {exam?.semester}</span>
                          <span>Registration Date: {new Date(registration.registrationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Subjects: </span>
                          {registration.registeredSubjects?.length > 0
                            ? registration.registeredSubjects.map(subject => subject.subjectName).join(', ')
                            : 'No subjects'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[exam?.status || 'upcoming']}>
                          {exam?.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exam && handleDownloadAdmitCard(exam)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Admit Card
                            </DropdownMenuItem>
                            {exam?.status === 'registration_open' && (
                              <DropdownMenuItem
                                onClick={() => handleCancelRegistration(registration.id)}
                                className="text-red-600"
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Cancel Registration
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Exams */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Exams ({exams.length})
          </CardTitle>
          <CardDescription>
            All exams available for registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exams available</h3>
              <p className="text-muted-foreground">
                There are no exams scheduled at the moment. Check back later.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Details</TableHead>
                    <TableHead>Academic Info</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => {
                    const StatusIcon = statusIcons[exam.status];
                    const isRegistered = myRegistrations.some(regData => {
                      const reg = regData.registration || regData;
                      return reg.examId === exam.id;
                    });
                    const canRegister = exam.status === 'registration_open' && !isRegistered;

                    return (
                      <TableRow key={exam.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{exam.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={examTypeColors[exam.examType]}>
                                {exam.examType}
                              </Badge>
                              <Badge variant="outline">
                                {exam.subjects?.length || 0} subjects
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {exam.academicYear}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Semester {exam.semester}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(exam.registrationStartDate).toLocaleDateString()} - {new Date(exam.registrationEndDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={statusColors[exam.status]}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {exam.status.replace('_', ' ')}
                            </Badge>
                            {isRegistered && (
                              <Badge variant="outline" className="text-green-600">
                                Registered
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {canRegister && (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                onClick={() => handleRegisterForExam(exam)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Register
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Modal */}
      <Dialog open={isRegistrationModalOpen} onOpenChange={setIsRegistrationModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register for Exam</DialogTitle>
            <DialogDescription>
              Confirm your registration for {selectedExam?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="space-y-2">
                  <p><strong>Exam:</strong> {selectedExam.name}</p>
                  <p><strong>Type:</strong> {selectedExam.examType}</p>
                  <p><strong>Academic Year:</strong> {selectedExam.academicYear}</p>
                  <p><strong>Semester:</strong> {selectedExam.semester}</p>
                  <p><strong>Exam Period:</strong> {new Date(selectedExam.startDate).toLocaleDateString()} - {new Date(selectedExam.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Subjects ({selectedExam.subjects?.length || 0}):</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedExam.subjects?.map((subject, index) => (
                    <div key={`${subject.subjectCode}-${index}`} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{subject.subjectName}</p>
                          <p className="text-sm text-muted-foreground">{subject.subjectCode}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p>{subject.maxMarks} marks</p>
                          <p className="text-muted-foreground">{subject.duration} min</p>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground">No subjects available</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsRegistrationModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={handleConfirmRegistration}
                >
                  Confirm Registration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}