<template>
  <q-layout view="hHh LpP lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Meni </q-toolbar-title>
        <!-- Prikaz korisničkog imena -->
        <p v-if="loggedInUser" style="margin-right: 10px">Korisnik: {{ loggedInUser }}</p>

        <!-- Prikaz ID kuhaara -->
        <p v-if="userID">ID Kuhara: {{ userID }}</p>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Dijalog za unos menija -->
        <q-dialog v-model="addMenuDialog" persistent>
          <q-card style="width: 700px">
            <q-card-section>
              <div class="text-h6">Dodaj meni</div>
            </q-card-section>
            <q-card-section>
              <q-form @submit="addMenu" ref="menuForm">
                <q-input
                  v-model="form.date"
                  type="date"
                  label="Datum"
                  :rules="[
                    (val) => !!val || 'Datum je obavezan',
                    (val) => isFutureDate(val) || 'Datum mora biti jednak ili veći od današnjeg',
                  ]"
                />
                <q-input v-model="form.juha_m1" label="Juha (Marenda 1)" />
                <q-input v-model="form.glavno_jelo_m1" label="Glavno jelo (Marenda 1)" />
                <q-input v-model="form.salata_m1" label="Salata (Marenda 1)" />
                <q-input v-model="form.juha_m2" label="Juha (Marenda 2)" />
                <q-input v-model="form.glavno_jelo_m2" label="Glavno jelo (Marenda 2)" />
                <q-input v-model="form.salata_m2" label="Salata (Marenda 2)" />
              </q-form>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Odustani" color="primary" @click="closeTheGreatDialog" />
              <q-btn flat label="Spremi" color="primary" @click="addMenu" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Tablica za pregled menija -->
        <q-card>
          <q-card-section>
            <div class="text-h6">Pregled menija</div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="menus"
              :columns="columns"
              row-key="Datum_marende"
              :pagination="pagination"
            >
              <!-- Ažuriranje podataka -->
              <template v-slot:body-cell="props">
                <q-td
                  :props="props"
                  @dblclick="onCellDblClick(props.row, props.col)"
                  style="cursor: pointer"
                >
                  <!-- Dodan style za bolji UX -->
                  <div
                    v-if="
                      editingCell.rowId !== props.row.Datum_marende ||
                      editingCell.col !== props.col.name
                    "
                  >
                    <div v-if="props.col.name === 'Datum_marende'">{{ props.value }}</div>
                    <div v-else>{{ props.value }}</div>
                  </div>
                  <q-input
                    v-else
                    v-model="props.row[props.col.field]"
                    @update:model-value="onCellInput(props.row, props.col, $event)"
                    dense
                    autofocus
                  />
                </q-td>
              </template>

              <!-- Brisanje menija -->
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn @click="deleteMenu(props.row)" color="negative" label="Obriši" size="sm" />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-section>
            <q-btn color="primary" @click="confirmUpdate">Ažuriraj meni</q-btn>

            <!-- Gumb za otvaranje dijaloga -->
            <q-btn color="primary" label="Dodaj meni" @click="openDialog" />
            <q-btn color="primary" label="Ispiši PDF" @click="printPDF" />
            <q-btn color="primary" label="Arhiv marenda" to="noActiveMenu" />
            <q-btn label="Odjavi se" color="negative" class="button-item" @click="logout" />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
