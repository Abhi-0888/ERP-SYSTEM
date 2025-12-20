import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalSettings } from './settings.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(
        @InjectModel(GlobalSettings.name)
        private settingsModel: Model<GlobalSettings>,
    ) { }

    async onModuleInit() {
        const count = await this.settingsModel.countDocuments();
        if (count === 0) {
            await new this.settingsModel({}).save();
        }
    }

    async getSettings() {
        return this.settingsModel.findOne().exec();
    }

    async updateSettings(data: any) {
        return this.settingsModel.findOneAndUpdate({}, data, { new: true }).exec();
    }
}
