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
  CreditCard,
  Calendar,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Eye,
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
import { feesAPI, Fee, FeePayment } from '@/services/api';

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

interface FeesSummary {
  totalFees: number;
  totalPaid: number;
  totalPending: number;
  completedSemesters: number;
  pendingSemesters: number;
}

export default function MyFeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FeesSummary>({
    totalFees: 0,
    totalPaid: 0,
    totalPending: 0,
    completedSemesters: 0,
    pendingSemesters: 0,
  });

  const fetchMyFees = async () => {
    try {
      setLoading(true);
      const response = await feesAPI.getMyFees();

      if (response.success) {
        const feeData = response.data || [];
        setFees(feeData);

        // Calculate summary
        const summary = feeData.reduce(
          (acc: { totalFees: number; totalPaid: number; totalPending: number; completedSemesters: number; pendingSemesters: number }, fee: Fee) => ({
            totalFees: acc.totalFees + fee.feeStructure.total,
            totalPaid: acc.totalPaid + fee.totalPaid,
            totalPending: acc.totalPending + fee.balance,
            completedSemesters: acc.completedSemesters + (fee.status === 'completed' ? 1 : 0),
            pendingSemesters: acc.pendingSemesters + (fee.status !== 'completed' ? 1 : 0),
          }),
          { totalFees: 0, totalPaid: 0, totalPending: 0, completedSemesters: 0, pendingSemesters: 0 }
        );
        setSummary(summary);
      } else {
        toast.error(response.message || 'Failed to fetch fees');
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to fetch your fees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFees();
  }, []);

  const handleDownloadReceipt = (payment: FeePayment) => {
    toast.success(`Downloading receipt for ${payment.receiptNumber}`);
    // Implement actual download logic here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your fees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          My Fees
        </h1>
        <p className="text-muted-foreground mt-2">
          View your fee payment history and outstanding balances
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">
              ₹{summary.totalFees.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              All semesters combined
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-600">
              ₹{summary.totalPaid.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.completedSemesters} semesters completed
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-yellow-600">
              ₹{summary.totalPending.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.pendingSemesters} semesters pending
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalFees > 0 ? Math.round((summary.totalPaid / summary.totalFees) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Payment completion rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Records ({fees.length})
          </CardTitle>
          <CardDescription>
            Your complete fee payment history across all semesters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fees.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No fee records found</h3>
              <p className="text-muted-foreground">
                Your fee records will appear here once they are created by the administration.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Academic Details</TableHead>
                    <TableHead>Fee Breakdown</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => {
                    const StatusIcon = statusIcons[fee.status];

                    return (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              {fee.academicYear}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Semester {fee.semester}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Fee ID: {fee.feeId}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Total: ₹{fee.feeStructure.total.toLocaleString()}
                            </p>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              {fee.feeStructure.tuitionFee && (
                                <div>Tuition: ₹{fee.feeStructure.tuitionFee.toLocaleString()}</div>
                              )}
                              {fee.feeStructure.labFee && (
                                <div>Lab: ₹{fee.feeStructure.labFee.toLocaleString()}</div>
                              )}
                              {fee.feeStructure.libraryFee && (
                                <div>Library: ₹{fee.feeStructure.libraryFee.toLocaleString()}</div>
                              )}
                              {fee.feeStructure.examFee && (
                                <div>Exam: ₹{fee.feeStructure.examFee.toLocaleString()}</div>
                              )}
                              {fee.feeStructure.developmentFee && (
                                <div>Development: ₹{fee.feeStructure.developmentFee.toLocaleString()}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={statusColors[fee.status]}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {fee.status}
                            </Badge>
                            <div className="space-y-1 text-xs">
                              <div className="text-green-600">
                                Paid: ₹{fee.totalPaid.toLocaleString()}
                              </div>
                              {fee.balance > 0 && (
                                <div className="text-orange-600">
                                  Balance: ₹{fee.balance.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
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
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {fee.payments.length > 0 && (
                                <DropdownMenuItem>
                                  <Receipt className="mr-2 h-4 w-4" />
                                  Payment History
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

      {/* Payment History */}
      {fees.some(fee => fee.payments.length > 0) && (
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Recent Payments
            </CardTitle>
            <CardDescription>
              Your recent fee payments and receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fees.flatMap(fee =>
                fee.payments.map(payment => (
                  <div key={payment.paymentId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Receipt className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {fee.academicYear} - Semester {fee.semester}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString()} • {payment.paymentMode.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {payment.receiptNumber}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReceipt(payment)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}