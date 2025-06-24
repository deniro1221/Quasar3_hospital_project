<template>
  <q-page padding>
    <!-- Prikaz poruke -->
    <div v-if="message" :class="{ positive: isSuccess, negative: !isSuccess }">
      {{ message }}
    </div>

    <!-- Tablica za pregled menija -->
    <q-table
      title="Pregled Menija"
      :rows="meni"
      :columns="columns"
      row-key="Datum_menija"
      selection="multiple"
      v-model:selected.sync="selectedRows"
    >
      <template v-slot:top>
        <q-btn label="Osvježi" color="primary" @click="osvjeziMenije" />
        <q-btn label="PDF" color="secondary" @click="izveziSvePDF" style="margin-left: 10px" />
        <q-btn
          label="PDF Označeno"
          color="secondary"
          @click="izveziOznacenoPDF"
          style="margin-left: 10px"
        />
      </template>

          <template
        v-slot:body-cell-Datum_menija="props"
        :props="props"
      >
        <q-td key="props.row.Datum_menija" auto-width>
          {{ formatDate(props.row.Datum_marende) }}
        </q-td>
      </template>

      <template
        v-slot:body-cell-Marenda1="props"
        :props="props"
      >
        <q-td key="props.row.Datum_menija" auto-width>
          Juha: {{ props.row.Marenda1.Juha }}
          <br />
          Glavno Jelo: {{ props.row.Marenda1.Glavno_jelo }}
          <br />
          Salata: {{ props.row.Marenda1.Salata }}
        </q-td>
      </template>

      <template
        v-slot:body-cell-Marenda2="props"
        :props="props"
      >
        <q-td key="props.row.Datum_menija" auto-width>
          Juha: {{ props.row.Marenda2.Juha }}
          <br />
          Glavno Jelo: {{ props.row.Marenda2.Glavno_jelo }}
          <br />
          Salata: {{ props.row.Marenda2.Salata }}
        </q-td>
      </template>

          <template
        v-slot:body-cell-username="props"
        :props="props"
      >
        <q-td key="props.row.Datum_menija" auto-width>
          {{ props.row.username }}
        </q-td>
      </template>

      <template v-slot:bottom>
        <q-btn label="Nazad" color="primary" @click="goToChefPanel" />
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'
import { useRouter } from 'vue-router'
import { date } from 'quasar'

const router = useRouter()

const message = ref('')
const isSuccess = ref(false)
const meni = ref([]) // Svi meniji
const selectedRows = ref([]) // Označeni redovi
const goToChefPanel = () => {
  router.push('/chef_panel')
}
function showMessage(txt, success = true) {
  message.value = txt
  isSuccess.value = success
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// Kolone tablice
const columns = [
  { name: 'Datum_menija', label: 'Datum', align: 'left' },
  { name: 'Marenda1', label: 'Marenda 1', align: 'left' },
  { name: 'Marenda2', label: 'Marenda 2', align: 'left' },
  { name: 'username', label: 'Kuhar', align: 'left' },
]

// Dohvati meni sa servera
async function osvjeziMenije() {
  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/history') // API endpoint za sve menije
    const data = await response.json()
    if (Array.isArray(data)) {
      meni.value = data // ako je već niz
    } else if (data) {
      meni.value = [data] // ako je objekat, smjesti u niz
    } else {
      meni.value = [] // ako je null ili ništa
    }
  } catch (error) {
    showMessage('Greška pri učitavanju menija.', false, error)
  }
}

// Function to format the date
const formatDate = (value) => {
  return date.formatDate(value, 'DD.MM.YYYY')
}

