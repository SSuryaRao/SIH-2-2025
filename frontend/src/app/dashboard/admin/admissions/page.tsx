'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

interface Admission {
  admissionId: string;
  applicationNumber: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
  };
  academicInfo: {
    appliedCourse: string;
    appliedBranch: string;
  };
  status: string;
  submittedAt: string;
  lastUpdatedAt: string;
  reviewInfo?: {
    reviewComments?: string;
    reviewedBy?: string;
    reviewedAt?: string;
  };
}

interface AdmissionStats {
  total: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
  waitlisted: number;
  courseWise: Record<string, number>;
  branchWise: Record<string, number>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'waitlisted':
      return 'bg-purple-100 text-purple-800';
    case 'converted_to_student':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [stats, setStats] = useState<AdmissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    comments: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    course: '',
    search: ''
  });

  const fetchAdmissions = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admissions', {
        headers: {
          Authorization: `Bearer ${Cookies.get('auth-token') || localStorage.getItem('auth-token')}`
        },
        params: filters
      });

      if (response.data.success) {
        setAdmissions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast.error('Failed to fetch admissions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admissions/stats', {
        headers: {
          Authorization: `Bearer ${Cookies.get('auth-token') || localStorage.getItem('auth-token')}`
        }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch admission statistics');
    }
  }, []);

  useEffect(() => {
    fetchAdmissions();
    fetchStats();
  }, [fetchAdmissions, fetchStats]);

  const handleStatusUpdate = async () => {
    if (!selectedAdmission || !statusUpdate.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admissions/${selectedAdmission.admissionId}/status`,
        statusUpdate,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('auth-token') || localStorage.getItem('auth-token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Application status updated successfully');
        setStatusUpdateModal(false);
        setSelectedAdmission(null);
        setStatusUpdate({ status: '', comments: '' });
        fetchAdmissions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleConvertToStudent = async (admissionId: string) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/admissions/${admissionId}/convert-to-student`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('auth-token') || localStorage.getItem('auth-token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Application converted to student record successfully');
        fetchAdmissions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error converting to student:', error);
      toast.error('Failed to convert application to student record');
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    const matchesStatus = !filters.status || admission.status === filters.status;
    const matchesCourse = !filters.course || admission.academicInfo.appliedCourse === filters.course;
    const matchesSearch = !filters.search ||
      admission.personalInfo.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      admission.applicationNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      admission.personalInfo.email.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesCourse && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Admission Management</h1>
        <p className="text-gray-600">Manage and review admission applications</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.submitted}</div>
              <div className="text-sm text-gray-600">Submitted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.under_review}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.waitlisted}</div>
              <div className="text-sm text-gray-600">Waitlisted</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search applications..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.course}
              onChange={(e) => setFilters({ ...filters, course: e.target.value })}
            >
              <option value="">All Courses</option>
              {stats && Object.keys(stats.courseWise).map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <Button onClick={fetchAdmissions} variant="outline">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredAdmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAdmissions.map((admission) => (
              <div key={admission.admissionId} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{admission.personalInfo.name}</h3>
                    <p className="text-sm text-gray-600">{admission.applicationNumber}</p>
                    <p className="text-sm text-gray-600">{admission.personalInfo.email}</p>
                  </div>
                  <Badge className={getStatusColor(admission.status)}>
                    {admission.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Applied Course</label>
                    <p>{admission.academicInfo.appliedCourse}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Applied Branch</label>
                    <p>{admission.academicInfo.appliedBranch}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted On</label>
                    <p>{new Date(admission.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {admission.reviewInfo?.reviewComments && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <label className="text-sm font-medium text-gray-500">Review Comments</label>
                    <p className="text-sm">{admission.reviewInfo.reviewComments}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAdmission(admission);
                      setStatusUpdateModal(true);
                      setStatusUpdate({ status: admission.status, comments: admission.reviewInfo?.reviewComments || '' });
                    }}
                  >
                    Update Status
                  </Button>

                  {admission.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-300"
                      onClick={() => handleConvertToStudent(admission.admissionId)}
                    >
                      Convert to Student
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredAdmissions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No applications found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      {statusUpdateModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Application Status</CardTitle>
              <CardDescription>
                {selectedAdmission.personalInfo.name} - {selectedAdmission.applicationNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="waitlisted">Waitlisted</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Comments</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  placeholder="Add review comments..."
                  value={statusUpdate.comments}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, comments: e.target.value })}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleStatusUpdate} className="flex-1">
                  Update Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusUpdateModal(false);
                    setSelectedAdmission(null);
                    setStatusUpdate({ status: '', comments: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}