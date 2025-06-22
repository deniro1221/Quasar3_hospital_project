<template>
  <q-page padding>
    <h4>Pregled aktivnih dijeta pacijenata</h4>

    <!-- Tabela sa prikazom podataka -->
    <q-table :rows="dijeta_pac" :columns="columns" row-key="ID_dijeta_pac">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            {{ props.row[col.field] }}
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Dugmad za ispis PDF-a -->
    <div class="q-mt-md q-gutter-sm">
      <q-btn
        label="Ispiši"
        color="secondary"
        @click="izveziAktivnePDF"
        class="q-ml-sm"
      />

      <q-btn label="Nazad" color="secondary" class="q-ml-sm" to="/admin" />
      <q-btn label="Arhiv neaktivnih pacijenta" color="secondary" class="q-ml-sm" to="/showPatientInactive" />
    </div>

    <!-- Poruka (uspjeh ili greška) -->
    <div v-if="message" style="margin-top: 10px" :style="{ color: isSuccess ? 'green' : 'red' }">
      {{ message }}
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'

// Reactive podaci
const dijeta_pac = ref([])
const message = ref('')
const isSuccess = ref(false)

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

// Učitavanje podataka
async function showPatient() {
  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/dijeta-pacijent/active')
    const data = await response.json()
    dijeta_pac.value = Array.isArray(data) ? data : data ? [data] : []
    console.log('Učitani podaci:', dijeta_pac.value)
  } catch (error) {
    console.error('Greška pri učitavanju podataka:', error)
  }
}

onMounted(() => {
  showPatient()
})

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
  printPdfFromData(dijeta_pac.value, 'Sve dijete pacijenata')
}

// Export aktivnih dijeta
/*function izveziAktivnePDF() {
  const today = new Date()
  const todayStart = new Date(today.setHours(0, 0, 0, 0))

  const aktivne = dijeta_pac.value.filter((row) => {
    if (!row.Odlazak) return false
    const odlazakDate = parseDateString(row.Odlazak)
    return odlazakDate >= todayStart
  })

  if (!aktivne.length) {
    alert('Nema aktivnih dijeta za ispis.')
    return
  }

  printPdfFromData(aktivne, 'Aktivne dijete pacijenata')
}
  */

// Pomoćna funkcija za parsiranje datuma
function parseDateString(dateStr) {
  const parts = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (parts) {
    const [, day, month, year] = parts
    return new Date(`${year}-${month}-${day}`)
  }
  return new Date(dateStr)
}
</script>
