<template>
  <div>
    <h4>Meni za danas ({{ formattedDate }})</h4>
    <div v-if="meni">
      <p>
        <strong>Marenda 1:</strong> {{ meni.Marenda1.Juha }} - {{ meni.Marenda1.Glavno_jelo }} -
        {{ meni.Marenda1.Salata }}
      </p>
      <p>
        <strong>Marenda 2:</strong> {{ meni.Marenda2.Juha }} - {{ meni.Marenda2.Glavno_jelo }} -
        {{ meni.Marenda2.Salata }}
      </p>
    </div>
    <div v-else>
      <p>Još nisu uneseni meniji za danas.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const meni = ref(null)
const formattedDate = dayjs().format('DD-MM-YYYY')

onMounted(async () => {
  try {
    const response = await fetch('http://192.168.1.10:3000/menu/today')
    if (!response.ok) throw new Error('Greška sa API-jem')
    const data = await response.json()
    // Postavite meni
    if (data && data.Datum_marende === dayjs().format('YYYY-MM-DD')) {
      meni.value = {
        Marenda1: data.Marenda1,
        Marenda2: data.Marenda2,
      }
    } else {
      meni.value = null
    }
  } catch (err) {
    console.error(err)
    meni.value = null
  }
})
</script>
