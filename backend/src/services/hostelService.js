const { dbHelpers, collections } = require('../config/database');
const { generateUniqueId } = require('../utils/auth');

class HostelService {
  // Create new hostel
  async createHostel(hostelData) {
    try {
      const hostelDoc = {
        hostelId: generateUniqueId('HST'),
        ...hostelData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const hostel = await dbHelpers.addDocument(collections.HOSTELS, hostelDoc);
      return hostel;
    } catch (error) {
      throw new Error(`Failed to create hostel: ${error.message}`);
    }
  }

  // Create hostel room
  async createHostelRoom(roomData) {
    try {
      // Verify hostel exists
      const hostel = await dbHelpers.getDocument(collections.HOSTELS, roomData.hostelId);
      if (!hostel) {
        throw new Error('Hostel not found');
      }

      // Check if room number already exists in this hostel
      const existingRooms = await dbHelpers.getDocuments(collections.HOSTEL_ROOMS, [
        { field: 'hostelId', operator: '==', value: roomData.hostelId },
        { field: 'roomNumber', operator: '==', value: roomData.roomNumber }
      ]);

      if (existingRooms.length > 0) {
        throw new Error('Room number already exists in this hostel');
      }

      const roomDoc = {
        roomId: generateUniqueId('ROOM'),
        currentOccupancy: 0,
        isActive: true,
        ...roomData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const room = await dbHelpers.addDocument(collections.HOSTEL_ROOMS, roomDoc);
      return room;
    } catch (error) {
      throw new Error(`Failed to create hostel room: ${error.message}`);
    }
  }

  // Allocate room to student
  async allocateRoom(studentId, roomId, allocationData = {}) {
    try {
      // Verify student exists
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Verify room exists and is available
      const room = await dbHelpers.getDocument(collections.HOSTEL_ROOMS, roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      if (!room.isActive) {
        throw new Error('Room is not active');
      }

      if (room.currentOccupancy >= room.capacity) {
        throw new Error('Room is at full capacity');
      }

      // Check if student already has an active allocation
      const existingAllocations = await dbHelpers.getDocuments(collections.HOSTEL_ALLOCATIONS, [
        { field: 'studentId', operator: '==', value: studentId },
        { field: 'status', operator: '==', value: 'active' }
      ]);

      if (existingAllocations.length > 0) {
        throw new Error('Student already has an active room allocation');
      }

      // Create allocation record
      const allocationDoc = {
        allocationId: generateUniqueId('ALLOC'),
        studentId,
        roomId,
        hostelId: room.hostelId,
        allocatedDate: new Date(),
        status: 'active',
        monthlyRent: allocationData.monthlyRent || room.rent,
        securityDeposit: allocationData.securityDeposit || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const allocation = await dbHelpers.addDocument(collections.HOSTEL_ALLOCATIONS, allocationDoc);

      // Update room occupancy
      await dbHelpers.updateDocument(collections.HOSTEL_ROOMS, roomId, {
        currentOccupancy: room.currentOccupancy + 1
      });

      return allocation;
    } catch (error) {
      throw new Error(`Failed to allocate room: ${error.message}`);
    }
  }

  // Vacate room
  async vacateRoom(allocationId) {
    try {
      const allocation = await dbHelpers.getDocument(collections.HOSTEL_ALLOCATIONS, allocationId);
      if (!allocation) {
        throw new Error('Allocation not found');
      }

      if (allocation.status !== 'active') {
        throw new Error('Allocation is not active');
      }

      // Update allocation status
      const updatedAllocation = await dbHelpers.updateDocument(collections.HOSTEL_ALLOCATIONS, allocationId, {
        status: 'vacated',
        vacatedDate: new Date()
      });

      // Update room occupancy
      const room = await dbHelpers.getDocument(collections.HOSTEL_ROOMS, allocation.roomId);
      if (room && room.currentOccupancy > 0) {
        await dbHelpers.updateDocument(collections.HOSTEL_ROOMS, allocation.roomId, {
          currentOccupancy: room.currentOccupancy - 1
        });
      }

      return updatedAllocation;
    } catch (error) {
      throw new Error(`Failed to vacate room: ${error.message}`);
    }
  }

  // Get all hostels
  async getAllHostels(filters = {}) {
    try {
      const queryFilters = [];

      if (filters.type) {
        queryFilters.push({ field: 'type', operator: '==', value: filters.type });
      }

      const hostels = await dbHelpers.getDocuments(
        collections.HOSTELS,
        queryFilters,
        { field: 'name', direction: 'asc' }
      );

      return hostels;
    } catch (error) {
      throw new Error(`Failed to get hostels: ${error.message}`);
    }
  }

  // Get hostel by ID with room details
  async getHostelById(hostelId) {
    try {
      const hostel = await dbHelpers.getDocument(collections.HOSTELS, hostelId);
      if (!hostel) {
        throw new Error('Hostel not found');
      }

      // Get rooms for this hostel
      const rooms = await dbHelpers.getDocuments(collections.HOSTEL_ROOMS, [
        { field: 'hostelId', operator: '==', value: hostelId }
      ], { field: 'roomNumber', direction: 'asc' });

      return {
        ...hostel,
        rooms
      };
    } catch (error) {
      throw new Error(`Failed to get hostel: ${error.message}`);
    }
  }

  // Get available rooms in a hostel
  async getAvailableRooms(hostelId) {
    try {
      const rooms = await dbHelpers.getDocuments(collections.HOSTEL_ROOMS, [
        { field: 'hostelId', operator: '==', value: hostelId },
        { field: 'isActive', operator: '==', value: true }
      ]);

      // Filter rooms with available capacity
      const availableRooms = rooms.filter(room => room.currentOccupancy < room.capacity);

      return availableRooms;
    } catch (error) {
      throw new Error(`Failed to get available rooms: ${error.message}`);
    }
  }

  // Get student's current allocation
  async getStudentAllocation(studentId) {
    try {
      const allocations = await dbHelpers.getDocuments(collections.HOSTEL_ALLOCATIONS, [
        { field: 'studentId', operator: '==', value: studentId },
        { field: 'status', operator: '==', value: 'active' }
      ]);

      if (allocations.length === 0) {
        return null;
      }

      const allocation = allocations[0];

      // Get room and hostel details
      const room = await dbHelpers.getDocument(collections.HOSTEL_ROOMS, allocation.roomId);
      const hostel = await dbHelpers.getDocument(collections.HOSTELS, allocation.hostelId);

      return {
        ...allocation,
        room,
        hostel
      };
    } catch (error) {
      throw new Error(`Failed to get student allocation: ${error.message}`);
    }
  }

  // Get all allocations with filters
  async getAllAllocations(filters = {}) {
    try {
      const queryFilters = [];

      if (filters.hostelId) {
        queryFilters.push({ field: 'hostelId', operator: '==', value: filters.hostelId });
      }

      if (filters.status) {
        queryFilters.push({ field: 'status', operator: '==', value: filters.status });
      }

      if (filters.studentId) {
        queryFilters.push({ field: 'studentId', operator: '==', value: filters.studentId });
      }

      const allocations = await dbHelpers.getDocuments(
        collections.HOSTEL_ALLOCATIONS,
        queryFilters,
        { field: 'allocatedDate', direction: 'desc' }
      );

      return allocations;
    } catch (error) {
      throw new Error(`Failed to get allocations: ${error.message}`);
    }
  }

  // Get hostel occupancy report
  async getHostelOccupancyReport(hostelId) {
    try {
      const hostel = await dbHelpers.getDocument(collections.HOSTELS, hostelId);
      if (!hostel) {
        throw new Error('Hostel not found');
      }

      const rooms = await dbHelpers.getDocuments(collections.HOSTEL_ROOMS, [
        { field: 'hostelId', operator: '==', value: hostelId }
      ]);

      const activeAllocations = await dbHelpers.getDocuments(collections.HOSTEL_ALLOCATIONS, [
        { field: 'hostelId', operator: '==', value: hostelId },
        { field: 'status', operator: '==', value: 'active' }
      ]);

      const report = {
        hostel: {
          name: hostel.name,
          type: hostel.type,
          totalRooms: hostel.totalRooms
        },
        occupancy: {
          totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
          currentOccupancy: rooms.reduce((sum, room) => sum + room.currentOccupancy, 0),
          availableSpaces: rooms.reduce((sum, room) => sum + (room.capacity - room.currentOccupancy), 0),
          occupancyRate: 0
        },
        rooms: rooms.map(room => ({
          roomId: room.roomId,
          roomNumber: room.roomNumber,
          floor: room.floor,
          capacity: room.capacity,
          currentOccupancy: room.currentOccupancy,
          available: room.capacity - room.currentOccupancy,
          type: room.type,
          rent: room.rent
        })),
        activeAllocations: activeAllocations.length
      };

      // Calculate occupancy rate
      if (report.occupancy.totalCapacity > 0) {
        report.occupancy.occupancyRate = Math.round(
          (report.occupancy.currentOccupancy / report.occupancy.totalCapacity) * 100
        );
      }

      return report;
    } catch (error) {
      throw new Error(`Failed to get occupancy report: ${error.message}`);
    }
  }

  // Update room details
  async updateRoom(roomId, updateData) {
    try {
      const room = await dbHelpers.getDocument(collections.HOSTEL_ROOMS, roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Don't allow updating roomId, hostelId, or currentOccupancy directly
      const { roomId: _, hostelId: __, currentOccupancy: ___, ...allowedUpdates } = updateData;

      const updatedRoom = await dbHelpers.updateDocument(collections.HOSTEL_ROOMS, roomId, allowedUpdates);
      return updatedRoom;
    } catch (error) {
      throw new Error(`Failed to update room: ${error.message}`);
    }
  }

  // Update hostel details
  async updateHostel(hostelId, updateData) {
    try {
      const hostel = await dbHelpers.getDocument(collections.HOSTELS, hostelId);
      if (!hostel) {
        throw new Error('Hostel not found');
      }

      // Don't allow updating hostelId
      const { hostelId: _, ...allowedUpdates } = updateData;

      const updatedHostel = await dbHelpers.updateDocument(collections.HOSTELS, hostelId, allowedUpdates);
      return updatedHostel;
    } catch (error) {
      throw new Error(`Failed to update hostel: ${error.message}`);
    }
  }

  // Get hostel statistics
  async getHostelStatistics() {
    try {
      const hostels = await dbHelpers.getDocuments(collections.HOSTELS);
      const rooms = await dbHelpers.getDocuments(collections.HOSTEL_ROOMS);
      const activeAllocations = await dbHelpers.getDocuments(collections.HOSTEL_ALLOCATIONS, [
        { field: 'status', operator: '==', value: 'active' }
      ]);

      const stats = {
        totalHostels: hostels.length,
        totalRooms: rooms.length,
        totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
        currentOccupancy: rooms.reduce((sum, room) => sum + room.currentOccupancy, 0),
        activeAllocations: activeAllocations.length,
        availableSpaces: 0,
        occupancyRate: 0,
        hostelTypes: {
          boys: hostels.filter(h => h.type === 'boys').length,
          girls: hostels.filter(h => h.type === 'girls').length
        }
      };

      stats.availableSpaces = stats.totalCapacity - stats.currentOccupancy;
      if (stats.totalCapacity > 0) {
        stats.occupancyRate = Math.round((stats.currentOccupancy / stats.totalCapacity) * 100);
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get hostel statistics: ${error.message}`);
    }
  }
}

module.exports = new HostelService();