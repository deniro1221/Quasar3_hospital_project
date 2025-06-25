<template>
  <q-page padding>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Povijest marendi</h1>
      <q-btn color="primary" @click="generatePDF">Preuzmi PDF</q-btn>
    </div>

    <q-table
      title="Povijest marendi"
      :rows="meni"
      :columns="columns"
      row-key="key"
      :loading="loading"
      class="shadow-24"
    >
      <template v-slot:body-cell-Marenda1="props">
        <q-td :props="props">
          <div v-if="props.row.Marenda1" class="leading-relaxed">
            <span class="font-semibold">🍲 Juha:</span> {{ props.row.Marenda1.Juha }}<br />
            <span class="font-semibold">🍛 Glavno:</span> {{ props.row.Marenda1.Glavno_jelo }}<br />
            <span class="font-semibold">🥗 Salata:</span> {{ props.row.Marenda1.Salata }}
          </div>
          <div v-else class="text-gray-400">N/A</div>
        </q-td>
      </template>

      <template v-slot:body-cell-Marenda2="props">
        <q-td :props="props">
          <div v-if="props.row.Marenda2" class="leading-relaxed">
            <span class="font-semibold">🍲 Juha:</span> {{ props.row.Marenda2.Juha }}<br />
            <span class="font-semibold">🍛 Glavno:</span> {{ props.row.Marenda2.Glavno_jelo }}<br />
            <span class="font-semibold">🥗 Salata:</span> {{ props.row.Marenda2.Salata }}
          </div>
          <div v-else class="text-gray-400">N/A</div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const meni = ref([]);
const loading = ref(false); // Dodano za prikazivanje stanja učitavanja
let intervalId = null;

const columns = ref([
  { name: "Datum_marende", required: true, label: "Datum", align: "left", field: row => row.Datum_marende, format: val => val, sortable: true },
  { name: "Marenda1", label: "Marenda 1", align: "left", field: 'Marenda1' },
  { name: "Marenda2", label: "Marenda 2", align: "left", field: 'Marenda2' },
  { name: "username", label: "Kuhar", align: "left", field: row => row.username, format: val => val, sortable: true }
]);

const fetchMeniji = async () => {
  loading.value = true; // Postavi stanje učitavanja na true prije dohvaćanja podataka
  try {
    const response = await fetch("https://backend-hospital-n9to.onrender.com/menu/history");
    const data = await response.json();

    const grouped = [];

    data.forEach(row => {
      const date = row.Datum_marende.split("T")[0];
      const user = row.username;
      const key = `${date}-${user}`;

      const marenda = {
        Juha: row.Juha,
        Glavno_jelo: row.Glavno_jelo,
        Salata: row.Salata
      };

      const existing = grouped.find(entry => entry.key === key);
      if (existing) {
        existing.Marenda2 = marenda;
      } else {
        grouped.push({
          key,
          Datum_marende: date,
          Marenda1: marenda,
          Marenda2: null,
          username: user
        });
      }
    });

    meni.value = grouped;
  } catch (error) {
    console.error("Greška kod dohvaćanja menija:", error);
  } finally {
    loading.value = false; // Postavi stanje učitavanja na false nakon dohvaćanja podataka
  }
};

onMounted(() => {
  fetchMeniji();
  intervalId = setInterval(fetchMeniji, 10000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});

const generatePDF = () => {
  const doc = new jsPDF();
  doc.text("Povijest marendi", 14, 16);

  const body = meni.value.map(row => {
    const m1 = row.Marenda1
      ? `Juha: ${row.Marenda1.Juha}, Glavno: ${row.Marenda1.Glavno_jelo}, Salata: ${row.Marenda1.Salata}`
      : "N/A";

    const m2 = row.Marenda2
      ? `Juha: ${row.Marenda2.Juha}, Glavno: ${row.Marenda2.Glavno_jelo}, Salata: ${row.Marenda2.Salata}`
      : "N/A";

    return [row.Datum_marende, m1, m2, row.username];
  });

  autoTable(doc, {
    head: [["Datum", "Marenda 1", "Marenda 2", "Kuhar"]],
    body,
    startY: 20,
    styles: { fontSize: 8, cellWidth: 'auto' },
    columnStyles: {
      0: { cellWidth: 25 },   // Datum
      1: { cellWidth: 50 },   // Marenda 1
      2: { cellWidth: 50 },   // Marenda 2
      3: { cellWidth: 25 },    // Kuhar
    },
  });

  doc.save("povijest_marendi.pdf");
};
</script>
