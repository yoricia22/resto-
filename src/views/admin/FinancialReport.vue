<template>
    <ion-page>
        <ion-header class="page-header">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/admin"></ion-back-button>
                </ion-buttons>
                <ion-title>Laporan Keuangan</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="page-content">
            <div class="container">
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card green">
                        <span class="stat-emoji">💰</span>
                        <span class="stat-label">Hari Ini</span>
                        <span class="stat-value">Rp {{ formatNumber(stats.pendapatan_hari_ini) }}</span>
                    </div>
                    <div class="stat-card orange">
                        <span class="stat-emoji">📊</span>
                        <span class="stat-label">Total Periode</span>
                        <span class="stat-value">Rp {{ formatNumber(stats.total_keseluruhan) }}</span>
                    </div>
                    <div class="stat-card purple">
                        <span class="stat-emoji">🧾</span>
                        <span class="stat-label">Transaksi</span>
                        <span class="stat-value">{{ stats.jumlah_transaksi }}</span>
                    </div>
                </div>

                <!-- Date Filter -->
                <div class="filter-card">
                    <div class="filter-row">
                        <div class="filter-field">
                            <label>Dari</label>
                            <input type="date" v-model="dari" class="date-input" />
                        </div>
                        <div class="filter-field">
                            <label>Sampai</label>
                            <input type="date" v-model="sampai" class="date-input" />
                        </div>
                    </div>
                    <div class="filter-actions">
                        <button class="filter-btn primary" @click="fetchReport">
                            📋 Tampilkan
                        </button>
                        <button class="filter-btn secondary" @click="resetFilter">
                            Reset
                        </button>
                    </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="loading-state">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Memuat laporan...</p>
                </div>

                <!-- Orders Table -->
                <div v-else-if="orders.length > 0" class="orders-section">
                    <h3 class="section-title">Riwayat Transaksi</h3>
                    <div v-for="(order, i) in orders" :key="order.id" class="order-card">
                        <div class="order-header">
                            <span class="order-num">{{ i + 1 }}</span>
                            <span class="order-code">{{ order.kode_order }}</span>
                            <span class="order-status" :class="'status-' + order.status">{{ order.status }}</span>
                        </div>
                        <div class="order-details">
                            <div class="detail-item">
                                <span class="detail-label">Tanggal</span>
                                <span class="detail-value">{{ order.waktu_pesan }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Jenis</span>
                                <span class="detail-value type-badge" :class="order.jenis_pesanan === 'dine_in' ? 'type-dine' : 'type-take'">
                                    {{ order.jenis_pesanan === 'dine_in' ? 'Dine-in' : 'Takeaway' }}
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Meja</span>
                                <span class="detail-value">{{ order.meja }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Total</span>
                                <span class="detail-value total">Rp {{ formatNumber(order.total) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state">
                    <span class="empty-icon">📊</span>
                    <p>Belum ada transaksi pada periode ini</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonSpinner
} from '@ionic/vue';
import AdminService from '@/services/admin';

const loading = ref(false);
const orders = ref<any[]>([]);
const stats = ref({
    pendapatan_hari_ini: 0,
    total_keseluruhan: 0,
    jumlah_transaksi: 0
});

// Default: first day of month to today
const now = new Date();
const dari = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
const sampai = ref(now.toISOString().split('T')[0]);

const formatNumber = (n: number) => {
    return new Intl.NumberFormat('id-ID').format(n || 0);
};

const fetchReport = async () => {
    loading.value = true;
    try {
        const data = await AdminService.getFinancialReport(dari.value, sampai.value);
        orders.value = data.orders;
        stats.value = {
            pendapatan_hari_ini: data.pendapatan_hari_ini,
            total_keseluruhan: data.total_keseluruhan,
            jumlah_transaksi: data.jumlah_transaksi
        };
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const resetFilter = () => {
    const now = new Date();
    dari.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    sampai.value = now.toISOString().split('T')[0];
    fetchReport();
};

onMounted(fetchReport);
</script>

<style scoped>
.page-header ion-toolbar {
    --background: #ffffff;
    --color: #1a202c;
    --border-color: #f0f0f0;
}
.page-header ion-title { font-weight: 800; font-size: 1.1rem; }

.page-content {
    --background: #f8f9fa;
    --color: #1a202c;
}

.container { padding: 1rem; max-width: 600px; margin: 0 auto; }

/* Stats */
.stats-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
    margin-bottom: 1rem;
}

.stat-card {
    background: #fff; border-radius: 16px; padding: 1rem;
    display: flex; flex-direction: column; align-items: center;
    gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.stat-emoji { font-size: 1.5rem; }
.stat-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.stat-value { font-size: 0.95rem; font-weight: 800; color: #1a202c; text-align: center; }

/* Filter */
.filter-card {
    background: #fff; border-radius: 16px; padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 1rem;
}
.filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.filter-field label { display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 4px; }
.date-input {
    width: 100%; padding: 10px 12px; background: #f8fafc;
    border: 1px solid #e2e8f0; border-radius: 10px;
    font-size: 0.85rem; outline: none; color: #1a202c;
    -webkit-appearance: none;
}
.date-input:focus { border-color: #f97316; }

.filter-actions { display: flex; gap: 8px; }
.filter-btn {
    flex: 1; padding: 10px; border: none; border-radius: 10px;
    font-weight: 700; font-size: 0.85rem; cursor: pointer;
}
.filter-btn.primary {
    background: linear-gradient(135deg, #f97316, #ef4444); color: #fff;
}
.filter-btn.secondary {
    background: #f1f5f9; color: #64748b;
}
.filter-btn:active { transform: scale(0.98); }

/* Loading & Empty */
.loading-state, .empty-state {
    text-align: center; padding: 3rem 1rem; color: #94a3b8;
}
.empty-icon { font-size: 3rem; display: block; margin-bottom: 0.5rem; }

/* Orders */
.section-title {
    font-size: 1rem; font-weight: 800; color: #1a202c;
    margin: 0 0 10px; letter-spacing: -0.3px;
}

.orders-section { display: flex; flex-direction: column; gap: 0; }

.order-card {
    background: #fff; border-radius: 14px; padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 10px;
}

.order-header {
    display: flex; align-items: center; gap: 8px;
    padding-bottom: 10px; border-bottom: 1px solid #f1f5f9;
    margin-bottom: 10px;
}
.order-num {
    width: 24px; height: 24px; border-radius: 8px;
    background: #f1f5f9; display: flex; align-items: center;
    justify-content: center; font-size: 0.75rem; font-weight: 700;
    color: #64748b;
}
.order-code {
    flex: 1; font-family: monospace; font-size: 0.8rem;
    font-weight: 700; color: #1a202c;
}

.order-status {
    padding: 3px 8px; border-radius: 8px;
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
}
.status-pending { background: #fef3c7; color: #d97706; }
.status-paid, .status-accepted { background: #dbeafe; color: #2563eb; }
.status-processing { background: #e0e7ff; color: #4f46e5; }
.status-ready, .status-completed { background: #d1fae5; color: #059669; }
.status-cancelled { background: #fee2e2; color: #dc2626; }

.order-details {
    display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
}
.detail-item { display: flex; flex-direction: column; }
.detail-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
.detail-value { font-size: 0.85rem; color: #1a202c; font-weight: 600; }
.detail-value.total { color: #f97316; font-weight: 800; }

.type-badge { display: inline-block; padding: 1px 6px; border-radius: 6px; font-size: 0.75rem; }
.type-dine { background: #dbeafe; color: #2563eb; }
.type-take { background: #fef3c7; color: #d97706; }
</style>
