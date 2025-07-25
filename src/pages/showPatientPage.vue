<template>
  <q-page padding>
    <h4>Pregled dijeta pacijenata</h4>

    <!-- User Info Display -->
    <div class="q-mb-md">
      <p v-if="loggedInUser">Sestra: {{ loggedInUser }}</p>
      <p v-if="idSestre">ID Sestre: {{ idSestre }}</p>
    </div>

    <!-- Message Display -->
    <div
      v-if="message"
      :class="isSuccess ? 'bg-green-2 text-green-10' : 'bg-red-2 text-red-10'"
      class="q-pa-md q-mb-md rounded-borders"
    >
      {{ message }}
    </div>

    <!-- Add Patient Diet Button -->
    <q-btn label="Dodaj dijetu pacijenta" color="primary" @click="openDialog" class="q-mb-md" />

    <q-table :rows="activePatients" :columns="columns" row-key="ID_dijeta_pac" class="styled-table">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            <!-- Editing on Double Click -->
            <div
              v-if="editingCell.rowId === props.row.ID_dijeta_pac && editingCell.col === col.name"
            >
              <input
                v-model="props.row[col.field]"
                @blur="onCellInput(props.row, col, $event)"
                @keydown.enter="onCellInput(props.row, col, $event)"
                @keydown.esc="cancelEdit()"
                autofocus
                style="width: 100%"
              />
            </div>
            <div
              v-else
              @dblclick="onCellDblClick(props.row, col)"
              style="min-width: 80px; cursor: pointer; user-select: none"
              title="Dvoklik za uređivanje"
            >
              {{ props.row[col.field] }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Combined Button Group -->
    <div class="q-gutter-sm button-group">
      <q-btn label="Ažuriraj" color="primary" @click="confirmUpdate" />
      <q-btn label="Odjavi se" color="negative" @click="logout" />
      <q-btn label="Ispis" color="secondary" @click="izveziAktivnePDF" />
    </div>

    <!-- Add Patient Diet Dialog -->
    <q-dialog v-model="dialogOpen">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6">Dodaj novu dijetu pacijenta</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="postPatient" class="q-gutter-md">
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
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-sm">
          <q-btn label="Odustani" color="secondary" @click="closeDialog" />
          <q-btn label="Spremi" color="primary" @click="postPatient" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import html2pdf from 'html2pdf.js'
import { useRouter } from 'vue-router'

// Data
const dijeta_pac = ref([])
const editingCell = ref({})
const changesMap = ref({})
const message = ref('')
const isSuccess = ref(false)
const API_URL = `${window.location.protocol}//${window.location.hostname}:3000`
// User Info
const loggedInUser = ref('')
const idSestre = ref('')
const username = ref('')

// Columns definition
const columns = [
  { name: 'ID_dijeta_pac', label: 'ID Dijete pacijenta', align: 'left', field: 'ID_dijeta_pac' },
  { name: 'Broj_sobe', label: 'Broj sobe', align: 'left', field: 'Broj_sobe' },
  { name: 'Ime_prezime', label: 'Ime i prezime', align: 'left', field: 'Ime_prezime' },
  { name: 'Dorucak', label: 'Doručak', align: 'left', field: 'Dorucak' },
  { name: 'Rucak', label: 'Ručak', align: 'left', field: 'Rucak' },
  { name: 'Vecera', label: 'Večera', align: 'left', field: 'Vecera' },
  { name: 'Vrsta_dijete', label: 'Vrsta dijete', align: 'left', field: 'Vrsta_dijete' },
  { name: 'Napomene', label: 'Napomene', align: 'left', field: 'Napomene' },
  { name: 'U_sobu', label: 'U sobu', align: 'left', field: 'U_sobu' },
  { name: 'Dolazak', label: 'Dolazak', align: 'left', field: 'Dolazak' },
  { name: 'Odlazak', label: 'Odlazak', align: 'left', field: 'Odlazak' },
  { name: 'Datum_unosa', label: 'Datum unosa', align: 'left', field: 'Datum_unosa' },
  { name: 'username', label: 'Sestra', align: 'left', field: 'username' },
]

// Dialog Control
const dialogOpen = ref(false)

// Form fields
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

// Router
const router = useRouter()

// Computed property for active patients
const activePatients = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set time to midnight for accurate comparison

  return dijeta_pac.value.filter((patient) => {
    if (!patient.Datum_odlaska) return true // If departure date is null, consider them active

    const departureDate = new Date(patient.Datum_odlaska)
    departureDate.setHours(0, 0, 0, 0)

    return departureDate >= today // Departure date is today or in the future
  })
})

// Functions

// Refresh ID
function refreshID() {
  idSestre.value = localStorage.getItem('idSestre') ? Number(localStorage.getItem('idSestre')) : ''
  username.value = localStorage.getItem('loggedInUser') || ''
}

// Show Message
function showMessage(txt, success = true) {
  isSuccess.value = success
  message.value = txt
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// Reset Form
function resetForm() {
  brojSobe.value = ''
  imePrezime.value = ''
  dorucak.value = ''
  rucak.value = ''
  vecera.value = ''
  vrsta_dijete.value = ''
  napomene.value = ''
  uSobu.value = 'da'
  dolazak.value = ''
  odlazak.value = ''
}

// Open Dialog
function openDialog() {
  dialogOpen.value = true
}

// Close Dialog
function closeDialog() {
  dialogOpen.value = false
  resetForm() // Clear the form when closing
}

// Fetch Patient Data
async function showPatient() {
  try {
    const response = await fetch(`${API_URL}/dijeta-pacijent/active`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    dijeta_pac.value = Array.isArray(data) ? data : data ? [data] : []
  } catch (error) {
    console.error('Greška pri učitavanju podataka.', error)
  }
  console.log('Prikaz podataka: ', dijeta_pac.value)
}

// Format Date to MySQL
function formatDateToMySQL(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr
  if (!dateStr.includes('-')) return dateStr
  const parts = dateStr.split('-')
  if (parts.length === 3 && parts[0].length === 4) return dateStr
  if (parts.length === 3 && parts[0].length === 2) {
    const [day, month, year] = parts
    return `${year}-${month}-${day}`
  }
  return dateStr
}

// Cell Double Click
function onCellDblClick(row, column) {
  if (['ID_dijeta_pac', 'username', 'Datum_unosa'].includes(column.name)) return
  editingCell.value = { rowId: row.ID_dijeta_pac, col: column.name }
}

// Cell Input
function onCellInput(row, column, event) {
  let newVal = event.target.value || event.target.innerText
  if (['Odlazak', 'Datum_unosa', 'Dolazak'].includes(column.name)) {
    newVal = formatDateToMySQL(newVal)
  }

  if (!changesMap.value[row.ID_dijeta_pac]) {
    changesMap.value[row.ID_dijeta_pac] = { ...row }
  }

  changesMap.value[row.ID_dijeta_pac][column.field] = newVal
  editingCell.value = {}
}

// Cancel Edit
function cancelEdit() {
  editingCell.value = {}
}

// Confirm Update
async function confirmUpdate() {
  if (!Object.keys(changesMap.value).length) {
    message.value = 'Nema promjena za ažurirati.'
    return
  }

  if (!confirm('Jeste li sigurni za ažuriranje?')) return

  let successCount = 0
  let failCount = 0

  for (const rowId in changesMap.value) {
    const updatedRow = { ...changesMap.value[rowId] }

    updatedRow.Odlazak = formatDateToMySQL(updatedRow.Odlazak)
    updatedRow.Dolazak = formatDateToMySQL(updatedRow.Dolazak)
    updatedRow.ID_sestre = idSestre.value // Use ref value
    updatedRow.username = username.value

    // 🔒 Remove protected fields before sending
    delete updatedRow.ID_dijeta_pac
    delete updatedRow.Datum_unosa

    const url = `${API_URL}/dijeta-pacijent/${rowId}`

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRow),
      })

      if (response.ok) {
        successCount++
        const index = dijeta_pac.value.findIndex((r) => r.ID_dijeta_pac === parseInt(rowId))
        if (index !== -1) {
          dijeta_pac.value[index] = {
            ...dijeta_pac.value[index],
            ...updatedRow,
          }
        }
      } else {
        failCount++
        const errMsg = await response.json()
        alert(`Greška kod ID ${rowId}: ${errMsg.message}`)
      }
    } catch (err) {
      failCount++
      alert(`Neuspješno slanje ID ${rowId}: ${err.message}`)
    }
  }

  // Refresh data after all update attempts, regardless of success or failure
  await showPatient()

  message.value = `Uspješno ažurirano: ${successCount}, Neuspješno: ${failCount}.`
  changesMap.value = {}
  editingCell.value = {}
}

// Post Patient Data
async function postPatient() {
  refreshID()
  console.log('ID_sestre za slanje: ', idSestre.value)
  try {
    const response = await fetch(`${API_URL}/dijeta-pacijent`, {
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
        Dolazak: dolazak.value,
        Odlazak: odlazak.value,
        ID_sestre: idSestre.value,
        username: username.value,
      }),
    })

    if (response.ok) {
      showMessage('Podaci uspješno spremljeni.', true)
      await showPatient() // Refresh table data
      closeDialog() // Close the dialog
    } else {
      showMessage('Greška pri unosu podataka.', false)
    }
  } catch (error) {
    console.error('Greška:', error)
    showMessage('Greška na serveru.', false)
  }
}

// Logout Function
const logout = () => {
  localStorage.removeItem('loggedInUser')
  localStorage.removeItem('idSestre')
  idSestre.value = ''
  loggedInUser.value = ''
  router.push('/login_nurse')
  console.log('ID_sestre u Vue nakon odjave:', idSestre.value)
}

// Function to generate and save PDF from data
function printPdfFromData(data, title) {
  if (!data.length) {
    alert('Nema podataka za ispis.')
    return
  }

  const style = `
    <style>
      table { width: 100%; border-collapse: collapse; font-size: 12px; font-family: Arial, sans-serif; }
      th, td { border: 1px solid #333; padding: 6px; text-align: left; }
      th { background: #f0f0f0; }
      h3 { margin-bottom: 10px; font-family: Arial, sans-serif; }
    </style>
  `

  const html = `
    ${style}
    <h3>${title}</h3>
    <table>
      <thead>
        <tr>
          ${columns.map((c) => `<th>${c.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (row) => `
            <tr>
              ${columns.map((c) => `<td>${row[c.field] ?? ''}</td>`).join('')}
            </tr>
          `,
          )
          .join('')}
      </tbody>
    </table>
  `

  const container = document.createElement('div')
  container.innerHTML = html
  html2pdf().from(container).save()
}

function parseDateString(dateStr) {
  const parts = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (parts) {
    const [, day, month, year] = parts
    return new Date(`${year}-${month}-${day}`)
  }
  return new Date(dateStr)
}

// Function to export active patient diets to PDF
function izveziAktivnePDF() {
  const today = new Date()
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)

  const aktivne = dijeta_pac.value.filter((row) => {
    if (!row.Odlazak) {
      console.log('Nema datum za red:', row)
      return false
    }

    const odlazakDate = parseDateString(row.Odlazak)
    odlazakDate.setHours(0, 0, 0, 0)

    console.log('Red:', row, 'Odlazak (raw):', row.Odlazak, 'Parsed:', odlazakDate)

    return odlazakDate >= todayStart
  })

  console.log('Aktivne dijete:', aktivne)

  if (!aktivne.length) {
    alert('Nema aktivnih dijeta za ispis.')
    return
  }

  printPdfFromData(aktivne, 'Aktivne dijete pacijenata')
}

// Lifecycle Hook
onMounted(() => {
  loggedInUser.value = localStorage.getItem('loggedInUser')
  refreshID()
  console.log('ID_sestre u Vue nakon učitavanja:', idSestre.value)

  if (!loggedInUser.value) {
    router.push('/login_nurse')
  }
  showPatient()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

/* Styled Table */
.styled-table {
  width: 100%;
  border-collapse: collapse;
}

.styled-table th,
.styled-table td {
  border: 1px solid #ddd; /* Light gray border */
  padding: 8px;
  text-align: left;
}

.styled-table th {
  background-color: #f2f2f2; /* Light gray background for header */
  font-weight: bold;
}

/* Button Group Styling */
.button-group {
  display: flex;
  justify-content: start; /* Align buttons to the left */
  gap: 10px; /* Space between buttons */
  margin-bottom: 10px; /* Space below the button group */
}
</style>
