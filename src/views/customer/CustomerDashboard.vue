<template>
    <ion-page>
        <!-- Header / Banner -->
        <ion-header class="kiosk-header" :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="goBack" fill="clear" class="back-btn">
                        <ion-icon :icon="arrowBackOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
                <ion-title>
                    <div class="logo-text">
                        <span class="highlight">Si</span>reta
                    </div>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="kiosk-content" :fullscreen="true">
            <!-- Hero Banner -->
            <div class="hero-banner">
                <div class="hero-content">
                    <h1>Mau makan apa? 🍽️</h1>
                    <div class="order-type-badge" :class="orderType">
                        <ion-icon :icon="orderType === 'dine_in' ? restaurantOutline : bagHandleOutline"></ion-icon>
                        <span>{{ orderType === 'dine_in' ? 'Dine In' : 'Take Away' }}</span>
                    </div>
                </div>
            </div>

            <!-- Category Filter -->
            <div class="category-scroll">
                <div class="cat-chip" :class="{ active: selectedCategory === 'all' }" @click="selectedCategory = 'all'">
                    <div class="cat-icon-wrapper all-icon">
                        <ion-icon :icon="gridOutline"></ion-icon>
                    </div>
                    <span>Semua</span>
                </div>
                <div v-for="(cat, index) in categories" :key="cat.id" class="cat-chip"
                    :class="{ active: selectedCategory === (cat.id || 0) }" @click="selectedCategory = (cat.id || 0)">
                    <div class="cat-icon-wrapper" :style="{ background: getColor(index) }">
                        <ion-icon :icon="fastFoodOutline"></ion-icon>
                    </div>
                    <span>{{ cat.name }}</span>
                </div>
            </div>

            <!-- Menu Grid -->
            <div class="menu-grid">
                <div v-if="loading" class="center-loader">
                    <ion-spinner name="crescent" color="primary"></ion-spinner>
                </div>
                <div v-else-if="filteredMenus.length === 0" class="empty-state">
                    <ion-icon :icon="searchOutline"></ion-icon>
                    <p>Menu tidak ditemukan</p>
                </div>
                <div v-else v-for="menu in filteredMenus" :key="menu.id" class="menu-card" @click="addToCart(menu)">
                    <div class="menu-image">
                        <img :src="getMenuImage(menu)" alt="Menu Image" @error="handleImageError" />
                        <div v-if="(menu.stock || 0) <= 0" class="out-of-stock-overlay">
                            <span>Habis</span>
                        </div>
                    </div>
                    <div class="menu-details">
                        <h3 class="menu-name">{{ menu.name }}</h3>
                        <p class="menu-price">Rp {{ formatPrice(menu.price) }}</p>
                    </div>
                    <div class="add-btn-overlay">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </div>
                </div>
            </div>
        </ion-content>

        <!-- Floating Cart Button -->
        <div class="floating-cart-btn" v-if="cartTotalItems > 0" @click="isCartOpen = true">
            <div class="cart-info">
                <span class="cart-count">{{ cartTotalItems }} Item</span>
                <span class="cart-total">Rp {{ formatPrice(cartTotalPrice) }}</span>
            </div>
            <div class="cart-icon">
                <ion-icon :icon="cartOutline"></ion-icon>
            </div>
        </div>

        <!-- Cart Drawer (Modal) -->
        <ion-modal :is-open="isCartOpen" @didDismiss="isCartOpen = false" :initial-breakpoint="1" :breakpoints="[0, 1]">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Keranjang Pesanan</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="isCartOpen = false">Tutup</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="cart-content">
                <!-- Cart Items -->
                <div v-if="cartItems.length === 0" class="empty-cart">
                    <ion-icon :icon="cartOutline"></ion-icon>
                    <p>Keranjang masih kosong</p>
                    <ion-button fill="outline" @click="isCartOpen = false">Mulai Belanja</ion-button>
                </div>
                <div v-else>
                    <div class="cart-list">
                        <div v-for="item in cartItems" :key="item.id" class="cart-item">
                            <div class="item-info">
                                <h4>{{ item.name }}</h4>
                                <p>Rp {{ formatPrice(item.price * item.quantity) }}</p>
                            </div>
                            <div class="qty-control">
                                <ion-button fill="clear" size="small" @click="decrementQty(item)">
                                    <ion-icon :icon="removeCircleOutline" slot="icon-only"></ion-icon>
                                </ion-button>
                                <span>{{ item.quantity }}</span>
                                <ion-button fill="clear" size="small" @click="incrementQty(item)">
                                    <ion-icon :icon="addCircleOutline" slot="icon-only"></ion-icon>
                                </ion-button>
                            </div>
                        </div>
                    </div>

                    <!-- Order Type Info -->
                    <div class="order-info-section">
                        <div class="order-info-row">
                            <ion-icon :icon="orderType === 'dine_in' ? restaurantOutline : bagHandleOutline"></ion-icon>
                            <span>{{ orderType === 'dine_in' ? 'Dine In — Makan di tempat' : 'Take Away — Bawa pulang' }}</span>
                        </div>
                    </div>
                </div>
            </ion-content>
            <ion-footer class="cart-footer" v-if="cartItems.length > 0">
                <div class="total-row">
                    <span>Total</span>
                    <span class="total-val">Rp {{ formatPrice(cartTotalPrice) }}</span>
                </div>
                <ion-button expand="block" class="checkout-btn" @click="checkout" :disabled="isProcessing">
                    <ion-icon :icon="sendOutline" slot="start"></ion-icon>
                    {{ isProcessing ? 'Mengirim...' : 'Kirim Pesanan' }}
                </ion-button>
            </ion-footer>
        </ion-modal>

        <!-- Loading Transaction -->
        <ion-loading :is-open="isProcessing" message="Mengirim pesanan ke kasir..." spinner="crescent"></ion-loading>

    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon, IonSpinner, IonModal,
    IonFooter, IonLoading
} from '@ionic/vue';
import {
    gridOutline, fastFoodOutline, searchOutline,
    addOutline, cartOutline, arrowBackOutline,
    addCircleOutline, removeCircleOutline,
    restaurantOutline, bagHandleOutline, sendOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminService, { MenuItem, CategoryItem } from '@/services/admin';
import CartService, { CartItem } from '@/services/cart';
import api from '@/services/api';

const router = useRouter();
const categories = ref<CategoryItem[]>([]);
const menus = ref<MenuItem[]>([]);
const loading = ref(true);
const selectedCategory = ref<string | number>('all');
const isCartOpen = ref(false);
const isProcessing = ref(false);

// Get order type from session (set by GuestLanding)
const orderType = ref(sessionStorage.getItem('order_type') || 'dine_in');

// Cart Direct Access
const cartItems = CartService.items;
const cartTotalItems = CartService.totalItems;
const cartTotalPrice = CartService.totalPrice;

const colorPalette = [
    'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
];

function getColor(index: number) {
    return colorPalette[index % colorPalette.length];
}

const filteredMenus = computed(() => {
    if (selectedCategory.value === 'all' || selectedCategory.value === 0) return menus.value;
    return menus.value.filter(m => Number(m.category_id) === Number(selectedCategory.value));
});

onMounted(async () => {
    await fetchData();
});

async function fetchData() {
    loading.value = true;
    try {
        const [cats, items] = await Promise.all([
            AdminService.getCategories(),
            AdminService.getMenus()
        ]);
        categories.value = cats;
        menus.value = items.filter((m: MenuItem) => m.is_available);
    } catch (e) {
        console.error(e);
    }
    loading.value = false;
}

function addToCart(menu: MenuItem) {
    if (menu.stock && menu.stock > 0) {
        CartService.addToCart(menu);
    }
}

function incrementQty(item: CartItem) {
    if (item.id) {
        CartService.updateQuantity(item.id, item.quantity + 1, item.notes);
    }
}

function decrementQty(item: CartItem) {
    if (!item.id) return;
    if (item.quantity > 1) {
        CartService.updateQuantity(item.id, item.quantity - 1, item.notes);
    } else {
        CartService.removeFromCart(item.id, item.notes);
    }
}

async function checkout() {
    if (cartItems.value.length === 0) return;

    isProcessing.value = true;

    // Guest order payload — no ditangani_oleh, no payment
    const payload = {
        jenis_pesanan: orderType.value,
        meja_id: orderType.value === 'dine_in' ? sessionStorage.getItem('meja_id') : null,
        items: cartItems.value.map(item => ({
            menu_id: item.id,
            kuantiti: item.quantity,
            catatan: item.notes
        }))
    };

    try {
        const trxRes = await api.post('/guest/orders', payload);
        const trxId = trxRes.data.data.id;

        CartService.clearCart();
        isCartOpen.value = false;

        // Navigate to pending page
        router.push(`/order/pending/${trxId}`);

    } catch (e: any) {
        console.error('Checkout failed', e);
        const msg = e.response?.data?.message || 'Gagal mengirim pesanan. Silakan coba lagi.';
        alert(msg);
    } finally {
        isProcessing.value = false;
    }
}

function goBack() {
    router.replace('/order');
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID').format(price);
}

function getMenuImage(menu: MenuItem) {
    if (!menu.image) return 'https://placehold.co/400x300?text=Menu';
    if (menu.image.startsWith('http')) return menu.image;
    return `http://127.0.0.1:8000/storage/${menu.image}`;
}

function handleImageError(e: Event) {
    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Menu';
}
</script>

<style scoped>
/* Theme & Colors */
:root {
    --highlight-color: #FF6B6B;
}

.kiosk-header ion-toolbar {
    --background: #ffffff;
    --border-color: transparent;
}

.back-btn {
    color: #1a202c;
    font-size: 22px;
}

.logo-text {
    font-weight: 800;
    font-size: 1.4rem;
    color: #1a202c;
    letter-spacing: -1px;
}

.highlight {
    color: #FF6B6B;
}

.kiosk-content {
    --background: #f8f9fa;
    --color: #1a202c;
    color: #1a202c;
}

/* Hero Banner */
.hero-banner {
    padding: 1.5rem;
    background: #ffffff;
    border-bottom-left-radius: 30px;
    border-bottom-right-radius: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    margin-bottom: 1.5rem;
}

.hero-content h1 {
    font-weight: 800;
    font-size: 1.6rem;
    color: #1a202c;
    margin: 0 0 0.75rem;
}

.hero-content p {
    color: #94a3b8;
    margin: 4px 0 0;
    font-size: 1rem;
}

/* Order Type Badge */
.order-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.85rem;
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
    font-size: 16px;
}

