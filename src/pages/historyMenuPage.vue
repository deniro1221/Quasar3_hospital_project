<template>
  <q-page padding>
    <div class="row">
      <div class="col-12 text-left">
        <!-- Gumb za otvaranje dijaloškog okvira za unos -->
        <q-btn label="Unesi novi jelovnik" color="primary" @click="otvoriUnosDijalog" />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <!-- Povijest Jelovnika -->
        <div class="q-pa-md">
          <h4>Menu History</h4>
          <q-table :rows="filteredRows" :columns="columns" row-key="Datum" class="my-table" flat>
            <template v-slot:body-cell="props">
              <q-td :props="props">
                <div v-if="isEditing(props.row, props.col)">
                  <q-input
                    v-model="props.row[props.col.field]"
                    borderless
                    dense
                    autofocus
                    @keyup.enter="stopEditing(props.row, props.col)"
                    @blur="stopEditing(props.row, props.col)"
                  />
                </div>
                <div v-else @click="startEditing(props.row, props.col)">
                  {{ props.value }}
                </div>
              </q-td>
            </template>
          </q-table>
          <q-btn label="Osvježi podatke" color="primary" @click="loadData" class="q-mt-md" />
        </div>
      </div>
    </div>

    <!-- Dijaloški okvir za unos jelovnika -->
    <q-dialog v-model="unosDijalog">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Unos novog jelovnika</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="submitManual">
            <q-input v-model="datum" type="date" label="Odaberite datum" />

            <div class="row">
              <div class="col-6">
                <div class="text-subtitle1">Marenda 1</div>
                <q-input v-model="juha_m1" label="Juha" required />
                <q-input v-model="glavno_jelo_m1" label="Glavno jelo" required />
                <q-input v-model="salata_m1" label="Salata" required />
              </div>
              <div class="col-6">
                <div class="text-subtitle1">Marenda 2</div>
                <q-input v-model="juha_m2" label="Juha" required />
                <q-input v-model="glavno_jelo_m2" label="Glavno jelo" required />
                <q-input v-model="salata_m2" label="Salata" required />
              </div>
            </div>

            <div class="q-mt-md" style="display: flex; gap: 10px">
              <q-btn label="Spremi" type="submit" color="primary" />
              <q-btn label="Odustani" type="button" color="red" @click="odustani" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Zatvori" color="primary" @click="unosDijalog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // Import the plugin
import axios from 'axios';

dayjs.extend(isSameOrAfter); // Extend dayjs - VERY IMPORTANT

const router = useRouter();

// Messages and states
const message = ref('');
const isSuccess = ref(false);

// ✅ Function to get the local date in the format yyyy-mm-dd
function getLocalDateFormatted() {
  return dayjs().format('YYYY-MM-DD');
}

function showMessage(txt, success = true) {
  message.value = txt;
  isSuccess.value = success;
  setTimeout(() => {
    message.value = '';
  }, 3000);
}

// Initial data for Unos/Uređivanje
const datum = ref(getLocalDateFormatted());
const juha_m1 = ref('');
const glavno_jelo_m1 = ref('');
const salata_m1 = ref('');
const juha_m2 = ref('');
const glavno_jelo_m2 = ref('');
const salata_m2 = ref('');
const idKuhara = localStorage.getItem('userID');

// Dijaloški okvir za unos
const unosDijalog = ref(false);

// In-cell editing state
const editingCell = ref(null); // { row: rowObject, col: columnObject }

// Povijest Jelovnika data
const columns = [
  { name: 'Datum', label: 'Datum', field: 'Datum', align: 'left', style: 'width: 150px' },
  { name: 'Marenda', label: 'Marenda', field: 'marenda', align: 'left' },
  { name: 'Kuhar', label: 'Kuhar', field: 'username', align: 'left' },
  { name: 'Juha', label: 'Juha', field: 'Juha', align: 'left' },
  { name: 'Glavno_jelo', label: 'Glavno jelo', field: 'Glavno_jelo', align: 'left' },
  { name: 'Salata', label: 'Salata', field: 'Salata', align: 'left' },
];

