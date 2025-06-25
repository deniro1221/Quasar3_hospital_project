<template>
  <div class="q-pa-md">
    <q-btn label="Osvježi podataka" color="primary" @click="fetchData" />

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="Datum"
      class="my-table"
      flat
    />

    <!-- Napomena: Možeš dodati stilove ili druga poboljšanja -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Definiramo stupce tablice
const columns = [
  { name: 'Datum', label: 'Datum', field: 'Datum', align: 'left', sortable: true },
  { name: 'Kuhar', label: 'Kuhar', field: 'Kuhar', align: 'left', sortable: true },

  { name: 'Juha_M1', label: 'Marenda 1 - Juha', field: 'Juha_M1', align: 'left' },
  { name: 'Glavno_jelo_M1', label: 'Marenda 1 - Glavno', field: 'Glavno_jelo_M1', align: 'left' },
  { name: 'Salata_M1', label: 'Marenda 1 - Salata', field: 'Salata_M1', align: 'left' },

  { name: 'Juha_M2', label: 'Marenda 2 - Juha', field: 'Juha_M2', align: 'left' },
  { name: 'Glavno_jelo_M2', label: 'Marenda 2 - Glavno', field: 'Glavno_jelo_M2', align: 'left' },
  { name: 'Salata_M2', label: 'Marenda 2 - Salata', field: 'Salata_M2', align: 'left' },
]

const rows = ref([])

// Funkcija za dohvat i preradu podataka
const fetchData = async () => {
  try {
    // Zamijeni s vlastitim API endpointom
    const response = await axios.get('https://backend-hospital-n9to.onrender.com/history_menu')
    // očekujemo da response.data bude niz objekata s odgovorima npr.
    // [{ Datum_marende: '2025-06-25', Juha: 'k', Glavno_jelo: 'j', Salata: 'l', Kuhar: 'marin' }, ...]
    const data = response.data

    // Transformiraj podatke u format prikladan za tablicu
    rows.value = data.map(item => ({
      Datum: item.Datum_marende,
      Kuhar: item.Kuhar,
      Juha_M1: item.Juha,
      Glavno_jelo_M1: item.Glavno_jelo,
      Salata_M1: item.Salata,
      Juha_M2: item.Juha,
      Glavno_jelo_M2: item.Glavno_jelo,
      Salata_M2: item.Salata,
    }))
  } catch (err) {
    console.error('Greška kod dohvata podataka:', err)
  }
}

// Dohvati odmah po ulasku i automatski osvježava svakih 60 sekundi
onMounted(() => {
  fetchData()
  setInterval(fetchData, 60000)
})
</script>

<style scoped>
.my-table {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
}
</style>
