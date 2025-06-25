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
  { name: 'Marenda', label: 'Marenda', field: 'marenda', align: 'left' },
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
      marenda: item.marenda,
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
.my-table td {
  font-weight: 600;
}

.my-table thead th {
  font-weight: 700;
}
</style>
