import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { University, UniversitySchema } from '../university/university.schema';
import { User, UserSchema } from '../user/user.schema';
import { AuditLog, AuditLogSchema } from '../audit/audit.schema';
import { Hostel, HostelSchema } from '../hostel/hostel.schema';
import { Book, BookSchema } from '../library/library.schema';
import { Vehicle, VehicleSchema } from '../transport/transport.schema';
import { SupportTicket, SupportTicketSchema } from '../support/support.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: University.name, schema: UniversitySchema },
            { name: User.name, schema: UserSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: Hostel.name, schema: HostelSchema },
            { name: Book.name, schema: BookSchema },
            { name: Vehicle.name, schema: VehicleSchema },
            { name: SupportTicket.name, schema: SupportTicketSchema },
        ]),
    ],
    controllers: [SuperAdminController],
    providers: [SuperAdminService],
})
export class SuperAdminModule { }
