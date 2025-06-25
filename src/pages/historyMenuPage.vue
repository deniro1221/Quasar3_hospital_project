<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Povijest marendi</h1>
      <button
        @click="generatePDF"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
      >
        Preuzmi PDF
      </button>
    </div>

    <table class="min-w-full bg-white border border-gray-200 shadow-md rounded">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Datum
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Marenda 1
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Marenda 2
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Kuhar
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="(row, index) in meni" :key="index" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ row.Datum_marende }}</div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-900">
              <div v-if="row.Marenda1" class="leading-relaxed">
                <span class="font-semibold">🍲 Juha:</span> {{ row.Marenda1.Juha }}<br />
                <span class="font-semibold">🍛 Glavno:</span> {{ row.Marenda1.Glavno_jelo }}<br />
                <span class="font-semibold">🥗 Salata:</span> {{ row.Marenda1.Salata }}
              </div>
              <div v-else class="text-gray-400">N/A</div>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-900">
              <div v-if="row.Marenda2" class="leading-relaxed">
                <span class="font-semibold">🍲 Juha:</span> {{ row.Marenda2.Juha }}<br />
                <span class="font-semibold">🍛 Glavno:</span> {{ row.Marenda2.Glavno_jelo }}<br />
                <span class="font-semibold">🥗 Salata:</span> {{ row.Marenda2.Salata }}
              </div>
              <div v-else class="text-gray-400">N/A</div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ row.username }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const meni = ref([]);
let intervalId = null;

const fetchMeniji = async () => {
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
  }
};

// Automatsko osvježavanje svakih 10 sekundi
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

<style scoped>
/* This style is no longer needed, moved to Tailwind */
</style>
