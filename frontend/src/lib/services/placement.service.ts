import api from "../api";

export const PlacementService = {
    getAllJobs: (params?: any) => api.get("/placement/jobs", { params }),
    getJobById: (id: string) => api.get(`/placement/jobs/${id}`),
    createJob: (data: any) => api.post("/placement/jobs", data),
    applyForJob: (data: any) => api.post("/placement/apply", data),
    getStudentApplications: (studentId: string) => api.get(`/placement/applications/student/${studentId}`).then(res => res.data),
    getStats: () => api.get("/placement/reports/statistics"),
};
