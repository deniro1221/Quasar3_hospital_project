<template>
  <div class="q-pa-md container">
    <h4>Menu History</h4>
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="Datum"
      class="my-table"
      flat
    />
    <q-btn label="Osvježi podatke" color="primary" @click="loadData" class="q-mt-md" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const columns = [
  { name: 'Datum', label: 'Datum', field: 'Datum', align: 'left' },
  { name: 'Kuhar', label: 'Kuhar', field: 'username', align: 'left' },
  { name: 'Juha', label: 'Juha', field: 'Juha', align: 'left' },
  { name: 'Glavno', label: 'Glavno jelo', field: 'Glavno_jelo', align: 'left' },
  { name: 'Salata', label: 'Salata', field: 'Salata', align: 'left' },
]

const rows = ref([])

const loadData = async () => {
  try {
    const response = await axios.get('https://backend-hospital-n9to.onrender.com/menu/history')
    rows.value = response.data.map(item => ({
      Datum: new Date(item.Datum_marende).toLocaleDateString(),
      username: item.username,
      Juha: item.Juha,
      Glavno_jelo: item.Glavno_jelo,
      Salata: item.Salata,
    }))
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka:', error)
  }
}

loadData()
</script>

<style scoped>
.container {
  max-width: 100%;
  padding: 10px;
}

.my-table {
  font-size: 15px;
  font-family: Arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
  border: 2px solid #000;
}

.my-table thead th {
  background-color: #e0e0e0;
  font-weight: bold;
  padding: 8px;
  border: 2px solid #000;
  text-align: left;
}

.my-table td {
  padding: 8px;
  border: 2px solid #000;
  font-weight: bold;
}

.my-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>