const rows = ref([]);

const filteredRows = computed(() => {
  const today = dayjs().format('YYYY-MM-DD');
  return rows.value.filter(row => dayjs(row.Datum).isSameOrAfter(today, 'day'));
});

const startEditing = (row, col) => {
  editingCell.value = { row, col };
};

const stopEditing = async (row, col) => {
  editingCell.value = null;

  // Perform API update here (replace with your actual API endpoint)
  try {
    await axios.put(`https://backend-hospital-n9to.onrender.com/menu/fresh`, {
      Datum_marende: row.Datum, // Assuming row.Datum contains the date
      [col.field]: row[col.field],  // Dynamically update the changed field
    });
    showMessage('Meni je ažuriran!', true);
    loadData(); // Refresh data
  } catch (error) {
    console.error('Greška pri ažuriranju menija:', error);
    showMessage('Greška na serveru!', false);
  }
};

const isEditing = (row, col) => {
  return editingCell.value && editingCell.value.row === row && editingCell.value.col === col;
};

// ✅ Function to submit manual
const submitManual = async () => {
  const today = dayjs();
  const selectedDate = dayjs(datum.value);

  if (selectedDate.isBefore(today, 'day')) {
    showMessage('Ne možete unijeti meni za prošli datum.', false);
    return;
  }

  const username = localStorage.getItem('loggedInUser');
  if (!username) {
    showMessage('Korisničko ime nije pronađeno. Molimo prijavite se ponovo.', false);
    return;
  }

  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Datum_marende: datum.value,
        Juha_m1: juha_m1.value,
        Glavno_jelo_m1: glavno_jelo_m1.value,
        Salata_m1: salata_m1.value,
        Juha_m2: juha_m2.value,
        Glavno_jelo_m2: glavno_jelo_m2.value,
        Salata_m2: salata_m2.value,
        ID_kuhara: idKuhara,
        username: username,
      }),
    });

    if (response.ok) {
      showMessage('Jelovnik uspješno spremljen!', true);
      // Reset the fields
      juha_m1.value = '';
      glavno_jelo_m1.value = '';
      salata_m1.value = '';
      juha_m2.value = '';
      glavno_jelo_m2.value = '';
      salata_m2.value = '';
      loadData(); // Refresh the history after submitting
      unosDijalog.value = false; // Zatvori dijaloški okvir nakon spremanja
    } else {
      showMessage('Greška pri unosu!', false);
    }
  } catch (error) {
    console.error('Greška:', error);
    showMessage('Greška na serveru.', false);
  }
};

// Load Povijest Jelovnika data
const loadData = async () => {
    try {
        const response = await axios.get('https://backend-hospital-n9to.onrender.com/menu/history');
        console.log("API Response:", response.data); // <--- ADD THIS LINE
        rows.value = response.data.map(item => ({
            Datum: dayjs(item.Datum_marende).format('YYYY-MM-DD'), // Format the date
            marenda: item.marenda,
            username: item.username,
            Juha: item.Juha,
            Glavno_jelo: item.Glavno_jelo,
            Salata: item.Salata,
        }));
    } catch (error) {
        console.error('Greška pri dohvaćanju podataka:', error);
    }
};

const otvoriUnosDijalog = () => {
  unosDijalog.value = true;
};

const natrag = () => {
  router.push('/chef_panel');
};

const odustani = () => {
  juha_m1.value = '';
  glavno_jelo_m1.value = '';
  salata_m1.value = '';
  juha_m2.value = '';
  glavno_jelo_m2.value = '';
  salata_m2.value = '';
};

loadData();
</script>

<style scoped>
.my-table {
  width: auto;
  max-width: none;
}

.my-table td {
  font-weight: 600;
}

.my-table thead th {
  font-weight: 700;
}
</style>