function izveziSvePDF() {
  if (meni.value.length === 0) {
    showMessage('Nema podataka za ispis.', false)
    return
  }

  const tableHTML = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #333;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
    }
    h3 {
      margin-bottom: 15px;
    }
  </style>

  <h3>Svi meniji</h3>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Marenda 1</th>
        <th>Marenda 2</th>
        <th>Kuhar</th>
      </tr>
    </thead>
    <tbody>
      ${meni.value
        .map(
          (row) => `
        <tr>
          <td>${row.Datum_marende}</td>
          <td>${row.Marenda1.Juha}
          <br/>
          ${row.Marenda1.Glavno_jelo}
          <br/>
          ${row.Marenda1.Salata}
          </td>
          <td>${row.Marenda2.Juha}
          <br/>
          ${row.Marenda2.Glavno_jelo}
          <br/>
          ${row.Marenda2.Salata}</td>
          <td>${row.username}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>
`

  const container = document.createElement('div')
  container.innerHTML = tableHTML
  html2pdf().from(container).save()
}

function izveziOznacenoPDF() {
  if (selectedRows.value.length === 0) {
    showMessage('Niste označili nijedan red.', false)
    return
  }

  // Filtriraj samo označene redove
  const oznaceni = selectedRows.value

  const tableHTML = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #333;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
    }
    h3 {
      margin-bottom: 15px;
    }
  </style>

  <h3>Označeni meniji</h3>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Marenda 1</th>
        <th>Marenda 2</th>
        <th>Kuhar</th>
      </tr>
    </thead>
    <tbody>
      ${oznaceni
        .map(
          (row) => `
        <tr>
          <td>${row.Datum_marende}</td>
          <td>${row.Marenda1.Juha}
          <br/>
          ${row.Marenda1.Glavno_jelo}
          <br/>
          ${row.Marenda1.Salata}
          </td>
          <td>${row.Marenda2.Juha}
          <br/>
          ${row.Marenda2.Glavno_jelo}
          <br/>
          ${row.Marenda2.Salata}</td>
          <td>${row.username}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>
  `
  const container = document.createElement('div')
  container.innerHTML = tableHTML
  html2pdf().from(container).save()
}

onMounted(() => {
  osvjeziMenije()
})
</script>
<style scoped>
    .q-table {
      font-size: 16px; /* Increase the base font size for the table */
    }

    .q-table__title {
      font-size: 20px; /* Increase the title font size */
    }

    .q-table th {
      font-size: 14px;      /* Increase header font size */
      font-weight: bold; /* Make header text bold */
      background-color: #f2f2f2; /* Add a subtle background color */
      padding: 12px 8px; /* Increase header padding */
      text-transform: capitalize; /* Capitalize the text */
    }
      .q-table td {
      padding: 10px 8px; /* Increase cell padding */
      border-bottom: 1px solid #ddd; /* Add a subtle border between rows */
    }

    .q-table tbody tr:hover {
      background-color: #f9f9f9; /* Add a subtle background color on hover */
      cursor: pointer; /* Change the cursor to a pointer */
    }
</style>
<template>
  <q-page padding>
    <!-- Prikaz poruke -->
    <div v-if="message" :class="{ positive: isSuccess, negative: !isSuccess }">
      {{ message }}
    </div>

    <!-- Tablica za pregled menija -->
    <q-table
      title="Pregled Menija"
      :rows="meni"
      :columns="columns"
      row-key="Datum_menija"
      selection="multiple"
      v-model:selected.sync="selectedRows"
    >
      <template v-slot:top>
        <q-btn label="Osvježi" color="primary" @click="osvjeziMenije" />
        <q-btn label="PDF" color="secondary" @click="izveziSvePDF" style="margin-left: 10px" />
        <q-btn
          label="PDF Označeno"
          color="secondary"
          @click="izveziOznacenoPDF"
          style="margin-left: 10px"
        />
      </template>

      <template
        v-slot:body-cell-Datum_menija="props"
        :props="props"
      >
        <q-td key="props.row.Datum_menija" auto-width>
          {{ formatDate(props.row.Datum_marende) }}
        </q-td>
      </template>

      <template
        v-slot:body-cell-Marenda1="props"
        :props="props"
      >
        <q-td key="props.row.Datum_menija" auto-width>
          <template v-if="props.row.Marenda1">
            Juha: {{ props.row.Marenda1.Juha }}
            <br />
            Glavno Jelo: {{ props.row.Marenda1.Glavno_jelo }}
            <br />
            Salata: {{ props.row.Marenda1.Salata }}
          </template>
          <template v-else>
            N/A
          </template>
        </q-td>
      </template>

      <template
        v-slot:body-cell-Marenda2="props"
        :props="props"
      >
        <q-td key="props.row.Datum_menija" auto-width>
          <template v-if="props.row.Marenda2">
            Juha: {{ props.row.Marenda2.Juha }}
            <br />
            Glavno Jelo: {{ props.row.Marenda2.Glavno_jelo }}
            <br />
            Salata: {{ props.row.Marenda2.Salata }}
          </template>
          <template v-else>
            N/A
          </template>
        </q-td>
      </template>

      <template
        v-slot:body-cell-username="props"
        :props="props"
      >
        <q-td key="props.row.Datum_menija" auto-width>
          {{ props.row.username }}
        </q-td>
      </template>

      <template v-slot:bottom>
        <q-btn label="Nazad" color="primary" @click="goToChefPanel" />
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import html2pdf from 'html2pdf.js';
import { useRouter } from 'vue-router';
import { date } from 'quasar';

const router = useRouter();

const message = ref('');
const isSuccess = ref(false);
const meni = ref([]); // Svi meniji
const selectedRows = ref([]); // Označeni redovi
const goToChefPanel = () => {
  router.push('/chef_panel');
};
function showMessage(txt, success = true) {
  message.value = txt;
  isSuccess.value = success;
  setTimeout(() => {
    message.value = '';
  }, 3000);
}

// Kolone tablice
const columns = [
  { name: 'Datum_menija', label: 'Datum', align: 'left' },
  { name: 'Marenda1', label: 'Marenda 1', align: 'left' },
  { name: 'Marenda2', label: 'Marenda 2', align: 'left' },
  { name: 'username', label: 'Kuhar', align: 'left' },
];

// Dohvati meni sa servera
async function osvjeziMenije() {
  try {
    const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/history'); // API endpoint za sve menije
    const data = await response.json();
    if (Array.isArray(data)) {
      meni.value = data; // ako je već niz
    } else if (data) {
      meni.value = [data]; // ako je objekat, smjesti u niz
    } else {
      meni.value = []; // ako je null ili ništa
    }
  } catch (error) {
    showMessage('Greška pri učitavanju menija.', false, error);
  }
}

// Function to format the date
const formatDate = (value) => {
  return date.formatDate(value, 'DD.MM.YYYY');
};

function izveziSvePDF() {
  if (meni.value.length === 0) {
    showMessage('Nema podataka za ispis.', false);
    return;
  }

  const tableHTML = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #333;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
    }
    h3 {
      margin-bottom: 15px;
    }
  </style>

  <h3>Svi meniji</h3>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Marenda 1</th>
        <th>Marenda 2</th>
        <th>Kuhar</th>
      </tr>
    </thead>
    <tbody>
      ${meni.value
        .map(
          (row) => `
        <tr>
          <td>${row.Datum_marende}</td>
          <td>
            ${row.Marenda1 ? `Juha: ${row.Marenda1.Juha}<br/>Glavno jelo: ${row.Marenda1.Glavno_jelo}<br/>Salata: ${row.Marenda1.Salata}` : 'N/A'}
          </td>
          <td>
            ${row.Marenda2 ? `Juha: ${row.Marenda2.Juha}<br/>Glavno jelo: ${row.Marenda2.Glavno_jelo}<br/>Salata: ${row.Marenda2.Salata}` : 'N/A'}
          </td>
          <td>${row.username}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>
`;

  const container = document.createElement('div');
  container.innerHTML = tableHTML;
  html2pdf().from(container).save();
}

function izveziOznacenoPDF() {
  if (selectedRows.value.length === 0) {
    showMessage('Niste označili nijedan red.', false);
    return;
  }

  // Filtriraj samo označene redove
  const oznaceni = selectedRows.value;

  const tableHTML = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #333;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
    }
    h3 {
      margin-bottom: 15px;
    }
  </style>

  <h3>Označeni meniji</h3>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Marenda 1</th>
        <th>Marenda 2</th>
        <th>Kuhar</th>
      </tr>
    </thead>
    <tbody>
      ${oznaceni
        .map(
          (row) => `
        <tr>
          <td>${row.Datum_marende}</td>
          <td>
            ${row.Marenda1 ? `Juha: ${row.Marenda1.Juha}<br/>Glavno jelo: ${row.Marenda1.Glavno_jelo}<br/>Salata: ${row.Marenda1.Salata}` : 'N/A'}
          </td>
          <td>
            ${row.Marenda2 ? `Juha: ${row.Marenda2.Juha}<br/>Glavno jelo: ${row.Marenda2.Glavno_jelo}<br/>Salata: ${row.Marenda2.Salata}` : 'N/A'}
          </td>
          <td>${row.username}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>
`;
  const container = document.createElement('div');
  container.innerHTML = tableHTML;
  html2pdf().from(container).save();
}

onMounted(() => {
  osvjeziMenije();
});
</script>

<style scoped>
.q-table {
  font-size: 16px; /* Increase the base font size for the table */
}

.q-table__title {
  font-size: 20px; /* Increase the title font size */
}

.q-table th {
  font-size: 14px; /* Increase header font size */
  font-weight: bold; /* Make header text bold */
  background-color: #f2f2f2; /* Add a subtle background color */
  padding: 12px 8px; /* Increase header padding */
  text-transform: capitalize; /* Capitalize the text */
}
.q-table td {
  padding: 10px 8px; /* Increase cell padding */
  border-bottom: 1px solid #ddd; /* Add a subtle border between rows */
}

.q-table tbody tr:hover {
  background-color: #f9f9f9; /* Add a subtle background color on hover */
  cursor: pointer; /* Change the cursor to a pointer */
}
</style>
