import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportTicket, SupportTicketSchema } from './support.schema';
import { AuditLog, AuditLogSchema } from '../audit/audit.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SupportTicket.name, schema: SupportTicketSchema },
            { name: AuditLog.name, schema: AuditLogSchema }
        ]),
    ],
    controllers: [SupportController],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule { }
