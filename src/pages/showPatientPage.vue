<template>
  <q-page padding>
    <h4>Pregled dijeta pacijenata</h4>

    <q-table :rows="dijeta_pac" :columns="columns" row-key="ID_dijeta_pac">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            <!-- Uređivanje na dvoklik -->
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

    <!-- Dugmad za ispis PDF-a smještena ispod tablice -->
    <div class="q-mt-md q-gutter-sm">
      <q-btn
        label="Ispiši PDF (aktivne)"
        color="secondary"
        @click="izveziAktivnePDF"
        class="q-ml-sm"
      />
      <q-btn label="Ispiši PDF (sve)" color="secondary" @click="izveziSvePDF" class="q-ml-sm" />
    </div>

    <div class="q-gutter-sm" style="margin-top: 20px">
      <q-btn label="Ažuriraj" color="primary" @click="confirmUpdate" />
      <q-btn label="Nazad" color="red" to="/nurse_panel" />
    </div>

    <div v-if="message" style="margin-top: 10px" :style="{ color: isSuccess ? 'green' : 'red' }">
      {{ message }}
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'
const dijeta_pac = ref([])
const editingCell = ref({})
const changesMap = ref({})
const message = ref('')
const idSestre = localStorage.getItem('idSestre') || null

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
  { name: 'ID_sestre', label: 'ID Sestre', align: 'left', field: 'ID_sestre' },
]

async function showPatient() {
  try {
    const response = await fetch('http://localhost:3000/dijeta-pacijent/back')
    const data = await response.json()
    dijeta_pac.value = Array.isArray(data) ? data : data ? [data] : []
  } catch (error) {
    console.error('Greška pri učitavanju podataka.', error)
  }
  console.log('Prikaz podataka: ', dijeta_pac.value)
}

onMounted(() => {
  showPatient()
})

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

function onCellDblClick(row, column) {
  if (['ID_dijeta_pac', 'ID_sestre', 'Datum_unosa'].includes(column.name)) return
  editingCell.value = { rowId: row.ID_dijeta_pac, col: column.name }
}

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

function cancelEdit() {
  editingCell.value = {}
}

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
    updatedRow.ID_sestre = idSestre // Dodaj trenutni ID sestre

    // 🔒 Ukloni zaštićena polja prije slanja
    delete updatedRow.ID_dijeta_pac
    //delete updatedRow.ID_sestre--->ukoliko se želi da se ne ažurira idsestre
    delete updatedRow.Datum_unosa

    const url = `http://localhost:3000/dijeta-pacijent/${rowId}`

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

  // Osvježi podatke nakon svih pokušaja ažuriranja, bez obzira na uspjeh ili neuspjeh
  await showPatient()

  message.value = `Uspješno ažurirano: ${successCount}, Neuspješno: ${failCount}.`
  changesMap.value = {}
  editingCell.value = {}
}

// Funkcija za generiranje i spremanje PDF-a iz podataka
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

// Funkcija za ispis svih dijeta pacijenata
function izveziSvePDF() {
  printPdfFromData(dijeta_pac.value, 'Sve dijete pacijenata')
}

function parseDateString(dateStr) {
  // Ako je datum u formatu DD-MM-YYYY
  const parts = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (parts) {
    const [, day, month, year] = parts
    return new Date(`${year}-${month}-${day}`)
  }

  // Ako je već u ispravnom formatu
  return new Date(dateStr)
}

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
</script>