/* Category Filter */
.category-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 0 1.5rem 1rem;
    scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
    display: none;
}

.cat-chip {
    background: #ffffff;
    border-radius: 50px;
    padding: 6px 16px 6px 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    cursor: pointer;
    flex-shrink: 0;
    border: 1px solid transparent;
}

.cat-chip.active {
    background: #FF6B6B;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.cat-icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: #64748b;
    font-size: 16px;
}

.cat-chip.active .cat-icon-wrapper {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

.all-icon {
    background: #f1f5f9;
}

.cat-chip span {
    font-weight: 600;
    font-size: 0.9rem;
}

/* Menu Grid */
.menu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 0 1.5rem 6rem;
}

.menu-card {
    background: #ffffff;
    color: #1a202c;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
    position: relative;
    cursor: pointer;
}

.menu-card:active {
    transform: scale(0.97);
}

.menu-image {
    width: 100%;
    height: 140px;
    position: relative;
    background: #f1f5f9;
}

.menu-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.out-of-stock-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 1.2rem;
}

.menu-details {
    padding: 12px;
}

.menu-name {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0 0 6px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: #1a202c;
}

.menu-price {
    font-weight: 800;
    color: #FF6B6B;
    margin: 0;
    font-size: 1.05rem;
}

.add-btn-overlay {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: #f8f9fa;
    color: #1a202c;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Floating Cart */
.floating-cart-btn {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #1a202c;
    color: #fff;
    border-radius: 50px;
    padding: 8px 8px 8px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    z-index: 100;
    width: 90%;
    max-width: 400px;
    cursor: pointer;
}

.cart-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.cart-count {
    font-size: 0.8rem;
    color: #94a3b8;
}

.cart-total {
    font-weight: 800;
    font-size: 1.1rem;
}

.cart-icon {
    width: 48px;
    height: 48px;
    background: #FF6B6B;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

/* Cart Modal */
.cart-content {
    --background: #f8f9fa;
    --color: #1a202c;
    color: #1a202c;
}

.cart-list {
    padding: 1rem;
}

.cart-item {
    background: #ffffff;
    padding: 1rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    color: #1a202c;
}

.item-info h4 {
    margin: 0 0 4px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1a202c;
}

.item-info p {
    margin: 0;
    color: #FF6B6B;
    font-weight: 600;
    font-size: 0.9rem;
}

.qty-control {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 12px;
}

.qty-control span {
    font-weight: 700;
    width: 20px;
    text-align: center;
    color: #1a202c;
}

/* Order Info Section */
.order-info-section {
    padding: 0 1rem 1rem;
}

.order-info-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8f9fa;
    padding: 12px 16px;
    border-radius: 14px;
    color: #475569;
    font-weight: 600;
    font-size: 0.9rem;
}

.order-info-row ion-icon {
    font-size: 20px;
    color: #FF6B6B;
}

.cart-footer {
    background: #ffffff;
    padding: 1.5rem;
    border-top: 1px solid #f1f5f9;
    color: #1a202c;
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a202c;
}

.checkout-btn {
    --background: linear-gradient(135deg, #FF6B6B, #FF8E53);
    --border-radius: 14px;
    font-weight: 700;
    height: 50px;
    font-size: 1rem;
    --box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.empty-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #94a3b8;
}

.empty-cart ion-icon {
    font-size: 64px;
    margin-bottom: 1rem;
}

.center-loader {
    grid-column: span 2;
    display: flex;
    justify-content: center;
    padding: 2rem;
}

.empty-state {
    grid-column: span 2;
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
}

.empty-state ion-icon {
    font-size: 48px;
    margin-bottom: 8px;
}
</style>
