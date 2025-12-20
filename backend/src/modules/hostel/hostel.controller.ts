import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HostelService } from './hostel.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateHostelDto, CreateRoomDto, AllocateRoomDto } from './hostel.dto';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('hostel')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class HostelController {
    constructor(private readonly hostelService: HostelService) { }

    // ============= HOSTEL MANAGEMENT =============

    @Post('hostels')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOSTEL_WARDEN)
    async createHostel(@Body() createHostelDto: CreateHostelDto) {
        try {
            return await this.hostelService.createHostel(createHostelDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create hostel',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('hostels')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.HOSTEL_WARDEN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findAllHostels(
        @Query('universityId') universityId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.hostelService.findAllHostels({
                universityId,
                page,
                limit,
            });
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch hostels',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('hostels/:id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.HOSTEL_WARDEN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getHostel(@Param('id') id: string) {
        try {
            const hostel = await this.hostelService.findHostelById(id);
            if (!hostel) {
                throw new HttpException('Hostel not found', HttpStatus.NOT_FOUND);
            }
            return hostel;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch hostel',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('hostels/:id')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOSTEL_WARDEN)
    async updateHostel(@Param('id') id: string, @Body() updateHostelDto: any) {
        try {
            const hostel = await this.hostelService.updateHostel(id, updateHostelDto);
            if (!hostel) {
                throw new HttpException('Hostel not found', HttpStatus.NOT_FOUND);
            }
            return hostel;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update hostel',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete('hostels/:id')
    @Roles(Role.UNIVERSITY_ADMIN)
    async deleteHostel(@Param('id') id: string) {
        try {
            await this.hostelService.deleteHostel(id);
            return { message: 'Hostel deleted successfully' };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete hostel',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= ROOM MANAGEMENT =============

    @Post('rooms')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOSTEL_WARDEN)
    async createRoom(@Body() createRoomDto: CreateRoomDto) {
        try {
            return await this.hostelService.createRoom(createRoomDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create room',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('rooms')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.HOSTEL_WARDEN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async findAllRooms(
        @Query('hostelId') hostelId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.hostelService.findAllRooms({
                hostelId,
                page,
                limit,
            });
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch rooms',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('rooms/availability/:hostelId')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.HOSTEL_WARDEN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getAvailableRooms(@Param('hostelId') hostelId: string) {
        try {
            return await this.hostelService.getAvailableRooms(hostelId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch available rooms',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('rooms/:id')
    @Roles(Role.STUDENT, Role.FACULTY, Role.HOD, Role.HOSTEL_WARDEN, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getRoom(@Param('id') id: string) {
        try {
            const room = await this.hostelService.findRoomById(id);
            if (!room) {
                throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
            }
            return room;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch room',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // ============= ROOM ALLOCATION =============

    @Post('allocate')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOSTEL_WARDEN)
    async allocateRoom(@Body() allocateRoomDto: AllocateRoomDto) {
        try {
            return await this.hostelService.allocateRoom(allocateRoomDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to allocate room',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('deallocate/:roomId/:studentId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOSTEL_WARDEN)
    async deallocateRoom(
        @Param('roomId') roomId: string,
        @Param('studentId') studentId: string,
    ) {
        try {
            return await this.hostelService.deallocateRoom(roomId, studentId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to deallocate room',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= REPORTS =============

    @Get('reports/occupancy/:hostelId')
    @Roles(Role.UNIVERSITY_ADMIN, Role.HOSTEL_WARDEN)
    async getOccupancyReport(@Param('hostelId') hostelId: string) {
        try {
            return await this.hostelService.generateOccupancyReport(hostelId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate occupancy report',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('reports/summary')
    @Roles(Role.UNIVERSITY_ADMIN)
    async getHostelSummary(@Query('universityId') universityId?: string) {
        try {
            return await this.hostelService.generateHostelSummary(universityId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate hostel summary',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
