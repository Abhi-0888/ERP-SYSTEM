import api from '../api';

export const LibraryService = {
    getBooks: async (params?: any) => {
        const response = await api.get('/library/books', { params });
        return response.data;
    },
    getBookById: async (id: string) => {
        const response = await api.get(`/library/books/${id}`);
        return response.data;
    },
    getIssuedBooks: async (userId: string) => {
        const response = await api.get(`/library/issued-books/user/${userId}`);
        return response.data;
    },
    getUserFine: async (userId: string) => {
        const response = await api.get(`/library/fine/${userId}`);
        return response.data;
    },
    issueBook: async (data: any) => {
        const response = await api.post('/library/issue', data);
        return response.data;
    },
    returnBook: async (issueId: string) => {
        const response = await api.post(`/library/return/${issueId}`);
        return response.data;
    },
    getAvailabilityReport: async () => {
        const response = await api.get('/library/reports/availability');
        return response.data;
    }
};
