import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { Vehicle, VehicleSchema, Route, RouteSchema } from './transport.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Vehicle.name, schema: VehicleSchema },
            { name: Route.name, schema: RouteSchema },
        ]),
    ],
    controllers: [TransportController],
    providers: [TransportService],
    exports: [TransportService],
})
export class TransportModule { }
