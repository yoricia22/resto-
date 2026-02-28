<template>
    <ion-page>
        <ion-content :fullscreen="true" class="pending-content">
            <div class="pending-wrapper">
                <!-- Animated Clock Icon -->
                <div class="animation-container">
                    <div class="pulse-ring"></div>
                    <div class="icon-circle">
                        <ion-icon :icon="timeOutline" class="pending-icon"></ion-icon>
                    </div>
                </div>

                <h1>Pesanan Diterima!</h1>
                <p class="subtitle">Silakan menuju kasir untuk pembayaran</p>

                <!-- Order Number Card -->
                <div class="order-card">
                    <span class="label">NOMOR PESANAN</span>
                    <span class="order-number">#{{ route.params.id }}</span>
                </div>

                <!-- Order Type Badge -->
                <div class="type-badge" :class="orderType === 'dine_in' ? 'dine-in' : 'take-away'">
                    <ion-icon :icon="orderType === 'dine_in' ? restaurantOutline : bagHandleOutline"></ion-icon>
                    <span>{{ orderType === 'dine_in' ? 'Dine In' : 'Take Away' }}</span>
                </div>

                <!-- Info Steps -->
                <div class="steps-container">
                    <div class="step">
                        <div class="step-number active">1</div>
                        <div class="step-info">
                            <h4>Pesanan Dikirim</h4>
                            <p>Pesanan kamu sudah masuk</p>
                        </div>
                        <ion-icon :icon="checkmarkCircleOutline" class="step-check"></ion-icon>
                    </div>
                    <div class="step-line"></div>
                    <div class="step">
                        <div class="step-number waiting">2</div>
                        <div class="step-info">
                            <h4>Menunggu Pembayaran</h4>
                            <p>Silakan bayar di kasir</p>
                        </div>
                        <ion-icon :icon="walletOutline" class="step-waiting-icon"></ion-icon>
                    </div>
                    <div class="step-line dim"></div>
                    <div class="step dim">
                        <div class="step-number">3</div>
                        <div class="step-info">
                            <h4>Sedang Dimasak</h4>
                            <p>Chef memproses pesanan</p>
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <ion-button expand="block" class="order-again-btn" @click="orderAgain">
                    <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                    Pesan Lagi
                </ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue';
import {
    timeOutline, restaurantOutline, bagHandleOutline,
    checkmarkCircleOutline, walletOutline, addCircleOutline
} from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue';

const route = useRoute();
const router = useRouter();
const orderType = ref(sessionStorage.getItem('order_type') || 'dine_in');

function orderAgain() {
    router.replace('/order');
}
</script>

<style scoped>
.pending-content {
    --background: #f8f9fa;
}

.pending-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem 1.5rem;
    text-align: center;
}

/* Animated Icon */
.animation-container {
    position: relative;
    margin-bottom: 2rem;
}

.pulse-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 107, 107, 0.1);
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.5;
    }
    50% {
        transform: translate(-50%, -50%) scale(1.3);
        opacity: 0;
    }
}

.icon-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 30px rgba(255, 107, 107, 0.3);
    animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pending-icon {
    font-size: 48px;
    color: white;
}

@keyframes scaleIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

h1 {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1a202c;
    margin: 0 0 0.5rem;
}

.subtitle {
    color: #64748b;
    font-size: 1.05rem;
    margin: 0 0 2rem;
}

/* Order Card */
.order-card {
    background: white;
    padding: 1.5rem 3rem;
    border-radius: 20px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
    border: 1px solid #e2e8f0;
}

.label {
    text-transform: uppercase;
    font-size: 0.8rem;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
}

.order-number {
    font-size: 2.5rem;
    font-weight: 900;
    color: #1a202c;
    font-family: 'Courier New', monospace;
}

/* Type Badge */
.type-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 2.5rem;
}

.type-badge.dine-in {
    background: rgba(255, 107, 107, 0.1);
    color: #FF6B6B;
}

.type-badge.take-away {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.type-badge ion-icon {
    font-size: 18px;
}

/* Steps */
.steps-container {
    width: 100%;
    max-width: 340px;
    margin-bottom: 2.5rem;
}

.step {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
}

.step.dim {
    opacity: 0.4;
}

.step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.step-number.active {
    background: #22c55e;
    color: white;
}

.step-number.waiting {
    background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    color: white;
    animation: pulseSmall 2s ease-in-out infinite;
}

@keyframes pulseSmall {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.3); }
    50% { box-shadow: 0 0 0 8px rgba(255, 107, 107, 0); }
}

.step-info {
    flex: 1;
    text-align: left;
}

.step-info h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1a202c;
}

.step-info p {
    margin: 2px 0 0;
    font-size: 0.8rem;
    color: #94a3b8;
}

.step-check {
    color: #22c55e;
    font-size: 22px;
}

.step-waiting-icon {
    color: #FF6B6B;
    font-size: 22px;
    animation: pulseSmall 2s ease-in-out infinite;
}

.step-line {
    width: 2px;
    height: 20px;
    background: #22c55e;
    margin-left: 17px;
}

.step-line.dim {
    background: #e2e8f0;
}

/* Button */
.order-again-btn {
    width: 100%;
    max-width: 340px;
    --background: #1a202c;
    --border-radius: 16px;
    font-weight: 700;
    height: 54px;
    font-size: 1rem;
    --box-shadow: 0 8px 20px rgba(26, 32, 44, 0.2);
}
</style>
