<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar class="kasir-toolbar">
                <ion-title>
                    <div class="toolbar-title">
                        <ion-icon :icon="walletOutline" class="title-icon"></ion-icon>
                        Kasir Dashboard
                    </div>
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="refreshOrders" class="toolbar-btn">
                        <ion-icon :icon="refreshOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button @click="handleLogout" class="toolbar-btn">
                        <ion-icon :icon="logOutOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" class="kasir-content">
            <!-- Stats Bar -->
            <div class="stats-bar">
                <div class="stat-item">
                    <span class="stat-number">{{ orders.length }}</span>
                    <span class="stat-label">Antrian</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">Rp {{ formatPrice(totalPendingRevenue) }}</span>
                    <span class="stat-label">Total Pending</span>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="center-content">
                <ion-spinner name="crescent"></ion-spinner>
                <p>Memuat pesanan...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="orders.length === 0" class="center-content empty-state">
                <div class="empty-icon-wrapper">
                    <ion-icon :icon="checkmarkDoneCircleOutline"></ion-icon>
                </div>
                <h3>Tidak ada pesanan pending</h3>
                <p>Semua pesanan sudah diproses! 🎉</p>
            </div>

            <!-- Orders Grid -->
            <div v-else class="orders-grid">
                <div v-for="order in orders" :key="order.id" class="order-card">
                    <!-- Card Header -->
                    <div class="card-header">
                        <div class="order-meta">
                            <span class="order-code">{{ order.kode_order || order.transaction_number }}</span>
                            <span class="order-type-badge" :class="order.jenis_pesanan">
                                <ion-icon
                                    :icon="order.jenis_pesanan === 'dine_in' ? restaurantOutline : bagHandleOutline">
                                </ion-icon>
                                {{ order.jenis_pesanan === 'dine_in' ? 'Dine In' : 'Take Away' }}
                            </span>
                        </div>
                        <div class="time-badge">
                            <ion-icon :icon="timeOutline"></ion-icon>
                            {{ formatTime(order.created_at || order.waktu_pesan) }}
                        </div>
                    </div>

                    <!-- Card Body — Item List -->
                    <div class="card-body">
                        <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                            <div class="qty-badge">{{ item.quantity || item.kuantiti }}x</div>
                            <div class="item-details">
                                <h4>{{ item.name || item.nama_menu }}</h4>
                                <p v-if="item.notes || item.catatan" class="notes">
                                    <ion-icon :icon="chatbubbleEllipsesOutline"></ion-icon>
                                    {{ item.notes || item.catatan }}
                                </p>
                            </div>
                            <span class="item-price">Rp {{ formatPrice(item.subtotal || (item.price * (item.quantity || item.kuantiti))) }}</span>
                        </div>
                    </div>

                    <!-- Card Footer -->
                    <div class="card-footer">
                        <div class="total-row">
                            <span>Total</span>
                            <span class="total-amount">Rp {{ formatPrice(order.total_harga || order.total_amount) }}</span>
                        </div>
                        <ion-button expand="block" class="pay-btn" @click="openPaymentModal(order)">
                            <ion-icon :icon="walletOutline" slot="start"></ion-icon>
                            Proses Pembayaran
                        </ion-button>
                    </div>
                </div>
            </div>
        </ion-content>

        <!-- Payment Modal -->
        <ion-modal :is-open="showPaymentModal" @didDismiss="closePaymentModal" :initial-breakpoint="1"
            :breakpoints="[0, 1]">
            <ion-header>
                <ion-toolbar class="modal-toolbar">
                    <ion-title>Pembayaran</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closePaymentModal">Tutup</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="modal-content" v-if="selectedOrder">
                <!-- Order Summary -->
                <div class="payment-summary">
                    <div class="payment-order-code">
                        {{ selectedOrder.kode_order || selectedOrder.transaction_number }}
                    </div>
                    <div class="payment-total-label">Total Pembayaran</div>
                    <div class="payment-total-amount">
                        Rp {{ formatPrice(selectedOrder.total_harga || selectedOrder.total_amount) }}
                    </div>
                </div>

                <!-- Payment Method Selection -->
                <div class="method-section">
                    <h3 class="section-title">Pilih Metode Pembayaran</h3>
                    <div class="method-grid">
                        <div class="method-card" :class="{ active: paymentMethod === 'cash' }"
                            @click="paymentMethod = 'cash'">
                            <div class="method-icon cash-icon">
                                <ion-icon :icon="cashOutline"></ion-icon>
                            </div>
                            <span class="method-label">Cash</span>
                            <div class="method-check" v-if="paymentMethod === 'cash'">
                                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                            </div>
                        </div>
                        <div class="method-card" :class="{ active: paymentMethod === 'qris' }"
                            @click="paymentMethod = 'qris'">
                            <div class="method-icon qris-icon">
                                <ion-icon :icon="qrCodeOutline"></ion-icon>
                            </div>
                            <span class="method-label">Non-Cash</span>
                            <div class="method-check" v-if="paymentMethod === 'qris'">
                                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cash Input -->
                <div v-if="paymentMethod === 'cash'" class="cash-section">
                    <label class="input-label">Jumlah Uang Diterima</label>
                    <div class="cash-input-wrapper">
                        <span class="currency-prefix">Rp</span>
                        <input type="number" v-model.number="cashAmount" class="cash-input"
                            placeholder="0" min="0" />
                    </div>
                    <!-- Quick Amount Buttons -->
                    <div class="quick-amounts">
                        <button v-for="amount in quickAmounts" :key="amount" class="quick-btn"
                            @click="cashAmount = amount">
                            {{ formatPriceShort(amount) }}
                        </button>
                        <button class="quick-btn exact" @click="cashAmount = orderTotal">
                            Uang Pas
                        </button>
                    </div>
                    <!-- Change -->
                    <div v-if="cashAmount > 0" class="change-display"
                        :class="{ insufficient: cashAmount < orderTotal }">
                        <span class="change-label">{{ cashAmount >= orderTotal ? 'Kembalian' : 'Kurang' }}</span>
                        <span class="change-amount">
                            Rp {{ formatPrice(Math.abs(cashAmount - orderTotal)) }}
                        </span>
                    </div>
                </div>

                <!-- Non-Cash Info -->
                <div v-if="paymentMethod === 'qris'" class="qris-section">
                    <div class="qris-info">
                        <ion-icon :icon="informationCircleOutline"></ion-icon>
                        <p>Pembayaran Non-Cash akan langsung diproses. Pastikan pelanggan sudah menyelesaikan pembayaran.</p>
                    </div>
                </div>
            </ion-content>

            <!-- Confirm Button -->
            <ion-footer class="modal-footer" v-if="selectedOrder">
                <ion-button expand="block" class="confirm-pay-btn" @click="processPayment"
                    :disabled="isProcessing || !canPay">
                    <ion-icon :icon="checkmarkDoneOutline" slot="start"></ion-icon>
                    {{ isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran' }}
                </ion-button>
            </ion-footer>
        </ion-modal>

        <!-- Processing Loader -->
        <ion-loading :is-open="isProcessing" message="Memproses pembayaran..." spinner="crescent"></ion-loading>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonSpinner, IonModal,
    IonFooter, IonLoading, toastController
} from '@ionic/vue';
import {
    walletOutline, refreshOutline, logOutOutline, timeOutline,
    restaurantOutline, bagHandleOutline, cashOutline, qrCodeOutline,
    checkmarkCircleOutline, checkmarkDoneOutline, checkmarkDoneCircleOutline,
    chatbubbleEllipsesOutline, informationCircleOutline
} from 'ionicons/icons';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import AuthService from '@/services/auth';

const router = useRouter();
const orders = ref<any[]>([]);
const loading = ref(true);
const showPaymentModal = ref(false);
const selectedOrder = ref<any>(null);
const paymentMethod = ref<'cash' | 'qris'>('cash');
const cashAmount = ref(0);
const isProcessing = ref(false);
let pollInterval: ReturnType<typeof setInterval> | null = null;

const orderTotal = computed(() => {
    if (!selectedOrder.value) return 0;
    return selectedOrder.value.total_harga || selectedOrder.value.total_amount || 0;
});

const totalPendingRevenue = computed(() => {
    return orders.value.reduce((sum, o) => sum + (o.total_harga || o.total_amount || 0), 0);
});

const quickAmounts = computed(() => {
    const total = orderTotal.value;
    if (total <= 0) return [];
    const rounded = Math.ceil(total / 10000) * 10000;
    const amounts = new Set([rounded, rounded + 10000, rounded + 20000, 50000, 100000, 200000]);
    return [...amounts].filter(a => a >= total).sort((a, b) => a - b).slice(0, 5);
});

const canPay = computed(() => {
    if (!paymentMethod.value) return false;
    if (paymentMethod.value === 'cash') return cashAmount.value >= orderTotal.value;
    return true; // qris always ok
});

onMounted(() => {
    fetchOrders();
    pollInterval = setInterval(fetchOrders, 15000);
});

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
});

async function fetchOrders() {
    try {
        const response = await api.get('/kasir/orders');
        orders.value = response.data.data;
    } catch (e: any) {
        console.error('Failed to fetch kasir orders', e);
    } finally {
        loading.value = false;
    }
}

function refreshOrders() {
    loading.value = true;
    fetchOrders();
}

function openPaymentModal(order: any) {
    selectedOrder.value = order;
    paymentMethod.value = 'cash';
    cashAmount.value = 0;
    showPaymentModal.value = true;
}

function closePaymentModal() {
    showPaymentModal.value = false;
    selectedOrder.value = null;
}

async function processPayment() {
    if (!selectedOrder.value || !canPay.value) return;

    isProcessing.value = true;

    try {
        const totalBayar = paymentMethod.value === 'cash'
            ? cashAmount.value
            : orderTotal.value;

        await api.post(`/transactions/${selectedOrder.value.id}/payment`, {
            metode_pembayaran: paymentMethod.value,
            karyawan_id: getKaryawanId(),
            total_bayar: totalBayar
        });

        await showToast('Pembayaran berhasil! Pesanan diteruskan ke dapur. ✅', 'success');
        closePaymentModal();
        fetchOrders();
    } catch (e: any) {
        console.error('Payment failed', e);
        const msg = e.response?.data?.message || 'Gagal memproses pembayaran.';
        await showToast(msg, 'danger');
    } finally {
        isProcessing.value = false;
    }
}

