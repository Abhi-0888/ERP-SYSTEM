import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlacementController } from './placement.controller';
import { PlacementService } from './placement.service';
import { JobPost, JobPostSchema, Application, ApplicationSchema } from './placement.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: JobPost.name, schema: JobPostSchema },
            { name: Application.name, schema: ApplicationSchema },
        ]),
    ],
    controllers: [PlacementController],
    providers: [PlacementService],
    exports: [PlacementService],
})
export class PlacementModule { }
