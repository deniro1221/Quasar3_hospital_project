<template>
  <q-page padding>
    <div class="row">
      <div class="col-12 col-md-6">
        <!-- Gumb za otvaranje dijaloškog okvira za unos -->
        <q-btn label="Unesi novi jelovnik" color="primary" @click="otvoriUnosDijalog" />
      </div>

      <div class="col-12 col-md-6">
        <!-- Povijest Jelovnika -->
        <div class="q-pa-md">
          <h4>Menu History</h4>
          <q-table :rows="rows" :columns="columns" row-key="Datum" class="my-table" flat />
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

    <!-- Dialog za aktivni meni -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6" v-if="dialogMode === 'pregled'">Aktivni meni</div>
          <div class="text-h6" v-else-if="dialogMode === 'brisanje'">
            Jeste li sigurni da želite obrisati meni za datum
            {{ datumAktivnogMenija.Datum_marende }}?
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Sadržaj za Pregled -->
          <div v-if="dialogMode === 'pregled'">
            <p><strong>Datum:</strong> {{ datumAktivnogMenija.Datum_marende }}</p>
            <q-input v-model="datumAktivnogMenija.Datum_marende" label="Datum" readonly />

            <div class="row">
              <div class="col-6">
                <div class="text-subtitle1">Marenda 1</div>
                <q-input v-model="datumAktivnogMenija.Juha_m1" label="Juha" />
                <q-input v-model="datumAktivnogMenija.Glavno_jelo_m1" label="Glavno jelo" />
                <q-input v-model="datumAktivnogMenija.Salata_m1" label="Salata" />
              </div>
              <div class="col-6">
                <div class="text-subtitle1">Marenda 2</div>
                <q-input v-model="datumAktivnogMenija.Juha_m2" label="Juha" />
                <q-input v-model="datumAktivnogMenija.Glavno_jelo_m2" label="Glavno jelo" />
                <q-input v-model="datumAktivnogMenija.Salata_m2" label="Salata" />
              </div>
            </div>
          </div>
          <!-- Sadržaj za Brisanje -->
          <div v-else-if="dialogMode === 'brisanje'">
            <p>
              Ova akcija će trajno obrisati meni za odabrani datum. Jeste li sigurni da želite
              nastaviti?
            </p>
          </div>
        </q-card-section>

        <q-card-actions align="around">
          <q-btn label="Odustani" color="negative" @click="zatvoriDijalog" />
          <q-btn
            v-if="dialogMode === 'pregled'"
            label="Spremi"
            color="primary"
            @click="azurirajMeni"
          />
          <q-btn v-else-if="dialogMode === 'brisanje'" label="Obriši" color="primary" @click="obrisiMeni" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import axios from 'axios';

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

// Dialog control
const dialogVisible = ref(false);
const dialogMode = ref('pregled'); // 'pregled' ili 'brisanje'

// Active menu data
const datumAktivnogMenija = ref({
  Datum_marende: '',
  Juha_m1: '',
  Glavno_jelo_m1: '',
  Salata_m1: '',
  Juha_m2: '',
  Glavno_jelo_m2: '',
  Salata_m2: '',
});

// Povijest Jelovnika data
const columns = [
  { name: 'Datum', label: 'Datum', field: 'Datum', align: 'left', style: 'width: 150px' },
  { name: 'Marenda', label: 'Marenda', field: 'marenda', align: 'left' },
  { name: 'Kuhar', label: 'Kuhar', field: 'username', align: 'left' },
  { name: 'Juha', label: 'Juha', field: 'Juha', align: 'left' },
  { name: 'Glavno', label: 'Glavno jelo', field: 'Glavno_jelo', align: 'left' },
  { name: 'Salata', label: 'Salata', field: 'Salata', align: 'left' },
];

const rows = ref([]);

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

const otkrijAktivniMeni = async () => {
  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/today');
    const data = await response.json();

    if (data) {
      datumAktivnogMenija.value = {
        Datum_marende: data.Datum_marende,
        Juha_m1: data.Marenda1.Juha || '',
        Glavno_jelo_m1: data.Marenda1.Glavno_jelo || '',
        Salata_m1: data.Marenda1.Salata || '',
        Juha_m2: data.Marenda2.Juha || '',
        Glavno_jelo_m2: data.Marenda2.Glavno_jelo || '',
        Salata_m2: data.Marenda2.Salata || '',
      };
    } else {
      // Initialize if no data
      datumAktivnogMenija.value = {
        Datum_marende: getLocalDateFormatted(),
        Juha_m1: '',
        Glavno_jelo_m1: '',
        Salata_m1: '',
        Juha_m2: '',
        Glavno_jelo_m2: '',
        Salata_m2: '',
      };
    }
  } catch (err) {
    console.error('Greška:', err);
    showMessage('Greška pri učitavanju menija!', false);
  }
};

