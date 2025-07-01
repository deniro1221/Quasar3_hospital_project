<template>
  <q-page padding>
    <h4>Arhiva pacijenata</h4>

    <!-- Message Display (optional) -->
    <div
      v-if="message"
      :class="isSuccess ? 'bg-green-2 text-green-10' : 'bg-red-2 text-red-10'"
      class="q-pa-md q-mb-md rounded-borders"
    >
      {{ message }}
    </div>

    <q-table
      :rows="inactivePatients"
      :columns="columns"
      row-key="ID_dijeta_pac"
      class="styled-table"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            {{ props.row[col.field] }}
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <div class="q-gutter-sm button-group">
      <q-btn label="Natrag" color="secondary" to="/showPatientAdmin" />
      <q-btn label="Ispiši" color="secondary" @click="izveziSvePDF" class="q-ml-sm" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import html2pdf from 'html2pdf.js'

// Data
const inactivePatients = ref([])
const message = ref('')
const isSuccess = ref(false)

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

// Fetch Inactive Patients
async function fetchInactivePatients() {
  try {
    const response = await fetch(
      'https://backend-hospital-n9to.onrender.com/dijeta-pacijent/inactive',
    )
    const data = await response.json()
    inactivePatients.value = Array.isArray(data) ? data : data ? [data] : []
  } catch (error) {
    console.error('Greška pri učitavanju arhiviranih pacijenata:', error)
    message.value = 'Greška pri učitavanju arhiviranih pacijenata.'
    isSuccess.value = false
  }
}
// Funkcija za generisanje PDF-a
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

// Export svih podataka
function izveziSvePDF() {
  printPdfFromData(inactivePatients.value, 'Arhiva pacijenata') // Make the changes here instead of dijeta_pac.value to inactivePatients.value
}

// Lifecycle Hook
onMounted(() => {
  fetchInactivePatients()
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
