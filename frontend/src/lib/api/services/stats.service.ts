import {apiClient} from '@/lib/api/clients';
import {ENDPOINTS} from '@/lib/api/endpoints';
import {DashboardStats} from '@/lib/api/definitions';

export const statsService = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        return apiClient.get<DashboardStats>(ENDPOINTS.STATS.DASHBOARD, ENDPOINTS.CREDENTIALS.INCLUDE);
    }
}