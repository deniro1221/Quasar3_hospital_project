<template>
  <q-page class="q-pa-md">
    <!-- Unos menija -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Dodaj meni</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="addMenu">
          <q-input
            v-model="form.date"
            type="date"
            label="Datum"
            :rules="[val => !!val || 'Datum je obavezan', val => isFutureDate(val) || 'Datum mora biti jednak ili veći od današnjeg']"
          />
          <q-input v-model="form.juha_m1" label="Juha (Marenda 1)" />
          <q-input v-model="form.glavno_jelo_m1" label="Glavno jelo (Marenda 1)" />
          <q-input v-model="form.salata_m1" label="Salata (Marenda 1)" />
          <q-input v-model="form.juha_m2" label="Juha (Marenda 2)" />
          <q-input v-model="form.glavno_jelo_m2" label="Glavno jelo (Marenda 2)" />
          <q-input v-model="form.salata_m2" label="Salata (Marenda 2)" />
          <q-btn type="submit" color="primary" label="Spremi meni" />
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Tablica za pregled menija -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Pregled menija</div>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="menus"
          :columns="columns"
          row-key="Datum_marende"
          :pagination="pagination"
        >
          <!-- Ažuriranje podataka -->
          <template v-slot:body-cell="props">
            <q-td :props="props">
              <div v-if="!props.row.editing">
                {{ props.value }}
              </div>
              <q-input
                v-else
                v-model="props.row[props.col.field]"
                @blur="updateMenu(props.row)"
                dense
                autofocus
              />
            </q-td>
          </template>

          <!-- Brisanje menija -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                @click="deleteMenu(props.row)"
                color="negative"
                label="Obriši"
                size="sm"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    // Stanje forme za unos menija
    const form = ref({
      date: new Date().toISOString().slice(0, 10),
      juha_m1: '',
      glavno_jelo_m1: '',
      salata_m1: '',
      juha_m2: '',
      glavno_jelo_m2: '',
      salata_m2: '',
    });

    // Stanje tablice s menijima
    const menus = ref([]);

    // Kolone za tablicu
    const columns = [
      { name: 'Datum_marende', label: 'Datum', field: 'Datum_marende', align: 'left', sortable: true },
      { name: 'Juha_m1', label: 'Juha (Marenda 1)', field: row => row.Marenda1.Juha, align: 'left', sortable: true },
      { name: 'Glavno_jelo_m1', label: 'Glavno jelo (Marenda 1)', field: row => row.Marenda1.Glavno_jelo, align: 'left', sortable: true },
      { name: 'Salata_m1', label: 'Salata (Marenda 1)', field: row => row.Marenda1.Salata, align: 'left', sortable: true },
      { name: 'Juha_m2', label: 'Juha (Marenda 2)', field: row => row.Marenda2.Juha, align: 'left', sortable: true },
      { name: 'Glavno_jelo_m2', label: 'Glavno jelo (Marenda 2)', field: row => row.Marenda2.Glavno_jelo, align: 'left', sortable: true },
      { name: 'Salata_m2', label: 'Salata (Marenda 2)', field: row => row.Marenda2.Salata, align: 'left', sortable: true },
      { name: 'actions', label: 'Akcije', field: 'actions', align: 'center' },
    ];

    // Paginacija za tablicu
    const pagination = ref({
      rowsPerPage: 10,
    });

    // Provjera da li je datum jednak ili veći od današnjeg
    const isFutureDate = (date) => {
      const today = new Date().toISOString().slice(0, 10);
      return date >= today;
    };

    // Dohvaćanje menija iz backend-a
    const fetchMenus = async () => {
      try {
        const response = await fetch('/menu/history');
        if (!response.ok) {
          throw new Error(`Greška pri dohvaćanju menija: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Transformacija podataka
        const groupedMenus = data.reduce((acc, menu) => {
          const date = menu.Datum_marende.split('T')[0]; // Uklanjanje vremenskog dijela iz datuma
          if (!acc[date]) {
            acc[date] = {
              Datum_marende: date,
              Marenda1: {},
              Marenda2: {},
              username: menu.username,
              ID_kuhara: menu.ID_kuhara,
            };
          }

          if (menu.marenda === 'Marenda1') {
            acc[date].Marenda1 = {
              Juha: menu.Juha,
              Glavno_jelo: menu.Glavno_jelo,
              Salata: menu.Salata,
            };
          } else if (menu.marenda === 'Marenda2') {
            acc[date].Marenda2 = {
              Juha: menu.Juha,
              Glavno_jelo: menu.Glavno_jelo,
              Salata: menu.Salata,
            };
          }

          return acc;
        }, {});

        // Pretvaranje objekta u niz
        menus.value = Object.values(groupedMenus).map(menu => ({
          ...menu,
          editing: false, // Dodajemo stanje za uređivanje
        }));

      } catch (error) {
        console.error(error.message);
        alert('Greška pri dohvaćanju menija: ' + error.message);
      }
    };

    // Dodavanje menija
    const addMenu = async () => {
      try {
        const response = await fetch('/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Datum_marende: form.value.date,
            Juha: form.value.juha_m1,
            Glavno_jelo: form.value.glavno_jelo_m1,
            Salata: form.value.salata_m1,
            marenda: 'Marenda1',
          }),
        });

        const response2 = await fetch('/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Datum_marende: form.value.date,
            Juha: form.value.juha_m2,
            Glavno_jelo: form.value.glavno_jelo_m2,
            Salata: form.value.salata_m2,
            marenda: 'Marenda2',
          }),
        });

        if (response.ok && response2.ok) {
          alert('Meni uspješno dodan!');
          fetchMenus();
        } else {
          throw new Error('Greška pri dodavanju menija');
        }
      } catch (error) {
        console.error(error.message);
        alert('Greška pri dodavanju menija');
      }
    };

    // Ažuriranje menija
    const updateMenu = async (menu) => {
      try {
        const response = await fetch('/menu/fresh', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Datum_marende: menu.Datum_marende,
            Juha: menu.Marenda1.Juha,
            Glavno_jelo: menu.Marenda1.Glavno_jelo,
            Salata: menu.Marenda1.Salata,
            marenda: 'Marenda1',
          }),
        });

        const response2 = await fetch('/menu/fresh', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Datum_marende: menu.Datum_marende,
            Juha: menu.Marenda2.Juha,
            Glavno_jelo: menu.Marenda2.Glavno_jelo,
            Salata: menu.Marenda2.Salata,
            marenda: 'Marenda2',
          }),
        });

        if (response.ok && response2.ok) {
          alert('Meni uspješno ažuriran!');
          fetchMenus();
        } else {
          throw new Error('Greška pri ažuriranju menija');
        }
      } catch (error) {
        console.error(error.message);
        alert('Greška pri ažuriranju menija');
      }
    };

    // Brisanje menija
    const deleteMenu = async (menu) => {
      try {
        const confirmDelete = confirm('Jeste li sigurni da želite obrisati meni?');
        if (confirmDelete) {
          const response = await fetch(`/menu/delete?datum=${menu.Datum_marende}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            alert('Meni uspješno obrisan!');
            fetchMenus();
          } else {
            throw new Error('Greška pri brisanju menija');
          }
        }
      } catch (error) {
        console.error(error.message);
        alert('Greška pri brisanju menija');
      }
    };

    // Učitavanje menija prilikom montiranja komponente
    onMounted(() => {
      fetchMenus();
    });

    return {
      form,
      menus,
      columns,
      pagination,
      addMenu,
      updateMenu,
      deleteMenu,
      isFutureDate,
    };
  },
};
</script>

<style scoped>
.q-card {
  margin-bottom: 20px;
}
</style>
