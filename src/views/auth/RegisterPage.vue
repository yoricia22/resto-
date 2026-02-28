<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <div class="auth-wrapper">
        <div class="glass-card">
          <div class="header-section">
            <div class="logo-container">
              <ion-icon :icon="personAddOutline" class="app-logo"></ion-icon>
            </div>
            <h1>Create Account</h1>
            <p>Join the culinary community today and explore</p>
          </div>

          <form @submit.prevent="handleRegister" class="form-section">
            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon slot="start" :icon="personOutline" class="input-icon"></ion-icon>
                <ion-input v-model="name" type="text" label="Full Name" label-placement="floating"
                  placeholder="Enter your full name" required></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon slot="start" :icon="mailOutline" class="input-icon"></ion-icon>
                <ion-input v-model="email" type="email" label="Email" label-placement="floating"
                  placeholder="Enter your email" required></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon slot="start" :icon="lockClosedOutline" class="input-icon"></ion-icon>
                <ion-input v-model="password" type="password" label="Password" label-placement="floating"
                  placeholder="Create a password" required></ion-input>
              </ion-item>
            </div>

            <div class="input-group">
              <ion-item lines="none" class="custom-item">
                <ion-icon slot="start" :icon="checkmarkCircleOutline" class="input-icon"></ion-icon>
                <ion-input v-model="passwordConfirmation" type="password" label="Confirm Password"
                  label-placement="floating" placeholder="Confirm your password" required></ion-input>
              </ion-item>
            </div>

            <div class="error-message" v-if="errorMessage">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <ion-button expand="block" type="submit" class="submit-btn" :disabled="loading">
              <span v-if="!loading">Sign Up</span>
              <ion-spinner v-else name="crescent"></ion-spinner>
            </ion-button>
          </form>

          <div class="footer-link">
            <p>Already have an account? <a @click.prevent="handleNavigation('/login')" href="#">Sign In</a></p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonItem, IonInput, IonButton, IonSpinner, IonIcon, toastController } from '@ionic/vue';
import { personOutline, mailOutline, lockClosedOutline, checkmarkCircleOutline, personAddOutline, alertCircleOutline } from 'ionicons/icons';
import AuthService from '@/services/auth';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const loading = ref(false);
const errorMessage = ref('');

const handleNavigation = (path: string) => {
  (document.activeElement as HTMLElement)?.blur();
  router.push(path);
};

const handleRegister = async () => {
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = "Passwords do not match";
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await AuthService.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    });

    // AuthService.saveToken(response.access_token);
    // AuthService.saveUser(response.user);

    const toast = await toastController.create({
      message: 'Registrasi berhasil! Silakan login.',
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Navigate to login page as requested
    router.replace('/login');
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      errorMessage.value = Object.values(errors).flat().join(', ');
    } else if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Registration failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-content {
  --background: url('https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80') no-repeat center center / cover;
}

.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 2rem 0;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.4);
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 2.5rem;
  border-radius: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  margin: 1rem 0;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  background: #f97316;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);
}

.app-logo {
  font-size: 30px;
  color: white;
}

.header-section h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 0.5rem;
  letter-spacing: -0.5px;
}

.header-section p {
  color: #718096;
  font-size: 0.95rem;
  margin: 0;
}

.input-group {
  margin-bottom: 1.25rem;
}

.custom-item {
  --background: rgba(255, 255, 255, 0.6);
  --border-radius: 12px;
  --padding-start: 0;
  --inner-padding-end: 0;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.custom-item:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #f97316;
}

.input-icon {
  color: #f97316;
  margin-left: 1rem;
  margin-right: 0.5rem;
}

.submit-btn {
  margin-top: 1.5rem;
  --background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  --border-radius: 12px;
  --box-shadow: 0 4px 6px rgba(249, 115, 22, 0.25);
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 50px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  border: 1px solid #fee2e2;
}

.footer-link {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.footer-link a {
  color: #f97316;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.footer-link a:hover {
  color: #ea580c;
}

/* Fix visible text color */
ion-input {
  --color: #1a202c !important;
  --placeholder-color: #718096;
  font-weight: 500;
}
</style>
