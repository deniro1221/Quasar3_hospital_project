<template>
  <q-page padding>
    <!-- Prikaz poruke -->
    <div v-if="message" :class="{ positive: isSuccess, negative: !isSuccess }">
      {{ message }}
    </div>

    <!-- Tablica za pregled menija -->
    <q-table
      title="Pregled Menija"
      :rows="meni"
      :columns="columns"
      row-key="Datum_menija"
      selection="multiple"
      v-model:selected.sync="selectedRows"
    >
      <template v-slot:top>
        <q-btn label="Osvježi" color="primary" @click="osvjeziMenije" />
        <q-btn label="PDF" color="secondary" @click="izveziSvePDF" style="margin-left: 10px" />
        <q-btn
          label="PDF Označeno"
          color="secondary"
          @click="izveziOznacenoPDF"
          style="margin-left: 10px"
        />
      </template>
      <template v-slot:bottom>
        <q-btn label="Nazad" color="primary" @click="goAdmin" />
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const message = ref('')
const isSuccess = ref(false)
const meni = ref([]) // Svi meniji
const selectedRows = ref([]) // Označeni redovi
const goAdmin = () => {
  router.push('/admin')
}
function showMessage(txt, success = true) {
  message.value = txt
  isSuccess.value = success
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// Kolone tablice
const columns = [
  { name: 'Datum_menija', label: 'Datum', align: 'left', field: 'Datum_menija' },
  { name: 'Marenda1', label: 'Marenda 1', align: 'left', field: 'Marenda1' },
  { name: 'Marenda2', label: 'Marenda 2', align: 'left', field: 'Marenda2' },
  { name: 'ID_kuhara', label: 'ID Kuhara', align: 'left', field: 'ID_kuhara' },
]

// Dohvati meni sa servera
async function osvjeziMenije() {
  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/history') // API endpoint za sve menije
    const data = await response.json()
    if (Array.isArray(data)) {
      meni.value = data // ako je već niz
    } else if (data) {
      meni.value = [data] // ako je objekat, smesti u niz
    } else {
      meni.value = [] // ako je null ili ništa
    }
  } catch (error) {
    showMessage('Greška pri učitavanju menija.', false, error)
  }
}

function izveziSvePDF() {
  if (meni.value.length === 0) {
    showMessage('Nema podataka za ispis.', false)
    return
  }

  const tableHTML = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #333;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
    }
    h3 {
      margin-bottom: 15px;
    }
  </style>

  <h3>Svi meniji</h3>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Marenda 1</th>
        <th>Marenda 2</th>
        <th>ID Kuhara</th>
      </tr>
    </thead>
    <tbody>
      ${meni.value
        .map(
          (row) => `
        <tr>
          <td>${row.Datum_menija}</td>
          <td>${row.Marenda1}</td>
          <td>${row.Marenda2}</td>
          <td>${row.ID_kuhara}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>
`

  const container = document.createElement('div')
  container.innerHTML = tableHTML
  html2pdf().from(container).save()
}

function izveziOznacenoPDF() {
  if (selectedRows.value.length === 0) {
    showMessage('Niste označili nijedan red.', false)
    return
  }

  // Filtriraj samo označene redove
  const oznaceni = selectedRows.value

  const tableHTML = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #333;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
    }
    h3 {
      margin-bottom: 15px;
    }
  </style>

  <h3>Označeni meniji</h3>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Marenda 1</th>
        <th>Marenda 2</th>
        <th>ID Kuhara</th>
      </tr>
    </thead>
    <tbody>
      ${oznaceni
        .map(
          (row) => `
        <tr>
          <td>${row.Datum_menija}</td>
          <td>${row.Marenda1}</td>
          <td>${row.Marenda2}</td>
          <td>${row.ID_kuhara}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>
  `
  const container = document.createElement('div')
  container.innerHTML = tableHTML
  html2pdf().from(container).save()
}

onMounted(() => {
  osvjeziMenije()
})
</script>