///
<reference types="html2pdf.js" />
<script setup>
import { ref, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { useRouter } from 'vue-router'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
// dayjs.tz.setDefault('Europe/Zagreb') // Remove default timezone to avoid shifting
dayjs.tz.setDefault('Europe/Zagreb')

const form = ref({
  date: dayjs().format('YYYY-MM-DD'),
  juha_m1: '',
  glavno_jelo_m1: '',
  salata_m1: '',
  juha_m2: '',
  glavno_jelo_m2: '',
  salata_m2: '',
})
const loggedInUser = ref('')
const userID = ref('')
// const apiUrl = import.meta.env.VITE_API_URL

const printPDF = () => {
  // Prepare the table HTML
  let tableHTML = `
        <h2 style="text-align: center; margin-bottom: 20px">Plan menija</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              ${columns
                .filter((col) => col.name !== 'actions')
                .map(
                  (col) =>
                    `<th style="border: 1px solid black; padding: 8px; text-align: left;">${col.label}</th>`,
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${menus.value
              .map(
                (menu) => `
              <tr>
                ${columns
                  .filter((col) => col.name !== 'actions')
                  .map(
                    (col) =>
                      `<td style="border: 1px solid black; padding: 8px;">${menu[col.field] || ''}</td>`,
                  )
                  .join('')}
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      `

  // Create a temporary div element to hold the table HTML
  const element = document.createElement('div')
  element.id = 'printable-menu' // Ensure the ID is set
  element.innerHTML = tableHTML
  document.body.appendChild(element) // Append to the body so html2pdf can find it

  const opt = {
    margin: 10,
    filename: 'plan_menija.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  html2pdf().set(opt).from(element).save()

  // Clean up: remove the temporary element after printing
  document.body.removeChild(element)
}

// Stanje tablice s menijima
const menus = ref([])

// Kolone za tablicu
const columns = [
  {
    name: 'Datum_marende',
    label: 'Datum',
    field: 'Datum_marende',
    align: 'left',
    sortable: true,
  },
  {
    name: 'Juha_m1',
    label: 'Juha (Marenda 1)',
    field: 'Juha_m1',
    align: 'left',
    sortable: true,
  },
  {
    name: 'Glavno_jelo_m1',
    label: 'Glavno jelo (Marenda 1)',
    field: 'Glavno_jelo_m1',
    align: 'left',
    sortable: true,
  },
  {
    name: 'Salata_m1',
    label: 'Salata (Marenda 1)',
    field: 'Salata_m1',
    align: 'left',
    sortable: true,
  },
  {
    name: 'Juha_m2',
    label: 'Juha (Marenda 2)',
    field: 'Juha_m2',
    align: 'left',
    sortable: true,
  },
  {
    name: 'Glavno_jelo_m2',
    label: 'Glavno jelo (Marenda 2)',
    field: 'Glavno_jelo_m2',
    align: 'left',
    sortable: true,
  },
  {
    name: 'Salata_m2',
    label: 'Salata (Marenda 2)',
    field: 'Salata_m2',
    align: 'left',
    sortable: true,
  },
  {
    name: 'username',
    label: 'Korisnik',
    field: 'username',
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'Akcije', field: 'actions', align: 'center' },
]

// Paginacija za tablicu
const pagination = ref({
  rowsPerPage: 10,
})

const isFutureDate = (date) => {
  const today = dayjs().format('YYYY-MM-DD')
  return date >= today
}

const fetchMenus = async () => {
  try {
    const response = await fetch('http://192.168.1.10:3000/menu/history', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Greška pri dohvaćanju menija: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('API podaci:', data)

    const groupedMenus = data.reduce((acc, menu) => {
      const date = menu.Datum.slice(0, 10)
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

      if (menu.marenda === 'Marenda1') {
        acc[date].Juha_m1 = menu.Juha || ''
        acc[date].Glavno_jelo_m1 = menu.Glavno_jelo_m1 || ''
        acc[date].Salata_m1 = menu.Salata_m1 || ''
      } else if (menu.marenda === 'Marenda2') {
        acc[date].Juha_m2 = menu.Juha || ''
        acc[date].Glavno_jelo_m2 = menu.Glavno_jelo_m2 || ''
        acc[date].Salata_m2 = menu.Salata_m2 || ''
      }

      acc[date].username = menu.username || ''
      acc[date].ID_kuhara = menu.ID_kuhara || ''

      return acc
    }, {})

    const transformed = Object.values(groupedMenus)
    console.log('Transformirani meniji:', transformed)
    menus.value = transformed
    console.log('menus.value:', menus.value)
  } catch (error) {
    console.error(error.message)
    alert('Greška pri dohvaćanju menija: ' + error.message)
  }
}

const addMenuDialog = ref(false)
const addMenu = async () => {
  try {
    const datumZaSlanje = form.value.date // Šalji direktno bez konverzije
    console.log('Frontend Datum za slanje:', datumZaSlanje)

    const payload = {
      Datum_marende: datumZaSlanje,
      ID_kuhara: 2,
      username: 'marin',
      Juha_m1: form.value.juha_m1,
      Glavno_jelo_m1: form.value.glavno_jelo_m1,
      Salata_m1: form.value.salata_m1,
      Juha_m2: form.value.juha_m2,
      Glavno_jelo_m2: form.value.glavno_jelo_m2,
      Salata_m2: form.value.salata_m2,
    }
    console.log('Frontend Payload:', JSON.stringify(payload))

    const response = await fetch(`http://192.168.1.10:3000/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const responseData = await response.json()
      console.log('Meni uspješno dodan:', responseData)
      alert('Meni uspješno dodan!')

      // Resetiraj formu
      form.value = {
        date: dayjs().format('YYYY-MM-DD'),
        juha_m1: '',
        glavno_jelo_m1: '',
        salata_m1: '',
        juha_m2: '',
        glavno_jelo_m2: '',
        salata_m2: '',
      }
      addMenuDialog.value = false
      await fetchMenus() // Refresh table after adding menu
    } else {
      console.error('Greška pri dodavanju menija:', response.status, response.statusText)
      try {
        const errorData = await response.json()
        alert(
          `Greška pri dodavanju menija: ${response.status} - ${errorData.message || response.statusText}`,
        )
      } catch (jsonError) {
        console.error('Greška pri parsiranju JSON odgovora:', jsonError)
        alert(`Greška pri dodavanju menija: ${response.status} - ${response.statusText}`)
      }
    }
  } catch (error) {
    console.error('Error in addMenu:', error)
    alert('Došlo je do pogreške pri dodavanju menija.')
  }
}
// Dialog close
const closeTheGreatDialog = () => {
  console.log('closeTheGreatDialog pozvan')
  addMenuDialog.value = false
}

