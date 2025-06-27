<template>
  <q-page class="q-pa-md">
    <!-- Gumb za dodavanje menija -->
    <q-btn color="primary" label="Dodaj meni" @click="showAddForm = true" />

    <!-- Tablica s menijima -->
    <q-table
      :rows="menus"
      :columns="columns"
      row-key="Datum_marende"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat color="primary" label="Uredi" @click="handleEdit(props.row)" />
          <q-btn flat color="negative" label="Obriši" @click="handleDelete(props.row.Datum_marende)" />
        </q-td>
      </template>
    </q-table>

    <!-- Forma za dodavanje/ažuriranje menija -->
    <q-dialog v-model="showAddForm" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ formTitle }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="formData.Datum_marende" label="Datum (YYYY-MM-DD)" />
          <q-input v-model="formData.Juha_m1" label="Juha (M1)" />
          <q-input v-model="formData.Glavno_jelo_m1" label="Glavno jelo (M1)" />
          <q-input v-model="formData.Salata_m1" label="Salata (M1)" />
          <q-input v-model="formData.Juha_m2" label="Juha (M2)" />
          <q-input v-model="formData.Glavno_jelo_m2" label="Glavno jelo (M2)" />
          <q-input v-model="formData.Salata_m2" label="Salata (M2)" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Otkaži" @click="handleCancel" />
          <q-btn color="primary" label="Spremi" @click="handleSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const menus = ref([]);
    const showAddForm = ref(false);
    const editingMenu = ref(null);

    // Stanje forme
    const formData = ref({
      Datum_marende: '',
      Juha_m1: '',
      Glavno_jelo_m1: '',
      Salata_m1: '',
      Juha_m2: '',
      Glavno_jelo_m2: '',
      Salata_m2: '',
    });

    // Naslov forme (dodaj/uredi)
    const formTitle = computed(() => (editingMenu.value ? 'Uredi meni' : 'Dodaj meni'));

    // Dohvati menije pri učitavanju stranice
    const fetchMenus = async () => {
      try {
        const response = await axios.get('https://backend-hospital-n9to.onrender.com/menu/history');
        menus.value = response.data;
      } catch (error) {
        console.error('Greška pri dohvaćanju menija:', error);
      }
    };

    // Dodaj/ažuriraj meni
    const handleSubmit = async () => {
      try {
        if (editingMenu.value) {
          await axios.put('https://backend-hospital-n9to.onrender.com/menu/fresh', formData.value);
        } else {
          await axios.post('https://backend-hospital-n9to.onrender.com/menu', formData.value);
        }
        await fetchMenus();
        showAddForm.value = false;
        editingMenu.value = null;
        resetForm();
      } catch (error) {
        console.error('Greška pri spremanju menija:', error);
      }
    };

    // Otkaži formu
    const handleCancel = () => {
      showAddForm.value = false;
      editingMenu.value = null;
      resetForm();
    };

    // Uredi meni
    const handleEdit = (menu) => {
      editingMenu.value = menu;
      formData.value = { ...menu };
      showAddForm.value = true;
    };

    // Obriši meni
    const handleDelete = async (datum) => {
      try {
        await axios.delete('https://backend-hospital-n9to.onrender.com/menu/delete', { params: { datum } });
        await fetchMenus();
      } catch (error) {
        console.error('Greška pri brisanju menija:', error);
      }
    };

    // Resetiraj formu
    const resetForm = () => {
      formData.value = {
        Datum_marende: '',
        Juha_m1: '',
        Glavno_jelo_m1: '',
        Salata_m1: '',
        Juha_m2: '',
        Glavno_jelo_m2: '',
        Salata_m2: '',
      };
    };

    // Dohvati menije pri učitavanju stranice
    onMounted(fetchMenus);

    // Definicija kolona za tablicu
    const columns = [
      { name: 'Datum_marende', label: 'Datum', field: 'Datum_marende', align: 'left' },
      { name: 'Juha_m1', label: 'Juha (M1)', field: 'Juha_m1', align: 'left' },
      { name: 'Glavno_jelo_m1', label: 'Glavno jelo (M1)', field: 'Glavno_jelo_m1', align: 'left' },
      { name: 'Salata_m1', label: 'Salata (M1)', field: 'Salata_m1', align: 'left' },
      { name: 'Juha_m2', label: 'Juha (M2)', field: 'Juha_m2', align: 'left' },
      { name: 'Glavno_jelo_m2', label: 'Glavno jelo (M2)', field: 'Glavno_jelo_m2', align: 'left' },
      { name: 'Salata_m2', label: 'Salata (M2)', field: 'Salata_m2', align: 'left' },
      { name: 'actions', label: 'Akcije', field: 'actions', align: 'center' },
    ];

    return {
      menus,
      showAddForm,
      formData,
      formTitle,
      columns,
      handleSubmit,
      handleCancel,
      handleEdit,
      handleDelete,
    };
  },
};
</script>
