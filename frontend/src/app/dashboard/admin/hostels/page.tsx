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
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  Bed,
  Eye,
  UserPlus,
  Loader2,
  Phone,
  Mail,
  MapPin,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  hostelsAPI,
  studentsAPI,
  Hostel,
  HostelRoom,
  Student,
  CreateHostelData,
  CreateRoomData,
  AllocateRoomData
} from '@/services/api';

interface HostelStats {
  totalHostels: number;
  totalRooms: number;
  totalCapacity: number;
  currentOccupancy: number;
  availableSpaces: number;
  occupancyRate: number;
  hostelTypes: {
    boys: number;
    girls: number;
  };
}

export default function HostelsPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<HostelStats>({
    totalHostels: 0,
    totalRooms: 0,
    totalCapacity: 0,
    currentOccupancy: 0,
    availableSpaces: 0,
    occupancyRate: 0,
    hostelTypes: { boys: 0, girls: 0 },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isCreateHostelModalOpen, setIsCreateHostelModalOpen] = useState(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [availableRooms, setAvailableRooms] = useState<HostelRoom[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [hostelForm, setHostelForm] = useState<CreateHostelData>({
    name: '',
    type: 'boys',
    capacity: 0,
    warden: {
      name: '',
      phone: '',
      email: '',
    },
    address: '',
    facilities: [],
    rules: [],
  });

  const [roomForm, setRoomForm] = useState<CreateRoomData>({
    hostelId: '',
    roomNumber: '',
    floor: 1,
    capacity: 1,
    type: 'single',
    rent: 0,
    facilities: [],
  });

  const [allocationForm, setAllocationForm] = useState<AllocateRoomData>({
    studentId: '',
    roomId: '',
    monthlyRent: 0,
    securityDeposit: 0,
  });

  const [facilitiesInput, setFacilitiesInput] = useState('');
  const [rulesInput, setRulesInput] = useState('');
  const [roomFacilitiesInput, setRoomFacilitiesInput] = useState('');

  const fetchHostels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hostelsAPI.getAll({
        type: selectedType as 'boys' | 'girls' | undefined,
      });

      if (response.success) {
        setHostels(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch hostels');
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
      toast.error('Failed to fetch hostels');
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

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
      const response = await hostelsAPI.getStatistics();
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
    fetchHostels();
    fetchStudents();
    fetchStats();
  }, [fetchHostels]);

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const hostelData = {
        ...hostelForm,
        facilities: facilitiesInput.split(',').map(f => f.trim()).filter(Boolean),
        rules: rulesInput.split(',').map(r => r.trim()).filter(Boolean),
      };

      const response = await hostelsAPI.create(hostelData);

      if (response.success) {
        toast.success('Hostel created successfully');
        setIsCreateHostelModalOpen(false);
        resetHostelForm();
        fetchHostels();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to create hostel');
      }
    } catch (error) {
      console.error('Error creating hostel:', error);
      toast.error('Failed to create hostel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const roomData = {
        ...roomForm,
        facilities: roomFacilitiesInput.split(',').map(f => f.trim()).filter(Boolean),
      };

      const response = await hostelsAPI.createRoom(roomData);

      if (response.success) {
        toast.success('Room created successfully');
        setIsCreateRoomModalOpen(false);
        resetRoomForm();
        fetchHostels();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await hostelsAPI.allocateRoom(allocationForm);

      if (response.success) {
        toast.success('Room allocated successfully');
        setIsAllocateModalOpen(false);
        resetAllocationForm();
        fetchHostels();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to allocate room');
      }
    } catch (error) {
      console.error('Error allocating room:', error);
      toast.error('Failed to allocate room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateRoomModal = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setRoomForm({ ...roomForm, hostelId: hostel.id });
    setIsCreateRoomModalOpen(true);
  };

  const openAllocateModal = async (hostel: Hostel) => {
    setSelectedHostel(hostel);
    try {
      const response = await hostelsAPI.getAvailableRooms(hostel.id);
      if (response.success) {
        setAvailableRooms(response.data || []);
        setIsAllocateModalOpen(true);
      } else {
        toast.error('Failed to fetch available rooms');
      }
    } catch {
      toast.error('Failed to fetch available rooms');
    }
  };

  const resetHostelForm = () => {
    setHostelForm({
      name: '',
      type: 'boys',
      capacity: 0,
      warden: { name: '', phone: '', email: '' },
      address: '',
      facilities: [],
      rules: [],
    });
    setFacilitiesInput('');
    setRulesInput('');
  };

  const resetRoomForm = () => {
    setRoomForm({
      hostelId: '',
      roomNumber: '',
      floor: 1,
      capacity: 1,
      type: 'single',
      rent: 0,
      facilities: [],
    });
    setRoomFacilitiesInput('');
  };

  const resetAllocationForm = () => {
    setAllocationForm({
      studentId: '',
      roomId: '',
      monthlyRent: 0,
      securityDeposit: 0,
    });
  };

  const filteredHostels = hostels.filter((hostel) => {
    const matchesSearch = searchQuery
      ? hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hostel.warden.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
  };

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hostels...</p>
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
            Hostel Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage hostels, rooms, and allocations
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateHostelModalOpen} onOpenChange={setIsCreateHostelModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Hostel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Hostel</DialogTitle>
                <DialogDescription>
                  Add a new hostel to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateHostel} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hostel Name</Label>
                    <Input
                      id="name"
                      value={hostelForm.name}
                      onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
                      placeholder="e.g., Boys Hostel A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={hostelForm.type}
                      onValueChange={(value: 'boys' | 'girls') => setHostelForm({ ...hostelForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boys">Boys</SelectItem>
                        <SelectItem value="girls">Girls</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Total Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={hostelForm.capacity}
                    onChange={(e) => setHostelForm({ ...hostelForm, capacity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label>Warden Information</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wardenName">Warden Name</Label>
                      <Input
                        id="wardenName"
                        value={hostelForm.warden.name}
                        onChange={(e) => setHostelForm({
                          ...hostelForm,
                          warden: { ...hostelForm.warden, name: e.target.value }
                        })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wardenPhone">Phone</Label>
                      <Input
                        id="wardenPhone"
                        value={hostelForm.warden.phone}
                        onChange={(e) => setHostelForm({
                          ...hostelForm,
                          warden: { ...hostelForm.warden, phone: e.target.value }
                        })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wardenEmail">Warden Email</Label>
                    <Input
                      id="wardenEmail"
                      type="email"
                      value={hostelForm.warden.email}
                      onChange={(e) => setHostelForm({
                        ...hostelForm,
                        warden: { ...hostelForm.warden, email: e.target.value }
                      })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={hostelForm.address}
                    onChange={(e) => setHostelForm({ ...hostelForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                  <Textarea
                    id="facilities"
                    value={facilitiesInput}
                    onChange={(e) => setFacilitiesInput(e.target.value)}
                    placeholder="WiFi, Laundry, Mess, Recreation Room"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">Rules (comma-separated)</Label>
                  <Textarea
                    id="rules"
                    value={rulesInput}
                    onChange={(e) => setRulesInput(e.target.value)}
                    placeholder="No smoking, Visitors allowed until 8 PM, Maintain cleanliness"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateHostelModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Hostel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">{stats.totalHostels}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Boys: {stats.hostelTypes.boys} | Girls: {stats.hostelTypes.girls}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalCapacity}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/5" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
            <Bed className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.currentOccupancy}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.occupancyRate}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.availableSpaces} spaces available
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
            Find hostels by name or warden name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by hostel name or warden name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boys">Boys Hostels</SelectItem>
                <SelectItem value="girls">Girls Hostels</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || selectedType) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hostels Table */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Hostels ({filteredHostels.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHostels.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hostels found</h3>
              <p className="text-muted-foreground mb-4">
                {hostels.length === 0
                  ? "There are no hostels in the system yet."
                  : "No hostels match your current filters."}
              </p>
              <Button onClick={() => setIsCreateHostelModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Hostel
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hostel Info</TableHead>
                    <TableHead>Warden Details</TableHead>
                    <TableHead>Capacity & Occupancy</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHostels.map((hostel) => (
                    <TableRow key={hostel.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{hostel.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {hostel.address ? `${hostel.address.substring(0, 50)}...` : 'Address not available'}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            ID: {hostel.hostelId}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{hostel.warden?.name || 'Warden not assigned'}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {hostel.warden?.phone || 'Phone not available'}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {hostel.warden?.email || 'Email not available'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Capacity: {hostel.capacity}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(hostel.capacity > 0 ? 60 : 0)}%`  // Mock occupancy
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            60% occupied  {/* Mock data */}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            hostel.type === 'boys'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                          }
                        >
                          {hostel.type}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
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
                            <DropdownMenuItem onClick={() => openCreateRoomModal(hostel)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Room
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAllocateModal(hostel)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Allocate Room
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Occupancy Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Room Modal */}
      <Dialog open={isCreateRoomModalOpen} onOpenChange={setIsCreateRoomModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Add a new room to {selectedHostel?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  placeholder="e.g., 101"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  min="1"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="4"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type</Label>
                <Select
                  value={roomForm.type}
                  onValueChange={(value: 'single' | 'double' | 'triple' | 'quad') => setRoomForm({ ...roomForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="triple">Triple</SelectItem>
                    <SelectItem value="quad">Quad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent">Monthly Rent (₹)</Label>
              <Input
                id="rent"
                type="number"
                min="0"
                value={roomForm.rent}
                onChange={(e) => setRoomForm({ ...roomForm, rent: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomFacilities">Room Facilities (comma-separated)</Label>
              <Textarea
                id="roomFacilities"
                value={roomFacilitiesInput}
                onChange={(e) => setRoomFacilitiesInput(e.target.value)}
                placeholder="AC, Attached Bathroom, Study Table, Wardrobe"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateRoomModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Room
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Allocate Room Modal */}
      <Dialog open={isAllocateModalOpen} onOpenChange={setIsAllocateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Room</DialogTitle>
            <DialogDescription>
              Allocate a room in {selectedHostel?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocateRoom} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select
                value={allocationForm.studentId}
                onValueChange={(value) => setAllocationForm({ ...allocationForm, studentId: value })}
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
              <Label htmlFor="room">Available Room</Label>
              <Select
                value={allocationForm.roomId}
                onValueChange={(value) => {
                  const room = availableRooms.find(r => r.id === value);
                  setAllocationForm({
                    ...allocationForm,
                    roomId: value,
                    monthlyRent: room?.rent || 0
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.roomNumber} - Floor {room.floor} ({room.type}) - ₹{room.rent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  min="0"
                  value={allocationForm.monthlyRent}
                  onChange={(e) => setAllocationForm({ ...allocationForm, monthlyRent: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  min="0"
                  value={allocationForm.securityDeposit}
                  onChange={(e) => setAllocationForm({ ...allocationForm, securityDeposit: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAllocateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Allocate Room
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}