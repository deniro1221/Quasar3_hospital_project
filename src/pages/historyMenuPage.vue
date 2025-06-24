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
      v-model:selected="selectedRows"
    >
      <template v-slot:top>
        <q-btn label="Osvježi" color="primary" @click="osvjeziMenije" />
        <q-btn label="PDF" color="secondary" @click="izveziSvePDF" class="q-ml-sm" />
        <q-btn label="PDF Označeno" color="secondary" @click="izveziOznacenoPDF" class="q-ml-sm" />
      </template>

      <template v-slot:body-cell-Datum_menija="props">
        <q-td auto-width>
          {{ formatDate(props.row.Datum_marende) }}
        </q-td>
      </template>

      <template v-slot:body-cell-Marenda1="props">
        <q-td auto-width>
          <div v-if="props.row.Marenda1">
            Juha: {{ props.row.Marenda1.Juha }}<br />
            Glavno jelo: {{ props.row.Marenda1.Glavno_jelo }}<br />
            Salata: {{ props.row.Marenda1.Salata }}
          </div>
          <div v-else>N/A</div>
        </q-td>
      </template>

      <template v-slot:body-cell-Marenda2="props">
        <q-td auto-width>
          <div v-if="props.row.Marenda2">
            Juha: {{ props.row.Marenda2.Juha }}<br />
            Glavno jelo: {{ props.row.Marenda2.Glavno_jelo }}<br />
            Salata: {{ props.row.Marenda2.Salata }}
          </div>
          <div v-else>N/A</div>
        </q-td>
      </template>

      <template v-slot:body-cell-username="props">
        <q-td auto-width>
          {{ props.row.username }}
        </q-td>
      </template>

      <template v-slot:bottom>
        <q-btn label="Nazad" color="primary" @click="goToChefPanel" />
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { date } from 'quasar'
import html2pdf from 'html2pdf.js'

const router = useRouter()

const message = ref('')
const isSuccess = ref(false)
const meni = ref([])
const selectedRows = ref([])

const showMessage = (txt, success = true) => {
  message.value = txt
  isSuccess.value = success
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const goToChefPanel = () => {
  router.push('/chef_panel')
}

const formatDate = (value) => {
  return date.formatDate(value, 'DD.MM.YYYY')
}

const columns = [
  { name: 'Datum_menija', label: 'Datum', align: 'left' },
  { name: 'Marenda1', label: 'Marenda 1', align: 'left' },
  { name: 'Marenda2', label: 'Marenda 2', align: 'left' },
  { name: 'username', label: 'Kuhar', align: 'left' }
]

const osvjeziMenije = async () => {
  try {
    const res = await fetch('https://backend-hospital-n9to.onrender.com/menu/history')
    const data = await res.json()
    meni.value = Array.isArray(data) ? data : data ? [data] : []
  } catch (err) {
    showMessage('Greška pri učitavanju menija.', false)
  }
}

const izveziPDF = (data, naslov) => {
  const html = `
    <style>
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { border: 1px solid #333; padding: 8px; text-align: left; }
      th { background-color: #f0f0f0; }
      h3 { margin-bottom: 15px; }
    </style>
    <h3>${naslov}</h3>
    <table>
      <thead>
        <tr>
          <th>Datum</th>
          <th>Marenda 1</th>
          <th>Marenda 2</th>
          <th>Kuhar</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (row) => `
          <tr>
            <td>${formatDate(row.Datum_marende)}</td>
            <td>
              ${
                row.Marenda1
                  ? `Juha: ${row.Marenda1.Juha}<br/>Glavno jelo: ${row.Marenda1.Glavno_jelo}<br/>Salata: ${row.Marenda1.Salata}`
                  : 'N/A'
              }
            </td>
            <td>
              ${
                row.Marenda2
                  ? `Juha: ${row.Marenda2.Juha}<br/>Glavno jelo: ${row.Marenda2.Glavno_jelo}<br/>Salata: ${row.Marenda2.Salata}`
                  : 'N/A'
              }
            </td>
            <td>${row.username}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `

  const container = document.createElement('div')
  container.innerHTML = html
  html2pdf().from(container).save()
}

const izveziSvePDF = () => {
  if (meni.value.length === 0) {
    showMessage('Nema podataka za ispis.', false)
    return
  }
  izveziPDF(meni.value, 'Svi meniji')
}

const izveziOznacenoPDF = () => {
  if (selectedRows.value.length === 0) {
    showMessage('Niste označili nijedan red.', false)
    return
  }
  izveziPDF(selectedRows.value, 'Označeni meniji')
}

onMounted(() => {
  osvjeziMenije()
})
</script>

<style scoped>
.q-table {
  font-size: 16px;
}

.q-table__title {
  font-size: 20px;
}

.q-table th {
  font-size: 14px;
  font-weight: bold;
  background-color: #f2f2f2;
  padding: 12px 8px;
  text-transform: capitalize;
}

.q-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #ddd;
}

.q-table tbody tr:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}

.positive {
  color: green;
  font-weight: bold;
  margin-bottom: 10px;
}

.negative {
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
