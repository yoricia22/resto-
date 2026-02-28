<template>
    <ion-page>
        <ion-content :fullscreen="true" class="landing-content">
            <!-- Decorative Background -->
            <div class="bg-decoration">
                <div class="circle circle-1"></div>
                <div class="circle circle-2"></div>
                <div class="circle circle-3"></div>
            </div>

            <div class="landing-wrapper">
                <!-- Logo & Welcome -->
                <div class="welcome-section">
                    <div class="logo-badge">
                        <ion-icon :icon="restaurantOutline" class="logo-icon"></ion-icon>
                    </div>
                    <h1 class="brand-name"><span class="highlight">Si</span>reta</h1>
                    <p class="tagline">Self-Order System</p>
                </div>

                <!-- Step 1: Order Type -->
                <template v-if="step === 'type'">
                    <div class="greeting-card">
                        <h2>Selamat Datang! 👋</h2>
                        <p>Mau makan di sini atau bawa pulang?</p>
                    </div>

                    <div class="order-type-grid">
                        <div class="type-card dine-in" @click="selectType('dine_in')">
                            <div class="type-icon-wrapper">
                                <ion-icon :icon="restaurantOutline" class="type-icon"></ion-icon>
                            </div>
                            <h3>Dine In</h3>
                            <p>Makan di tempat</p>
                            <div class="arrow-hint">
                                <ion-icon :icon="arrowForwardOutline"></ion-icon>
                            </div>
                        </div>

                        <div class="type-card take-away" @click="selectType('take_away')">
                            <div class="type-icon-wrapper">
                                <ion-icon :icon="bagHandleOutline" class="type-icon"></ion-icon>
                            </div>
                            <h3>Take Away</h3>
                            <p>Bawa pulang</p>
                            <div class="arrow-hint">
                                <ion-icon :icon="arrowForwardOutline"></ion-icon>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Step 2: Table Selection (Dine-In only) -->
                <template v-else-if="step === 'table'">
                    <div class="greeting-card">
                        <h2>Pilih Meja 🪑</h2>
                        <p>Pilih meja yang tersedia untukmu</p>
                    </div>

                    <!-- Loading -->
                    <div v-if="loadingTables" class="table-loading">
                        <ion-spinner name="crescent" color="primary"></ion-spinner>
                        <p>Memuat daftar meja...</p>
                    </div>

                    <!-- Table Grid -->
                    <div v-else class="table-grid">
                        <div
                            v-for="table in tables"
                            :key="table.id"
                            class="table-card"
                            :class="{
                                'available': table.status === 'available',
                                'booked': table.status === 'booked' || table.status === 'occupied',
                                'selected': selectedTable?.id === table.id
                            }"
                            @click="selectTable(table)"
                        >
                            <div class="table-icon">
                                <ion-icon :icon="table.status === 'available' ? gridOutline : lockClosedOutline"></ion-icon>
                            </div>
                            <span class="table-number">Meja {{ table.nomor_meja || table.table_number }}</span>
                            <span class="table-status-label">
                                {{ table.status === 'available' ? 'Tersedia' : 'Penuh' }}
                            </span>
                            <div v-if="selectedTable?.id === table.id" class="selected-check">
                                <ion-icon :icon="checkmarkCircle"></ion-icon>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="table-actions">
                        <ion-button
                            expand="block"
                            class="confirm-table-btn"
                            :disabled="!selectedTable"
                            @click="confirmTable"
                        >
                            <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
                            Lanjut Pesan
                        </ion-button>
                        <ion-button
                            expand="block"
                            fill="clear"
                            class="back-link"
                            @click="step = 'type'"
                        >
                            ← Kembali
                        </ion-button>
                    </div>
                </template>

                <!-- Staff Login Link -->
                <div class="staff-link">
                    <a @click.prevent="goToLogin" href="#">Login sebagai Staff →</a>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon, IonButton, IonSpinner } from '@ionic/vue';
import {
    restaurantOutline, bagHandleOutline, arrowForwardOutline,
    gridOutline, lockClosedOutline, checkmarkCircle
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const step = ref<'type' | 'table'>('type');
const tables = ref<any[]>([]);
const selectedTable = ref<any>(null);
const loadingTables = ref(false);

async function selectType(type: 'dine_in' | 'take_away') {
    sessionStorage.setItem('order_type', type);
    sessionStorage.removeItem('meja_id'); // clear old table

    if (type === 'take_away') {
        router.push('/order/menu');
    } else {
        // Dine-In — load tables first
        step.value = 'table';
        await loadTables();
    }
}

async function loadTables() {
    loadingTables.value = true;
    try {
        const res = await api.get('/tables');
        tables.value = res.data.data;
    } catch (e) {
        console.error('Failed to load tables', e);
    } finally {
        loadingTables.value = false;
    }
}

function selectTable(table: any) {
    if (table.status !== 'available') return; // can't select booked table
    selectedTable.value = table;
}

function confirmTable() {
    if (!selectedTable.value) return;
    sessionStorage.setItem('meja_id', String(selectedTable.value.id));
    router.push('/order/menu');
}

function goToLogin() {
    router.push('/login');
}
</script>

<style scoped>
.landing-content {
    --background: #f8f9fa;
}

.bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
}

.circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;
}

.circle-1 {
    width: 300px;
    height: 300px;
    background: #FF6B6B;
    top: -80px;
    right: -60px;
}

.circle-2 {
    width: 200px;
    height: 200px;
    background: #FF8E53;
    bottom: 10%;
    left: -60px;
}

.circle-3 {
    width: 150px;
    height: 150px;
    background: #667eea;
    bottom: 30%;
    right: -40px;
}

.landing-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem 1.5rem;
}

/* Logo & Brand */
.welcome-section {
    text-align: center;
    margin-bottom: 2rem;
    animation: fadeInDown 0.8s ease;
}

.logo-badge {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    box-shadow: 0 12px 30px rgba(255, 107, 107, 0.35);
    transform: rotate(-8deg);
    transition: transform 0.3s ease;
}

.logo-badge:hover {
    transform: rotate(0deg) scale(1.05);
}

.logo-icon {
    font-size: 40px;
    color: white;
    transform: rotate(8deg);
}

.brand-name {
    font-size: 2.5rem;
    font-weight: 900;
    color: #1a202c;
    margin: 0;
    letter-spacing: -1px;
}

.highlight {
    color: #FF6B6B;
}

.tagline {
    color: #94a3b8;
    font-size: 1rem;
    margin: 4px 0 0;
    font-weight: 500;
}

/* Greeting Card */
.greeting-card {
    text-align: center;
    margin-bottom: 2rem;
    animation: fadeInUp 0.8s ease 0.2s both;
}

.greeting-card h2 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #1a202c;
    margin: 0 0 0.5rem;
}

.greeting-card p {
    color: #64748b;
    font-size: 1.05rem;
    margin: 0;
}

/* Order Type Grid */
.order-type-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    max-width: 400px;
    animation: fadeInUp 0.8s ease 0.4s both;
}

.type-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 2rem 1.2rem 1.5rem;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    position: relative;
    overflow: hidden;
    border: 2px solid transparent;
}

.type-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.type-card.dine-in::before {
    background: linear-gradient(90deg, #FF6B6B, #FF8E53);
}

.type-card.take-away::before {
    background: linear-gradient(90deg, #667eea, #764ba2);
}

.type-card:active {
    transform: scale(0.96);
}

.type-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    border-color: #f1f5f9;
}

.type-card:hover::before {
    opacity: 1;
}

.type-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
}

.dine-in .type-icon-wrapper {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.12), rgba(255, 142, 83, 0.12));
}

.take-away .type-icon-wrapper {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.12));
}

.type-icon {
    font-size: 30px;
}

.dine-in .type-icon {
    color: #FF6B6B;
}

.take-away .type-icon {
    color: #667eea;
}

.type-card h3 {
    font-size: 1.1rem;
    font-weight: 800;
    color: #1a202c;
    margin: 0 0 4px;
}

.type-card p {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 0;
}

.arrow-hint {
    margin-top: 1rem;
    color: #cbd5e1;
    font-size: 18px;
    transition: all 0.3s ease;
}

.type-card:hover .arrow-hint {
    color: #64748b;
    transform: translateX(4px);
}

/* ── Table Selection ── */
.table-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #64748b;
    padding: 2rem;
    animation: fadeInUp 0.5s ease;
}

.table-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
    max-width: 400px;
    margin-bottom: 1.5rem;
    animation: fadeInUp 0.6s ease;
}

.table-card {
    background: #ffffff;
    border-radius: 18px;
    padding: 1rem 0.5rem;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0,0,0,0.06);
    border: 2px solid #e2e8f0;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    position: relative;
}

.table-card.available {
    border-color: #e2e8f0;
}

.table-card.available:active {
    transform: scale(0.95);
}

.table-card.booked {
    background: #f8fafc;
    opacity: 0.5;
    cursor: not-allowed;
}

.table-card.selected {
    border-color: #FF6B6B;
    background: rgba(255, 107, 107, 0.04);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15);
}

.table-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.table-card.available .table-icon {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
}

.table-card.booked .table-icon {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
}

.table-card.selected .table-icon {
    background: rgba(255, 107, 107, 0.12);
    color: #FF6B6B;
}

.table-number {
    font-weight: 800;
    font-size: 0.8rem;
    color: #1a202c;
}

.table-card.booked .table-number {
    color: #94a3b8;
}

.table-status-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table-card.available .table-status-label {
    color: #22c55e;
}

.selected-check {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 18px;
    color: #FF6B6B;
}

/* Action Buttons */
.table-actions {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    animation: fadeInUp 0.7s ease;
}

.confirm-table-btn {
    --background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    --border-radius: 16px;
    font-weight: 700;
    height: 54px;
    font-size: 1rem;
    --box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.back-link {
    --color: #94a3b8;
    font-weight: 600;
    font-size: 0.9rem;
}

/* Staff Login */
.staff-link {
    margin-top: 2.5rem;
    animation: fadeInUp 0.8s ease 0.6s both;
}

.staff-link a {
    color: #94a3b8;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    transition: color 0.2s;
}

.staff-link a:hover {
    color: #FF6B6B;
}

/* Animations */
@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
