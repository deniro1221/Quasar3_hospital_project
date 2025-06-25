<template>
  <div class="q-pa-md q-gutter-md">
    <q-btn label="Osvježi" color="primary" @click="fetchData" />

    <q-table
      class="my-custom-table"
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      :visible-columns="columns.map(c => c.name)"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td
            v-for="col in columns"
            :key="col.name"
            :props="props"
            class="text-base text-left px-4 py-3"
          >
            {{ props.row[col.field] }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import axios from 'axios'

// Podaci za tablicu
const rows = ref([])

const columns = [
  { name: 'tip', label: 'Tip', field: 'tip', align: 'left', sortable: false },
  { name: 'Juha', label: 'Juha', field: 'Juha', align: 'left' },
  { name: 'Glavno_jelo', label: 'Glavno jelo', field: 'Glavno_jelo', align: 'left' },
  { name: 'Salata', label: 'Salata', field: 'Salata', align: 'left' },
]

// Funkcija za dohvat podataka
const fetchData = async () => {
  try {
    const res = await axios.get('/api/menu/history')
    const data = res.data

    const flattened = data.flatMap(item => {
      return [
        {
          tip: 'Marenda 1',
          Juha: item.Juha,
          Glavno_jelo: item.Glavno_jelo,
          Salata: item.Salata,
        },
        {
          tip: 'Marenda 2',
          Juha: item.Juha,
          Glavno_jelo: item.Glavno_jelo,
          Salata: item.Salata,
        },
      ]
    })

    rows.value = flattened
  } catch (err) {
    console.error('Greška kod dohvata:', err)
  }
}

// Osvježi odmah i svakih 60 sekundi
onMounted(fetchData)
useIntervalFn(fetchData, 60000)
</script>

<style scoped>
.my-custom-table {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
}

.my-custom-table th,
.my-custom-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.my-custom-table thead {
  background-color: #f0f0f0;
  font-weight: bold;
}
</style>
