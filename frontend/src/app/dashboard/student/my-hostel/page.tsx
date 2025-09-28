'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Home,
  Users,
  Bed,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Wifi,
  Car,
  Utensils,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { hostelsAPI, HostelAllocation, Hostel, HostelRoom } from '@/services/api';

interface AllocationWithDetails extends HostelAllocation {
  hostel?: Hostel;
  room?: HostelRoom;
}

const facilityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  parking: Car,
  mess: Utensils,
  security: Shield,
  laundry: Home,
  gym: Users,
  library: FileText,
};

export default function MyHostelPage() {
  const [allocation, setAllocation] = useState<AllocationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAllocation, setHasAllocation] = useState(false);

  const fetchMyAllocation = async () => {
    try {
      setLoading(true);
      const response = await hostelsAPI.getMyAllocation();

      if (response.success && response.data) {
        setAllocation(response.data);
        setHasAllocation(true);
      } else {
        setHasAllocation(false);
        // Don't show error toast for no allocation case
        if (response.message && !response.message.includes('not allocated')) {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error('Error fetching hostel allocation:', error);
      setHasAllocation(false);
      // Only show error for actual errors, not missing allocations
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status !== 404) {
        toast.error('Failed to fetch hostel information');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAllocation();
  }, []);

  const handleRequestVacate = () => {
    toast.info('Vacate request submitted. The administration will review your request.');
    // Implement actual vacate request logic here
  };

  const handlePayRent = () => {
    toast.info('Redirecting to payment gateway...');
    // Implement payment logic here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your hostel information...</p>
        </div>
      </div>
    );
  }

  if (!hasAllocation) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            My Hostel
          </h1>
          <p className="text-muted-foreground mt-2">
            Your hostel accommodation details
          </p>
        </div>

        <Card className="rounded-2xl shadow-md">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Hostel Allocation</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You don&apos;t have a hostel room allocated yet. Please contact the administration
                or submit a hostel application to get accommodation.
              </p>
              <div className="space-y-3">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Building2 className="mr-2 h-4 w-4" />
                  Apply for Hostel
                </Button>
                <div className="text-sm text-muted-foreground">
                  Need help? Contact the hostel administration
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          My Hostel
        </h1>
        <p className="text-muted-foreground mt-2">
          Your current hostel accommodation details
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Room Number</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">
              {allocation?.room?.roomNumber || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Floor {allocation?.room?.floor || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-600">
              ₹{allocation?.monthlyRent?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Per month
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Room Type</CardTitle>
            <Bed className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-yellow-600 capitalize">
              {allocation?.room?.type || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Capacity: {allocation?.room?.capacity || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="mr-1 h-3 w-3" />
                {allocation?.status || 'Active'}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Since {allocation?.allocatedDate ? new Date(allocation.allocatedDate).toLocaleDateString() : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hostel Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hostel Information
            </CardTitle>
            <CardDescription>
              Details about your assigned hostel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">{allocation?.hostel?.name || 'Unknown Hostel'}</p>
                  <p className="text-sm text-muted-foreground">
                    {allocation?.hostel?.type ?
                      `${allocation.hostel.type.charAt(0).toUpperCase() + allocation.hostel.type.slice(1)} Hostel` :
                      'Type not specified'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm">
                    {allocation?.hostel?.address || 'Address not available'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm">
                    Capacity: {allocation?.hostel?.capacity || 'Not specified'} students
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm">
                    Allocated on: {allocation?.allocatedDate ?
                      new Date(allocation.allocatedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Date not available'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Warden Contact
            </CardTitle>
            <CardDescription>
              Contact information for your hostel warden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{allocation?.hostel?.warden?.name || 'Warden name not available'}</p>
                  <p className="text-sm text-muted-foreground">Hostel Warden</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm">{allocation?.hostel?.warden?.phone || 'Phone not available'}</p>
                  <p className="text-xs text-muted-foreground">Mobile number</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Mail className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm">{allocation?.hostel?.warden?.email || 'Email not available'}</p>
                  <p className="text-xs text-muted-foreground">Email address</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Details and Facilities */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Room Details
            </CardTitle>
            <CardDescription>
              Specifications of your assigned room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">Room Number</p>
                  <p className="font-semibold">{allocation?.room?.roomNumber || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-semibold">{allocation?.room?.floor || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-semibold capitalize">{allocation?.room?.type || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold">{allocation?.room?.capacity || 0} students</p>
                </div>
              </div>

              {allocation?.room?.facilities && allocation.room.facilities.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Room Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {allocation.room.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Hostel Facilities
            </CardTitle>
            <CardDescription>
              Available facilities in your hostel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allocation?.hostel?.facilities && allocation.hostel.facilities.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {allocation.hostel.facilities.map((facility, index) => {
                  const FacilityIcon = facilityIcons[facility.toLowerCase()] || Shield;
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <FacilityIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm capitalize">{facility}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No facilities information available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Information */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Your hostel fee and payment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Monthly Rent</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₹{allocation?.monthlyRent?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Security Deposit</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ₹{allocation?.securityDeposit?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Next Due</span>
              </div>
              <p className="text-sm text-orange-600 font-medium">
                {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={handlePayRent}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Rent
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Payment History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hostel Rules */}
      {allocation?.hostel?.rules && allocation.hostel.rules.length > 0 && (
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Hostel Rules & Regulations
            </CardTitle>
            <CardDescription>
              Important rules and guidelines for hostel residents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allocation.hostel.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-2 p-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{rule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common hostel-related actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleRequestVacate}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Request Vacate
            </Button>
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Contact Warden
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}