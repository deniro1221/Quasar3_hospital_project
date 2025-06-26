<script setup>
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // Import the plugin
import axios from 'axios';
import { useQuasar } from 'quasar';

const $q = useQuasar()

dayjs.extend(isSameOrAfter); // Extend dayjs with the plugin

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
