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
  CreditCard,
  Plus,
  Search,
  MoreHorizontal,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { feesAPI, studentsAPI, Fee, Student, CreateFeeStructureData, RecordPaymentData } from '@/services/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const statusIcons = {
  pending: Clock,
  partial: AlertCircle,
  completed: CheckCircle,
};

interface FeeStats {
  totalFees: number;
  totalCollected: number;
  totalPending: number;
  completedFees: number;
  pendingFees: number;
  partialFees: number;
}

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<FeeStats>({
    totalFees: 0,
    totalCollected: 0,
    totalPending: 0,
    completedFees: 0,
    pendingFees: 0,
    partialFees: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateFeeStructureData>({
    studentId: '',
    academicYear: '',
    semester: 1,
    feeStructure: {
      tuitionFee: 0,
      labFee: 0,
      libraryFee: 0,
      examFee: 0,
      developmentFee: 0,
    },
  });

  const [paymentForm, setPaymentForm] = useState<RecordPaymentData>({
    amount: 0,
    paymentMode: 'cash',
    transactionId: '',
    receiptNumber: '',
  });

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await feesAPI.getAll({
        academicYear: selectedYear || undefined,
        semester: selectedSemester ? parseInt(selectedSemester) : undefined,
        status: selectedStatus || undefined,
      });

      if (response.success) {
        setFees(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch fees');
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester, selectedStatus]);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      if (response.success) {
        setStudents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await feesAPI.getFeeStatistics();
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
    fetchFees();
    fetchStudents();
    fetchStats();
  }, [fetchFees]);

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await feesAPI.createFeeStructure(createForm);

      if (response.success) {
        toast.success('Fee structure created successfully');
        setIsCreateModalOpen(false);
        setCreateForm({
          studentId: '',
          academicYear: '',
          semester: 1,
          feeStructure: {
            tuitionFee: 0,
            labFee: 0,
            libraryFee: 0,
            examFee: 0,
            developmentFee: 0,
          },
        });
        fetchFees();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to create fee structure');
      }
    } catch (error) {
      console.error('Error creating fee structure:', error);
      toast.error('Failed to create fee structure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedFee) return;

    try {
      setIsSubmitting(true);
      const response = await feesAPI.recordPayment(selectedFee.id, paymentForm);

      if (response.success) {
        toast.success('Payment recorded successfully');
        setIsPaymentModalOpen(false);
        setPaymentForm({
          amount: 0,
          paymentMode: 'cash',
          transactionId: '',
          receiptNumber: '',
        });
        fetchFees();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentModal = (fee: Fee) => {
    setSelectedFee(fee);
    setPaymentForm({
      amount: fee.balance,
      paymentMode: 'cash',
      transactionId: '',
      receiptNumber: '',
    });
    setIsPaymentModalOpen(true);
  };

  const filteredFees = fees.filter((fee) => {
    const student = students.find(s => s.id === fee.studentId);
    const matchesSearch = searchQuery
      ? student?.personalInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student?.academicInfo.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.feeId.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedYear('');
    setSelectedSemester('');
  };

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading fees...</p>
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
            Fee Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage student fees and payment records
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Fee Structure</DialogTitle>
              <DialogDescription>
                Create a new fee structure for a student
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateFeeStructure} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select
                    value={createForm.studentId}
                    onValueChange={(value) => setCreateForm({ ...createForm, studentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.personalInfo.name} - {student.academicInfo.rollNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    placeholder="e.g., 2024-25"
                    value={createForm.academicYear}
                    onChange={(e) => setCreateForm({ ...createForm, academicYear: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={createForm.semester.toString()}
                  onValueChange={(value) => setCreateForm({ ...createForm, semester: parseInt(value) })}
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

              <div className="space-y-4">
                <Label>Fee Structure</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tuitionFee">Tuition Fee</Label>
                    <Input
                      id="tuitionFee"
                      type="number"
                      min="0"
                      value={createForm.feeStructure.tuitionFee}
                      onChange={(e) => setCreateForm({
                        ...createForm,
                        feeStructure: {
                          ...createForm.feeStructure,
                          tuitionFee: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="labFee">Lab Fee</Label>
                    <Input
                      id="labFee"
                      type="number"
                      min="0"
                      value={createForm.feeStructure.labFee}
                      onChange={(e) => setCreateForm({
                        ...createForm,
                        feeStructure: {
                          ...createForm.feeStructure,
                          labFee: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="libraryFee">Library Fee</Label>
                    <Input
                      id="libraryFee"
                      type="number"
                      min="0"
                      value={createForm.feeStructure.libraryFee}
                      onChange={(e) => setCreateForm({
                        ...createForm,
                        feeStructure: {
                          ...createForm.feeStructure,
                          libraryFee: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="examFee">Exam Fee</Label>
                    <Input
                      id="examFee"
                      type="number"
                      min="0"
                      value={createForm.feeStructure.examFee}
                      onChange={(e) => setCreateForm({
                        ...createForm,
                        feeStructure: {
                          ...createForm.feeStructure,
                          examFee: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developmentFee">Development Fee</Label>
                    <Input
                      id="developmentFee"
                      type="number"
                      min="0"
                      value={createForm.feeStructure.developmentFee}
                      onChange={(e) => setCreateForm({
                        ...createForm,
                        feeStructure: {
                          ...createForm.feeStructure,
                          developmentFee: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-medium">
                    Total: ₹{Object.values(createForm.feeStructure).reduce((sum, fee) => sum + (fee || 0), 0).toLocaleString()}
                  </p>
                </div>
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
                  Create Fee Structure
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.totalCollected.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-yellow-600">
              ₹{stats.totalPending.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">{stats.totalFees}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedFees}
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
            Find fees by student name, roll number, or fee ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by student name, roll number, or fee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-25">2024-25</SelectItem>
                <SelectItem value="2023-24">2023-24</SelectItem>
                <SelectItem value="2022-23">2022-23</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Sem {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || selectedStatus || selectedYear || selectedSemester) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fees Table */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Records ({filteredFees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFees.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No fee records found</h3>
              <p className="text-muted-foreground mb-4">
                {fees.length === 0
                  ? "There are no fee records in the system yet."
                  : "No fee records match your current filters."}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Fee Structure
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Info</TableHead>
                    <TableHead>Academic Details</TableHead>
                    <TableHead>Fee Details</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => {
                    const student = students.find(s => s.id === fee.studentId);
                    const StatusIcon = statusIcons[fee.status];

                    return (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{student?.personalInfo.name || 'Unknown Student'}</p>
                            <p className="text-sm text-muted-foreground">
                              Roll: {student?.academicInfo.rollNumber || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Fee ID: {fee.feeId}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {fee.academicYear}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Semester {fee.semester}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Total: ₹{fee.feeStructure.total.toLocaleString()}
                            </p>
                            <p className="text-sm text-green-600">
                              Paid: ₹{fee.totalPaid.toLocaleString()}
                            </p>
                            <p className="text-sm text-orange-600">
                              Balance: ₹{fee.balance.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge className={statusColors[fee.status]}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {fee.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </div>
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
                              {fee.balance > 0 && (
                                <DropdownMenuItem onClick={() => openPaymentModal(fee)}>
                                  <Receipt className="mr-2 h-4 w-4" />
                                  Record Payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Receipt className="mr-2 h-4 w-4" />
                                View Receipt
                              </DropdownMenuItem>
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

      {/* Record Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {students.find(s => s.id === selectedFee?.studentId)?.personalInfo.name}
            </DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm space-y-1">
                  <p><strong>Total Fee:</strong> ₹{selectedFee.feeStructure.total.toLocaleString()}</p>
                  <p><strong>Already Paid:</strong> ₹{selectedFee.totalPaid.toLocaleString()}</p>
                  <p><strong>Balance:</strong> ₹{selectedFee.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max={selectedFee.balance}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select
                  value={paymentForm.paymentMode}
                  onValueChange={(value: 'cash' | 'card' | 'upi' | 'bank_transfer') => setPaymentForm({ ...paymentForm, paymentMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentForm.paymentMode !== 'cash' && (
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    placeholder="Enter transaction ID"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number (Optional)</Label>
                <Input
                  id="receiptNumber"
                  value={paymentForm.receiptNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Payment
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}