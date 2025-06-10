<template>
  <q-page padding>
    <!-- Poruka -->
    <div v-if="message" :class="{ positive: isSuccess, negative: !isSuccess }">
      {{ message }}
    </div>

    <!-- Glavni obrazac za unos -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Unos jelovnika za današnji datum</div>
      </q-card-section>

      <q-form @submit.prevent="submitManual">
        <q-input v-model="datum" type="date" label="Odaberite datum" readonly />
        <q-input v-model="marenda1" label="Marenda 1" required />
        <q-input v-model="marenda2" label="Marenda 2" required />

        <div class="q-mt-md" style="display: flex; gap: 10px">
          <q-btn label="Spremi" type="submit" color="primary" />
          <q-btn label="Odustani" type="button" color="red" @click="odustani" />
          <q-btn label="Natrag" type="button" color="primary" @click="natrag" />
        </div>

        <div style="margin-top: 20px; display: flex; gap: 10px">
          <q-btn label="Prikaži aktivni meni" color="primary" @click="otkrijAktivniMeni" />
          <q-btn label="Obriši meni" color="negative" @click="otvoriDijalogBrisanje" />
        </div>
      </q-form>
    </q-card>

    <!-- Dijalog za prikaz i uređivanje aktivnog menija -->
    <q-dialog v-model="dialogAktivniMeni" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Aktivni meni za danas</div>
        </q-card-section>

        <q-card-section>
          <p><strong>Datum:</strong> {{ datumAktivnogMenija.Datum_menija }}</p>
          <q-input v-model="datumAktivnogMenija.Datum_menija" label="Datum" readonly />
          <q-input v-model="datumAktivnogMenija.Marenda1" label="Marenda 1" />
          <q-input v-model="datumAktivnogMenija.Marenda2" label="Marenda 2" />
        </q-card-section>

        <q-card-actions align="around">
          <q-btn label="Odustani" color="negative" @click="dialogAktivniMeni = false" />
          <q-btn label="Spremi" color="primary" @click="azurirajMeni" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dijalog za brisanje menija -->
    <q-dialog v-model="dialogObrisiMeni" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            Jeste li sigurni da želite obrisati meni za datum
            {{ datumAktivnogMenija.Datum_menija }}?
          </div>
        </q-card-section>

        <q-card-actions align="around">
          <q-btn label="Odustani" color="negative" @click="dialogObrisiMeni = false" />
          <q-btn label="Obriši" color="primary" @click="obrisiMeni" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ✅ Funkcija koja vraća lokalni datum u formatu yyyy-mm-dd (bez UTC konverzije!)
function getLocalDateFormatted() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Poruke i stanja
const message = ref('')
const isSuccess = ref(false)
function showMessage(txt, success = true) {
  message.value = txt
  isSuccess.value = success
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// Početni datum i polja
const datum = ref(getLocalDateFormatted())
const marenda1 = ref('')
const marenda2 = ref('')
const idKuhara = localStorage.getItem('userID')

// Dijalog i aktivni meni
const dialogAktivniMeni = ref(false)
const datumAktivnogMenija = ref({ Datum_menija: '', Marenda1: '', Marenda2: '' })

// ✅ Funkcija za unos novog menija
const submitManual = async () => {
  const todayStr = getLocalDateFormatted()

  if (datum.value !== todayStr) {
    showMessage('Možete unositi samo za današnji dan', false)
    return
  }

  if (!marenda1.value.trim() || !marenda2.value.trim()) {
    showMessage('Obje marende moraju biti unesene.', false)
    return
  }

  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Datum_menija: datum.value,
        Marenda1: marenda1.value,
        Marenda2: marenda2.value,
        ID_kuhara: idKuhara,
      }),
    })

    if (response.ok) {
      showMessage('Jelovnik uspješno spremljen!', true)
      marenda1.value = ''
      marenda2.value = ''
    } else {
      showMessage('Greška pri unosu!', false)
    }
  } catch (error) {
    console.error('Greška:', error)
    showMessage('Greška na serveru.', false)
  }
}

const otkrijAktivniMeni = async (openDialog = true) => {
  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/today')
    const data = await response.json()

    if (data) {
      datumAktivnogMenija.value = {
        Datum_menija: data.Datum_menija,
        Marenda1: data.Marenda1 || '',
        Marenda2: data.Marenda2 || '',
      }
    } else {
      datumAktivnogMenija.value = {
        Datum_menija: getLocalDateFormatted(),
        Marenda1: '',
        Marenda2: '',
      }
    }

    if (openDialog) {
      dialogAktivniMeni.value = true
    }
  } catch (err) {
    console.error('Greška:', err)
    showMessage('Greška pri učitavanju menija!', false)
  }
}
console.log('ID kuhara:', localStorage.getItem('userID'))

// ✅ Funkcija za ažuriranje aktivnog menija
const azurirajMeni = async () => {
  if (!confirm('Jeste li sigurni da želite ažurirati meni?')) return

  const ID_kuhara = localStorage.getItem('userID')
  if (!ID_kuhara) {
    showMessage('ID kuhar nije pronađen!', false)
    return
  }

  try {
    let datumZaSlanje = datumAktivnogMenija.value.Datum_menija
    if (datumZaSlanje && datumZaSlanje.includes('T')) {
      datumZaSlanje = datumZaSlanje.slice(0, 10)
    }

    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/fresh', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Datum_menija: datumZaSlanje,
        Marenda1: datumAktivnogMenija.value.Marenda1,
        Marenda2: datumAktivnogMenija.value.Marenda2,
        ID_kuhara: ID_kuhara,
      }),
    })

    if (response.ok) {
      showMessage('Meni je ažuriran!', true)
      dialogAktivniMeni.value = false
    } else {
      showMessage('Greška pri ažuriranju!', false)
    }
  } catch (err) {
    console.error('Greška:', err)
    showMessage('Greška na serveru!', false)
  }
}

const dialogObrisiMeni = ref(false) // Dodan dijalog za brisanje
// Funkcija za otvaranje dijaloga za brisanje menija
const otvoriDijalogBrisanje = async () => {
  await otkrijAktivniMeni(false) // NE otvaramo prikaz aktivnog menija
  if (!datumAktivnogMenija.value.Datum_menija) {
    showMessage('Nema aktivnog menija za danas!', false)
    return
  }

  dialogObrisiMeni.value = true
}

const obrisiMeni = async () => {
  const rawDatum = datumAktivnogMenija.value.Datum_menija || ''
  const datumZaBrisanje = rawDatum.slice(0, 10)

  if (!datumZaBrisanje || datumZaBrisanje.length !== 10) {
    showMessage('Nevažeći datum za brisanje!', false)
    return
  }

  if (!confirm(`Jeste li sigurni da želite obrisati meni za datum ${datumZaBrisanje}?`)) {
    return
  }

  try {
    const response = await fetch(
      `https://backend-hospital-n9to.onrender.com/menu/delete?datum=${encodeURIComponent(datumZaBrisanje)}`,
      { method: 'DELETE' },
    )

    if (response.ok) {
      showMessage('Meni je uspješno obrisan!', true)
      dialogObrisiMeni.value = false
      datumAktivnogMenija.value = { Datum_menija: '', Marenda1: '', Marenda2: '' }
    } else {
      const errorText = await response.text()
      console.error('Odgovor sa servera:', errorText)
      showMessage('Greška pri brisanju menija!', false)
    }
  } catch (err) {
    console.error('Greška:', err)
    showMessage('Greška na serveru!', false)
  }
}

// Funkcija za dugme "Natrag"
function natrag() {
  router.push('/chef_panel')
}

// Funkcija za dugme "Odustani"
function odustani() {
  marenda1.value = ''
  marenda2.value = ''
}

//osvježavanje:
</script>

<style scoped>
.positive {
  color: green;
}
.negative {
  color: red;
}
</style>
