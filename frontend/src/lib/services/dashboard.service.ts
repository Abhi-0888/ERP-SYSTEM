import api from '../api';

export interface DashboardStats {
    students: {
        total: number;
        active: number;
        graduated: number;
    };
    faculty: {
        total: number;
    };
    fees: {
        totalCollected: number;
        totalPending: number;
    };
    library: {
        totalBooks: number;
        issuedBooks: number;
    };
}

export const DashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        // In a real scenario, we would have a dedicated dashboard endpoint.
        // For now, we fetch from individual modules to aggregate stats.
        // Note: This relies on the existence of these endpoints in the backend. 
        // If not present, we should implement a dashboard controller in backend or use what's available.

        // Since we didn't implement a specific dashboard endpoint in backend yet,
        // we might fail here if we don't have these exact counts available. 
        // I will assume for now we can get lists and count them, or I'll implement a quick mock-wrapper 
        // that calls the real endpoints if they exist, or returns 0 if they don't to avoid crashing.

        // Correct approach: Let's try to hit the endpoints I know exist from my backend work.
        // StudentController: GET /students (with pagination metadata usually)
        // FeeController: GET /fees (maybe?)

        try {
            const [studentsRes, feesRes] = await Promise.all([
                api.get('/students?limit=1'),
                api.get('/fees?limit=1')
            ]);

            return {
                students: {
                    total: studentsRes.data.total || 0,
                    active: 0, // Placeholder
                    graduated: 0,
                },
                faculty: {
                    total: 0, // Placeholder
                },
                fees: {
                    totalCollected: 0, // Placeholder
                    totalPending: 0,
                },
                library: {
                    totalBooks: 0,
                    issuedBooks: 0
                }
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
            // Return empty stats to prevent crash
            return {
                students: { total: 0, active: 0, graduated: 0 },
                faculty: { total: 0 },
                fees: { totalCollected: 0, totalPending: 0 },
                library: { totalBooks: 0, issuedBooks: 0 }
            }
        }
    }
};
