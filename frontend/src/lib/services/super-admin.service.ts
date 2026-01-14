import api from "@/lib/api";

export const SuperAdminService = {
    getDashboardStats: () => api.get("/super-admin/stats/dashboard"),
    getSecurityStats: () => api.get("/super-admin/stats/security"),
    getModuleStats: () => api.get("/super-admin/stats/modules"),
    getAuditLogs: (page = 1, limit = 50, userId = "", module = "", severity = "", startDate = "", endDate = "") => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (userId) params.append("userId", userId);
        if (module && module !== 'ALL') params.append("module", module);
        if (severity && severity !== 'ALL') params.append("severity", severity);
        if (startDate && endDate) {
            params.append("startDate", startDate);
            params.append("endDate", endDate);
        }
        return api.get(`/super-admin/audit-logs?${params.toString()}`);
    },
    getSecurityEvents: () => api.get("/super-admin/stats/security-events"),
    getActiveSessions: () => api.get("/super-admin/stats/sessions"),
    getNotifications: () => api.get("/super-admin/notifications"),

    // Future expansion for other Super Admin entities if not using existing services
    // For Users and Universities, we might reuse UserService and UniversityService
    // but ensuring they call the correct endpoints that return ALL data for Super Admin.
};
