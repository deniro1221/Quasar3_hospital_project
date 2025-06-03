<template>
  <q-page class="flex flex-center" style="background-color: #e0f7fa">
    <div class="admin-container">
      <h1>Dobrodošli u Sestru Panel!</h1>

      <!-- Prikaz korisničkog imena -->
      <p v-if="loggedInUser">Sestra: {{ loggedInUser }}</p>

      <!-- Prikaz ID sestre -->
      <p v-if="idSestre">ID Sestre: {{ idSestre }}</p>

      <!-- Poruka -->
      <p v-if="message">{{ message }}</p>

      <!-- Gumbi -->
      <div class="q-pa-md">
        <div class="q-gutter-md column">
          <q-btn
            label="Unos Dijete pacijenta"
            color="primary"
            class="button-item"
            @click="goToInputPatient"
          />

          <q-btn
            label="Pregled dijeta pacijenta"
            color="primary"
            class="button-item"
            @click="goToShowPatient"
          />
          <q-btn label="Odjavi se" color="negative" class="button-item" @click="logout" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Varijable za prikaz
const loggedInUser = ref('')
const idSestre = ref('')
const message = ref('')

function refreshID() {
  idSestre.value = localStorage.getItem('idSestre') ? Number(localStorage.getItem('idSestre')) : ''
}

// Učitavanje podataka iz localStorage
onMounted(() => {
  loggedInUser.value = localStorage.getItem('loggedInUser')
  refreshID()
  console.log('ID_sestre u Vue nakon učitavanja:', idSestre.value)

  if (!loggedInUser.value) {
    router.push('/login_nurse')
  }
})

const goToInputPatient = () => {
  router.push('/inputPatient')
}

// prikaži dijete pacijenta
const goToShowPatient = () => {
  router.push('/showPatient')
}

//logout funkcija:

const logout = () => {
  localStorage.removeItem('loggedInUser')
  localStorage.removeItem('idSestre')

  idSestre.value = '' // ili null, ovisno što želiš prikazati
  router.push('/login_nurse')
}
console.log('ID_sestre u Vue nakon odjave:', idSestre.value)
</script>

<style scoped>
.admin-container {
  text-align: center;
}
.button-item {
  width: 200px;
  font-size: 14px;
  padding: 8px 12px;
  margin: 0 auto 12px; /* centriraj + dodaj razmak ispod */
}
</style>
