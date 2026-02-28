import api from './api';

export interface MenuItem {
    id?: number;
    name: string;
    price: number;
    description?: string;
    category_id: number;
    image?: string;
    stock?: number;
    preparation_time?: number;
    is_available?: boolean;
    category?: { id: number; name: string };
    status?: string;
    slug?: string;
}

export interface CategoryItem {
    id?: number;
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    status?: string;
    sort_order?: number;
}

export interface StaffItem {
    id?: number;
    name: string;
    email: string;
    password?: string;
    role: string;
    aktif: boolean;
}

export interface ReportData {
    orders: Array<{
        id: number;
        kode_order: string;
        waktu_pesan: string;
        jenis_pesanan: string;
        meja: string;
        total: number;
        status: string;
    }>;
    pendapatan_hari_ini: number;
    total_keseluruhan: number;
    jumlah_transaksi: number;
}

export default {
    // ── Menus ──
    async getMenus(params?: { search?: string; category_id?: number }) {
        const response = await api.get('/menus', { params });
        return response.data.data;
    },

    async createMenu(data: MenuItem) {
        const response = await api.post('/admin/menus', data);
        return response.data;
    },

    async updateMenu(id: number, data: Partial<MenuItem>) {
        const response = await api.put(`/admin/menus/${id}`, data);
        return response.data;
    },

    async deleteMenu(id: number) {
        const response = await api.delete(`/admin/menus/${id}`);
        return response.data;
    },

    // ── Categories ──
    async getCategories() {
        const response = await api.get('/categories');
        return response.data.data;
    },

    async createCategory(data: CategoryItem) {
        const response = await api.post('/admin/categories', data);
        return response.data;
    },

    async updateCategory(id: number, data: Partial<CategoryItem>) {
        const response = await api.put(`/admin/categories/${id}`, data);
        return response.data;
    },

    async deleteCategory(id: number) {
        const response = await api.delete(`/admin/categories/${id}`);
        return response.data;
    },

    // ── Staff Management ──
    async getStaff() {
        const response = await api.get('/owner/users');
        return response.data.data;
    },

    async createStaff(data: StaffItem) {
        const response = await api.post('/owner/users', data);
        return response.data;
    },

    async updateStaff(id: number, data: Partial<StaffItem>) {
        const response = await api.put(`/owner/users/${id}`, data);
        return response.data;
    },

    async deleteStaff(id: number) {
        const response = await api.delete(`/owner/users/${id}`);
        return response.data;
    },

    // ── Financial Report ──
    async getFinancialReport(dari?: string, sampai?: string): Promise<ReportData> {
        const params: any = {};
        if (dari) params.dari = dari;
        if (sampai) params.sampai = sampai;
        const response = await api.get('/owner/reports', { params });
        return response.data.data;
    },
};
