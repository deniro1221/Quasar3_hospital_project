<script setup>
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar()

const unosDijalog = ref(false);
const datum = ref(dayjs().format('YYYY-MM-DD'));
const juha_m1 = ref(''), glavno_jelo_m1 = ref(''), salata_m1 = ref('');
const juha_m2 = ref(''), glavno_jelo_m2 = ref(''), salata_m2 = ref('');
const rows = ref([]);
const editingCell = ref(null);
const message = ref('');
const isSuccess = ref(false);
const loading = ref(false);
const apiUrl = 'https://backend-hospital-n9to.onrender.com'; // corrected api url

const columns = [
  { name: 'Datum', label: 'Datum', field: 'Datum', align: 'left' },
  { name: 'marenda', label: 'Marenda', field: 'marenda', align: 'left' },
  { name: 'username', label: 'Kuhar', field: 'username', align: 'left' },
  { name: 'Juha', label: 'Juha', field: 'Juha', align: 'left' },
  { name: 'Glavno_jelo', label: 'Glavno jelo', field: 'Glavno_jelo', align: 'left' },
  { name: 'Salata', label: 'Salata', field: 'Salata', align: 'left' },
];

const filteredRows = computed(() =>
  rows.value.filter(row => dayjs(row.Datum).isSameOrAfter(dayjs(), 'day'))
);

const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`${apiUrl}/menu/history`);
    rows.value = data;
  } catch (err) {
    console.error('Greška kod dohvata:', err);
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Failed to load data',
    })
  } finally {
    loading.value = false;
  }
};

const showMessage = (txt, success = true) => {
  message.value = txt;
  isSuccess.value = success;
  setTimeout(() => (message.value = ''), 3000);
};

const submitManual = async () => {
  const username = localStorage.getItem('loggedInUser');
  const ID_kuhara = localStorage.getItem('userID');
  try {
    await axios.post(`${apiUrl}/menu`, {
      Datum_marende: datum.value,
      Juha_m1: juha_m1.value,
      Glavno_jelo_m1: glavno_jelo_m1.value,
      Salata_m1: salata_m1.value,
      Juha_m2: juha_m2.value,
      Glavno_jelo_m2: glavno_jelo_m2.value,
      Salata_m2: salata_m2.value,
      ID_kuhara,
      username
    });
    showMessage('Jelovnik spremljen!');
    unosDijalog.value = false;
    loadData();
  } catch (err) {
    showMessage('Greška pri spremanju', false);
  }
};

const startEditing = (row, col) => editingCell.value = { row, col };
const isEditing = (row, col) => editingCell.value?.row === row && editingCell.value.col === col;

const stopEditing = async (row, col) => {
  editingCell.value = null;
  try {
    await axios.put(`${apiUrl}/menu/fresh`, {
      Datum_marende: row.Datum,
      [`${col.field}_m${row.marenda.endsWith('1') ? '1' : '2'}`]: row[col.field]
    });
    showMessage('Ažurirano');
    loadData();
  } catch (err) {
    showMessage('Greška kod ažuriranja', false);
  }
};

const otvoriUnosDijalog = () => unosDijalog.value = true;

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page padding>
    <q-btn label="Unesi novi jelovnik" color="primary" @click="otvoriUnosDijalog" />

    <q-table :rows="filteredRows" :columns="columns" row-key="Datum" class="q-mt-md" :loading="loading">
      <template v-slot:body-cell="props">
        <q-td :props="props">
          <div v-if="isEditing(props.row, props.col)" class="editing-cell">
            <q-input v-model="props.row[props.col.field]" dense autofocus
              @blur="stopEditing(props.row, props.col)" @keyup.enter="stopEditing(props.row, props.col)" />
          </div>
          <div v-else @click="startEditing(props.row, props.col)">
            {{ props.value }}
          </div>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="unosDijalog">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">Unos novog jelovnika</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="submitManual">
            <q-input v-model="datum" type="date" label="Datum" />
            <div class="row">
              <div class="col-6">
                <q-input v-model="juha_m1" label="Juha M1" />
                <q-input v-model="glavno_jelo_m1" label="Glavno jelo M1" />
                <q-input v-model="salata_m1" label="Salata M1" />
              </div>
              <div class="col-6">
                <q-input v-model="juha_m2" label="Juha M2" />
                <q-input v-model="glavno_jelo_m2" label="Glavno jelo M2" />
                <q-input v-model="salata_m2" label="Salata M2" />
              </div>
            </div>
            <q-btn label="Spremi" type="submit" color="primary" class="q-mt-md" />
          </q-form>
        </q-card-section>
        <q-card-actions>
          <q-btn flat label="Zatvori" @click="unosDijalog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

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

.editing-cell {
  background-color: #f0f0f0;
}
</style>
