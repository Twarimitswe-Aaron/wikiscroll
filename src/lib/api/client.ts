import { authStore } from '../stores/auth';

const API_BASE_URL = '/api/v1';

interface RequestOptions extends RequestInit {
    requireAuth?: boolean;
}

class ApiClient {
    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { requireAuth = true, ...customConfig } = options;
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...customConfig.headers,
        };

        if (requireAuth) {
            let token = null;
            authStore.subscribe(state => token = state.token)();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const config: RequestInit = {
            ...customConfig,
            headers,
        };

        const url = `${API_BASE_URL}${endpoint}`;

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401 && requireAuth) {
                    authStore.logout();
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `API Error: ${response.status} ${response.statusText}`);
            }

            // Don't try to parse JSON if status is 204 No Content
            if (response.status === 204) {
                return {} as T;
            }

            return await response.json() as T;
        } catch (error) {
            throw error;
        }
    }

    get<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, data?: any, options?: RequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    put<T>(endpoint: string, data?: any, options?: RequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    delete<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiClient();
