import api from "../api";

export const PlacementService = {
    getAllJobs: (params?: any) => api.get("/placement/jobs", { params }).then(res => res.data),
    getJobById: (id: string) => api.get(`/placement/jobs/${id}`).then(res => res.data),
    createJob: (data: any) => api.post("/placement/jobs", data).then(res => res.data),
    applyForJob: (data: any) => api.post("/placement/apply", data).then(res => res.data),
    getStudentApplications: (studentId: string) => api.get(`/placement/applications/student/${studentId}`).then(res => res.data),
    getStats: () => api.get("/placement/reports/statistics").then(res => res.data),
};
