<template>
  <q-page class="flex flex-center" style="background-color: #e0f7fa">
    <div class="admin-container">
      <h2>ADMIN PANEL</h2>
      <p>Uspješno ste se prijavili.</p>
      <p v-if="loggedInUser">Korisnik: {{ loggedInUser }}</p>
      <!-- Prikaz korisničkog imena -->

      <div class="button-container">
        <q-btn label="Sestre" color="primary" class="button-item" @click="goToNurse" />
        <q-btn label="Kuhari" color="primary" class="button-item" @click="goToChef" />
        <q-btn
          label="Pregled Jelovnika"
          color="primary"
          class="button-item"
          @click="goToHistoryMenu"
        />
        <q-btn
          label="Pregled Dijeta pacijenta"
          color="primary"
          class="button-item"
          @click="goToPatient"
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
const loggedInUser = ref('')

//funkcija za povijst pregleda menija kuhara;
const goToHistoryMenu = () => {
  router.push('/admin_history_menu')
}

// Funkcija za preusmjeravanje na stranicu s sestrama
const goToNurse = () => {
  router.push('/nurse') // Pretpostavljam da imate rutu '/nurse'
}
const goToChef = () => {
  router.push('/chef')
}

const goToPatient = () => {
  router.push('/showPatientAdmin')
}
onMounted(() => {
  // Provjera korisnika u localStorage
  loggedInUser.value = localStorage.getItem('loggedInUser')

  // Ako korisnik nije prijavljen, preusmjeri ga na login stranicu
  if (!loggedInUser.value) {
    router.push('/') // Preusmjeri na login stranicu
  }
})

//logout:
const logout = () => {
  localStorage.removeItem('loggedInUser')

  router.push('/login')
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
  width: 100px; /* Širina svakog gumba */
  padding: 10px; /* Unutarnji razmak unutar gumba */
}
.button-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px; /* Razmak između dugmadi */
  justify-content: center; /* Poravnaj sve u sredinu */
  margin-top: 20px;
}

.button-item {
  min-width: 120px; /* Minimalna širina, ali fleksibilna */
  padding: 8px 16px; /* Unutarnji razmak: vertikalno x horizontalno */
  font-size: 14px;
  border-radius: 8px; /* Zaobljeni rubovi, da ne izgleda kao kutija */
}
</style>
