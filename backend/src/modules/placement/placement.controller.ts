import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { PlacementService } from './placement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateJobPostDto, ApplyJobDto, UpdateApplicationStatusDto } from './placement.dto';

import { UniversityIsolationGuard } from '../../common/guards/university-isolation.guard';

@Controller('placement')
@UseGuards(JwtAuthGuard, RolesGuard, UniversityIsolationGuard)
export class PlacementController {
    constructor(private readonly placementService: PlacementService) { }

    // ============= JOB POSTING =============

    @Post('jobs')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async createJobPost(@Body() createJobPostDto: CreateJobPostDto) {
        try {
            return await this.placementService.createJobPost(createJobPostDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to create job posting',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('jobs')
    @Roles(Role.STUDENT, Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getAllJobs(
        @Query('universityId') universityId?: string,
        @Query('status') status?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.placementService.getAllJobs({
                universityId,
                status,
                page,
                limit,
            });
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch job postings',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('jobs/:id')
    @Roles(Role.STUDENT, Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getJobById(@Param('id') id: string) {
        try {
            const job = await this.placementService.getJobById(id);
            if (!job) {
                throw new HttpException('Job posting not found', HttpStatus.NOT_FOUND);
            }
            return job;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch job posting',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('jobs/:id')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async updateJob(@Param('id') id: string, @Body() updateJobDto: any) {
        try {
            const job = await this.placementService.updateJob(id, updateJobDto);
            if (!job) {
                throw new HttpException('Job posting not found', HttpStatus.NOT_FOUND);
            }
            return job;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update job posting',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Delete('jobs/:id')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async deleteJob(@Param('id') id: string) {
        try {
            await this.placementService.deleteJob(id);
            return { message: 'Job posting deleted successfully' };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete job posting',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= JOB APPLICATIONS =============

    @Post('apply')
    @Roles(Role.STUDENT)
    async applyForJob(@Body() applyJobDto: ApplyJobDto) {
        try {
            return await this.placementService.applyForJob(applyJobDto);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to apply for job',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('applications')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async getAllApplications(
        @Query('status') status?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            return await this.placementService.getAllApplications({
                status,
                page,
                limit,
            });
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch applications',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('applications/job/:jobId')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async getApplicationsByJob(@Param('jobId') jobId: string) {
        try {
            return await this.placementService.getApplicationsByJob(jobId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch applications',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('applications/student/:studentId')
    @Roles(Role.STUDENT)
    async getStudentApplications(@Param('studentId') studentId: string) {
        try {
            return await this.placementService.getStudentApplications(studentId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch applications',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('applications/:id')
    @Roles(Role.STUDENT, Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN, Role.SUPER_ADMIN)
    async getApplicationById(@Param('id') id: string) {
        try {
            const application = await this.placementService.getApplicationById(id);
            if (!application) {
                throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
            }
            return application;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch application',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch('applications/:id/status')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async updateApplicationStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateApplicationStatusDto,
    ) {
        try {
            const application = await this.placementService.updateApplicationStatus(
                id,
                updateStatusDto.status,
            );
            if (!application) {
                throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
            }
            return application;
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to update application status',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ============= REPORTS =============

    @Get('reports/statistics')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async getPlacementStatistics(@Query('universityId') universityId?: string) {
        try {
            return await this.placementService.generatePlacementStatistics(universityId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate statistics',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('reports/company/:company')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async getCompanyApplications(@Param('company') company: string) {
        try {
            return await this.placementService.getApplicationsByCompany(company);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch company applications',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('reports/eligible-students/:jobId')
    @Roles(Role.PLACEMENT_OFFICER, Role.UNIVERSITY_ADMIN)
    async getEligibleStudents(@Param('jobId') jobId: string) {
        try {
            return await this.placementService.getEligibleStudents(jobId);
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to fetch eligible students',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
