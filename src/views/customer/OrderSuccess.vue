<template>
    <ion-page>
        <ion-content :fullscreen="true" class="success-content">
            <div class="success-wrapper">
                <div class="animation-container">
                    <ion-icon :icon="checkmarkCircle" class="success-icon"></ion-icon>
                </div>

                <h1>Pesanan Berhasil!</h1>
                <p>Terima kasih sudah memesan.</p>

                <div class="order-card">
                    <span class="label">Nomor Pesanan</span>
                    <span class="order-number">#{{ route.params.id }}</span>
                </div>

                <div class="info-text">
                    <p>Pesanan Anda sudah masuk ke dapur.</p>
                    <p>Silakan tunggu dipanggil ya! 😉</p>
                </div>

                <ion-button expand="block" class="home-btn" @click="backToHome">
                    Kembali ke Menu
                </ion-button>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/vue';
import { checkmarkCircle } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

function backToHome() {
    router.replace('/customer');
}
</script>

<style scoped>
.success-content {
    --background: #f8fafc;
}

.success-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
}

.animation-container {
    margin-bottom: 2rem;
}

.success-icon {
    font-size: 120px;
    color: #22c55e;
    animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
    from {
        transform: scale(0);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 0.5rem;
}

p {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0 0 2rem;
}

.order-card {
    background: white;
    padding: 1.5rem 3rem;
    border-radius: 20px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
    border: 1px solid #e2e8f0;
}

.label {
    text-transform: uppercase;
    font-size: 0.85rem;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
}

.order-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: #0f172a;
    font-family: monospace;
}

.info-text p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
}

.home-btn {
    margin-top: 2rem;
    width: 100%;
    max-width: 300px;
    --border-radius: 12px;
    --padding-top: 16px;
    --padding-bottom: 16px;
    font-weight: 600;
}
</style>
