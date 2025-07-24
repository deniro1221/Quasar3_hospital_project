<template>
  <div class="menu-container">
    <div class="menu-title">Meni za danas ({{ formattedDate }})</div>
    <div v-if="meni">
      <!-- Marenda 1 -->
      <div class="menu-item">
        <div class="menu-heading">Marenda 1</div>
        <div class="menu-details">
          <div><strong>Salata:</strong> {{ meni.Marenda1.Salata }}</div>
          <div><strong>Glavno Jelo:</strong> {{ meni.Marenda1.Glavno_jelo }}</div>
          <div><strong>Juha:</strong> {{ meni.Marenda1.Juha }}</div>
        </div>
      </div>
      <!-- Marenda 2 -->
      <div class="menu-item">
        <div class="menu-heading">Marenda 2</div>
        <div class="menu-details">
          <div><strong>Salata:</strong> {{ meni.Marenda2.Salata }}</div>
          <div><strong>Glavno Jelo:</strong> {{ meni.Marenda2.Glavno_jelo }}</div>
          <div><strong>Juha:</strong> {{ meni.Marenda2.Juha }}</div>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="no-menu">🎉 Još nisu uneseni meniji za danas. 🥗</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const meni = ref(null)
const formattedDate = dayjs().format('DD.MM.YYYY')
const API_URL = `${window.location.protocol}//${window.location.hostname}:3000`
onMounted(async () => {
  try {
    const response = await fetch(`${API_URL}/menu/today`)
    if (!response.ok) throw new Error('Greška sa API-jem')
    const data = await response.json()
    // Ako API vraća za danas
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

<style scoped>
.menu-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  line-height: 1.5;
}

.menu-title {
  text-align: center;
  font-size: 1.8em;
  margin-bottom: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.menu-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}
.menu-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.menu-heading {
  font-size: 1.2em;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
}

.menu-details {
  font-size: 1em;
  color: #555;
  line-height: 1.4;
}

/* Stil za opcionalni tekst */
.no-menu {
  text-align: center;
  font-size: 1.3em;
  margin-top: 40px;
  color: #2980b9;
  font-weight: bold;
}
</style>
