import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export default {
    async register(data: any): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    async login(data: any): Promise<AuthResponse> {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    async logout(): Promise<void> {
        // Fire and forget logout request to server
        api.post('/auth/logout').catch(() => { });

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    async getUser(): Promise<User> {
        const response = await api.get('/user');
        return response.data;
    },

    saveToken(token: string) {
        localStorage.setItem('auth_token', token);
    },

    saveUser(user: User) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }
};