function getKaryawanId(): number {
    // Try to get from logged-in user, fallback to 1
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            return user.karyawan_id || user.id || 1;
        }
    } catch { }
    return 1;
}

async function handleLogout() {
    await AuthService.logout();
    router.replace('/login');
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID').format(price);
}

function formatPriceShort(price: number) {
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)}jt`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}rb`;
    return price.toString();
}

function formatTime(dateString: string) {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

async function showToast(message: string, color: string = 'dark') {
    const toast = await toastController.create({ message, duration: 2500, color });
    await toast.present();
}
</script>

<style scoped>
/* ── Toolbar ── */
.kasir-toolbar {
    --background: #1a202c;
    --color: #ffffff;
}

.toolbar-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 1.2rem;
}

.title-icon {
    font-size: 22px;
    color: #FF6B6B;
}

.toolbar-btn {
    color: #94a3b8;
}

/* ── Stats Bar ── */
.stats-bar {
    display: flex;
    gap: 12px;
    padding: 1rem 1.5rem;
    background: #1a202c;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
    margin-bottom: 1.5rem;
}

.stat-item {
    flex: 1;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-number {
    font-weight: 800;
    font-size: 1.2rem;
    color: #ffffff;
}

.stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ── Content ── */
.kasir-content {
    --background: #f1f5f9;
}

.center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: #64748b;
}

.empty-icon-wrapper {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.25);
}

.empty-icon-wrapper ion-icon {
    font-size: 48px;
    color: white;
}

.empty-state h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: #334155;
    margin: 0 0 0.5rem;
}

.empty-state p {
    color: #94a3b8;
    font-size: 1rem;
}

/* ── Orders Grid ── */
.orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
    padding: 0 1rem 2rem;
}

.order-card {
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.order-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Card Header */
.card-header {
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #f1f5f9;
}

.order-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.order-code {
    font-weight: 800;
    font-size: 1rem;
    color: #1a202c;
    letter-spacing: -0.3px;
}

.order-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.7rem;
    width: fit-content;
}

.order-type-badge.dine_in {
    background: rgba(255, 107, 107, 0.1);
    color: #FF6B6B;
}

.order-type-badge.take_away {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.order-type-badge ion-icon {
    font-size: 12px;
}

.time-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #f8fafc;
    color: #64748b;
    padding: 4px 10px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.8rem;
}

.time-badge ion-icon {
    font-size: 14px;
}

/* Card Body */
.card-body {
    padding: 0.75rem 1.25rem;
    flex: 1;
}

.order-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px dashed #f1f5f9;
}

.order-item:last-child {
    border-bottom: none;
}

.qty-badge {
    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    color: white;
    min-width: 32px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.8rem;
    flex-shrink: 0;
}

.item-details {
    flex: 1;
}

.item-details h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155;
    line-height: 1.3;
}

.notes {
    margin: 3px 0 0;
    font-size: 0.78rem;
    color: #f59e0b;
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 4px;
}

