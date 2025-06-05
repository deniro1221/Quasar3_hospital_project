<template>
  <q-page padding class="menu-page">
    <div v-if="loading" class="loading">Učitavanje menija...</div>
    <div v-else>
      <div v-if="meni" class="meniji-container">
        <h4 class="naslov">Meni za danas ({{ formattedDate }})</h4>
        <div class="marenda"><strong>Marenda 1:</strong> {{ meni.Marenda1 }}</div>
        <div class="marenda"><strong>Marenda 2:</strong> {{ meni.Marenda2 }}</div>
      </div>
      <div v-else class="no-menu">
        <p>🎉 Još nisu uneseni meniji za danas. 🥗</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Funkcija za formatiranje datuma dd-mm-yyyy
function formatDateDMY(dateStr) {
  const [yyyy, mm, dd] = dateStr.split('-')
  return `${dd}-${mm}-${yyyy}`
}

const meni = ref(null)
const loading = ref(true)
const todayDate = new Date().toISOString().slice(0, 10)
const formattedDate = formatDateDMY(todayDate)

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/menu/todays')
    if (response.ok) {
      const data = await response.json()
      if (data) {
        meni.value = {
          ...data,
          Datum_menija: formatDateDMY(data.Datum_menija),
        }
      }
    } else {
      console.error('Greška pri dohvaćanju menija')
    }
  } catch (err) {
    console.error('Greška:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.menu-page {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
}

.loading {
  text-align: center;
  font-size: 1.2em;
  margin-top: 50px;
  color: #555;
}

.meniji-container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  margin-top: 20px;
}

.naslov {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 600;
}

.marenda {
  background-color: #ffffff;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 4px;
  font-size: 1.1em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.no-menu {
  text-align: center;
  font-size: 1.3em;
  margin-top: 40px;
  color: #3498db;
  font-weight: bold;
}
</style>
