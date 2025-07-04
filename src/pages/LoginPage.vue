<template>
  <q-page class="flex flex-center" style="background-color: #e0f7fa">
    <div class="login-container">
      <h6 class="text-h6">Dobrodošli na prijavu za Admina</h6>
      <q-input filled v-model="username" label="Korisničko ime" class="q-mb-md" />
      <q-input filled v-model="password" label="Lozinka" type="password" class="q-mb-md" />
      <div class="button-container">
        <q-btn @click="submit" label="Potvrdi" color="primary" class="q-mr-sm" />
        <q-btn @click="cancel" label="Odustani" color="negative" />
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <!-- Poruka greške -->
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('') // Varijabla za pohranu poruka o grešci

const submit = async () => {
  try {
    const response = await axios.post('http://192.168.1.10:3000/login', {
      username: username.value,
      password: password.value,
    })

    console.log(response.data.message) // Prikaz poruke od servera
    errorMessage.value = '' // Resetirajte poruku greške

    // Spremite korisničko ime u localStorage
    localStorage.setItem('loggedInUser', username.value)

    // Preusmjerite na admin stranicu nakon uspješne prijave
    router.push('/admin')
  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data.message || 'Došlo je do greške. Pokušajte ponovo.'
      console.error('Greška prilikom autentikacije:', error.response.data.message)
    } else {
      errorMessage.value = 'Greška prilikom povezivanja.'
      console.error('Greška prilikom povezivanja:', error.message)
    }
  }
}

const cancel = () => {
  username.value = ''
  password.value = ''
  errorMessage.value = '' // Resetirajte poruku greške
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: space-between;
}

.error-message {
  color: red; /* Stilizujte poruku greške */
}
</style>
