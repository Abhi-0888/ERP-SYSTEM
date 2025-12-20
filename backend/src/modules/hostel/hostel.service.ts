import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hostel, HostelDocument } from './hostel.schema';
import { Room, RoomDocument } from './hostel.schema';
import { CreateHostelDto, CreateRoomDto, AllocateRoomDto } from './hostel.dto';

@Injectable()
export class HostelService {
    constructor(
        @InjectModel(Hostel.name) private hostelModel: Model<HostelDocument>,
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    ) { }

    // ============= HOSTEL MANAGEMENT =============

    async createHostel(createHostelDto: CreateHostelDto): Promise<Hostel> {
        const newHostel = new this.hostelModel(createHostelDto);
        return newHostel.save();
    }

    async findAllHostels(filters: any): Promise<any> {
        const { universityId, page = 1, limit = 10 } = filters;
        const query: any = { isActive: true };

        if (universityId) {
            query.universityId = universityId;
        }

        const skip = (page - 1) * limit;
        const hostels = await this.hostelModel
            .find(query)
            .populate('wardenId')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        const total = await this.hostelModel.countDocuments(query);

        return {
            data: hostels,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findHostelById(id: string): Promise<Hostel> {
        const hostel = await this.hostelModel.findById(id).populate('wardenId').exec();
        if (!hostel) {
            throw new NotFoundException('Hostel not found');
        }
        return hostel;
    }

    async updateHostel(id: string, updateHostelDto: any): Promise<Hostel> {
        const hostel = await this.hostelModel
            .findByIdAndUpdate(id, updateHostelDto, { new: true })
            .exec();

        if (!hostel) {
            throw new NotFoundException('Hostel not found');
        }
        return hostel;
    }

    async deleteHostel(id: string): Promise<void> {
        const hostel = await this.hostelModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        if (!hostel) {
            throw new NotFoundException('Hostel not found');
        }
    }

    // ============= ROOM MANAGEMENT =============

    async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
        // Check if hostel exists
        const hostel = await this.hostelModel.findById(createRoomDto.hostelId);
        if (!hostel) {
            throw new NotFoundException('Hostel not found');
        }

        // Check if room already exists
        const existingRoom = await this.roomModel.findOne({
            hostelId: createRoomDto.hostelId,
            roomNumber: createRoomDto.roomNumber,
        });

        if (existingRoom) {
            throw new BadRequestException('Room with this number already exists in this hostel');
        }

        const newRoom = new this.roomModel(createRoomDto);
        return newRoom.save();
    }

    async findAllRooms(filters: any): Promise<any> {
        const { hostelId, page = 1, limit = 10 } = filters;
        const query: any = { isActive: true };

        if (hostelId) {
            query.hostelId = hostelId;
        }

        const skip = (page - 1) * limit;
        const rooms = await this.roomModel
            .find(query)
            .populate('hostelId occupants')
            .skip(skip)
            .limit(limit)
            .sort({ floor: 1, roomNumber: 1 })
            .exec();

        const total = await this.roomModel.countDocuments(query);

        return {
            data: rooms,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findRoomById(id: string): Promise<Room> {
        const room = await this.roomModel
            .findById(id)
            .populate('hostelId occupants')
            .exec();

        if (!room) {
            throw new NotFoundException('Room not found');
        }
        return room;
    }

    async getAvailableRooms(hostelId: string): Promise<Room[]> {
        return this.roomModel
            .find({
                hostelId,
                isActive: true,
                $expr: { $lt: [{ $size: '$occupants' }, '$capacity'] },
            })
            .populate('hostelId')
            .sort({ floor: 1, roomNumber: 1 })
            .exec();
    }

    // ============= ROOM ALLOCATION =============

    async allocateRoom(allocateRoomDto: AllocateRoomDto): Promise<any> {
        const { roomId, studentId } = allocateRoomDto;

        // Check if room exists
        const room = await this.roomModel.findById(roomId);
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        // Check if room is full
        if (room.occupants.length >= room.capacity) {
            throw new BadRequestException('Room is full');
        }

        // Check if student is already allocated
        const existingAllocation = await this.roomModel.findOne({
            occupants: studentId,
            isActive: true,
        });

        if (existingAllocation) {
            throw new BadRequestException('Student is already allocated to a room');
        }

        // Add student to room
        const updatedRoom = await this.roomModel.findByIdAndUpdate(
            roomId,
            { $addToSet: { occupants: studentId } },
            { new: true },
        );

        return {
            message: 'Student allocated to room successfully',
            room: updatedRoom,
        };
    }

    async deallocateRoom(roomId: string, studentId: string): Promise<any> {
        const room = await this.roomModel.findById(roomId);
        if (!room) {
            throw new NotFoundException('Room not found');
        }

        // Convert ObjectIds to strings for comparison
        const occupantIds = room.occupants.map(id => id.toString());
        if (!occupantIds.includes(studentId)) {
            throw new BadRequestException('Student is not allocated to this room');
        }

        const updatedRoom = await this.roomModel.findByIdAndUpdate(
            roomId,
            { $pull: { occupants: studentId } },
            { new: true },
        );

        return {
            message: 'Student deallocated from room successfully',
            room: updatedRoom,
        };
    }

    // ============= REPORTS =============

    async generateOccupancyReport(hostelId: string): Promise<any> {
        const hostel = await this.hostelModel.findById(hostelId);
        if (!hostel) {
            throw new NotFoundException('Hostel not found');
        }

        const rooms = await this.roomModel.find({ hostelId, isActive: true });

        let totalOccupancy = 0;
        let totalCapacity = 0;
        const roomDetails = [];

        for (const room of rooms) {
            totalCapacity += room.capacity;
            totalOccupancy += room.occupants.length;

            roomDetails.push({
                roomId: room._id,
                roomNumber: room.roomNumber,
                floor: room.floor,
                capacity: room.capacity,
                occupancy: room.occupants.length,
                occupancyPercentage: (room.occupants.length / room.capacity) * 100,
                available: room.capacity - room.occupants.length,
            });
        }

        return {
            hostelName: hostel.name,
            hostelId: hostel._id,
            totalRooms: rooms.length,
            totalCapacity,
            totalOccupancy,
            occupancyPercentage: (totalOccupancy / totalCapacity) * 100,
            availableSeats: totalCapacity - totalOccupancy,
            roomDetails,
            generatedAt: new Date(),
        };
    }

    async generateHostelSummary(universityId?: string): Promise<any> {
        const query: any = { isActive: true };
        if (universityId) {
            query.universityId = universityId;
        }

        const hostels = await this.hostelModel.find(query);

        const summary = {
            totalHostels: hostels.length,
            totalRooms: 0,
            totalCapacity: 0,
            totalOccupancy: 0,
            hostelDetails: [],
        };

        for (const hostel of hostels) {
            const rooms = await this.roomModel.find({
                hostelId: hostel._id,
                isActive: true,
            });

            let hostelCapacity = 0;
            let hostelOccupancy = 0;

            for (const room of rooms) {
                hostelCapacity += room.capacity;
                hostelOccupancy += room.occupants.length;
            }

            summary.totalRooms += rooms.length;
            summary.totalCapacity += hostelCapacity;
            summary.totalOccupancy += hostelOccupancy;

            summary.hostelDetails.push({
                hostelId: hostel._id,
                hostelName: hostel.name,
                type: hostel.type,
                totalRooms: rooms.length,
                capacity: hostelCapacity,
                occupancy: hostelOccupancy,
                occupancyPercentage:
                    hostelCapacity > 0 ? (hostelOccupancy / hostelCapacity) * 100 : 0,
            });
        }

        summary['overallOccupancyPercentage'] =
            summary.totalCapacity > 0
                ? (summary.totalOccupancy / summary.totalCapacity) * 100
                : 0;

        return summary;
    }
}