// Dialog cancel
const onDialogCancel = () => {
  form.value = {
    date: dayjs().format('YYYY-MM-DD'),
    juha_m1: '',
    glavno_jelo_m1: '',
    salata_m1: '',
    juha_m2: '',
    glavno_jelo_m2: '',
    salata_m2: '',
  }
}

// Open dialog
const openDialog = () => {
  console.log('openDialog pozvan')
  addMenuDialog.value = true
  console.log('addMenuDialog.value', addMenuDialog.value)
}

const editingCell = ref({ rowId: null, col: null })

// Mapa za praćenje promjena
const changesMap = ref({})

// Funkcija za dvoklik na ćeliju
function onCellDblClick(row, column) {
  console.log('onCellDblClick pozvan', row, column)
  if (['Datum_marende', 'username', 'ID_kuhara', 'actions'].includes(column.name)) {
    console.log('Polje nije dozvoljeno za uređivanje')
    return
  }
  editingCell.value = { rowId: row.Datum_marende, col: column.name }
  console.log('editingCell.value nakon dvoklika', editingCell.value)
}

// Funkcija za unos u ćeliju
function onCellInput(row, column, event) {
  console.log('onCellInput pozvan', row, column, event)
  let newVal = row[column.field]
  console.log('newVal', newVal)

  if (!changesMap.value[row.Datum_marende]) {
    changesMap.value[row.Datum_marende] = { ...row }
  }

  changesMap.value[row.Datum_marende][column.field] = newVal
  console.log('changesMap.value nakon unosa', changesMap.value)
}

// Funkcija za prekid uređivanja
function cancelEdit() {
  console.log('cancelEdit pozvan')
  editingCell.value = {}
  console.log('editingCell.value nakon cancelEdit', editingCell.value)
}

