import api from '../api';

export const AcademicService = {
    // --- Departments ---
    getDepartments: async (params?: any) => {
        const response = await api.get('/academic/departments', { params });
        return response.data;
    },
    createDepartment: async (data: any) => {
        const response = await api.post('/academic/departments', data);
        return response.data;
    },
    updateDepartment: async (id: string, data: any) => {
        const response = await api.patch(`/academic/departments/${id}`, data);
        return response.data;
    },
    deleteDepartment: async (id: string) => {
        const response = await api.delete(`/academic/departments/${id}`);
        return response.data;
    },

    // --- Programs ---
    getPrograms: async (params?: any) => {
        const response = await api.get('/academic/programs', { params });
        return response.data;
    },
    createProgram: async (data: any) => {
        const response = await api.post('/academic/programs', data);
        return response.data;
    },
    updateProgram: async (id: string, data: any) => {
        const response = await api.patch(`/academic/programs/${id}`, data);
        return response.data;
    },
    deleteProgram: async (id: string) => {
        const response = await api.delete(`/academic/programs/${id}`);
        return response.data;
    },

    // --- Courses (Subjects) ---
    getCourses: async (params?: any) => {
        const response = await api.get('/academic/courses', { params });
        return response.data;
    },
    createCourse: async (data: any) => {
        const response = await api.post('/academic/courses', data);
        return response.data;
    },
    updateCourse: async (id: string, data: any) => {
        const response = await api.patch(`/academic/courses/${id}`, data);
        return response.data;
    },
    deleteCourse: async (id: string) => {
        const response = await api.delete(`/academic/courses/${id}`);
        return response.data;
    },

    // --- Academic Years ---
    getAcademicYears: async (params?: any) => {
        const response = await api.get('/academic/academic-years', { params });
        return response.data;
    },
    getActiveAcademicYear: async () => {
        const response = await api.get('/academic/academic-years/active');
        return response.data;
    },
    createAcademicYear: async (data: any) => {
        const response = await api.post('/academic/academic-years', data);
        return response.data;
    },
    updateAcademicYear: async (id: string, data: any) => {
        const response = await api.patch(`/academic/academic-years/${id}`, data);
        return response.data;
    },
    deleteAcademicYear: async (id: string) => {
        const response = await api.delete(`/academic/academic-years/${id}`);
        return response.data;
    }
};
