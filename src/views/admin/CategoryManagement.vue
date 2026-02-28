<template>
    <ion-page>
        <ion-header class="admin-header">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/admin" text="" :icon="arrowBackOutline"></ion-back-button>
                </ion-buttons>
                <ion-title>Kelola Kategori</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="openCreateModal" fill="clear" class="add-btn">
                        <ion-icon :icon="addOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="admin-content">
            <!-- Loading -->
            <div v-if="loading" class="center-content">
                <ion-spinner name="crescent" color="primary"></ion-spinner>
            </div>

            <!-- Empty State -->
            <div v-else-if="categories.length === 0" class="center-content empty-state">
                <ion-icon :icon="layersOutline" class="empty-icon"></ion-icon>
                <h3>Belum ada kategori</h3>
                <p>Tap tombol + untuk menambah kategori baru</p>
            </div>

            <!-- Category List -->
            <div v-else class="list-container">
                <div v-for="(cat, index) in categories" :key="cat.id" class="cat-card">
                    <div class="cat-main" @click="openEditModal(cat)">
                        <div class="cat-avatar" :style="{ background: getColor(index) }">
                            <ion-icon :icon="layersOutline"></ion-icon>
                        </div>
                        <div class="cat-info">
                            <span class="cat-name">{{ cat.name }}</span>
                            <span class="cat-desc" v-if="cat.description">{{ cat.description }}</span>
                            <span class="cat-desc" v-else>Tidak ada deskripsi</span>
                        </div>
                        <span class="status-badge" :class="cat.status === 'active' ? 'active' : 'inactive'">
                            {{ cat.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </div>
                    <div class="cat-actions">
                        <ion-button fill="clear" size="small" @click="openEditModal(cat)">
                            <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" size="small" color="danger" @click="confirmDelete(cat)">
                            <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                        </ion-button>
                    </div>
                </div>
            </div>
        </ion-content>

        <!-- Create/Edit Modal -->
        <ion-modal :is-open="showModal" @didDismiss="closeModal" :breakpoints="[0, 0.75]" :initialBreakpoint="0.75">
            <ion-header>
                <ion-toolbar>
                    <ion-title>{{ editingCat ? 'Edit Kategori' : 'Tambah Kategori' }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeModal">Tutup</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="modal-content">
                <form @submit.prevent="saveCategory" class="form-container">
                    <div class="form-group">
                        <label>Nama Kategori *</label>
                        <ion-input v-model="form.name" placeholder="Contoh: Makanan Utama" fill="outline"
                            class="form-input"></ion-input>
                    </div>

                    <div class="form-group">
                        <label>Deskripsi</label>
                        <ion-textarea v-model="form.description" placeholder="Deskripsi singkat..." fill="outline"
                            :rows="3" class="form-input"></ion-textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group flex-1">
                            <label>Status</label>
                            <ion-select v-model="form.status" fill="outline" interface="action-sheet"
                                class="form-input">
                                <ion-select-option value="active">Aktif</ion-select-option>
                                <ion-select-option value="inactive">Nonaktif</ion-select-option>
                            </ion-select>
                        </div>
                        <div class="form-group flex-1">
                            <label>Urutan</label>
                            <ion-input v-model.number="form.sort_order" type="number" placeholder="0" fill="outline"
                                class="form-input"></ion-input>
                        </div>
                    </div>

                    <div class="error-msg" v-if="formError">{{ formError }}</div>

                    <ion-button expand="block" type="submit" class="save-btn" :disabled="saving">
                        <ion-spinner v-if="saving" name="crescent"></ion-spinner>
                        <span v-else>{{ editingCat ? 'Simpan Perubahan' : 'Tambah Kategori' }}</span>
                    </ion-button>
                </form>
            </ion-content>
        </ion-modal>

        <!-- Delete Alert -->
        <ion-alert :is-open="showDeleteAlert" header="Hapus Kategori"
            :message="`Yakin ingin menghapus '${deletingCat?.name}'?`" :buttons="deleteAlertButtons"
            @didDismiss="showDeleteAlert = false"></ion-alert>

        <!-- Toast Notification -->
        <ion-toast :is-open="showToast" :message="toastMessage" :duration="2000" :color="toastColor"
            @didDismiss="showToast = false"></ion-toast>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonIcon, IonBackButton, IonSpinner,
    IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption, IonAlert,
    IonToast
} from '@ionic/vue';
import {
    arrowBackOutline, addOutline, layersOutline,
    createOutline, trashOutline
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import AdminService, { CategoryItem } from '@/services/admin';

const loading = ref(true);
const categories = ref<CategoryItem[]>([]);
const showModal = ref(false);
const editingCat = ref<CategoryItem | null>(null);
const saving = ref(false);
const formError = ref('');

const showDeleteAlert = ref(false);
const deletingCat = ref<CategoryItem | null>(null);

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const form = ref({
    name: '',
    description: '',
    status: 'active',
    sort_order: 0 as number | null,
});

const deleteAlertButtons = [
    { text: 'Batal', role: 'cancel' },
    {
        text: 'Hapus',
        role: 'destructive',
        handler: async () => {
            if (deletingCat.value?.id) {
                try {
                    await AdminService.deleteCategory(deletingCat.value.id);
                    await fetchCategories();
                    presentToast('Kategori berhasil dihapus', 'success');
                } catch (e: any) {
                    const msg = e.response?.data?.message || 'Gagal menghapus kategori.';
                    presentToast(msg, 'danger');
                }
            }
        }
    }
];

const colorPalette = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #fccb90, #d57eeb)',
];

function getColor(index: number): string {
    return colorPalette[index % colorPalette.length];
}

async function fetchCategories() {
    loading.value = true;
    try {
        categories.value = await AdminService.getCategories();
    } catch { categories.value = []; }
    loading.value = false;
}

function openCreateModal() {
    editingCat.value = null;
    form.value = { name: '', description: '', status: 'active', sort_order: 0 };
    formError.value = '';
    showModal.value = true;
}

function openEditModal(cat: CategoryItem) {
    editingCat.value = cat;
    form.value = {
        name: cat.name,
        description: cat.description || '',
        status: cat.status || 'active',
        sort_order: cat.sort_order ?? 0,
    };
    formError.value = '';
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
    editingCat.value = null;
}

async function saveCategory() {
    if (!form.value.name) {
        formError.value = 'Nama kategori wajib diisi.';
        return;
    }
    saving.value = true;
    formError.value = '';
    try {
        const payload = {
            name: form.value.name,
            description: form.value.description,
            status: form.value.status,
            sort_order: form.value.sort_order ?? 0,
        };
        if (editingCat.value?.id) {
            await AdminService.updateCategory(editingCat.value.id, payload);
            presentToast('Kategori berhasil diperbarui', 'success');
        } else {
            await AdminService.createCategory(payload);
            presentToast('Kategori berhasil ditambahkan', 'success');
        }
        closeModal();
        await fetchCategories();
    } catch (e: any) {
        formError.value = e.response?.data?.message || 'Gagal menyimpan kategori.';
        // presentToast(formError.value, 'danger'); // Optional: show toast for save error too? formError is already shown in modal
    }
    saving.value = false;
}

function confirmDelete(cat: CategoryItem) {
    deletingCat.value = cat;
    showDeleteAlert.value = true;
}

function presentToast(message: string, color: string) {
    toastMessage.value = message;
    toastColor.value = color;
    showToast.value = true;
}

onMounted(async () => {
    await fetchCategories();
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

.cat-card {
    background: #ffffff;
    color: #1a202c;
    border-radius: 18px;
    padding: 1rem;
    margin-bottom: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease;
}

.cat-card:active {
    transform: scale(0.99);
}

.cat-main {
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
}

.cat-avatar {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 22px;
    flex-shrink: 0;
}

.cat-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.cat-name {
    font-weight: 700;
    font-size: 0.95rem;
    color: #1a202c;
}

.cat-desc {
    font-size: 0.78rem;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
}

.status-badge {
    font-size: 0.7rem;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 600;
    flex-shrink: 0;
}

.status-badge.active {
    background: #ecfdf5;
    color: #059669;
}

.status-badge.inactive {
    background: #f1f5f9;
    color: #94a3b8;
}

.cat-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0;
    margin-top: 8px;
    border-top: 1px solid #f1f5f9;
    padding-top: 8px;
}

.cat-actions ion-button {
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
    --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --border-radius: 16px;
    --box-shadow: 0 8px 20px rgba(102, 126, 234, 0.25);
    font-weight: 700;
    font-size: 1rem;
    height: 52px;
    margin-top: 0.5rem;
}
</style>
