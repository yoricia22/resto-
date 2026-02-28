<template>
    <ion-page>
        <ion-header class="admin-header">
            <ion-toolbar>
                <ion-title>Admin Dashboard</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="handleLogout" fill="clear" class="logout-btn">
                        <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
                        Logout
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="admin-content">
            <div class="dashboard-container">
                <!-- Welcome Section -->
                <div class="welcome-section">
                    <div class="welcome-text">
                        <p class="greeting">Halo, {{ userName }} 👋</p>
                        <h1>Dashboard Admin</h1>
                        <p class="subtitle">Kelola restoran Anda dari sini</p>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-row">
                    <div class="stat-card" @click="router.push('/admin/menus')">
                        <div class="stat-icon menu-icon">
                            <ion-icon :icon="restaurantOutline"></ion-icon>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">{{ menuCount }}</span>
                            <span class="stat-label">Total Menu</span>
                        </div>
                        <ion-icon :icon="chevronForwardOutline" class="stat-arrow"></ion-icon>
                    </div>
                    <div class="stat-card" @click="router.push('/admin/categories')">
                        <div class="stat-icon cat-icon">
                            <ion-icon :icon="gridOutline"></ion-icon>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">{{ categoryCount }}</span>
                            <span class="stat-label">Kategori</span>
                        </div>
                        <ion-icon :icon="chevronForwardOutline" class="stat-arrow"></ion-icon>
                    </div>
                </div>

                <!-- Quick Actions -->
                <h2 class="section-title">Menu Cepat</h2>
                <div class="quick-actions">
                    <div class="action-card" @click="router.push('/admin/menus')">
                        <div class="action-icon-wrap orange-gradient">
                            <ion-icon :icon="fastFoodOutline"></ion-icon>
                        </div>
                        <span class="action-label">Kelola Menu</span>
                        <p class="action-desc">Tambah, edit, hapus menu makanan</p>
                    </div>
                    <div class="action-card" @click="router.push('/admin/categories')">
                        <div class="action-icon-wrap blue-gradient">
                            <ion-icon :icon="layersOutline"></ion-icon>
                        </div>
                        <span class="action-label">Kelola Kategori</span>
                        <p class="action-desc">Atur kategori menu restoran</p>
                    </div>
                </div>
                <div class="quick-actions">
                    <div class="action-card" @click="router.push('/admin/users')">
                        <div class="action-icon-wrap green-gradient">
                            <ion-icon :icon="peopleOutline"></ion-icon>
                        </div>
                        <span class="action-label">Kelola Staff</span>
                        <p class="action-desc">Tambah, edit, hapus akun staff</p>
                    </div>
                    <div class="action-card" @click="router.push('/admin/reports')">
                        <div class="action-icon-wrap purple-gradient">
                            <ion-icon :icon="cashOutline"></ion-icon>
                        </div>
                        <span class="action-label">Laporan Keuangan</span>
                        <p class="action-desc">Lihat pendapatan dan riwayat transaksi</p>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonButton, IonButtons
} from '@ionic/vue';
import {
    logOutOutline, restaurantOutline, gridOutline,
    fastFoodOutline, layersOutline, chevronForwardOutline,
    peopleOutline, cashOutline
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthService from '@/services/auth';
import AdminService from '@/services/admin';

const router = useRouter();
const userName = ref('Admin');
const menuCount = ref(0);
const categoryCount = ref(0);

onMounted(async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            userName.value = user.name || 'Admin';
        } catch { /* ignore */ }
    }

    try {
        const menus = await AdminService.getMenus();
        menuCount.value = menus.length;
    } catch { menuCount.value = 0; }

    try {
        const categories = await AdminService.getCategories();
        categoryCount.value = categories.length;
    } catch { categoryCount.value = 0; }
});

const handleLogout = async () => {
    await AuthService.logout();
    router.replace('/login');
};

const navigateTo = (path: string) => {
    router.push(path);
};
</script>

<style scoped>
.admin-header ion-toolbar {
    --background: #ffffff;
    --color: #1a202c;
    --border-color: #f0f0f0;
}

.admin-header ion-title {
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: -0.3px;
}

.logout-btn {
    --color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
}

.admin-content {
    --background: #f8f9fa;
    --color: #1a202c;
    color: #1a202c;
}

.dashboard-container {
    padding: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
    color: #1a202c;
}

/* ── Welcome ── */
.welcome-section {
    margin-bottom: 1.5rem;
}

.greeting {
    font-size: 0.9rem;
    color: #94a3b8;
    margin: 0 0 4px;
    font-weight: 500;
}

.welcome-text h1 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #1a202c;
    margin: 0 0 4px;
    letter-spacing: -0.5px;
}

.subtitle {
    color: #94a3b8;
    font-size: 0.85rem;
    margin: 0;
}

/* ── Stats ── */
.stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 2rem;
}

.stat-card {
    background: #ffffff;
    color: #1a202c;
    border-radius: 20px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
}

.stat-card:active {
    transform: scale(0.97);
}

.stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
}

.menu-icon {
    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    color: #fff;
}

.cat-icon {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-number {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1a202c;
    line-height: 1;
}

.stat-label {
    font-size: 0.8rem;
    color: #94a3b8;
    font-weight: 600;
    margin-top: 2px;
}

.stat-arrow {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    color: #cbd5e1;
    font-size: 18px;
}

/* ── Section Title ── */
.section-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: #1a202c;
    margin: 0 0 12px;
    letter-spacing: -0.3px;
}

/* ── Quick Actions ── */
.quick-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.action-card {
    background: #ffffff;
    color: #1a202c;
    border-radius: 20px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.25s ease;
    flex-wrap: wrap;
}

.action-card:active {
    transform: scale(0.98);
}

.action-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;
    flex-shrink: 0;
}

.orange-gradient {
    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
}

.blue-gradient {
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.action-label {
    font-weight: 700;
    font-size: 1rem;
    color: #1a202c;
    flex: 1;
}

.action-desc {
    width: 100%;
    margin: -8px 0 0 64px;
    font-size: 0.8rem;
    color: #94a3b8;
}
</style>
