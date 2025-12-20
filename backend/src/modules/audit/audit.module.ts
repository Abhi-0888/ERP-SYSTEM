import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './audit.schema';
import { AuditService } from './audit.service';
import { MonitorService } from './monitor.service';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
    ],
    providers: [AuditService, MonitorService],
    exports: [AuditService],
})
export class AuditModule { }
