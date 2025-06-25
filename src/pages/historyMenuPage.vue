<template>
  <div class="q-pa-md container">
    <div class="tables-wrapper">
      <div class="table-box">
        <h2>Marenda 1</h2>
        <q-table
          :rows="rowsMarenda1"
          :columns="columns"
          row-key="Datum"
          class="my-table"
          flat
        />
      </div>
      <div class="table-box">
        <h2>Marenda 2</h2>
        <q-table
          :rows="rowsMarenda2"
          :columns="columns"
          row-key="Datum"
          class="my-table"
          flat
        />
      </div>
    </div>
    <q-btn label="Osvježi podatke" color="primary" @click="loadAllData" class="q-mt-md"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
.container {
  max-width: 100%;
  padding: 10px;
}

/* Flex wrapper za tablice */
.tables-wrapper {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

/* Pojedinačni kontejner za tablicu */
.table-box {
  flex: 1 1 48%;
  border: 3px solid #333;
  padding: 10px;
  box-sizing: border-box;
  min-width: 300px;
  background-color: #fff;
}

/* QTable stilovi */
.my-table {
  font-size: 15px;
  font-family: Arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
  border: 2px solid #000;
}

/* Header */
.my-table thead th {
  background-color: #e0e0e0;
  font-weight: bold;
  padding: 8px;
  border: 2px solid #000;
  text-align: left;
}

/* Ćelije */
.my-table td {
  padding: 8px;
  border: 2px solid #000;
  font-weight: bold;
}

/* Zebra efekt */
.my-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* Mobilni prikaz - jedna ispod druge */
@media (max-width: 768px) {
  .tables-wrapper {
    flex-direction: column;
  }

  .table-box {
    flex: 1 1 100%;
  }
}
</style>
