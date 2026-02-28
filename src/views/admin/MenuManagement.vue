<template>
    <ion-page>
        <ion-header class="admin-header">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/admin" text="" :icon="arrowBackOutline"></ion-back-button>
                </ion-buttons>
                <ion-title>Kelola Menu</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="openCreateModal" fill="clear" class="add-btn">
                        <ion-icon :icon="addOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-toolbar class="search-toolbar">
                <ion-searchbar v-model="searchQuery" placeholder="Cari menu..." :debounce="400" @ionInput="fetchMenus"
                    class="custom-searchbar"></ion-searchbar>
            </ion-toolbar>
        </ion-header>

        <ion-content class="admin-content">
            <!-- Loading -->
            <div v-if="loading" class="center-content">
                <ion-spinner name="crescent" color="primary"></ion-spinner>
            </div>

            <!-- Empty State -->
            <div v-else-if="menus.length === 0" class="center-content empty-state">
                <ion-icon :icon="fastFoodOutline" class="empty-icon"></ion-icon>
                <h3>Belum ada menu</h3>
                <p>Tap tombol + untuk menambah menu baru</p>
            </div>

            <!-- Menu List -->
            <div v-else class="list-container">
                <div v-for="menu in menus" :key="menu.id" class="menu-card">
                    <div class="menu-main" @click="openEditModal(menu)">
                        <div class="menu-avatar" :style="{ background: getAvatarColor(menu.category?.name) }">
                            {{ menu.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="menu-info">
                            <span class="menu-name">{{ menu.name }}</span>
                            <span class="menu-category">{{ menu.category?.name || '—' }}</span>
                            <span class="menu-price">Rp {{ formatPrice(menu.price) }}</span>
                        </div>
                        <div class="menu-meta">
                            <span class="stock-badge" :class="(menu.stock ?? 0) > 0 ? 'in-stock' : 'out-stock'">
                                {{ (menu.stock ?? 0) > 0 ? `Stok: ${menu.stock}` : 'Habis' }}
                            </span>
                        </div>
                    </div>
                    <div class="menu-actions">
                        <ion-button fill="clear" size="small" @click="openEditModal(menu)">
                            <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" size="small" color="danger" @click="confirmDelete(menu)">
                            <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                        </ion-button>
                    </div>
                </div>
            </div>
        </ion-content>

        <!-- Create/Edit Modal -->
        <ion-modal :is-open="showModal" @didDismiss="closeModal" :breakpoints="[0, 0.95]" :initialBreakpoint="0.95">
            <ion-header>
                <ion-toolbar>
                    <ion-title>{{ editingMenu ? 'Edit Menu' : 'Tambah Menu' }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeModal">Tutup</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="modal-content">
                <form @submit.prevent="saveMenu" class="form-container">
                    <div class="form-group">
                        <label>Nama Menu *</label>
                        <ion-input v-model="form.name" placeholder="Contoh: Nasi Goreng Spesial" fill="outline"
                            class="form-input"></ion-input>
                    </div>

                    <div class="form-row">
                        <div class="form-group flex-1">
                            <label>Harga (Rp) *</label>
                            <ion-input v-model.number="form.price" type="number" placeholder="25000" fill="outline"
                                class="form-input"></ion-input>
                        </div>
                        <div class="form-group flex-1">
                            <label>Stok</label>
                            <ion-input v-model.number="form.stock" type="number" placeholder="100" fill="outline"
                                class="form-input"></ion-input>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Kategori *</label>
                        <ion-select v-model.number="form.category_id" placeholder="Pilih Kategori" fill="outline"
                            interface="action-sheet" class="form-input">
                            <ion-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                {{ cat.name }}
                            </ion-select-option>
                        </ion-select>
                    </div>

                    <div class="form-group">
                        <label>Deskripsi</label>
                        <ion-textarea v-model="form.description" placeholder="Deskripsi singkat menu..." fill="outline"
                            :rows="3" class="form-input"></ion-textarea>
                    </div>

                    <div class="form-group">
                        <label>Waktu Persiapan (menit)</label>
                        <ion-input v-model.number="form.preparation_time" type="number" placeholder="10" fill="outline"
                            class="form-input"></ion-input>
                    </div>

                    <div class="error-msg" v-if="formError">{{ formError }}</div>

                    <ion-button expand="block" type="submit" class="save-btn" :disabled="saving">
                        <ion-spinner v-if="saving" name="crescent"></ion-spinner>
                        <span v-else>{{ editingMenu ? 'Simpan Perubahan' : 'Tambah Menu' }}</span>
                    </ion-button>
                </form>
            </ion-content>
        </ion-modal>

        <!-- Delete Alert -->
        <ion-alert :is-open="showDeleteAlert" header="Hapus Menu"
            :message="`Yakin ingin menghapus '${deletingMenu?.name}'?`" :buttons="deleteAlertButtons"
            @didDismiss="showDeleteAlert = false"></ion-alert>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonBackButton, IonSearchbar, IonSpinner,
    IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption, IonAlert,
    toastController
} from '@ionic/vue';
import {
    arrowBackOutline, addOutline, fastFoodOutline,
    createOutline, trashOutline
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import AdminService, { MenuItem, CategoryItem } from '@/services/admin';

const loading = ref(true);
const menus = ref<MenuItem[]>([]);
const categories = ref<CategoryItem[]>([]);
const searchQuery = ref('');
const showModal = ref(false);
const editingMenu = ref<MenuItem | null>(null);
const saving = ref(false);
const formError = ref('');

const showDeleteAlert = ref(false);
const deletingMenu = ref<MenuItem | null>(null);

const form = ref({
    name: '',
    price: null as number | null,
    stock: null as number | null,
    category_id: null as number | null,
    description: '',
    preparation_time: null as number | null,
});

const deleteAlertButtons = [
    { text: 'Batal', role: 'cancel' },
    {
        text: 'Hapus',
        role: 'destructive',
        handler: async () => {
            if (deletingMenu.value?.id) {
                try {
                    await AdminService.deleteMenu(deletingMenu.value.id);
                    await fetchMenus();
                } catch (e: any) {
                    const msg = e.response?.data?.message || 'Gagal menghapus menu.';
                    const toast = await toastController.create({
                        message: msg,
                        duration: 3000,
                        color: 'danger',
                        position: 'bottom'
                    });
                    await toast.present();
                }
            }
        }
    }
];

const avatarColors: Record<string, string> = {};
const colorPalette = [
    'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #fccb90, #d57eeb)',
];

function getAvatarColor(categoryName?: string): string {
    const key = categoryName || 'default';
    if (!avatarColors[key]) {
        const idx = Object.keys(avatarColors).length % colorPalette.length;
        avatarColors[key] = colorPalette[idx];
    }
    return avatarColors[key];
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID').format(price);
}

async function fetchMenus() {
    loading.value = true;
    try {
        const params: any = {};
        if (searchQuery.value) params.search = searchQuery.value;
        menus.value = await AdminService.getMenus(params);
    } catch { menus.value = []; }
    loading.value = false;
}

async function fetchCategories() {
    try {
        categories.value = await AdminService.getCategories();
    } catch { categories.value = []; }
}

function openCreateModal() {
    editingMenu.value = null;
    form.value = { name: '', price: null, stock: null, category_id: null, description: '', preparation_time: null };
    formError.value = '';
    showModal.value = true;
}

function openEditModal(menu: MenuItem) {
    editingMenu.value = menu;
    form.value = {
        name: menu.name,
        price: menu.price,
        stock: menu.stock ?? null,
        category_id: menu.category?.id ?? null,
        description: menu.description || '',
        preparation_time: menu.preparation_time ?? null,
    };
    formError.value = '';
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
    editingMenu.value = null;
}

async function saveMenu() {
    if (!form.value.name || !form.value.price || !form.value.category_id) {
        formError.value = 'Nama, harga, dan kategori wajib diisi.';
        return;
    }
    saving.value = true;
    formError.value = '';
    try {
        const payload: any = {
            name: form.value.name,
            price: form.value.price,
            category_id: form.value.category_id,
            description: form.value.description,
            stock: form.value.stock ?? 0,
            preparation_time: form.value.preparation_time ?? 10,
        };
        if (editingMenu.value?.id) {
            await AdminService.updateMenu(editingMenu.value.id, payload);
        } else {
            await AdminService.createMenu(payload);
        }
        closeModal();
        await fetchMenus();
    } catch (e: any) {
        formError.value = e.response?.data?.message || 'Gagal menyimpan menu.';
    }
    saving.value = false;
}

function confirmDelete(menu: MenuItem) {
    deletingMenu.value = menu;
    showDeleteAlert.value = true;
}

onMounted(async () => {
    await Promise.all([fetchMenus(), fetchCategories()]);
});
</script>

<style scoped>
.admin-header ion-toolbar {
    --background: #ffffff;
    --color: #1a202c;
    --border-color: #f0f0f0;
}

.admin-header ion-title {
    font-weight: 800;
    font-size: 1.1rem;
}

.search-toolbar {
    --background: #ffffff;
    padding: 0 8px 8px;
}

.custom-searchbar {
    --background: #f1f5f9;
    --border-radius: 14px;
    --box-shadow: none;
    --placeholder-color: #94a3b8;
    --icon-color: #94a3b8;
    font-size: 0.9rem;
}

.add-btn {
    --color: #FF6B6B;
    font-size: 1.5rem;
}

.admin-content {
    --background: #f8f9fa;
    --color: #1a202c;
    color: #1a202c;
}

.center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
}

.empty-state .empty-icon {
    font-size: 64px;
    color: #cbd5e1;
    margin-bottom: 12px;
}

.empty-state h3 {
    color: #64748b;
    font-weight: 700;
    margin: 0 0 4px;
}

.empty-state p {
    color: #94a3b8;
    font-size: 0.85rem;
    margin: 0;
}

.list-container {
    padding: 12px;
}

.menu-card {
    background: #ffffff;
    color: #1a202c;
    border-radius: 18px;
    padding: 1rem;
    margin-bottom: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease;
}

.menu-card:active {
    transform: scale(0.99);
}

.menu-main {
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
}

.menu-avatar {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.menu-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.menu-name {
    font-weight: 700;
    font-size: 0.95rem;
    color: #1a202c;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.menu-category {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
}

.menu-price {
    font-size: 0.85rem;
    color: #FF6B6B;
    font-weight: 700;
    margin-top: 2px;
}

.menu-meta {
    flex-shrink: 0;
}

.stock-badge {
    font-size: 0.7rem;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 600;
}

.in-stock {
    background: #ecfdf5;
    color: #059669;
}

.out-stock {
    background: #fef2f2;
    color: #ef4444;
}

.menu-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0;
    margin-top: 8px;
    border-top: 1px solid #f1f5f9;
    padding-top: 8px;
}

.menu-actions ion-button {
    --padding-start: 12px;
    --padding-end: 12px;
    font-size: 1.1rem;
}

/* ── Modal ── */
.modal-content {
    --background: #f8f9fa;
    --color: #1a202c;
    color: #1a202c;
}

.form-container {
    padding: 1.5rem;
}

.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    font-weight: 700;
    font-size: 0.8rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}

.form-input {
    --border-radius: 14px;
    --background: #ffffff;
    --color: #1a202c;
    color: #1a202c;
    font-size: 0.95rem;
}

.form-row {
    display: flex;
    gap: 12px;
}

.flex-1 {
    flex: 1;
}

.error-msg {
    background: #fef2f2;
    color: #ef4444;
    padding: 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    margin-bottom: 1rem;
    border: 1px solid #fee2e2;
}

.save-btn {
    --background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    --border-radius: 16px;
    --box-shadow: 0 8px 20px rgba(255, 107, 107, 0.25);
    font-weight: 700;
    font-size: 1rem;
    height: 52px;
    margin-top: 0.5rem;
}
</style>
