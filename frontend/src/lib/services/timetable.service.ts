import api from '../api';

export const TimetableService = {
    getAllTimetables: async (params?: any) => {
        const response = await api.get('/timetable', { params });
        return response.data;
    },
    getTimetableById: async (id: string) => {
        const response = await api.get(`/timetable/${id}`);
        return response.data;
    },
    createTimetable: async (data: any) => {
        const response = await api.post('/timetable', data);
        return response.data;
    },
    updateTimetable: async (id: string, data: any) => {
        const response = await api.patch(`/timetable/${id}`, data);
        return response.data;
    },
    deleteTimetable: async (id: string) => {
        const response = await api.delete(`/timetable/${id}`);
        return response.data;
    },
    addSlot: async (id: string, data: any) => {
        const response = await api.post(`/timetable/${id}/slots`, data);
        return response.data;
    },
    updateSlot: async (id: string, slotId: string, data: any) => {
        const response = await api.patch(`/timetable/${id}/slots/${slotId}`, data);
        return response.data;
    },
    deleteSlot: async (id: string, slotId: string) => {
        const response = await api.delete(`/timetable/${id}/slots/${slotId}`);
        return response.data;
    }
};