.notes ion-icon {
    font-size: 12px;
}

.item-price {
    font-weight: 700;
    font-size: 0.85rem;
    color: #64748b;
    white-space: nowrap;
}

/* Card Footer */
.card-footer {
    padding: 1rem 1.25rem;
    border-top: 1px solid #f1f5f9;
    background: #fafbfc;
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-weight: 700;
    font-size: 1rem;
    color: #1a202c;
}

.total-amount {
    font-size: 1.15rem;
    font-weight: 800;
    color: #FF6B6B;
}

.pay-btn {
    --background: linear-gradient(135deg, #22c55e, #16a34a);
    --border-radius: 14px;
    font-weight: 700;
    height: 48px;
    font-size: 0.95rem;
    --box-shadow: 0 6px 18px rgba(34, 197, 94, 0.3);
}

/* ── Payment Modal ── */
.modal-toolbar {
    --background: #ffffff;
    --color: #1a202c;
    --border-width: 0;
}

.modal-content {
    --background: #f8f9fa;
}

.payment-summary {
    background: #1a202c;
    padding: 2rem 1.5rem;
    text-align: center;
    border-bottom-left-radius: 28px;
    border-bottom-right-radius: 28px;
    margin-bottom: 1.5rem;
}

.payment-order-code {
    font-size: 0.85rem;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
}

.payment-total-label {
    font-size: 0.8rem;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
}

.payment-total-amount {
    font-size: 2rem;
    font-weight: 900;
    color: #ffffff;
}

/* Method Section */
.method-section {
    padding: 0 1.5rem;
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #475569;
    margin: 0 0 0.75rem;
}

.method-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.method-card {
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.method-card.active {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.04);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.method-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
}

.cash-icon {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
}

.qris-icon {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.method-label {
    font-weight: 700;
    font-size: 0.9rem;
    color: #334155;
}

.method-check {
    position: absolute;
    top: 8px;
    right: 8px;
    color: #22c55e;
    font-size: 20px;
}

/* Cash Input */
.cash-section {
    padding: 0 1.5rem 1.5rem;
}

.input-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #475569;
    margin-bottom: 0.5rem;
    display: block;
}

.cash-input-wrapper {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    padding: 0 16px;
    height: 56px;
    transition: border-color 0.2s;
}

.cash-input-wrapper:focus-within {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.currency-prefix {
    font-weight: 800;
    color: #94a3b8;
    margin-right: 8px;
    font-size: 1rem;
}

.cash-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1.3rem;
    font-weight: 800;
    color: #1a202c;
    background: transparent;
}

.cash-input::placeholder {
    color: #cbd5e1;
}

/* Quick Amounts */
.quick-amounts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.quick-btn {
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    font-weight: 700;
    font-size: 0.8rem;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s ease;
}

.quick-btn:active {
    transform: scale(0.95);
}

.quick-btn.exact {
    background: #1a202c;
    color: #ffffff;
    border-color: #1a202c;
}

/* Change Display */
.change-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding: 14px 16px;
    border-radius: 14px;
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.15);
}

.change-display.insufficient {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.15);
}

.change-label {
    font-weight: 700;
    font-size: 0.9rem;
    color: #22c55e;
}

.change-display.insufficient .change-label {
    color: #ef4444;
}

.change-amount {
    font-weight: 800;
    font-size: 1.2rem;
    color: #22c55e;
}

.change-display.insufficient .change-amount {
    color: #ef4444;
}

/* QRIS Section */
.qris-section {
    padding: 0 1.5rem 1.5rem;
}

.qris-info {
    display: flex;
    gap: 10px;
    background: rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.15);
    padding: 14px 16px;
    border-radius: 14px;
    align-items: flex-start;
}

.qris-info ion-icon {
    font-size: 22px;
    color: #667eea;
    flex-shrink: 0;
    margin-top: 2px;
}

.qris-info p {
    margin: 0;
    font-size: 0.85rem;
    color: #475569;
    line-height: 1.5;
}

/* Modal Footer */
.modal-footer {
    background: #ffffff;
    padding: 1rem 1.5rem;
    border-top: 1px solid #f1f5f9;
}

.confirm-pay-btn {
    --background: linear-gradient(135deg, #22c55e, #16a34a);
    --border-radius: 14px;
    font-weight: 700;
    height: 54px;
    font-size: 1rem;
    --box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.confirm-pay-btn[disabled] {
    --background: #cbd5e1;
    --box-shadow: none;
}
</style>
