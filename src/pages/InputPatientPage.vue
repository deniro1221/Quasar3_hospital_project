<template>
  <q-page padding>
    <!-- Poruka o uspjehu/neuspjehu -->
    <div
      v-if="message"
      :class="isSuccess ? 'bg-green-2 text-green-10' : 'bg-red-2 text-red-10'"
      class="q-pa-md q-mb-md rounded-borders"
    >
      {{ message }}
    </div>

    <q-form @submit.prevent="postPatient">
      <q-input v-model="brojSobe" label="Broj sobe" type="number" required />
      <q-input v-model="imePrezime" label="Ime i prezime" required />
      <q-input v-model="dorucak" label="Doručak" required />
      <q-input v-model="rucak" label="Ručak" required />
      <q-input v-model="vecera" label="Večera" required />
      <q-input v-model="vrsta_dijete" label="Vrsta dijete" required />
      <q-input v-model="napomene" label="Napomene" />
      <q-input v-model="dolazak" label="Dolazak" type="date" required />
      <q-input v-model="odlazak" label="Odlazak" type="date" required />
      <q-select v-model="uSobu" label="U sobu" :options="['da', 'ne']" required />
      <q-btn label="Spremi" type="submit" color="primary" class="q-mt-md" />
      <q-btn label="Odustani" type="submit" color="negative" class="q-mt-md" @click="cancelInput" />
      <q-btn label="Nazad" type="submit" color="secondary" class="q-mt-md" to="/nurse_panel" />
    </q-form>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// ID_sestre iz localStorage
const idSestre = ref(Number(localStorage.getItem('idSestre') ?? '1'))

const message = ref('')
const isSuccess = ref(false)
// pozovi refresh
refreshID()

//funkcija za refresh id
function refreshID() {
  idSestre.value = Number(localStorage.getItem('idSestre'))
  console.log('ID sestre je na: ', idSestre.value)
}

// Funkcija za prikaz poruke
function showMessage(txt, success = true) {
  isSuccess.value = success
  message.value = txt
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// Polja
const brojSobe = ref('')
const imePrezime = ref('')
const dorucak = ref('')
const rucak = ref('')
const vecera = ref('')
const vrsta_dijete = ref('')
const napomene = ref('')
const uSobu = ref('da')
const dolazak = ref('')
const odlazak = ref('')

// Reset funkcija
function resetForm() {
  brojSobe.value = ''
  imePrezime.value = ''
  dorucak.value = ''
  rucak.value = ''
  vecera.value = ''
  vrsta_dijete.value = ''
  napomene.value = ''
  uSobu.value = 'da'
}

// Danasnji datum (YYYY-MM-DD)

// Slanje podataka
async function postPatient() {
  //osiguraj refresh ID:
  refreshID()
  console.log('ID_sestre za slanje: ', idSestre.value)
  try {
    const response = await fetch('http://localhost:3000/dijeta-pacijent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Broj_sobe: brojSobe.value,
        Ime_prezime: imePrezime.value,
        Dorucak: dorucak.value,
        Rucak: rucak.value,
        Vecera: vecera.value,
        vrsta_dijete: vrsta_dijete.value,
        Napomene: napomene.value,
        U_sobu: uSobu.value,
        Dolazak: dolazak.value, // ovdje šaljemo ručno unesen datum
        Odlazak: odlazak.value,
        ID_sestre: idSestre.value,
      }),
    })

    if (response.ok) {
      showMessage('Podaci uspješno spremljeni.', true)
      // Reset polja
      brojSobe.value = ''
      imePrezime.value = ''
      dorucak.value = ''
      rucak.value = ''
      vecera.value = ''
      vrsta_dijete.value = ''
      napomene.value = ''
      uSobu.value = 'da'
    } else {
      showMessage(' Greška pri unosu podataka.', false)
    }
  } catch (error) {
    console.error('Greška:', error)
    showMessage(' Greška na serveru.', false)
  }
}

// Odustani
function cancelInput() {
  resetForm()
  showMessage(' Unos je poništen.', false)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>
