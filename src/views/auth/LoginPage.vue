<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <div class="auth-wrapper">
        <div class="glass-card">
          <div class="header-section relative">
            <ion-button fill="clear" class="back-btn" @click="handleNavigation('/')">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
            </ion-button>
            <div class="logo-container">
              <ion-icon :icon="restaurantOutline" class="app-logo"></ion-icon>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue your culinary journey</p>
          </div>

          <form @submit.prevent="handleLogin" class="form-section">
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
                  placeholder="Enter your password" required></ion-input>
              </ion-item>
            </div>

            <div class="error-message" v-if="errorMessage">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <ion-button expand="block" type="submit" class="submit-btn" :disabled="loading">
              <span v-if="!loading">Sign In</span>
              <ion-spinner v-else name="crescent"></ion-spinner>
            </ion-button>
          </form>

          <div class="footer-link">
            <p>New to us? <a @click.prevent="handleNavigation('/register')" href="#">Create an Account</a></p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonItem, IonInput, IonButton, IonSpinner, IonIcon } from '@ionic/vue';
import { mailOutline, lockClosedOutline, restaurantOutline, alertCircleOutline, arrowBackOutline } from 'ionicons/icons';
import AuthService from '@/services/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const handleNavigation = (path: string) => {
  (document.activeElement as HTMLElement)?.blur();
  router.push(path);
};

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await AuthService.login({
      email: email.value,
      password: password.value
    });

    AuthService.saveToken(response.access_token);
    AuthService.saveUser(response.user);

    // Redirect based on role
    const role = (response.user as any).role ? (response.user as any).role.toLowerCase() : '';

    if (['admin', 'owner'].includes(role)) {
      router.replace('/admin');
    } else if (role === 'kasir') {
      router.replace('/kasir');
    } else if (role === 'chef') {
      router.replace('/chef');
    } else {
      router.replace('/customer');
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      errorMessage.value = Object.values(errors).flat().join(', ');
    } else if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Login failed. Please check your credentials.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-content {
  --background: transparent;
  background: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') no-repeat center center / cover;
  position: relative;
}

.auth-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%);
  backdrop-filter: blur(3px);
  z-index: 0;
}

.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 2.5rem 2rem;
  border-radius: 30px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.4);
  animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.back-btn {
  position: absolute;
  top: -10px;
  left: -10px;
  --color: #64748b;
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  height: 40px;
  font-size: 24px;
}

.logo-container {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  width: 70px;
  height: 70px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.2rem;
  box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
  transform: rotate(-10deg);
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: rotate(0deg) scale(1.05);
}

.app-logo {
  font-size: 35px;
  color: white;
  transform: rotate(10deg);
}

.header-section h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 0.5rem;
  letter-spacing: -0.5px;
}

.header-section p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 1.2rem;
}

.custom-item {
  --background: #ffffff;
  --border-radius: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  --min-height: 56px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.custom-item.item-has-focus {
  border-color: #FF8E53;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(255, 142, 83, 0.15);
}

.input-icon {
  color: #94a3b8;
  margin-right: 12px;
  transition: color 0.3s ease;
}

.custom-item.item-has-focus .input-icon {
  color: #FF8E53;
}

ion-input {
  --padding-start: 0;
  --placeholder-color: #94a3b8;
  --color: #1e293b;
  font-weight: 500;
}

.submit-btn {
  margin-top: 2rem;
  --background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  --background-hover: linear-gradient(135deg, #fa5a5a 0%, #f07d42 100%);
  --border-radius: 16px;
  --box-shadow: 0 10px 20px rgba(255, 107, 107, 0.25);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
  height: 56px;
  --color: white;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn:active {
  transform: scale(0.98);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  color: #ef4444;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  border: 1px solid #fee2e2;
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {

  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.footer-link {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.95rem;
  color: #64748b;
}

.footer-link a {
  color: #FF6B6B;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s;
  position: relative;
}

.footer-link a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #FF6B6B;
  transition: width 0.3s ease;
}

.footer-link a:hover::after {
  width: 100%;
}
</style>
