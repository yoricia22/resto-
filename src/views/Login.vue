<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login Resto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-input
        v-model="email"
        label="Email"
        type="email"
        fill="outline"
      ></ion-input>

      <ion-input
        v-model="password"
        label="Password"
        type="password"
        fill="outline"
        class="ion-margin-top"
      ></ion-input>

      <ion-button expand="block" class="ion-margin-top" @click="handleLogin">
        Login
      </ion-button>

      <p v-if="error" style="color:red">{{ error }}</p>
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
import { login } from '@/services/authService'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const res = await login(email.value, password.value)

    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))

    router.push('/home')

  } catch (err) {
    error.value = 'Email atau password salah'
  }
}
</script>