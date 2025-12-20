import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobPost, JobPostDocument } from './placement.schema';
import { Application, ApplicationDocument } from './placement.schema';
import { CreateJobPostDto, ApplyJobDto } from './placement.dto';

@Injectable()
export class PlacementService {
    constructor(
        @InjectModel(JobPost.name) private jobPostModel: Model<JobPostDocument>,
        @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    ) {}

    // ============= JOB POSTING =============

    async createJobPost(createJobPostDto: CreateJobPostDto): Promise<JobPost> {
        const newJobPost = new this.jobPostModel({
            ...createJobPostDto,
            status: 'Active',
            createdAt: new Date(),
        });
        return newJobPost.save();
    }

    async getAllJobs(filters: any): Promise<any> {
        const { universityId, status = 'Active', page = 1, limit = 10 } = filters;
        const query: any = {};

        if (universityId) {
            query.universityId = universityId;
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const jobs = await this.jobPostModel
            .find(query)
            .populate('postedBy')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        const total = await this.jobPostModel.countDocuments(query);

        return {
            data: jobs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getJobById(id: string): Promise<JobPost> {
        const job = await this.jobPostModel.findById(id).populate('postedBy').exec();
        if (!job) {
            throw new NotFoundException('Job posting not found');
        }
        return job;
    }

    async updateJob(id: string, updateJobDto: any): Promise<JobPost> {
        const job = await this.jobPostModel
            .findByIdAndUpdate(id, updateJobDto, { new: true })
            .exec();

        if (!job) {
            throw new NotFoundException('Job posting not found');
        }
        return job;
    }

    async deleteJob(id: string): Promise<void> {
        const job = await this.jobPostModel.findByIdAndDelete(id).exec();
        if (!job) {
            throw new NotFoundException('Job posting not found');
        }
    }

    // ============= JOB APPLICATIONS =============

    async applyForJob(applyJobDto: ApplyJobDto): Promise<Application> {
        // Check if job exists
        const job = await this.jobPostModel.findById(applyJobDto.jobId);
        if (!job) {
            throw new NotFoundException('Job posting not found');
        }

        // Check if deadline has passed
        if (new Date() > new Date(job.deadline)) {
            throw new BadRequestException('Application deadline has passed');
        }

        // Check if student already applied
        const existingApplication = await this.applicationModel.findOne({
            jobId: applyJobDto.jobId,
            studentId: applyJobDto.studentId,
        });

        if (existingApplication) {
            throw new BadRequestException('You have already applied for this job');
        }

        const newApplication = new this.applicationModel({
            ...applyJobDto,
            appliedDate: new Date(),
            status: 'Applied',
        });

        return newApplication.save();
    }

    async getAllApplications(filters: any): Promise<any> {
        const { status, page = 1, limit = 10 } = filters;
        const query: any = {};

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const applications = await this.applicationModel
            .find(query)
            .populate('jobId studentId')
            .skip(skip)
            .limit(limit)
            .sort({ appliedDate: -1 })
            .exec();

        const total = await this.applicationModel.countDocuments(query);

        return {
            data: applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getApplicationsByJob(jobId: string): Promise<Application[]> {
        return this.applicationModel
            .find({ jobId })
            .populate('studentId')
            .sort({ appliedDate: -1 })
            .exec();
    }

    async getStudentApplications(studentId: string): Promise<Application[]> {
        return this.applicationModel
            .find({ studentId })
            .populate('jobId')
            .sort({ appliedDate: -1 })
            .exec();
    }

    async getApplicationById(id: string): Promise<Application> {
        const application = await this.applicationModel
            .findById(id)
            .populate('jobId studentId')
            .exec();

        if (!application) {
            throw new NotFoundException('Application not found');
        }
        return application;
    }

    async updateApplicationStatus(id: string, status: string): Promise<Application> {
        const validStatuses = ['Applied', 'Shortlisted', 'Rejected', 'Selected', 'Placed'];

        if (!validStatuses.includes(status)) {
            throw new BadRequestException(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
        }

        const application = await this.applicationModel
            .findByIdAndUpdate(id, { status }, { new: true })
            .exec();

        if (!application) {
            throw new NotFoundException('Application not found');
        }
        return application;
    }

    // ============= REPORTS =============

    async generatePlacementStatistics(universityId?: string): Promise<any> {
        const jobQuery: any = {};
        if (universityId) {
            jobQuery.universityId = universityId;
        }

        const jobs = await this.jobPostModel.find(jobQuery);
        const jobIds = jobs.map((job) => job._id);

        const applications = await this.applicationModel.find({
            jobId: { $in: jobIds },
        });

        const statusBreakdown = {
            Applied: 0,
            Shortlisted: 0,
            Rejected: 0,
            Selected: 0,
            Placed: 0,
        };

        applications.forEach((app) => {
            statusBreakdown[app.status]++;
        });

        return {
            totalJobPostings: jobs.length,
            activeJobPostings: jobs.filter((j) => j.status === 'Active').length,
            totalApplications: applications.length,
            statusBreakdown,
            placementRate:
                applications.length > 0
                    ? ((statusBreakdown.Placed / applications.length) * 100).toFixed(2)
                    : 0,
            generatedAt: new Date(),
        };
    }

    async getApplicationsByCompany(company: string): Promise<any> {
        const jobs = await this.jobPostModel.find({ company });
        const jobIds = jobs.map((job) => job._id);

        const applications = await this.applicationModel
            .find({ jobId: { $in: jobIds } })
            .populate('jobId studentId')
            .sort({ appliedDate: -1 })
            .exec();

        return {
            company,
            totalJobs: jobs.length,
            totalApplications: applications.length,
            applications,
        };
    }

    async getEligibleStudents(jobId: string): Promise<any> {
        const job = await this.jobPostModel.findById(jobId);
        if (!job) {
            throw new NotFoundException('Job posting not found');
        }

        // This would typically query the student profiles to find eligible students
        // For now, we'll return the job details and indicate that this would need
        // integration with the student module

        return {
            jobId,
            jobTitle: job.role,
            company: job.company,
            eligibilityCriteria: job.eligibilityCriteria,
            note: 'Eligibility checking requires integration with student module',
        };
    }
}
