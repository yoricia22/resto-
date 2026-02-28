<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Selamat datang 👋</h2>

      <div v-if="user" class="user-info">
        <p><strong>{{ user.name }}</strong></p>
        <p>{{ user.email }}</p>
        <p v-if="user.role">Role: <b>{{ user.role }}</b></p>
      </div>

      <ion-button expand="block" class="ion-margin-top" @click="handleLogout">
        Logout
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/vue';

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthService, { User } from '@/services/auth';

const router = useRouter();
const user = ref<User | any>(null);

onMounted(async () => {
  // Try to get from local storage first
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch (e) {
      console.error("Error parsing user", e);
    }
  }

  // Optionally fetch fresh user data from API
  try {
    const remoteUser = await AuthService.getUser();
    user.value = remoteUser;
    AuthService.saveUser(remoteUser);
  } catch (e) {
    console.error("Failed to fetch fresh user data", e);
    // If 401, maybe logout? router guards should handle it on navigation, 
    // but here we are already on the page.
  }
});

const handleLogout = async () => {
  await AuthService.logout();
  router.replace('/login');
};
</script>

<style scoped>
.user-info {
  margin-top: 20px;
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #333333;
}

.user-info p {
  margin: 8px 0;
  font-size: 16px;
  line-height: 1.5;
}

.user-info strong {
  font-size: 18px;
  color: #FF8E53;
}
</style>
