'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

interface ApplicationData {
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
    reviewedAt?: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'waitlisted':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'converted_to_student':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'Application Submitted';
    case 'under_review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'waitlisted':
      return 'Waitlisted';
    case 'converted_to_student':
      return 'Admission Confirmed';
    default:
      return status;
  }
};

export default function TrackApplicationPage() {
  const [applicationNumber, setApplicationNumber] = useState('');
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackApplication = async () => {
    if (!applicationNumber.trim()) {
      toast.error('Please enter a valid application number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `http://localhost:5000/api/admissions/track/${applicationNumber}`
      );

      if (response.data.success) {
        setApplicationData(response.data.data);
      } else {
        setError(response.data.message || 'Application not found');
        setApplicationData(null);
      }
    } catch (error) {
      console.error('Track application error:', error);
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 404) {
        setError('Application not found. Please check your application number.');
      } else {
        setError('Failed to track application. Please try again.');
      }
      setApplicationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Application</h1>
          <p className="text-gray-600">Enter your application number to check the status</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Tracker</CardTitle>
            <CardDescription>
              Enter the application number you received after submitting your admission application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter your application number (e.g., ADM2024123456)"
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value.toUpperCase())}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleTrackApplication()}
              />
              <Button
                onClick={handleTrackApplication}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Tracking...
                  </div>
                ) : (
                  'Track Application'
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {applicationData && (
          <div className="space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-3">
                      <span>Application Status</span>
                      <Badge className={`${getStatusColor(applicationData.status)} border`}>
                        {getStatusText(applicationData.status)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Application Number: {applicationData.applicationNumber}</CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Submitted: {formatDate(applicationData.submittedAt)}</div>
                    <div>Last Updated: {formatDate(applicationData.lastUpdatedAt)}</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Applicant Information */}
            <Card>
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-medium">{applicationData.personalInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                    <p className="text-lg">{applicationData.personalInfo.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="text-lg">{applicationData.personalInfo.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Applied Course</label>
                    <p className="text-lg font-medium">{applicationData.academicInfo.appliedCourse}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Applied Branch</label>
                    <p className="text-lg">{applicationData.academicInfo.appliedBranch}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 pb-4">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium">Application Submitted</p>
                      <p className="text-sm text-gray-500">{formatDate(applicationData.submittedAt)}</p>
                    </div>
                  </div>

                  {applicationData.status !== 'submitted' && (
                    <div className="flex items-center space-x-4 pb-4">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium">Application Under Review</p>
                        <p className="text-sm text-gray-500">Your application is being reviewed by admissions committee</p>
                      </div>
                    </div>
                  )}

                  {(applicationData.status === 'approved' ||
                    applicationData.status === 'rejected' ||
                    applicationData.status === 'waitlisted' ||
                    applicationData.status === 'converted_to_student') && applicationData.reviewInfo && (
                    <div className="flex items-center space-x-4 pb-4">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                        applicationData.status === 'approved' || applicationData.status === 'converted_to_student'
                          ? 'bg-green-500'
                          : applicationData.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {applicationData.status === 'approved' && 'Application Approved'}
                          {applicationData.status === 'rejected' && 'Application Rejected'}
                          {applicationData.status === 'waitlisted' && 'Application Waitlisted'}
                          {applicationData.status === 'converted_to_student' && 'Admission Confirmed'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {applicationData.reviewInfo.reviewedAt && formatDate(applicationData.reviewInfo.reviewedAt)}
                        </p>
                        {applicationData.reviewInfo.reviewComments && (
                          <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-md">
                            {applicationData.reviewInfo.reviewComments}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {applicationData.status === 'converted_to_student' && (
                    <div className="flex items-center space-x-4 pb-4">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-emerald-700">Welcome to the College!</p>
                        <p className="text-sm text-gray-500">
                          Your admission is confirmed. You will receive further instructions via email.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                {applicationData.status === 'submitted' && (
                  <div className="space-y-2">
                    <p>• Your application is being processed</p>
                    <p>• You will be notified via email about any updates</p>
                    <p>• The review process typically takes 5-7 business days</p>
                  </div>
                )}

                {applicationData.status === 'under_review' && (
                  <div className="space-y-2">
                    <p>• Your application is currently under review</p>
                    <p>• The admissions committee is evaluating your documents</p>
                    <p>• Results will be communicated within 3-5 business days</p>
                  </div>
                )}

                {applicationData.status === 'approved' && (
                  <div className="space-y-2 text-green-700">
                    <p>• Congratulations! Your application has been approved</p>
                    <p>• You will receive admission confirmation and fee payment instructions</p>
                    <p>• Complete the fee payment to secure your seat</p>
                  </div>
                )}

                {applicationData.status === 'waitlisted' && (
                  <div className="space-y-2 text-purple-700">
                    <p>• Your application is on the waitlist</p>
                    <p>• You will be notified if a seat becomes available</p>
                    <p>• Keep checking your email for updates</p>
                  </div>
                )}

                {applicationData.status === 'rejected' && (
                  <div className="space-y-2 text-red-700">
                    <p>• Unfortunately, your application was not successful this time</p>
                    <p>• You may apply again in the next admission cycle</p>
                    <p>• Contact admissions office for feedback if needed</p>
                  </div>
                )}

                {applicationData.status === 'converted_to_student' && (
                  <div className="space-y-2 text-emerald-700">
                    <p>• Your admission is confirmed!</p>
                    <p>• Check your email for student registration details</p>
                    <p>• Visit the college for document verification</p>
                    <p>• Attend orientation program as scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-2">Admissions Office</h3>
                    <p className="text-sm text-gray-600">admissions@college.edu</p>
                    <p className="text-sm text-gray-600">+91 12345 67890</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium mb-2">Help Desk</h3>
                    <p className="text-sm text-gray-600">helpdesk@college.edu</p>
                    <p className="text-sm text-gray-600">+91 12345 67891</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-medium mb-2">Office Hours</h3>
                    <p className="text-sm text-gray-600">Mon - Fri: 9 AM - 5 PM</p>
                    <p className="text-sm text-gray-600">Sat: 9 AM - 1 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}