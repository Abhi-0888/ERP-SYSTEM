import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getRoot() {
        return {
            message: '🎉 University ERP API is Running!',
            version: '1.0.0',
            status: 'operational',
            endpoints: {
                auth: '/auth/login',
                universities: '/universities',
                users: '/users',
                academic: '/academic/departments',
                students: '/students',
                attendance: '/attendance',
                timetable: '/timetable',
                exams: '/exams',
                fees: '/fees/structures',
            },
            documentation: '/api-docs (coming soon)',
        };
    }

    @Get('health')
    getHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
}
