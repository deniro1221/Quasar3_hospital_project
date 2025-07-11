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
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
// dayjs.tz.setDefault('Europe/Zagreb') // Remove default timezone to avoid shifting
dayjs.tz.setDefault('Europe/Zagreb')
const menus = ref([])

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
    const response = await fetch('http://192.168.1.10:3000/menu/today', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Greška pri dohvaćanju menija: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    const groupedMenus = data.reduce((acc, menu) => {
      const date = dayjs.utc(menu.Datum).tz('Europe/Zagreb').format('YYYY-MM-DD')

      if (!acc[date]) {
        acc[date] = {
          Datum_marende: date,
          Juha_m1: '',
          Glavno_jelo_m1: '',
          Salata_m1: '',
          Juha_m2: '',
          Glavno_jelo_m2: '',
          Salata_m2: '',
          username: '',
          ID_kuhara: '',
        }
      }

      if (menu.marendaa === 'Marenda1') {
        acc[date].Juha_m1 = menu.Juha_m1 || ''
        acc[date].Glavno_jelo_m1 = menu.Glavno_jelo_m1 || ''
        acc[date].Salata_m1 = menu.Salata_m1 || ''
        acc[date].username = menu.username || ''
        acc[date].ID_kuhara = menu.ID_kuhara || ''
      } else if (menu.marendaa === 'Marenda2') {
        acc[date].Juha_m2 = menu.Juha_m1 || ''
        acc[date].Glavno_jelo_m2 = menu.Glavno_jelo_m1 || ''
        acc[date].Salata_m2 = menu.Salata_m1 || ''
        acc[date].username = menu.username || ''
        acc[date].ID_kuhara = menu.ID_kuhara || ''
      }

      return acc
    }, {})

    menus.value = Object.values(groupedMenus)

    // Postavi današnji meni
    const todayMenu = menus.value.find((menu) => menu.Datum_marende === todayDate)

    if (todayMenu) {
      meni.value = {
        Marenda1: `${todayMenu.Juha_m1} - ${todayMenu.Glavno_jelo_m1} - ${todayMenu.Salata_m1}`,
        Marenda2: `${todayMenu.Juha_m2} - ${todayMenu.Glavno_jelo_m2} - ${todayMenu.Salata_m2}`,
      }
    }
  } catch (error) {
    console.error(error.message)
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
