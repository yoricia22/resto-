<template>
    <ion-page>
        <ion-header class="page-header">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/admin"></ion-back-button>
                </ion-buttons>
                <ion-title>Kelola Staff</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="openCreateModal" class="add-btn">
                        <ion-icon :icon="addOutline" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="page-content">
            <div class="container">
                <!-- Search -->
                <div class="search-bar">
                    <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
                    <input type="text" v-model="searchQuery" placeholder="Cari nama atau email..." class="search-input" />
                </div>

                <!-- Staff List -->
                <div v-if="loading" class="loading-state">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Memuat data staff...</p>
                </div>

                <div v-else-if="filteredStaff.length === 0" class="empty-state">
                    <span class="empty-icon">👥</span>
                    <p>Belum ada staff</p>
                </div>

                <div v-else class="staff-list">
                    <div v-for="staff in filteredStaff" :key="staff.id" class="staff-card">
                        <div class="staff-avatar" :class="'role-' + staff.role">
                            {{ staff.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="staff-info">
                            <h3>{{ staff.name }}</h3>
                            <p>{{ staff.email }}</p>
                            <div class="staff-badges">
                                <span class="badge" :class="'badge-' + staff.role">{{ staff.role }}</span>
                                <span class="badge" :class="staff.aktif ? 'badge-active' : 'badge-inactive'">
                                    {{ staff.aktif ? 'Aktif' : 'Nonaktif' }}
                                </span>
                            </div>
                        </div>
                        <div class="staff-actions">
                            <ion-button fill="clear" size="small" @click="openEditModal(staff)">
                                <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
                            </ion-button>
                            <ion-button fill="clear" size="small" color="danger" @click="confirmDelete(staff)">
                                <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                            </ion-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create/Edit Modal -->
            <ion-modal :is-open="showModal" @didDismiss="closeModal">
                <ion-header>
                    <ion-toolbar>
                        <ion-title>{{ isEditing ? 'Edit Staff' : 'Tambah Staff' }}</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="closeModal">Tutup</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding modal-content">
                    <div class="form-group">
                        <label>Nama Lengkap *</label>
                        <input type="text" v-model="form.name" placeholder="Nama lengkap" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" v-model="form.email" placeholder="email@contoh.com" class="form-input" />
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Password {{ isEditing ? '' : '*' }}</label>
                            <input type="password" v-model="form.password"
                                :placeholder="isEditing ? 'Kosongkan jika tidak diubah' : 'Min. 6 karakter'"
                                class="form-input" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Role *</label>
                            <select v-model="form.role" class="form-input">
                                <option value="kasir">Kasir</option>
                                <option value="chef">Chef</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <div class="toggle-wrap">
                                <ion-toggle :checked="form.aktif" @ionChange="form.aktif = $event.detail.checked">
                                </ion-toggle>
                                <span>{{ form.aktif ? 'Aktif' : 'Nonaktif' }}</span>
                            </div>
                        </div>
                    </div>
                    <p v-if="isEditing" class="hint-text">* Kosongkan password jika tidak ingin mengubahnya</p>
                    <button class="save-btn" @click="saveStaff" :disabled="saving">
                        {{ saving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Staff') }}
                    </button>
                </ion-content>
            </ion-modal>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonBackButton, IonIcon, IonSpinner,
    IonModal, IonToggle, toastController, alertController
} from '@ionic/vue';
import { addOutline, searchOutline, createOutline, trashOutline } from 'ionicons/icons';
import AdminService from '@/services/admin';

const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const staffList = ref<any[]>([]);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
    name: '',
    email: '',
    password: '',
    role: 'kasir',
    aktif: true
});

const filteredStaff = computed(() => {
    if (!searchQuery.value) return staffList.value;
    const q = searchQuery.value.toLowerCase();
    return staffList.value.filter(s =>
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
});

const fetchStaff = async () => {
    loading.value = true;
    try {
        staffList.value = await AdminService.getStaff();
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const openCreateModal = () => {
    form.value = { name: '', email: '', password: '', role: 'kasir', aktif: true };
    isEditing.value = false;
    editingId.value = null;
    showModal.value = true;
};

const openEditModal = (staff: any) => {
    form.value = {
        name: staff.name,
        email: staff.email,
        password: '',
        role: staff.role,
        aktif: staff.aktif ?? true
    };
    isEditing.value = true;
    editingId.value = staff.id;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const saveStaff = async () => {
    if (!form.value.name || !form.value.email) {
        const toast = await toastController.create({
            message: 'Nama dan email wajib diisi', duration: 2000, color: 'danger'
        });
        await toast.present();
        return;
    }

    if (!isEditing.value && !form.value.password) {
        const toast = await toastController.create({
            message: 'Password wajib diisi untuk staff baru', duration: 2000, color: 'danger'
        });
        await toast.present();
        return;
    }

    saving.value = true;
    try {
        const data: any = {
            name: form.value.name,
            email: form.value.email,
            role: form.value.role,
            aktif: form.value.aktif
        };
        if (form.value.password) data.password = form.value.password;

        if (isEditing.value && editingId.value) {
            await AdminService.updateStaff(editingId.value, data);
        } else {
            await AdminService.createStaff(data);
        }

        const toast = await toastController.create({
            message: isEditing.value ? 'Staff berhasil diperbarui ✅' : 'Staff berhasil ditambahkan 🎉',
            duration: 2000, color: 'success'
        });
        await toast.present();
        showModal.value = false;
        await fetchStaff();
    } catch (e: any) {
        const msg = e.response?.data?.message || 'Gagal menyimpan staff';
        const toast = await toastController.create({
            message: msg, duration: 2000, color: 'danger'
        });
        await toast.present();
    } finally {
        saving.value = false;
    }
};

const confirmDelete = async (staff: any) => {
    const alert = await alertController.create({
        header: 'Hapus Staff?',
        message: `Akun "${staff.name}" akan dihapus secara permanen.`,
        buttons: [
            { text: 'Batal', role: 'cancel' },
            {
                text: 'Hapus', role: 'destructive',
                handler: async () => {
                    try {
                        await AdminService.deleteStaff(staff.id);
                        const toast = await toastController.create({
                            message: 'Staff berhasil dihapus', duration: 2000, color: 'success'
                        });
                        await toast.present();
                        await fetchStaff();
                    } catch {
                        const toast = await toastController.create({
                            message: 'Gagal menghapus staff', duration: 2000, color: 'danger'
                        });
                        await toast.present();
                    }
                }
            }
        ]
    });
    await alert.present();
};

onMounted(fetchStaff);
</script>

<style scoped>
.page-header ion-toolbar {
    --background: #ffffff;
    --color: #1a202c;
    --border-color: #f0f0f0;
}
.page-header ion-title { font-weight: 800; font-size: 1.1rem; }
.add-btn { --color: #f97316; }

.page-content {
    --background: #f8f9fa;
    --color: #1a202c;
}

.container { padding: 1rem; max-width: 600px; margin: 0 auto; }

.search-bar {
    position: relative; margin-bottom: 1rem;
}
.search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #94a3b8; font-size: 18px;
}
.search-input {
    width: 100%; padding: 12px 14px 12px 42px;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
    font-size: 0.9rem; outline: none; color: #1a202c;
}
.search-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }

.loading-state, .empty-state {
    text-align: center; padding: 3rem 1rem; color: #94a3b8;
}
.empty-icon { font-size: 3rem; display: block; margin-bottom: 0.5rem; }

.staff-list { display: flex; flex-direction: column; gap: 10px; }

.staff-card {
    background: #fff; border-radius: 16px; padding: 1rem;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.staff-avatar {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 1.1rem; color: #fff; flex-shrink: 0;
}
.role-kasir { background: linear-gradient(135deg, #10b981, #14b8a6); }
.role-chef { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.role-owner { background: linear-gradient(135deg, #f97316, #ef4444); }

.staff-info { flex: 1; min-width: 0; }
.staff-info h3 { font-weight: 700; font-size: 0.95rem; color: #1a202c; margin: 0; }
.staff-info p { font-size: 0.8rem; color: #94a3b8; margin: 2px 0 6px; }

.staff-badges { display: flex; gap: 6px; }
.badge {
    padding: 2px 8px; border-radius: 8px; font-size: 0.7rem;
    font-weight: 700; text-transform: uppercase;
}
.badge-kasir { background: #d1fae5; color: #059669; }
.badge-chef { background: #ede9fe; color: #7c3aed; }
.badge-owner { background: #ffedd5; color: #ea580c; }
.badge-active { background: #d1fae5; color: #059669; }
.badge-inactive { background: #fee2e2; color: #dc2626; }

.staff-actions { display: flex; flex-direction: column; }

/* Modal */
.modal-content { --background: #f8f9fa; }

.form-group { margin-bottom: 1rem; }
.form-group label {
    display: block; font-size: 0.85rem; font-weight: 700;
    color: #475569; margin-bottom: 6px;
}
.form-input {
    width: 100%; padding: 12px 14px; background: #fff;
    border: 1px solid #e2e8f0; border-radius: 12px;
    font-size: 0.9rem; outline: none; color: #1a202c;
    -webkit-appearance: none;
}
.form-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.toggle-wrap {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 0; font-size: 0.85rem; font-weight: 600; color: #475569;
}

.hint-text { font-size: 0.8rem; color: #d97706; margin: -4px 0 12px; }

.save-btn {
    width: 100%; padding: 14px; border: none; border-radius: 14px;
    background: linear-gradient(135deg, #f97316, #ef4444);
    color: #fff; font-weight: 700; font-size: 0.95rem;
    cursor: pointer; margin-top: 0.5rem;
}
.save-btn:disabled { opacity: 0.6; }
.save-btn:active { transform: scale(0.98); }
</style>
