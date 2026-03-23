import api from '../api';
import { Timetable, ApiResponse } from '../types';

export const TimetableService = {
    getAllTimetables: async (params?: Record<string, string | number | boolean>): Promise<ApiResponse<Timetable[]>> => {
        const response = await api.get('/timetable', { params });
        return response.data;
    },
    getTimetableById: async (id: string): Promise<Timetable> => {
        const response = await api.get(`/timetable/${id}`);
        return response.data;
    },
    createTimetable: async (data: Partial<Timetable>): Promise<Timetable> => {
        const response = await api.post('/timetable', data);
        return response.data;
    },
    updateTimetable: async (id: string, data: Partial<Timetable>): Promise<Timetable> => {
        const response = await api.patch(`/timetable/${id}`, data);
        return response.data;
    },
    deleteTimetable: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/timetable/${id}`);
        return response.data;
    },
    getTimetableForStudent: async (studentId: string): Promise<Timetable> => {
        const response = await api.get(`/timetable/student/${studentId}`);
        return response.data;
    },
    addSlot: async (id: string, data: Partial<Timetable['slots'][0]>): Promise<Timetable> => {
        const response = await api.post(`/timetable/${id}/slots`, data);
        return response.data;
    },
    updateSlot: async (id: string, slotId: string, data: Partial<Timetable['slots'][0]>): Promise<Timetable> => {
        const response = await api.patch(`/timetable/${id}/slots/${slotId}`, data);
        return response.data;
    },
    deleteSlot: async (id: string, slotId: string): Promise<{ message: string }> => {
        const response = await api.delete(`/timetable/${id}/slots/${slotId}`);
        return response.data;
    }
};
