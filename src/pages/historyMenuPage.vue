<template>
  <q-page class="q-pa-md">
    <!-- Unos menija -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h4">Dodaj meni</div>
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
          row-key="Datum_menija"
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
import { useQuasar } from 'quasar';

export default {
  setup() {
    const $q = useQuasar();

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
      { name: 'Datum_menija', label: 'Datum', field: 'Datum_menija', align: 'left', sortable: true },
      { name: 'Juha_m1', label: 'Juha (Marenda 1)', field: 'Juha_m1', align: 'left', sortable: true },
      { name: 'Glavno_jelo_m1', label: 'Glavno jelo (Marenda 1)', field: 'Glavno_jelo_m1', align: 'left', sortable: true },
      { name: 'Salata_m1', label: 'Salata (Marenda 1)', field: 'Salata_m1', align: 'left', sortable: true },
      { name: 'Juha_m2', label: 'Juha (Marenda 2)', field: 'Juha_m2', align: 'left', sortable: true },
      { name: 'Glavno_jelo_m2', label: 'Glavno jelo (Marenda 2)', field: 'Glavno_jelo_m2', align: 'left', sortable: true },
      { name: 'Salata_m2', label: 'Salata (Marenda 2)', field: 'Salata_m2', align: 'left', sortable: true },
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
        const data = await response.json();
        menus.value = data.map(menu => ({
          ...menu,
          editing: false, // Dodajemo stanje za uređivanje
        }));
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Greška pri dohvaćanju menija',
        });
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
            Juha_m1: form.value.juha_m1,
            Glavno_jelo_m1: form.value.glavno_jelo_m1,
            Salata_m1: form.value.salata_m1,
            Juha_m2: form.value.juha_m2,
            Glavno_jelo_m2: form.value.glavno_jelo_m2,
            Salata_m2: form.value.salata_m2,
          }),
        });

        if (response.ok) {
          $q.notify({
            type: 'positive',
            message: 'Meni uspješno dodan!',
          });
          fetchMenus();
        } else {
          $q.notify({
            type: 'negative',
            message: 'Greška pri dodavanju menija!',
          });
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Greška pri dodavanju menija!',
        });
      }
    };

    // Ažuriranje menija
    const updateMenu = async (menu) => {
      try {
        const response = await fetch('/menu/fresh', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Datum_marende: menu.Datum_menija,
            Juha_m1: menu.Juha_m1,
            Glavno_jelo_m1: menu.Glavno_jelo_m1,
            Salata_m1: menu.Salata_m1,
            Juha_m2: menu.Juha_m2,
            Glavno_jelo_m2: menu.Glavno_jelo_m2,
            Salata_m2: menu.Salata_m2,
          }),
        });

        if (response.ok) {
          $q.notify({
            type: 'positive',
            message: 'Meni uspješno ažuriran!',
          });
          fetchMenus();
        } else {
          $q.notify({
            type: 'negative',
            message: 'Greška pri ažuriranju menija!',
          });
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Greška pri ažuriranju menija!',
        });
      }
    };

    // Brisanje menija
    const deleteMenu = async (menu) => {
      try {
        const confirmDelete = await $q.dialog({
          title: 'Potvrda',
          message: 'Jeste li sigurni da želite obrisati meni?',
          cancel: true,
          persistent: true,
        });

        if (confirmDelete) {
          const response = await fetch(`/menu/delete?datum=${menu.Datum_menija}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            $q.notify({
              type: 'positive',
              message: 'Meni uspješno obrisan!',
            });
            fetchMenus();
          } else {
            $q.notify({
              type: 'negative',
              message: 'Greška pri brisanju menija!',
            });
          }
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Greška pri brisanju menija!',
        });
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
