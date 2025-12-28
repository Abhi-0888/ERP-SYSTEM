import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { University, UniversitySchema } from './university.schema';
import { User, UserSchema } from '../user/user.schema';
import { UniversityService } from './university.service';
import { UniversityController } from './university.controller';
import { UserModule } from '../user/user.module';
import { StatsModule } from '../stats/stats.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: University.name, schema: UniversitySchema },
            { name: User.name, schema: UserSchema },
        ]),
        forwardRef(() => UserModule),
        StatsModule,
    ],
    controllers: [UniversityController],
    providers: [UniversityService],
    exports: [UniversityService],
})
export class UniversityModule { }
