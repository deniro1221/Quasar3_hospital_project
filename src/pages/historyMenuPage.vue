<template>
  <q-page class="q-pa-md">
    <!-- Unos menija -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Dodaj meni</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="addMenu" ref="menuForm">
          <!-- Dodan ref na formu -->
          <q-input
            v-model="form.date"
            type="date"
            label="Datum"
            :rules="[
              (val) => !!val || 'Datum je obavezan',
              (val) => isFutureDate(val) || 'Datum mora biti jednak ili veći od današnjeg',
            ]"
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
        <q-table :rows="menus" :columns="columns" row-key="Datum_marende" :pagination="pagination">
          <!-- Ažuriranje podataka -->
          <template v-slot:body-cell="props">
            <q-td
              :props="props"
              @dblclick="enableEditing(props.row, props.col.name)"
              style="cursor: pointer"
            >
              <!-- Dodan style za bolji UX -->
              <div
                v-if="
                  !props.row.editing ||
                  props.col.name === 'Datum_marende' ||
                  props.col.name === 'username' ||
                  props.col.name === 'ID_kuhara'
                "
              >
                {{ props.value }}
              </div>
              <q-input
                v-else
                v-model="props.row[props.col.field]"
                @blur="
                  () => {
                    updateMenu(props.row, props.col.field)
                  }
                "
                dense
                autofocus
              />
            </q-td>
          </template>

          <!-- Brisanje menija -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn @click="deleteMenu(props.row)" color="negative" label="Obriši" size="sm" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'

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
    })

    // Stanje tablice s menijima
    const menus = ref([])

    // Kolone za tablicu
    const columns = [
      {
        name: 'Datum_marende',
        label: 'Datum',
        field: 'Datum_marende',
        align: 'left',
        sortable: true,
      },
      {
        name: 'Juha_m1',
        label: 'Juha (Marenda 1)',
        field: 'Juha_m1',
        align: 'left',
        sortable: true,
      },
      {
        name: 'Glavno_jelo_m1',
        label: 'Glavno jelo (Marenda 1)',
        field: 'Glavno_jelo_m1',
        align: 'left',
        sortable: true,
      },
      {
        name: 'Salata_m1',
        label: 'Salata (Marenda 1)',
        field: 'Salata_m1',
        align: 'left',
        sortable: true,
      },
      {
        name: 'Juha_m2',
        label: 'Juha (Marenda 2)',
        field: 'Juha_m2',
        align: 'left',
        sortable: true,
      },
      {
        name: 'Glavno_jelo_m2',
        label: 'Glavno jelo (Marenda 2)',
        field: 'Glavno_jelo_m2',
        align: 'left',
        sortable: true,
      },
      {
        name: 'Salata_m2',
        label: 'Salata (Marenda 2)',
        field: 'Salata_m2',
        align: 'left',
        sortable: true,
      },
      {
        name: 'username',
        label: 'Korisnik',
        field: 'username',
        align: 'left',
        sortable: true,
      },
      {
        name: 'ID_kuhara',
        label: 'ID kuhara',
        field: 'ID_kuhara',
        align: 'left',
        sortable: true,
      },
      { name: 'actions', label: 'Akcije', field: 'actions', align: 'center' },
    ]

    // Paginacija za tablicu
    const pagination = ref({
      rowsPerPage: 10,
    })

    // Provjera da li je datum jednak ili veći od današnjeg
    const isFutureDate = (date) => {
      const today = new Date().toISOString().slice(0, 10)
      return date >= today
    }

    // Dohvaćanje menija iz backend-a
    const fetchMenus = async () => {
      try {
        const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/history')
        if (!response.ok) {
          throw new Error(`Greška pri dohvaćanju menija: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()

        // Grupiraj podatke po datumu
        const groupedMenus = data.reduce((acc, menu) => {
          const date = menu.Datum.split('T')[0]
          if (!acc[date]) {
            acc[date] = {
              Datum_marende: date,
              Juha_m1: '',
              Glavno_jelo_m1: '',
              Salata_m1: '',
              Juha_m2: '',
              Glavno_jelo_m2: '',
              Salata_m2: '',
              username: menu.username,
              ID_kuhara: menu.ID_kuhara,
            }
          }

          if (menu.marenda === 'Marenda1') {
            acc[date].Juha_m1 = menu.Juha_m1 || ''
            acc[date].Glavno_jelo_m1 = menu.Glavno_jelo_m1 || ''
            acc[date].Salata_m1 = menu.Salata_m1 || ''
            acc[date].username = menu.username || ''
            acc[date].ID_kuhara = menu.ID_kuhara || ''
          } else if (menu.marenda === 'Marenda2') {
            acc[date].Juha_m2 = menu.Juha_m1 || '' // Ispravljeno menu.Juha_m1 u menu.Juha_m2
            acc[date].Glavno_jelo_m2 = menu.Glavno_jelo_m1 || '' // Ispravljeno menu.Glavno_jelo_m1 u menu.Glavno_jelo_m2
            acc[date].Salata_m2 = menu.Salata_m1 || '' // Ispravljeno menu.Salata_m1 u menu.Salata_m2
            acc[date].username = menu.username || ''
            acc[date].ID_kuhara = menu.ID_kuhara || ''
          }

          return acc
        }, {})

        // Pretvoriti objekt u niz
        menus.value = Object.values(groupedMenus)
      } catch (error) {
        console.error(error.message)
        alert('Greška pri dohvaćanju menija: ' + error.message)
      }
    }

    // Dodavanje menija
    const addMenu = async () => {
      try {
        // Provjera postoji li meni za taj datum
        const existingMenu = menus.value.find((menu) => menu.Datum_marende === form.value.date)

        if (existingMenu) {
          // Ako meni postoji, prikaži poruku o grešci
          alert('Meni za taj datum već postoji.')
          // Resetiranje forme
          form.value = {
            date: new Date().toISOString().slice(0, 10),
            juha_m1: '',
            glavno_jelo_m1: '',
            salata_m1: '',
            juha_m2: '',
            glavno_jelo_m2: '',
            salata_m2: '',
          }
          return // Prekini funkciju
        }

        // Ako meni ne postoji, pošalji zahtjev za dodavanje
        const response = await fetch('https://backend-hospital-n9to.onrender.com/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Datum_marende: form.value.date,
            ID_kuhara: 2, // Ili dohvati ID_kuhara dinamički
            username: 'marin', // Ili dohvati username dinamički
            Juha_m1: form.value.juha_m1,
            Glavno_jelo_m1: form.value.glavno_jelo_m1,
            Salata_m1: form.value.salata_m1,
            Juha_m2: form.value.juha_m2,
            Glavno_jelo_m2: form.value.glavno_jelo_m2,
            Salata_m2: form.value.salata_m2,
          }),
        })

        if (response.ok) {
          alert('Meni uspješno dodan!')
          fetchMenus()

          // Resetiranje forme
          form.value = {
            date: new Date().toISOString().slice(0, 10),
            juha_m1: '',
            glavno_jelo_m1: '',
            salata_m1: '',
            juha_m2: '',
            glavno_jelo_m2: '',
            salata_m2: '',
          }
        } else {
          const errorData = await response.json()
          throw new Error(
            `Greška pri dodavanju menija: ${response.status} ${JSON.stringify(errorData)}`,
          )
        }
      } catch (error) {
        console.error(error.message)
        alert('Greška pri dodavanju menija: ' + error.message)
      }
    }

    // Ažuriranje menija
    const updateMenu = async (menu, field) => {
      try {
        const originalValue = menus.value.find((m) => m.Datum_marende === menu.Datum_marende)[field] // Dohvati originalnu vrijednost

        const value = menu[field]
        if (value === originalValue) {
          // Ako se vrijednost nije promijenila, nemoj ažurirati
          menu.editing = false // Onemogući uređivanje
          return
        }

        const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/fresh', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Datum_marende: menu.Datum_marende,
            [field]: value,
          }),
        })

        if (response.ok) {
          alert('Meni uspješno ažuriran!')
          fetchMenus()
          menu.editing = false // Onemogući uređivanje
        } else {
          throw new Error('Greška pri ažuriranju menija')
        }
      } catch (error) {
        console.error(error.message)
        alert('Greška pri ažuriranju menija')
      }
    }

    const enableEditing = (row, columnName) => {
      if (
        columnName !== 'Datum_marende' &&
        columnName !== 'actions' &&
        columnName !== 'username' &&
        columnName !== 'ID_kuhara'
      ) {
        row.editing = true
      }
    }

    // Brisanje menija
    const deleteMenu = async (menu) => {
      try {
        const confirmDelete = confirm('Jeste li sigurni da želite obrisati meni?')
        if (confirmDelete) {
          const response = await fetch(
            `https://backend-hospital-n9to.onrender.com/menu/delete?datum=${menu.Datum_marende}`,
            {
              method: 'DELETE',
            },
          )

          if (response.ok) {
            alert('Meni uspješno obrisan!')
            fetchMenus()
          } else {
            throw new Error('Greška pri brisanju menija')
          }
        }
      } catch (error) {
        console.error(error.message)
        alert('Greška pri brisanju menija')
      }
    }

    // Učitavanje menija prilikom montiranja komponente
    onMounted(() => {
      fetchMenus()
    })

    return {
      form,
      menus,
      columns,
      pagination,
      addMenu,
      updateMenu,
      deleteMenu,
      isFutureDate,
      enableEditing,
    }
  },
}
</script>

<style scoped>
.q-card {
  margin-bottom: 20px;
}
</style>
