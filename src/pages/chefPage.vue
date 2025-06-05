<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Pregled podataka o kuharima</div>
      </q-card-section>

      <q-card-section>
        <q-btn @click="showAddChefDialog" label="Dodaj Kuhara" color="primary" class="q-mb-md" />
        <q-table :rows="filteredChefs" :columns="columns" row-key="ID_kuhara">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" align="center">
              <q-btn flat round icon="edit" color="primary" @click="editChef(props.row)" />
              <q-btn
                flat
                round
                icon="delete"
                color="red"
                @click="deleteChef(props.row.ID_kuhara)"
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
          <div class="text-h6">{{ isEditing ? 'Uredi Kuhara' : 'Dodaj Kuhara' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="isEditing ? updateChef() : addChef()">
            <q-input filled v-model="form.Ime_kuhara" label="Ime" required />
            <q-input filled v-model="form.Prezime_kuhara" label="Prezime" required />
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

// Podaci kuhar
const chefs = ref([])

const form = ref({
  ID_kuhar: '',
  Ime_kuhar: '',
  Prezime_kuhar: '',
})

const isEditing = ref(false)
const isDialogOpen = ref(false)

// Definicija kolona za tabelu
const columns = [
  { name: 'ID_kuhara', label: 'ID kuhara', field: 'ID_kuhara', align: 'left' },
  { name: 'Ime_kuhara', label: 'Ime', field: 'Ime_kuhara', align: 'left' },
  { name: 'Prezime_kuhara', label: 'Prezime', field: 'Prezime_kuhara', align: 'left' },
  { name: 'actions', label: 'Akcije', align: 'center', sortable: false },
]

// Dohvaćanje svih kuhara iz API-ja
const fetchChefs = async () => {
  try {
    const response = await axios.get('http://localhost:3000/chef')
    chefs.value = response.data
  } catch (error) {
    console.error('Greška prilikom dohvaćanja kuhara:', error)
  }
}

// Filtrirane kuhari
const filteredChefs = computed(() => chefs.value)

// Prikaz modala za dodavanje
const showAddChefDialog = () => {
  isEditing.value = false
  form.value = {
    ID_kuhara: '',
    Ime_kuhara: '',
    Prezime_kuhara: '',
  }
  isDialogOpen.value = true
}
const editChef = (chef) => {
  isEditing.value = true
  form.value = { ...chef }
  isDialogOpen.value = true
}

// Dodavanje novog kuhara
const addChef = async () => {
  try {
    await axios.post('http://localhost:3000/chef', form.value)
    await fetchChefs()
    closeDialog()
  } catch (error) {
    console.error('Greška prilikom dodavanja kuhara:', error)
  }
}

// Ažuriranje podataka kuhara
const updateChef = async () => {
  try {
    await axios.put(`http://localhost:3000/chef/${form.value.ID_kuhara}`, form.value)
    await fetchChefs()
    closeDialog()
  } catch (error) {
    console.error('Greška prilikom ažuriranja kuhara:', error)
  }
}

// Brisanje kuhara
const deleteChef = async (id) => {
  if (confirm('Jeste li sigurni da želite izbrisati ovog kuhara?')) {
    try {
      await axios.delete(`http://localhost:3000/chef/${id}`)
      await fetchChefs()
    } catch (error) {
      console.error('Greška prilikom brisanja kuhara:', error)
      alert('Došlo je do greške prilikom brisanja.')
    }
  }
}

// Zatvaranje dijaloškog prozora
const closeDialog = () => {
  isDialogOpen.value = false
}

// Pri pokretanju dohvaća sve kuhare
onMounted(fetchChefs)
</script>
