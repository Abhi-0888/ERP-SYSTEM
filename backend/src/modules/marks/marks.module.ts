import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mark, MarkSchema } from './marks.schema';
import { MarksController } from './marks.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Mark.name, schema: MarkSchema },
        ]),
    ],
    controllers: [MarksController],
})
export class MarksModule {}
