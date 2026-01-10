<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Register Resto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-input
        v-model="name"
        label="Nama Lengkap"
        type="text"
        fill="outline"
      ></ion-input>

      <ion-input
        v-model="email"
        label="Email"
        type="email"
        fill="outline"
        class="ion-margin-top"
      ></ion-input>

      <ion-input
        v-model="password"
        label="Password"
        type="password"
        fill="outline"
        class="ion-margin-top"
      ></ion-input>

      <ion-input
        v-model="confirmPassword"
        label="Konfirmasi Password"
        type="password"
        fill="outline"
        class="ion-margin-top"
      ></ion-input>

      <ion-button expand="block" class="ion-margin-top" @click="handleRegister">
        Daftar
      </ion-button>

      <p class="ion-text-center ion-margin-top">
        Sudah punya akun? 
        <router-link to="/login" style="color: var(--ion-color-primary)">
          Login disini
        </router-link>
      </p>

      <p v-if="error" style="color:red" class="ion-text-center">{{ error }}</p>
      <p v-if="success" style="color:green" class="ion-text-center">{{ success }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton
} from '@ionic/vue'

import { ref } from 'vue'
import { register } from '@/services/authService'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()

const handleRegister = async () => {
  try {
    error.value = ''
    success.value = ''

    // Validasi
    if (!name.value || !email.value || !password.value || !confirmPassword.value) {
      error.value = 'Semua field harus diisi'
      return
    }

    if (password.value.length < 6) {
      error.value = 'Password minimal 6 karakter'
      return
    }

    if (password.value !== confirmPassword.value) {
      error.value = 'Password dan konfirmasi password tidak sama'
      return
    }

    const res = await register(name.value, email.value, password.value)

    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))

    success.value = 'Registrasi berhasil! Mengalihkan...'
    
    setTimeout(() => {
      router.push('/home')
    }, 1000)

  } catch (err) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Terjadi kesalahan saat registrasi'
    }
  }
}
</script>

<style scoped>
a {
  text-decoration: none;
  font-weight: 500;
}
</style>
