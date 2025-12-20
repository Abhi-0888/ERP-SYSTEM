import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { GlobalSettings, GlobalSettingsSchema } from './settings.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: GlobalSettings.name, schema: GlobalSettingsSchema }]),
    ],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
