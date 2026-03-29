import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument, Route, RouteDocument, TransportEnrollment, TransportEnrollmentDocument } from './transport.schema';
import { CreateVehicleDto, CreateRouteDto, UpdateVehicleDto, UpdateRouteDto, EnrollTransportDto } from './transport.dto';

@Injectable()
export class TransportService {
    constructor(
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
        @InjectModel(Route.name) private routeModel: Model<RouteDocument>,
        @InjectModel(TransportEnrollment.name) private enrollmentModel: Model<TransportEnrollmentDocument>,
    ) { }

    // ============= VEHICLE MANAGEMENT =============
    async createVehicle(universityId: string, dto: CreateVehicleDto): Promise<Vehicle> {
        const vehicle = new this.vehicleModel({ ...dto, universityId });
        return vehicle.save();
    }

    async findAllVehicles(universityId: string): Promise<Vehicle[]> {
        return this.vehicleModel.find({ universityId, isActive: true }).populate('driverId').exec();
    }

    async updateVehicle(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
        const vehicle = await this.vehicleModel.findByIdAndUpdate(id, dto, { new: true });
        if (!vehicle) throw new NotFoundException('Vehicle not found');
        return vehicle;
    }

    async deleteVehicle(id: string): Promise<void> {
        await this.vehicleModel.findByIdAndUpdate(id, { isActive: false });
    }

    // ============= ROUTE MANAGEMENT =============
    async createRoute(universityId: string, dto: CreateRouteDto): Promise<Route> {
        const route = new this.routeModel({ ...dto, universityId });
        return route.save();
    }

    async findAllRoutes(universityId: string): Promise<Route[]> {
        return this.routeModel.find({ universityId, isActive: true }).populate('vehicleId').exec();
    }

    async updateRoute(id: string, dto: UpdateRouteDto): Promise<Route> {
        const route = await this.routeModel.findByIdAndUpdate(id, dto, { new: true });
        if (!route) throw new NotFoundException('Route not found');
        return route;
    }

    async deleteRoute(id: string): Promise<void> {
        await this.routeModel.findByIdAndUpdate(id, { isActive: false });
    }

    // ============= ENROLLMENT MANAGEMENT =============
    async enrollStudent(universityId: string, studentId: string, dto: EnrollTransportDto): Promise<TransportEnrollment> {
        const enrollment = new this.enrollmentModel({ ...dto, studentId, universityId });
        return enrollment.save();
    }

    async getStudentEnrollment(studentId: string): Promise<TransportEnrollment | null> {
        return this.enrollmentModel.findOne({ studentId })
            .populate({
                path: 'routeId',
                populate: { path: 'vehicleId' }
            })
            .exec();
    }

    async updateEnrollmentStatus(id: string, status: string): Promise<TransportEnrollment> {
        const enrollment = await this.enrollmentModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!enrollment) throw new NotFoundException('Enrollment not found');
        return enrollment;
    }
}
