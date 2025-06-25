<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-md-6 col-12">
        <h2>Marenda 1</h2>
        <q-table
          :rows="rowsMarenda1"
          :columns="columns"
          row-key="Datum"
          class="my-table marenda-table"
          flat
        />
      </div>
      <div class="col-md-6 col-12">
        <h2>Marenda 2</h2>
        <q-table
          :rows="rowsMarenda2"
          :columns="columns"
          row-key="Datum"
          class="my-table marenda-table"
          flat
        />
      </div>
    </div>

    <q-btn label="Osvježi podatke" color="primary" @click="loadAllData" class="q-mt-md"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// Definiramo stupce
const columns = [
  { name: 'Datum', label: 'Datum', field: 'Datum', align: 'left' },
  { name: 'Kuhar', label: 'Kuhar', field: 'Kuhar', align: 'left' },
  { name: 'Juha', label: 'Juha', field: 'Juha', align: 'left' },
  { name: 'Glavno', label: 'Glavno jelo', field: 'Glavno_jelo', align: 'left' },
  { name: 'Salata', label: 'Salata', field: 'Salata', align: 'left' },
]

// Liste za podatke
const rowsMarenda1 = ref([])
const rowsMarenda2 = ref([])

// Mock funkcije za dohvat podataka
const fetchMarenda1 = async () => {
  try {
    const response = {
      data: [
        {
          Datum_marende: '2025-06-25',
          Kuhar: 'marin',
          Juha: 'k',
          Glavno_jelo: 'j',
          Salata: 'l',
        },
        {
          Datum_marende: '2025-06-24',
          Kuhar: 'marin',
          Juha: 'r',
          Glavno_jelo: 'rr',
          Salata: 'r',
        },
      ]
    }
    rowsMarenda1.value = response.data.map(item => ({
      Datum: item.Datum_marende,
      Kuhar: item.Kuhar,
      Juha: item.Juha,
      Glavno_jelo: item.Glavno_jelo,
      Salata: item.Salata,
    }))
  } catch (err) {
    console.error('Greška za Marenda 1:', err)
  }
}

const fetchMarenda2 = async () => {
  try {
    const response = {
      data: [
        {
          Datum_marende: '2025-06-25',
          Kuhar: 'marin',
          Juha: 'm',
          Glavno_jelo: 'o',
          Salata: 'm',
        },
        {
          Datum_marende: '2025-06-24',
          Kuhar: 'marin',
          Juha: 'minestrone',
          Glavno_jelo: 'brancin',
          Salata: 'm ovako',
        },
      ]
    }
    rowsMarenda2.value = response.data.map(item => ({
      Datum: item.Datum_marende,
      Kuhar: item.Kuhar,
      Juha: item.Juha,
      Glavno_jelo: item.Glavno_jelo,
      Salata: item.Salata,
    }))
  } catch (err) {
    console.error('Greška za Marenda 2:', err)
  }
}

const loadAllData = async () => {
  await fetchMarenda1()
  await fetchMarenda2()
}

loadAllData()
</script>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
}

.col-md-6 {
  width: 50%; /* Dvije tablice jedna pored druge na medium i većim ekranima */
  padding: 5px; /* Smanjeno padding radi smanjenja prostora */
  box-sizing: border-box;
}

.col-12 {
  width: 100%; /* Jedna ispod druge na manjim ekranima */
}

.my-table {
  width: 100%;
  font-size: 14px; /* Smanjen font */
  font-family: Arial, sans-serif;
  border-collapse: collapse; /* Spaja obrube ćelija */
}

.my-table thead th {
  background-color: #f0f0f0;
  font-weight: bold;
  padding: 8px; /* Smanjeno padding */
  border: 2px solid #888; /* Jači i tamniji obrub */
  font-weight: bold; /* Podebljan font */
}

.my-table td {
  padding: 8px; /* Smanjeno padding */
  border: 1.5px solid #888; /* Jači i tamniji obrub */
  font-weight: bold; /* Podebljan font */
}

.my-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>

