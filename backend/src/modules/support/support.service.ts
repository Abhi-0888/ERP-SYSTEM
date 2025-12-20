import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportTicket } from './support.schema';

@Injectable()
export class SupportService {
    constructor(
        @InjectModel(SupportTicket.name)
        private ticketModel: Model<SupportTicket>,
    ) { }

    async findAll() {
        return this.ticketModel.find().populate('userId').populate('universityId').exec();
    }

    async findOne(id: string) {
        return this.ticketModel.findById(id).populate('userId').populate('universityId').exec();
    }

    async updateStatus(id: string, status: string) {
        return this.ticketModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }
}
