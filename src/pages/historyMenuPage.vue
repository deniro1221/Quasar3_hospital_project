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
        <q-td :props="props" class="q-pa-md">
          <div v-if="props.row.Marenda1">
            <q-table
              :rows="[
                { jelo: 'Juha', sastojak: props.row.Marenda1.Juha },
                { jelo: 'Glavno jelo', sastojak: props.row.Marenda1.Glavno_jelo },
                { jelo: 'Salata', sastojak: props.row.Marenda1.Salata }
              ]"
              :columns="[
                { name: 'jelo', label: 'Jelo', field: 'jelo' },
                { name: 'sastojak', label: 'Sastojak', field: 'sastojak' }
              ]"
              row-key="jelo"
              dense
              flat
              bordered
            />
          </div>
          <div v-else class="text-gray-400">N/A</div>
        </q-td>
      </template>

      <template v-slot:body-cell-Marenda2="props">
        <q-td :props="props" class="q-pa-md">
          <div v-if="props.row.Marenda2">
            <q-table
              :rows="[
                { jelo: 'Juha', sastojak: props.row.Marenda2.Juha },
                { jelo: 'Glavno jelo', sastojak: props.row.Marenda2.Glavno_jelo },
                { jelo: 'Salata', sastojak: props.row.Marenda2.Salata }
              ]"
              :columns="[
                { name: 'jelo', label: 'Jelo', field: 'jelo' },
                { name: 'sastojak', label: 'Sastojak', field: 'sastojak' }
              ]"
              row-key="jelo"
              dense
              flat
              bordered
            />
          </div>
          <div v-else class="text-gray-400">N/A</div>
        </q-td>
      </template>

      <template v-slot:body-cell-Datum_marende="props">
        <q-td :props="props">
          {{ props.row.Datum_marende }}
        </q-td>
      </template>

      <template v-slot:body-cell-username="props">
        <q-td :props="props">
          {{ props.row.username }}
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
  doc.text("Povijest marendi", 14, 16);

  const body = [];

  meni.value.forEach(row => {
    const marenda1 = row.Marenda1
      ? [
        `Juha: ${row.Marenda1.Juha}`,
        `Glavno: ${row.Marenda1.Glavno_jelo}`,
        `Salata: ${row.Marenda1.Salata}`
      ]
      : ["N/A"];

    const marenda2 = row.Marenda2
      ? [
        `Juha: ${row.Marenda2.Juha}`,
        `Glavno: ${row.Marenda2.Glavno_jelo}`,
        `Salata: ${row.Marenda2.Salata}`
      ]
      : ["N/A"];

    body.push([row.Datum_marende, ...marenda1, ...marenda2, row.username]);
  });

  autoTable(doc, {
    head: [["Datum", "Marenda 1 - Juha", "Marenda 1 - Glavno", "Marenda 1 - Salata", "Marenda 2 - Juha", "Marenda 2 - Glavno", "Marenda 2 - Salata", "Kuhar"]],
    body,
    startY: 20,
    styles: { fontSize: 8, cellWidth: 'auto' },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
      6: { cellWidth: 30 },
      7: { cellWidth: 22 },
    },
  });

  doc.save("povijest_marendi.pdf");
};
</script>
