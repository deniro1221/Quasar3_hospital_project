<template v-slot:body-cell-Marenda1="props">
  <q-td :props="props" class="q-pa-md">
    <div v-if="props.row.Marenda1">
      <table class="w-full text-base table-fixed border border-gray-400 rounded-lg overflow-hidden">
        <thead class="bg-gray-200 text-center font-medium text-lg">
          <tr>
            <th class="p-4 border border-gray-400">Jelo</th>
            <th class="p-4 border border-gray-400">Sastojak</th>
          </tr>
        </thead>
        <tbody class="text-center">
          <tr>
            <td class="p-4 border border-gray-400">Juha</td>
            <td class="p-4 border border-gray-400">{{ props.row.Marenda1.Juha }}</td>
          </tr>
          <tr>
            <td class="p-4 border border-gray-400">Glavno jelo</td>
            <td class="p-4 border border-gray-400">{{ props.row.Marenda1.Glavno_jelo }}</td>
          </tr>
          <tr>
            <td class="p-4 border border-gray-400">Salata</td>
            <td class="p-4 border border-gray-400">{{ props.row.Marenda1.Salata }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-gray-400 text-center text-lg">N/A</div>
  </q-td>
</template>

<template v-slot:body-cell-Marenda2="props">
  <q-td :props="props" class="q-pa-md">
    <div v-if="props.row.Marenda2">
      <table class="w-full text-base table-fixed border border-gray-400 rounded-lg overflow-hidden">
        <thead class="bg-gray-200 text-center font-medium text-lg">
          <tr>
            <th class="p-4 border border-gray-400">Jelo</th>
            <th class="p-4 border border-gray-400">Sastojak</th>
          </tr>
        </thead>
        <tbody class="text-center">
          <tr>
            <td class="p-4 border border-gray-400">Juha</td>
            <td class="p-4 border border-gray-400">{{ props.row.Marenda2.Juha }}</td>
          </tr>
          <tr>
            <td class="p-4 border border-gray-400">Glavno jelo</td>
            <td class="p-4 border border-gray-400">{{ props.row.Marenda2.Glavno_jelo }}</td>
          </tr>
          <tr>
            <td class="p-4 border border-gray-400">Salata</td>
            <td class="p-4 border border-gray-400">{{ props.row.Marenda2.Salata }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-gray-400 text-center text-lg">N/A</div>
  </q-td>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const meni = ref([]);
const loading = ref(false);
let intervalId = null;

const columns = ref([
  { name: "Datum_marende", required: true, label: "Datum", align: "left", field: row => row.Datum_marende, format: val => val, sortable: true },
  { name: "Marenda1", label: "Marenda 1", align: "left", field: 'Marenda1' },
  { name: "Marenda2", label: "Marenda 2", align: "left", field: 'Marenda2' },
  { name: "username", label: "Kuhar", align: "left", field: row => row.username, format: val => val, sortable: true }
]);

const fetchMeniji = async () => {
  loading.value = true;
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
    loading.value = false;
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
  doc.setFontSize(12);
  doc.text("Povijest marendi", 14, 16);

  const body = [];

  meni.value.forEach(row => {
    const marenda1 = row.Marenda1
      ? [
          `Juha: ${row.Marenda1.Juha}`,
          `Glavno: ${row.Marenda1.Glavno_jelo}`,
          `Salata: ${row.Marenda1.Salata}`
        ]
      : ["N/A", "", ""];

    const marenda2 = row.Marenda2
      ? [
          `Juha: ${row.Marenda2.Juha}`,
          `Glavno: ${row.Marenda2.Glavno_jelo}`,
          `Salata: ${row.Marenda2.Salata}`
        ]
      : ["N/A", "", ""];

    body.push([row.Datum_marende, ...marenda1, ...marenda2, row.username]);
  });

  autoTable(doc, {
    head: [["Datum", "Marenda 1 - Juha", "Marenda 1 - Glavno", "Marenda 1 - Salata", "Marenda 2 - Juha", "Marenda 2 - Glavno", "Marenda 2 - Salata", "Kuhar"]],
    body,
    startY: 20,
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 },
      5: { cellWidth: 35 },
      6: { cellWidth: 35 },
      7: { cellWidth: 25 },
    },
  });

  doc.save("povijest_marendi.pdf");
};
</script>