// Functions to open the dialog in different modes
const otvoriPregledDijalog = async () => {
  await otkrijAktivniMeni();
  dialogMode.value = 'pregled';
  dialogVisible.value = true;
};

const otvoriBrisanjeDijalog = async () => {
  await otkrijAktivniMeni();
  dialogMode.value = 'brisanje';
  dialogVisible.value = true;
};

const zatvoriDijalog = () => {
  dialogVisible.value = false;
};

// Funkcija za otvaranje dijaloškog okvira za unos
const otvoriUnosDijalog = () => {
  unosDijalog.value = true;
};

// ✅ Function to update active menu
const azurirajMeni = async () => {
  if (!confirm('Jeste li sigurni da želite ažurirati meni?')) return;

  const selectedDate = dayjs(datumAktivnogMenija.value.Datum_marende);
  if (selectedDate.isBefore(dayjs(), 'day')) {
    showMessage('Ne možete ažurirati meni za prošli datum!', false);
    return;
  }

  const ID_kuhara = localStorage.getItem('userID');
  if (!ID_kuhara) {
    showMessage('ID kuhara nije pronađen!', false);
    return;
  }

  // **GET USERNAME HERE - INSIDE THE FUNCTION**
  const username = localStorage.getItem('loggedInUser');
  if (!username) {
    showMessage('Korisničko ime nije pronađeno. Molimo prijavite se ponovo.', false);
    return;
  }

  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/fresh', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Datum_marende: datumAktivnogMenija.value.Datum_marende,
        Juha_m1: datumAktivnogMenija.value.Juha_m1,
        Glavno_jelo_m1: datumAktivnogMenija.value.Glavno_jelo_m1,
        Salata_m1: datumAktivnogMenija.value.Salata_m1,
        Juha_m2: datumAktivnogMenija.value.Juha_m2,
        Glavno_jelo_m2: datumAktivnogMenija.value.Glavno_jelo_m2,
        Salata_m2: datumAktivnogMenija.value.Salata_m2,
        ID_kuhara: ID_kuhara,
        username: username,
      }),
    });

    if (response.ok) {
      showMessage('Meni je ažuriran!', true);
      zatvoriDijalog();
      loadData(); // Refresh the history after updating
    } else {
      showMessage('Greška pri ažuriranju!', false);
    }
  } catch (err) {
    console.error('Greška:', err);
    showMessage('Greška na serveru!', false);
  }
};

const obrisiMeni = async () => {
  const datumZaBrisanje = datumAktivnogMenija.value.Datum_marende;

  const selectedDate = dayjs(datumZaBrisanje);
  if (selectedDate.isBefore(dayjs(), 'day')) {
    showMessage('Ne možete obrisati meni za prošli datum!', false);
    return;
  }

  if (!confirm(`Jeste li sigurni da želite obrisati meni za datum ${datumZaBrisanje}?`)) {
    return;
  }

  try {
    const response = await fetch(
      `https://backend-hospital-n9to.onrender.com/menu/delete?datum=${encodeURIComponent(
        datumZaBrisanje,
      )}`,
      { method: 'DELETE' },
    );

    if (response.ok) {
      showMessage('Meni je uspješno obrisan!', true);
      zatvoriDijalog();
      datumAktivnogMenija.value = {
        Datum_marende: '',
        Juha_m1: '',
        Glavno_jelo_m1: '',
        Salata_m1: '',
        Juha_m2: '',
        Glavno_jelo_m2: '',
        Salata_m2: '',
      };
      loadData(); // Refresh the history after deleting
    } else {
      const errorText = await response.text();
      console.error('Odgovor sa servera:', errorText);
      showMessage('Greška pri brisanju menija!', false);
    }
  } catch (err) {
    console.error('Greška:', err);
    showMessage('Greška na serveru!', false);
  }
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

// Load Povijest Jelovnika data
const loadData = async () => {
  try {
    const response = await axios.get('https://backend-hospital-n9to.onrender.com/menu/history');
    rows.value = response.data.map(item => ({
      Datum: new Date(item.Datum_marende).toLocaleDateString(),
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

loadData();
</script>

<style scoped>
.my-table {
  width: 100%;
  max-width: 100%;
}

.positive {
  color: green;
}

.negative {
  color: red;
}

.my-table td {
  font-weight: 600;
}

.my-table thead th {
  font-weight: 700;
}
</style>
