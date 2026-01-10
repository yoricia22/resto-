<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Selamat datang 👋</h2>

      <p v-if="user">
        <strong>{{ user.name }}</strong><br />
        Role: <b>{{ user.role }}</b>
      </p>

      <ion-button expand="block" class="ion-margin-top" @click="logout">
        Logout
      </ion-button>
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
  IonButton
} from '@ionic/vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    router.push('/login')
  } else {
    user.value = JSON.parse(storedUser)
  }
})

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>