async function confirmUpdate() {
  console.log('confirmUpdate pozvan')
  if (!Object.keys(changesMap.value).length) {
    alert('Nema promjena za ažurirati.')
    return
  }

  if (!confirm('Jeste li sigurni za ažuriranje?')) return

  let successCount = 0
  let failCount = 0

  console.log('changesMap.value prije slanja', changesMap.value)

  for (const rowId in changesMap.value) {
    const updatedRow = { ...changesMap.value[rowId] }

    // Pripremi podatke za slanje
    const payload = {
      Datum_marende: updatedRow.Datum_marende,
      Juha_m1: updatedRow.Juha_m1,
      Glavno_jelo_m1: updatedRow.Glavno_jelo_m1,
      Salata_m1: updatedRow.Salata_m1,
      Juha_m2: updatedRow.Juha_m2,
      Glavno_jelo_m2: updatedRow.Glavno_jelo_m2,
      Salata_m2: updatedRow.Salata_m2,
      username: loggedInUser.value,
      ID_kuhara: userID.value,
    }
    // Log the date being sent from frontend
    console.log('Datum_marende koji se šalje s frontenda:', payload.Datum_marende)
    console.log('payload prije slanja', payload)
    const url = `http://192.168.1.10:3000/menu/fresh`

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        successCount++
        const index = menus.value.findIndex((r) => r.Datum_marende === rowId)
        if (index !== -1) {
          menus.value[index] = {
            ...menus.value[index],
            ...updatedRow,
          }
        }
      } else {
        failCount++
        const errMsg = await response.json()
        alert(`Greška kod datuma ${rowId}: ${errMsg.message}`)
      }
    } catch (err) {
      failCount++
      alert(`Neuspješno slanje za datum ${rowId}: ${err.message}`)
    }
  }

  // Osvježi podatke nakon svih pokušaja ažuriranja
  await fetchMenus()

  alert(`Uspješno ažurirano: ${successCount}, Neuspješno: ${failCount}.`)
  changesMap.value = {}
  editingCell.value = {}
  console.log('changesMap.value nakon ažuriranja', changesMap.value)
  console.log('editingCell.value nakon ažuriranja', editingCell.value)
}

const deleteMenu = async (menu) => {
  try {
    const confirmDelete = confirm('Jeste li sigurni da želite obrisati meni?')
    if (confirmDelete) {
      const url = `http://192.168.1.10:3000/menu/delete?datum=${menu.Datum_marende}`
      console.log('URL za brisanje:', url)
      const response = await fetch(url, {
        method: 'DELETE',
      })
      if (response.ok) {
        alert('Meni uspješno obrisan!')
        await fetchMenus() // Ensure table refresh after delete
      } else {
        throw new Error('Greška pri brisanju menija')
      }
    }
  } catch (error) {
    console.error(error.message)
    alert('Greška pri brisanju menija')
  }
}

const router = useRouter()
//logout:
const logout = () => {
  // Briši podatke iz localStorage
  localStorage.removeItem('loggedInUser')
  localStorage.removeItem('userID')
  // Preusmeri na početnu ili login stranicu
  router.push('/login_chef')
}
const loadUserData = () => {
  loggedInUser.value = localStorage.getItem('loggedInUser')
  userID.value = localStorage.getItem('userID')
}

onMounted(() => {
  fetchMenus()
  loadUserData()

  // Ako korisnik nije prijavljen, preusmjeri na login
  if (!loggedInUser.value) {
    router.push('/')
  }
})

// Učitaj podatke i kada se komponenta vrati u fokus (npr. povratak iz drugog taba)
onMounted(() => {
  window.addEventListener('focus', loadUserData)
})

//make it accessible to the template
defineExpose({
  form,
  menus,
  columns,
  pagination,
  addMenu,
  deleteMenu,
  isFutureDate,
  editingCell,
  changesMap,
  onCellDblClick,
  onCellInput,
  cancelEdit,
  confirmUpdate,
  addMenuDialog,
  openDialog,
  onDialogCancel,
  closeTheGreatDialog,
  loggedInUser,
  userID,
  router,
  logout,
  printPDF,
  dayjs,
})
</script>

<style>
.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}

.styled-table th,
.styled-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.styled-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.button-group .q-btn {
  margin-right: 10px; /* Adjust the spacing as needed */
}
</style>
