<template>
  <div class="q-pa-md">

    <h2>Marenda 1</h2>
    <q-table
      :rows="rowsMarenda1"
      :columns="columns"
      row-key="Datum"
      class="my-table"
      flat
    />

    <h2>Marenda 2</h2>
    <q-table
      :rows="rowsMarenda2"
      :columns="columns"
      row-key="Datum"
      class="my-table"
      flat
    />

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
.my-table {
  font-size: 16px;
  font-family: Arial, sans-serif;
}

.my-table thead th {
  background-color: #f0f0f0;
  font-weight: bold;
  padding: 10px;
}

.my-table td {
  padding: 10px;
}
</style>
