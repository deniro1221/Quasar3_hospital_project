<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Pregled podataka o sestrama</div>
      </q-card-section>

      <q-card-section>
        <q-btn @click="showAddNurseDialog" label="Dodaj Sestru" color="primary" class="q-mb-md" />
        <q-table :rows="filteredNurses" :columns="columns" row-key="ID_sestre" class="styled-table">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" align="center">
              <q-btn flat round icon="edit" color="primary" @click="editNurse(props.row)" />
              <q-btn
                flat
                round
                icon="delete"
                color="red"
                @click="deleteNurse(props.row.ID_sestre)"
              />
            </q-td>
          </template>
        </q-table>
        <!-- Dodavanje separator i gumba ispod tablice -->
        <q-separator class="q-my-md" />
        <div class="row justify-start">
          <q-btn label="Natrag" color="primary" to="/admin" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Ostatak vašeg modal prozora za dodavanje/uredivanje -->
    <q-dialog v-model="isDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Uredi Sestru' : 'Dodaj Sestru' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="isEditing ? updateNurse() : addNurse()">
            <q-input filled v-model="form.Ime_sestre" label="Ime" required />
            <q-input filled v-model="form.Prezime_sestre" label="Prezime" required />
             <q-input filled v-model="form.username" label="username" required />
            <q-input filled v-model="form.lozinka" label="lozinka" required />
            <div class="q-mt-md row justify-end q-gutter-sm">
              <q-btn type="submit" label="Spremi" color="primary" />
              <q-btn flat label="Odustani" color="warning" @click="closeDialog" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const nurses = ref([])
const form = ref({
  ID_sestre: '',
  Ime_sestre: '',
  Prezime_sestre: '',
  username: '',
  lozinka: '',
})
const isEditing = ref(false)
const isDialogOpen = ref(false)

// Definicija kolona za tabelu
const columns = [
  { name: 'ID_sestre', label: 'ID sestre', field: 'ID_sestre', align: 'left' },
  { name: 'Ime_sestre', label: 'Ime', field: 'Ime_sestre', align: 'left' },
  { name: 'Prezime_sestre', label: 'Prezime', field: 'Prezime_sestre', align: 'left' },
    { name: 'username', label: 'Korisničko ime', field: 'username', align: 'left' },
  { name: 'actions', label: 'Akcije', align: 'center', sortable: false },
]

// Dohvaćanje svih sestara iz API-ja
const fetchNurses = async () => {
  try {
    const response = await axios.get('https://backend-hospital-n9to.onrender.com/nurse')
    nurses.value = response.data
  } catch (error) {
    console.error('Greška prilikom dohvaćanja sestara:', error)
  }
}

// Filtrirane sestre
const filteredNurses = computed(() => nurses.value)

// Prikaz modala za dodavanje
const showAddNurseDialog = () => {
  isEditing.value = false
  form.value = {
    ID_sestre: '',
    Ime_sestre: '',
    Prezime_sestre: '',
        username: '',
    lozinka: '',
  }
  isDialogOpen.value = true
}

// Prikaz modala za uređivanje
const editNurse = (nurse) => {
  isEditing.value = true
  form.value = { ...nurse }
  isDialogOpen.value = true
}

// Dodavanje nove sestre
const addNurse = async () => {
  try {
    await axios.post('https://backend-hospital-n9to.onrender.com/nurse', form.value)
    await fetchNurses()
    closeDialog()
  } catch (error) {
    console.error('Greška prilikom dodavanja sestre:', error)
  }
}

// Ažuriranje sestre
const updateNurse = async () => {
  try {
    await axios.put(
      `https://backend-hospital-n9to.onrender.com/nurse/${form.value.ID_sestre}`,
      form.value,
    )
    await fetchNurses()
    closeDialog()
  } catch (error) {
    console.error('Greška prilikom ažuriranja sestre:', error)
  }
}

// Brisanje sestre
const deleteNurse = async (id) => {
  if (confirm('Jeste li sigurni da želite izbrisati ovu sestru?')) {
    try {
      await axios.delete(`https://backend-hospital-n9to.onrender.com/nurse/${id}`)
      await fetchNurses()
    } catch (error) {
      console.error('Greška prilikom brisanja sestre:', error)
      alert('Došlo je do greške prilikom brisanja.')
    }
  }
}

// Zatvori modal
const closeDialog = () => {
  isDialogOpen.value = false
}

// Dohvati podatke pri pokretanju
onMounted(fetchNurses)
</script>

<style scoped>
.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.styled-table thead tr {
  background-color: #009879;
  color: #ffffff;
  text-align: left;
}

.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #009879;
}
</style>
