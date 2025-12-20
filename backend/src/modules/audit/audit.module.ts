import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './audit.schema';
import { PermissionOverride, PermissionOverrideSchema } from './override.schema';
import { AuditService } from './audit.service';
import { MonitorService } from './monitor.service';
import { OverrideController } from './override.controller';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AuditLog.name, schema: AuditLogSchema },
            { name: PermissionOverride.name, schema: PermissionOverrideSchema },
        ]),
    ],
    controllers: [OverrideController],
    providers: [AuditService, MonitorService],
    exports: [AuditService],
})
export class AuditModule { }
