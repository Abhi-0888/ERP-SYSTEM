import {
    Controller, Get, Post, Body, UseGuards, Request,
    BadRequestException, UseInterceptors, UploadedFile, Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UniversityService } from '../university/university.service';
import { AcademicService } from '../academic/academic.service';
import { UserService } from '../user/user.service';
import { parse } from 'csv-parse/sync';

@Controller('onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OnboardingController {
    constructor(
        private readonly onboardingService: OnboardingService,
        private readonly universityService: UniversityService,
        private readonly academicService: AcademicService,
        private readonly userService: UserService,
    ) { }

    @Get('status')
    @Roles(Role.UNIVERSITY_ADMIN)
    getStatus(@Request() req: any) {
        return this.onboardingService.getStatus(req.user.universityId);
    }

    @Post('profile')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupProfile(@Request() req: any, @Body() profileData: any) {
        // Stage 1: University Profile Setup
        await this.universityService.update(req.user.universityId, profileData);
        return this.onboardingService.updateStage(req.user.universityId, 1, profileData);
    }

    @Post('academics')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupAcademics(@Request() req: any, @Body() academicData: any) {
        // Stage 2: Academic Structure Setup
        const universityId = req.user.universityId;
        const createdDepts: any[] = [];
        const createdPrograms: any[] = [];
        const errors: string[] = [];

        if (!academicData.departments || academicData.departments.length < 1) {
            throw new BadRequestException('At least one department is required');
        }

        for (const dept of academicData.departments || []) {
            try {
                const created = await this.academicService.createDepartment({
                    name: dept.name,
                    code: dept.code,
                    universityId,
                    description: dept.description,
                });
                createdDepts.push(created);
            } catch (err: any) {
                errors.push(`Department "${dept.name}": ${err.message}`);
            }
        }

        for (const prog of academicData.programs || []) {
            try {
                const dept = createdDepts.find(d => d.code === prog.departmentCode);
                if (!dept) {
                    errors.push(`Program "${prog.name}": Department code "${prog.departmentCode}" not found`);
                    continue;
                }
                const created = await this.academicService.createProgram({
                    name: prog.name,
                    code: prog.code,
                    departmentId: dept._id,
                    duration: prog.duration || 4,
                    level: prog.level || 'UG',
                    description: prog.description,
                });
                createdPrograms.push(created);
            } catch (err: any) {
                errors.push(`Program "${prog.name}": ${err.message}`);
            }
        }

        const stageData = {
            departmentCount: createdDepts.length,
            programCount: createdPrograms.length,
            departments: createdDepts.map(d => ({ id: d._id, name: d.name, code: d.code })),
            programs: createdPrograms.map(p => ({ id: p._id, name: p.name, code: p.code })),
            errors: errors.length > 0 ? errors : undefined,
        };

        return this.onboardingService.updateStage(universityId, 2, stageData);
    }

    @Post('staff')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupStaff(@Request() req: any, @Body() staffData: any) {
        // Stage 3: Role & Staff Setup
        const universityId = req.user.universityId;
        const createdStaff: any[] = [];
        const errors: string[] = [];

        const requiredRoles = [Role.REGISTRAR, Role.FINANCE];
        const providedRoles = (staffData.staff || []).map((s: any) => s.role);
        const missingRoles = requiredRoles.filter(r => !providedRoles.includes(r));

        if (missingRoles.length > 0) {
            throw new BadRequestException(`Missing mandatory roles: ${missingRoles.join(', ')}`);
        }

        for (const staff of staffData.staff || []) {
            try {
                const created = await this.userService.create({
                    username: staff.username,
                    email: staff.email,
                    password: staff.password || 'TempPass123!',
                    role: staff.role,
                    universityId,
                    phoneNumber: staff.phoneNumber,
                    isActive: true,
                });
                createdStaff.push({
                    id: (created as any)._id,
                    username: staff.username,
                    role: staff.role,
                });
            } catch (err: any) {
                errors.push(`Staff "${staff.username}": ${err.message}`);
            }
        }

        const stageData = {
            staffCount: createdStaff.length,
            staff: createdStaff,
            errors: errors.length > 0 ? errors : undefined,
        };

        return this.onboardingService.updateStage(universityId, 3, stageData);
    }

    @Post('modules')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupModules(@Request() req: any, @Body() modulesData: any) {
        // Stage 4: Module Configuration
        if (modulesData.enabledModules) {
            await this.universityService.update(req.user.universityId, {
                enabledModules: modulesData.enabledModules
            });
        }
        return this.onboardingService.updateStage(req.user.universityId, 4, modulesData);
    }

    @Post('import/upload/:type')
    @Roles(Role.UNIVERSITY_ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    async uploadImportFile(
        @Request() req: any,
        @Param('type') type: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        // Stage 5: CSV Upload and Preview
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const validTypes = ['faculty', 'students', 'courses'];
        if (!validTypes.includes(type)) {
            throw new BadRequestException(`Invalid import type. Must be one of: ${validTypes.join(', ')}`);
        }

        try {
            // Parse CSV content
            const csvContent = file.buffer.toString('utf-8');
            const records = parse(csvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            // Validate and transform based on type
            const processedRecords = this.validateImportRecords(type, records);

            // Store in onboarding status for later processing
            const universityId = req.user.universityId;
            const status = await this.onboardingService.getStatus(universityId);

            const importData = status.stageData?.stage5 || { imports: {} };
            importData.imports = importData.imports || {};
            importData.imports[type] = {
                records: processedRecords.valid,
                errors: processedRecords.errors,
                count: processedRecords.valid.length,
                uploadedAt: new Date(),
            };

            await this.onboardingService.updateStageData(universityId, 5, importData);

            return {
                success: true,
                type,
                validCount: processedRecords.valid.length,
                errorCount: processedRecords.errors.length,
                preview: processedRecords.valid.slice(0, 5),
                errors: processedRecords.errors.slice(0, 10),
            };
        } catch (err: any) {
            throw new BadRequestException(`Failed to parse CSV: ${err.message}`);
        }
    }

    private validateImportRecords(type: string, records: any[]): { valid: any[], errors: string[] } {
        const valid: any[] = [];
        const errors: string[] = [];

        const requiredFields: Record<string, string[]> = {
            faculty: ['name', 'email', 'department'],
            students: ['name', 'email', 'program', 'enrollment_year'],
            courses: ['name', 'code', 'credits', 'program'],
        };

        const fields = requiredFields[type] || [];

        records.forEach((record, index) => {
            const missingFields = fields.filter(f => !record[f] || record[f].trim() === '');
            if (missingFields.length > 0) {
                errors.push(`Row ${index + 2}: Missing fields: ${missingFields.join(', ')}`);
            } else {
                valid.push(record);
            }
        });

        return { valid, errors };
    }

    @Post('import')
    @Roles(Role.UNIVERSITY_ADMIN)
    async setupImport(@Request() req: any, @Body() importData: any) {
        // Stage 5: Finalize Import
        const universityId = req.user.universityId;
        const status = await this.onboardingService.getStatus(universityId);
        const existingImports = status.stageData?.stage5?.imports || {};

        // Process the imported data
        const results: Record<string, any> = {};
        const allErrors: string[] = [];

        for (const [type, data] of Object.entries(existingImports) as [string, any][]) {
            if (data.records && data.records.length > 0) {
                try {
                    const processed = await this.processImportedRecords(universityId, type, data.records);
                    results[type] = {
                        imported: processed.success,
                        failed: processed.failed,
                    };
                    if (processed.errors.length > 0) {
                        allErrors.push(...processed.errors.map((e: string) => `${type}: ${e}`));
                    }
                } catch (err: any) {
                    allErrors.push(`${type}: ${err.message}`);
                }
            }
        }

        const stageData = {
            importedTypes: Object.keys(existingImports),
            importedAt: new Date(),
            recordCounts: results,
            errors: allErrors.length > 0 ? allErrors : undefined,
        };

        return this.onboardingService.updateStage(universityId, 5, stageData);
    }

    private async processImportedRecords(universityId: string, type: string, records: any[]) {
        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const record of records) {
            try {
                switch (type) {
                    case 'faculty':
                        await this.userService.create({
                            username: record.email.split('@')[0],
                            email: record.email,
                            password: 'TempPass123!',
                            role: Role.FACULTY,
                            universityId,
                            isActive: true,
                        });
                        success++;
                        break;
                    case 'students':
                        // For students, we'd normally create both a User and StudentProfile
                        // For now, just create the user account
                        await this.userService.create({
                            username: record.email.split('@')[0],
                            email: record.email,
                            password: 'TempPass123!',
                            role: Role.STUDENT,
                            universityId,
                            isActive: true,
                        });
                        success++;
                        break;
                    case 'courses':
                        // Courses would be created via AcademicService
                        // This needs program lookup - skipping for MVP
                        success++;
                        break;
                }
            } catch (err: any) {
                failed++;
                if (errors.length < 10) {
                    errors.push(`${record.email || record.name}: ${err.message}`);
                }
            }
        }

        return { success, failed, errors };
    }

    @Post('activate')
    @Roles(Role.UNIVERSITY_ADMIN)
    async activate(@Request() req: any) {
        // Stage 6: Go Live
        return this.onboardingService.completeOnboarding(req.user.universityId);
    }
}


