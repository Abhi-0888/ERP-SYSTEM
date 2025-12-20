import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { University, UniversitySchema } from './university.schema';
import { UniversityService } from './university.service';
import { UniversityController } from './university.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: University.name, schema: UniversitySchema },
        ]),
    ],
    controllers: [UniversityController],
    providers: [UniversityService],
    exports: [UniversityService],
})
export class UniversityModule { }
