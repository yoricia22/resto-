<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar color="primary">
                <ion-title>Chef Dashboard 👨‍🍳</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="refreshOrders">
                        <ion-icon :icon="refreshOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="handleLogout">
                        <ion-icon :icon="logOutOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" class="ion-padding chef-content">
            <div v-if="loading" class="center-content">
                <ion-spinner name="crescent"></ion-spinner>
                <p>Memuat pesanan...</p>
            </div>

            <div v-else-if="orders.length === 0" class="center-content empty-state">
                <ion-icon :icon="restaurantOutline" size="large"></ion-icon>
                <h3>Tidak ada pesanan aktif</h3>
                <p>Semua pesanan sudah selesai!</p>
            </div>

            <div v-else class="orders-grid">
                <div v-for="order in orders" :key="order.id" class="order-card">
                    <div class="card-header">
                        <div class="order-info">
                            <h2>{{ order.customer_name }}</h2>
                            <span class="order-number">#{{ order.transaction_number }}</span>
                        </div>
                        <div class="time-badge">
                            {{ formatTime(order.created_at) }}
                        </div>
                    </div>

                    <div class="card-body">
                        <div v-if="!order.items || order.items.length === 0" class="no-items">
                            <p>Tidak ada detail item</p>
                        </div>
                        <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                            <div class="qty-badge">{{ item.quantity || item.kuantiti }}x</div>
                            <div class="item-details">
                                <h4>{{ item.name || item.nama_menu }}</h4>
                                <p v-if="item.notes || item.catatan" class="notes">Note: {{ item.notes || item.catatan }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="status-badge" :class="order.status">
                            {{ order.status === 'accepted' ? 'Baru Masuk' : 'Sedang Dimasak' }}
                        </div>
                        <ion-button expand="block" color="success" @click="markReady(order.id)">
                            Selesai Masak
                        </ion-button>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonSpinner, toastController
} from '@ionic/vue';
import { refreshOutline, logOutOutline, restaurantOutline } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import AuthService from '@/services/auth';

const router = useRouter();
const orders = ref<any[]>([]);
const loading = ref(true);

onMounted(() => {
    fetchOrders();
    // Poll every 30 seconds
    setInterval(fetchOrders, 30000);
});

async function fetchOrders() {
    try {
        const response = await api.get('/chef/orders');
        orders.value = response.data.data;
    } catch (e: any) {
        console.error('Failed to fetch orders', e);
        if (e.response && e.response.data && e.response.data.message) {
            showToast(e.response.data.message, 'danger');
        }
    } finally {
        loading.value = false;
    }
}

function refreshOrders() {
    loading.value = true;
    fetchOrders();
}

async function markReady(orderId: number) {
    try {
        await api.post(`/transactions/${orderId}/ready`);
        await showToast('Pesanan ditandai selesai! Siap diantar.', 'success');
        fetchOrders();
    } catch (e) {
        console.error(e);
        await showToast('Gagal update status pesanan.', 'danger');
    }
}

async function handleLogout() {
    await AuthService.logout();
    router.replace('/login');
}

function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

async function showToast(message: string, color: string = 'dark') {
    const toast = await toastController.create({
        message,
        duration: 2000,
        color
    });
    await toast.present();
}
</script>

<style scoped>
.chef-content {
    --background: #f1f5f9;
    --color: #1e293b;
    color: #1e293b !important;
}

.center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80vh;
    color: #64748b !important;
}

.empty-state ion-icon {
    font-size: 64px;
    margin-bottom: 1rem;
    color: #cbd5e1 !important;
}

.orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding-bottom: 2rem;
}

.order-card {
    background: #ffffff !important;
    color: #1e293b !important;
    --ion-text-color: #1e293b;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
}

.card-header {
    background: #f8fafc !important;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #e2e8f0;
}

.order-info h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b !important;
}

.order-number {
    font-size: 0.85rem;
    color: #64748b !important;
    display: block;
    margin-top: 4px;
}

.time-badge {
    background: #cbd5e1;
    color: #475569 !important;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
}

.card-body {
    padding: 1rem;
    flex: 1;
    background: #ffffff !important;
    color: #1e293b !important;
}

.order-item {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.qty-badge {
    background: #ef4444;
    color: white !important;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    flex-shrink: 0;
}

.item-details {
    flex: 1;
}

.item-details h4 {
    margin: 0 0 4px;
    font-size: 1rem;
    font-weight: 600;
    color: #334155 !important;
    line-height: 1.2;
}

.notes {
    margin: 0;
    font-size: 0.9rem;
    color: #f59e0b !important;
    font-style: italic;
    font-weight: 500;
}

.card-footer {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc !important;
}

.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.status-badge.confirmed {
    background: #dbeafe;
    color: #2563eb !important;
}

.status-badge.preparing {
    background: #fef3c7;
    color: #d97706 !important;
}

.status-badge.accepted {
    background: #dbeafe;
    color: #2563eb !important;
}

.status-badge.processing {
    background: #fef3c7;
    color: #d97706 !important;
}

</style>
