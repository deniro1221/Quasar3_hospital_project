<template>
  <q-page padding>
    <!-- Message -->
    <div v-if="message" :class="{ positive: isSuccess, negative: !isSuccess }">
      {{ message }}
    </div>

    <!-- Main Form -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Unos/uređivanje jelovnika</div>
      </q-card-section>

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
          <q-btn label="Natrag" type="button" color="primary" @click="natrag" />
        </div>

        <div style="margin-top: 20px; display: flex; gap: 10px">
          <q-btn label="Prikaži aktivni meni" color="primary" @click="otkrijAktivniMeni" />
          <q-btn label="Obriši meni" color="negative" @click="otvoriDijalogBrisanje" />
        </div>
      </q-form>
    </q-card>

    <!-- Dialog for Active Menu -->
    <q-dialog v-model="dialogAktivniMeni" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Aktivni meni</div>
        </q-card-section>

        <q-card-section>
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
        </q-card-section>

        <q-card-actions align="around">
          <q-btn label="Odustani" color="negative" @click="dialogAktivniMeni = false" />
          <q-btn label="Spremi" color="primary" @click="azurirajMeni" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="dialogObrisiMeni" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            Jeste li sigurni da želite obrisati meni za datum
            {{ datumAktivnogMenija.Datum_marende }}?
          </div>
        </q-card-section>

        <q-card-actions align="around">
          <q-btn label="Odustani" color="negative" @click="dialogObrisiMeni = false" />
          <q-btn label="Obriši" color="primary" @click="obrisiMeni" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

const router = useRouter();

// ✅ Function to get the local date in the format yyyy-mm-dd
function getLocalDateFormatted() {
  return dayjs().format('YYYY-MM-DD');
}

// Messages and states
const message = ref('');
const isSuccess = ref(false);

function showMessage(txt, success = true) {
  message.value = txt;
  isSuccess.value = success;
  setTimeout(() => {
    message.value = '';
  }, 3000);
}

// Initial data
const datum = ref(getLocalDateFormatted()); // Date can now be changed
const juha_m1 = ref('');
const glavno_jelo_m1 = ref('');
const salata_m1 = ref('');
const juha_m2 = ref('');
const glavno_jelo_m2 = ref('');
const salata_m2 = ref('');
const idKuhara = localStorage.getItem('userID');

// Dialog and active menu
const dialogAktivniMeni = ref(false);
const datumAktivnogMenija = ref({
  Datum_marende: '',
  Juha_m1: '',
  Glavno_jelo_m1: '',
  Salata_m1: '',
  Juha_m2: '',
  Glavno_jelo_m2: '',
  Salata_m2: '',
});

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
    // Optionally, redirect to the login page:
    // router.push('/login');
    return; // Stop the submission
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
        username: username, // Use the username retrieved from localStorage
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
    } else {
      showMessage('Greška pri unosu!', false);
    }
  } catch (error) {
    console.error('Greška:', error);
    showMessage('Greška na serveru.', false);
  }
};

const otkrijAktivniMeni = async (openDialog = true) => {
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

    if (openDialog) {
      dialogAktivniMeni.value = true;
    }
  } catch (err) {
    console.error('Greška:', err);
    showMessage('Greška pri učitavanju menija!', false);
  }
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
        username: username.value
      }),
    });

    if (response.ok) {
      showMessage('Meni je ažuriran!', true);
      dialogAktivniMeni.value = false;
    } else {
      showMessage('Greška pri ažuriranju!', false);
    }
  } catch (err) {
    console.error('Greška:', err);
    showMessage('Greška na serveru!', false);
  }
};

const dialogObrisiMeni = ref(false); // Delete dialog
// Function to open delete dialog
const otvoriDijalogBrisanje = async () => {
  await otkrijAktivniMeni(false); // Do NOT open display active menu
  if (!datumAktivnogMenija.value.Datum_marende) {
    showMessage('Nema aktivnog menija za danas!', false);
    return;
  }

  const selectedDate = dayjs(datumAktivnogMenija.value.Datum_marende);
  if (selectedDate.isBefore(dayjs(), 'day')) {
    showMessage('Ne možete obrisati meni za prošli datum!', false);
    return;
  }

  dialogObrisiMeni.value = true;
};

// Function to delete menu
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
      dialogObrisiMeni.value = false;
      datumAktivnogMenija.value = {
        Datum_marende: '',
        Juha_m1: '',
        Glavno_jelo_m1: '',
        Salata_m1: '',
        Juha_m2: '',
        Glavno_jelo_m2: '',
        Salata_m2: '',
      };
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

// Function for the "Natrag" button
function natrag() {
  router.push('/chef_panel');
}

// Function for the "Odustani" button
function odustani() {
  juha_m1.value = '';
  glavno_jelo_m1.value = '';
  salata_m1.value = '';
  juha_m2.value = '';
  glavno_jelo_m2.value = '';
  salata_m2.value = '';
}
</script>

<style scoped>
.positive {
  color: green;
}

.negative {
  color: red;
}
</style>
