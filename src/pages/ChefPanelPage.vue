<template>
  <q-page class="flex flex-center" style="background-color: #e0f7fa">
    <div class="admin-container">
      <h2>Dobrodošli u Kuhar Panel!</h2>

      <!-- Prikaz korisničkog imena -->
      <p v-if="loggedInUser">Korisnik: {{ loggedInUser }}</p>

      <!-- Prikaz ID kuhaara -->
      <p v-if="userID">ID Kuhara: {{ userID }}</p>

      <!-- Poruka -->
      <p v-if="message">{{ message }}</p>

      <!-- Gumbi -->
      <div class="button-container">
        <q-btn label="Unos jelovnika" color="primary" class="button-item" @click="goToInputMenu" />
        <q-btn
          label="Pregled povijesti jelovnika"
          color="primary"
          class="button-item"
          @click="goToHistoryMenu"
        />
        <q-btn label="Odjavi se" color="negative" class="button-item" @click="logout" />
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
const userID = ref('')
const message = ref('')

// Učitavanje podataka iz localStorage
onMounted(() => {
  loggedInUser.value = localStorage.getItem('loggedInUser')
  userID.value = localStorage.getItem('userID')

  // Ako korisnik nije prijavljen, preusmjeri na login
  if (!loggedInUser.value) {
    router.push('/')
  }
})

// Funkcija za preusmjeravanje na unos jelovnika
const goToInputMenu = () => {
  router.push('/inputMenu_panel')
}

//funkcija za povijest jelovnika /pregled;
const goToHistoryMenu = () => {
  router.push('/history_menu')
}

//logout:
const logout = () => {
  // Briši podatke iz localStorage
  localStorage.removeItem('loggedInUser')
  localStorage.removeItem('userID')
  // Preusmeri na početnu ili login stranicu
  router.push('/login_chef')
}
</script>

<style scoped>
.admin-container {
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: space-around; /* Raspoređuje gumbe ravnomjerno po cijelom prostoru */
  margin-top: 20px; /* Razmak iznad gumba */
}

.button-item {
  width: 150px; /* Širina svakog gumba */
  padding: 10px; /* Unutarnji razmak unutar gumba */
}
</style>
