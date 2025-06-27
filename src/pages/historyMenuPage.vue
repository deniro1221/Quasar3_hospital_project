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
            <!-- Editing on Double Click -->
            <div
              v-if="editingCell.rowId === props.row.Datum && editingCell.col === col.name"
            >
              <input
                v-model="props.row[col.field]"
                @blur="onCellInput(props.row, col, $event)"
                @keydown.enter="onCellInput(props.row, col, $event)"
                @keydown.esc="cancelEdit()"
                autofocus
                style="width: 100%"
              />
            </div>
            <div
              v-else
              @dblclick="onCellDblClick(props.row, col)"
              style="min-width: 80px; cursor: pointer; user-select: none"
              title="Dvoklik za uređivanje"
            >
              {{ formatDate(props.row[col.field], col.name) }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Combined Button Group -->
    <div class="q-gutter-sm button-group">
      <q-btn label="Ažuriraj" color="primary" @click="confirmUpdate" />
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
const editingCell = ref({})
const changesMap = ref({})
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

// Cell Double Click
function onCellDblClick(row, column) {
  if (['Datum', 'username'].includes(column.name)) return // Don't edit Datum and username
  editingCell.value = { rowId: row.Datum, col: column.name }
}

// Cell Input
function onCellInput(row, column, event) {
  const newVal = event.target.value || event.target.innerText

  if (!changesMap.value[row.Datum]) {
    changesMap.value[row.Datum] = { ...row }
  }

  changesMap.value[row.Datum][column.field] = newVal
  editingCell.value = {}
}

// Cancel Edit
function cancelEdit() {
  editingCell.value = {}
}

// Confirm Update
async function confirmUpdate() {
  if (!Object.keys(changesMap.value).length) {
    message.value = 'Nema promjena za ažurirati.'
    return
  }

  if (!confirm('Jeste li sigurni za ažuriranje?')) return

  let successCount = 0
  let failCount = 0

  for (const rowId in changesMap.value) {
    const updatedRow = { ...changesMap.value[rowId] }

    // Prepare data for the PUT request.  Adapt this to your API's expected format
    const payload = {
        Datum_marende: updatedRow.Datum,
        [`${updatedRow.Juha ? 'Juha_m1' : 'Juha_m2'}`]: updatedRow.Juha,  // Assuming you know which Marenda it is
        [`${updatedRow.Glavno_jelo ? 'Glavno_jelo_m1' : 'Glavno_jelo_m2'}`]: updatedRow.Glavno_jelo,
        [`${updatedRow.Salata ? 'Salata_m1' : 'Salata_m2'}`]: updatedRow.Salata
    };
    console.log("Payload za update:", payload);

    //Construct the URL for the PUT request
    const url = `https://backend-hospital-n9to.onrender.com/menu/fresh`;  // Adapt this to your API's URL
     try {
      console.log("Šaljem PUT zahtjev na:", url, "s podacima:", payload);  //dodano
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log("Odgovor s backenda:", response);  //dodano

      if (response.ok) {
        successCount++
        const index = meni.value.findIndex((r) => r.Datum === rowId)
        if (index !== -1) {
          meni.value[index] = {
            ...meni.value[index],
            ...updatedRow,
          }
        }
      } else {
        failCount++
        const errMsg = await response.json()
        alert(`Greška kod Datuma ${rowId}: ${errMsg.message}`)
      }
    } catch (err) {
      failCount++
      alert(`Neuspješno slanje za Datum ${rowId}: ${err.message}`)
    }
  }

  // Refresh data after all update attempts, regardless of success or failure
  await showMenu()

  message.value = `Uspješno ažurirano: ${successCount}, Neuspješno: ${failCount}.`
  changesMap.value = {}
  editingCell.value = {}
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
