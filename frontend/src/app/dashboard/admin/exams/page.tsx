'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  Eye,
  UserPlus,
  Loader2,
  CheckCircle,
  PlayCircle,
  CalendarDays,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { examsAPI, Exam, ExamSubject, CreateExamData } from '@/services/api';

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
  ongoingExams: number;
  completedExams: number;
  totalRegistrations: number;
  activeRegistrations: number;
  examsByType: Record<string, number>;
  examsBySemester: Record<string, number>;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<ExamStats>({
    totalExams: 0,
    upcomingExams: 0,
    ongoingExams: 0,
    completedExams: 0,
    totalRegistrations: 0,
    activeRegistrations: 0,
    examsByType: {},
    examsBySemester: {},
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [examForm, setExamForm] = useState<CreateExamData>({
    name: '',
    examType: 'internal',
    academicYear: '',
    semester: 1,
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    eligibleCourses: [],
    subjects: [],
  });

  const [currentSubject, setCurrentSubject] = useState<ExamSubject>({
    subjectCode: '',
    subjectName: '',
    examDate: '',
    startTime: '',
    endTime: '',
    maxMarks: 100,
    duration: 180,
  });

  const courses = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
  ];

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examsAPI.getAll({
        academicYear: selectedYear || undefined,
        semester: selectedSemester ? parseInt(selectedSemester) : undefined,
        examType: selectedType || undefined,
        status: selectedStatus || undefined,
      });

      if (response.success) {
        setExams(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester, selectedType, selectedStatus]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await examsAPI.getStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchStats();
  }, [fetchExams]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (examForm.subjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await examsAPI.create(examForm);

      if (response.success) {
        toast.success('Exam created successfully');
        setIsCreateModalOpen(false);
        resetForm();
        fetchExams();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubject = () => {
    if (!currentSubject.subjectCode || !currentSubject.subjectName) {
      toast.error('Please fill in subject code and name');
      return;
    }

    setExamForm({
      ...examForm,
      subjects: [...examForm.subjects, currentSubject],
    });

    setCurrentSubject({
      subjectCode: '',
      subjectName: '',
      examDate: '',
      startTime: '',
      endTime: '',
      maxMarks: 100,
      duration: 180,
    });
  };

  const handleRemoveSubject = (index: number) => {
    setExamForm({
      ...examForm,
      subjects: examForm.subjects.filter((_, i) => i !== index),
    });
  };

  const handleUpdateExamStatus = async (examId: string, status: string) => {
    try {
      const response = await examsAPI.updateStatus(examId, status);
      if (response.success) {
        toast.success('Exam status updated successfully');
        fetchExams();
        fetchStats();
      } else {
        toast.error('Failed to update exam status');
      }
    } catch {
      toast.error('Failed to update exam status');
    }
  };

  const resetForm = () => {
    setExamForm({
      name: '',
      examType: 'internal',
      academicYear: '',
      semester: 1,
      startDate: '',
      endDate: '',
      registrationStartDate: '',
      registrationEndDate: '',
      eligibleCourses: [],
      subjects: [],
    });
    setCurrentSubject({
      subjectCode: '',
      subjectName: '',
      examDate: '',
      startTime: '',
      endTime: '',
      maxMarks: 100,
      duration: 180,
    });
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = searchQuery
      ? exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.examId.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedYear('');
    setSelectedSemester('');
  };

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exams...</p>
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
            Exam Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage exams, schedules, and student registrations
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Set up a new exam with subjects and schedule
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateExam} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="examName">Exam Name</Label>
                  <Input
                    id="examName"
                    value={examForm.name}
                    onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                    placeholder="e.g., Mid-Term Exams - Fall 2025"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select
                    value={examForm.examType}
                    onValueChange={(value: 'internal' | 'external' | 'practical' | 'viva') => setExamForm({ ...examForm, examType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="viva">Viva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={examForm.academicYear}
                    onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
                    placeholder="e.g., 2024-25"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={examForm.semester.toString()}
                    onValueChange={(value) => setExamForm({ ...examForm, semester: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Exam Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={examForm.startDate}
                    onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Exam End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={examForm.endDate}
                    onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regStartDate">Registration Start Date</Label>
                  <Input
                    id="regStartDate"
                    type="date"
                    value={examForm.registrationStartDate}
                    onChange={(e) => setExamForm({ ...examForm, registrationStartDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regEndDate">Registration End Date</Label>
                  <Input
                    id="regEndDate"
                    type="date"
                    value={examForm.registrationEndDate}
                    onChange={(e) => setExamForm({ ...examForm, registrationEndDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Eligible Courses</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {courses.map((course) => (
                    <label key={course} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={examForm.eligibleCourses.includes(course)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExamForm({
                              ...examForm,
                              eligibleCourses: [...examForm.eligibleCourses, course],
                            });
                          } else {
                            setExamForm({
                              ...examForm,
                              eligibleCourses: examForm.eligibleCourses.filter(c => c !== course),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{course}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Add Subject Section */}
              <div className="space-y-4">
                <Label>Add Subjects</Label>
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subjectCode">Subject Code</Label>
                      <Input
                        id="subjectCode"
                        value={currentSubject.subjectCode}
                        onChange={(e) => setCurrentSubject({ ...currentSubject, subjectCode: e.target.value })}
                        placeholder="e.g., CS101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectName">Subject Name</Label>
                      <Input
                        id="subjectName"
                        value={currentSubject.subjectName}
                        onChange={(e) => setCurrentSubject({ ...currentSubject, subjectName: e.target.value })}
                        placeholder="e.g., Programming Fundamentals"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examDate">Exam Date</Label>
                      <Input
                        id="examDate"
                        type="date"
                        value={currentSubject.examDate}
                        onChange={(e) => setCurrentSubject({ ...currentSubject, examDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={currentSubject.startTime}
                        onChange={(e) => setCurrentSubject({ ...currentSubject, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={currentSubject.endTime}
                        onChange={(e) => setCurrentSubject({ ...currentSubject, endTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxMarks">Max Marks</Label>
                      <Input
                        id="maxMarks"
                        type="number"
                        min="1"
                        value={currentSubject.maxMarks}
                        onChange={(e) => setCurrentSubject({ ...currentSubject, maxMarks: parseInt(e.target.value) || 100 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={currentSubject.duration}
                        onChange={(e) => setCurrentSubject({ ...currentSubject, duration: parseInt(e.target.value) || 180 })}
                      />
                    </div>
                  </div>

                  <Button type="button" onClick={handleAddSubject} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                  </Button>
                </div>

                {/* Added Subjects */}
                {examForm.subjects.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Subjects ({examForm.subjects.length})</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {examForm.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{subject.subjectCode} - {subject.subjectName}</p>
                            <p className="text-sm text-muted-foreground">
                              {subject.examDate} | {subject.startTime} - {subject.endTime} | {subject.maxMarks} marks | {subject.duration} min
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSubject(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Exam
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">{stats.totalExams}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-600">
              {stats.upcomingExams}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
            <PlayCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.ongoingExams}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRegistrations}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.activeRegistrations} active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find exams by name, ID, or filter by type, status, and academic details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by exam name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
                <SelectItem value="viva">Viva</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="registration_open">Registration Open</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2023-24">2023-24</SelectItem>
                <SelectItem value="2022-23">2022-23</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Sem" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || selectedType || selectedStatus || selectedYear || selectedSemester) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exams ({filteredExams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exams found</h3>
              <p className="text-muted-foreground mb-4">
                {exams.length === 0
                  ? "There are no exams in the system yet."
                  : "No exams match your current filters."}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Exam
              </Button>
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
                  {filteredExams.map((exam) => {
                    const StatusIcon = statusIcons[exam.status];

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
                                {exam.subjects.length} subjects
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ID: {exam.examId}
                            </p>
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
                            <p className="text-xs text-muted-foreground">
                              {exam.eligibleCourses.length} courses eligible
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Duration: {Math.ceil((new Date(exam.endDate).getTime() - new Date(exam.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(exam.registrationStartDate).toLocaleDateString()} - {new Date(exam.registrationEndDate).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Registration period
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={statusColors[exam.status]}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {exam.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
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
                              <DropdownMenuItem>
                                <Users className="mr-2 h-4 w-4" />
                                View Registrations
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {exam.status === 'upcoming' && (
                                <DropdownMenuItem onClick={() => handleUpdateExamStatus(exam.id, 'registration_open')}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Open Registration
                                </DropdownMenuItem>
                              )}
                              {exam.status === 'registration_open' && (
                                <DropdownMenuItem onClick={() => handleUpdateExamStatus(exam.id, 'ongoing')}>
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  Start Exam
                                </DropdownMenuItem>
                              )}
                              {exam.status === 'ongoing' && (
                                <DropdownMenuItem onClick={() => handleUpdateExamStatus(exam.id, 'completed')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Complete Exam
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </div>
  );
}