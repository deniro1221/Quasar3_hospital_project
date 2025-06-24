<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Povijest marendi</h1>
    <table class="table-auto w-full border">
      <thead>
        <tr class="bg-gray-200">
          <th class="border px-4 py-2">Datum</th>
          <th class="border px-4 py-2">Marenda 1</th>
          <th class="border px-4 py-2">Marenda 2</th>
          <th class="border px-4 py-2">Kuhar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in meni" :key="index" class="border-t">
          <td class="border px-4 py-2">{{ row.Datum_marende }}</td>
          <td class="border px-4 py-2">
            <div v-if="row.Marenda1">
              Juha: {{ row.Marenda1.Juha }}<br />
              Glavno jelo: {{ row.Marenda1.Glavno_jelo }}<br />
              Salata: {{ row.Marenda1.Salata }}
            </div>
            <div v-else>N/A</div>
          </td>
          <td class="border px-4 py-2">
            <div v-if="row.Marenda2">
              Juha: {{ row.Marenda2.Juha }}<br />
              Glavno jelo: {{ row.Marenda2.Glavno_jelo }}<br />
              Salata: {{ row.Marenda2.Salata }}
            </div>
            <div v-else>N/A</div>
          </td>
          <td class="border px-4 py-2">{{ row.username }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const meni = ref([]);

const osvjeziMenije = async () => {
  try {
    const response = await fetch("https://backend-hospital-n9to.onrender.com/menu/history");
    const data = await response.json();

    const groupedData = [];

    data.forEach(row => {
      const date = row.Datum_marende.split("T")[0];
      const user = row.username;
      const key = `${date}-${user}`;
      const existing = groupedData.find(item => item.key === key);

      const marenda = {
        Juha: row.Juha,
        Glavno_jelo: row.Glavno_jelo,
        Salata: row.Salata
      };

      if (existing) {
        existing.Marenda2 = marenda;
      } else {
        groupedData.push({
          key,
          Datum_marende: date,
          Marenda1: marenda,
          Marenda2: null,
          username: user
        });
      }
    });

    meni.value = groupedData;
  } catch (error) {
    console.error("Greška prilikom dohvata menija:", error);
  }
};

onMounted(() => {
  osvjeziMenije();
});
</script>

<style scoped>
table {
  border-collapse: collapse;
}
th,
td {
  text-align: left;
}
</style>
