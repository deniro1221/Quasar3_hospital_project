<template>
  <q-page padding>
    <h4>Pregled Menija</h4>

    <!-- User Info Display -->
    <div class="q-mb-md">
      <p v-if="loggedInUser">Korisnik: {{ loggedInUser }}</p>
    </div>

    <!-- Message Display -->
    <div
      v-if="message"
      :class="isSuccess ? 'bg-green-2 text-green-10' : 'bg-red-2 text-red-10'"
      class="q-pa-md q-mb-md rounded-borders"
    >
      {{ message }}
    </div>

    <q-table :rows="meni" :columns="columns" row-key="Datum" class="styled-table">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            {{ formatDate(props.row[col.field], col.name) }}
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Combined Button Group -->
    <div class="q-gutter-sm button-group">
      <q-btn label="Odjavi se" color="negative" @click="logout" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

// Data
const meni = ref([])
const message = ref('')
const isSuccess = ref(false)

// User Info
const loggedInUser = ref('')

// Columns definition
const columns = [
  { name: 'Datum', label: 'Datum', align: 'left', field: 'Datum' },
  { name: 'Juha', label: 'Juha', align: 'left', field: 'Juha' },
  { name: 'Glavno_jelo', label: 'Glavno jelo', align: 'left', field: 'Glavno_jelo' },
  { name: 'Salata', label: 'Salata', align: 'left', field: 'Salata' },
  { name: 'username', label: 'Korisnik', align: 'left', field: 'username' },
]

// Router
const router = useRouter()

// Functions

// Show Message
function showMessage(txt, success = true) {
  isSuccess.value = success
  message.value = txt
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// Fetch Menu Data
async function showMenu() {
  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/history') // Prilagodite URL
    const data = await response.json()
    meni.value = Array.isArray(data) ? data : data ? [data] : []
  } catch (error) {
    console.error('Greška pri učitavanju podataka.', error)
  }
  console.log('Prikaz podataka: ', meni.value)
}

// Format Date
function formatDate(value, columnName) {
  if (columnName === 'Datum' && value) {
    return dayjs(value).format('DD-MM-YYYY')
  }
  return value
}

// Logout Function
const logout = () => {
  localStorage.removeItem('loggedInUser')
  router.push('/login_nurse')
}

// Lifecycle Hook
onMounted(() => {
  loggedInUser.value = localStorage.getItem('loggedInUser')

  if (!loggedInUser.value) {
    router.push('/login_nurse')
  }
  showMenu()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

/* Styled Table */
.styled-table {
  width: 100%;
  border-collapse: collapse;
}

.styled-table th,
.styled-table td {
  border: 1px solid #ddd; /* Light gray border */
  padding: 8px;
  text-align: left;
}

.styled-table th {
  background-color: #f2f2f2; /* Light gray background for header */
  font-weight: bold;
}

/* Button Group Styling */
.button-group {
  display: flex;
  justify-content: start; /* Align buttons to the left */
  gap: 10px; /* Space between buttons */
  margin-bottom: 10px; /* Space below the button group */
}
</style>
