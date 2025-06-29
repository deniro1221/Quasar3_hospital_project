<template>
  <q-page class="q-pa-md">
    <!-- Gumb za otvaranje dijaloga -->
    <q-btn color="primary" label="Dodaj meni" @click="openDialog" />

    <!-- Dijalog za unos menija -->
    <q-dialog v-model="addMenuDialog" ref="addMenuDialog" @hide="onDialogCancel">
      <q-card style="width: 700px">
        <q-card-section>
          <div class="text-h6">Dodaj meni</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="addMenu" ref="menuForm" @reset="onReset">
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
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" @click="closeDialog" />
          <!-- Promijenjeno v-close-popup u @click="closeDialog" -->
          <q-btn flat label="Spremi" color="primary" @click="addMenu" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
              @dblclick="onCellDblClick(props.row, props.col)"
              style="cursor: pointer"
            >
              <!-- Dodan style za bolji UX -->
              <div
                v-if="
                  editingCell.rowId !== props.row.Datum_marende ||
                  editingCell.col !== props.col.name
                "
              >
                {{ props.value }}
              </div>
              <q-input
                v-else
                v-model="props.row[props.col.field]"
                @update:model-value="onCellInput(props.row, props.col, $event)"
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
      <q-card-section>
        <q-btn color="primary" @click="confirmUpdate">Ažuriraj meni</q-btn>
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
    const closeDialog = () => {
      console.log('closeDialog pozvan')
      addMenuDialog.value = false
      form.value = {
        date: new Date().toISOString().slice(0, 10),
        juha_m1: '',
        glavno_jelo_m1: '',
        salata_m1: '',
        juha_m2: '',
        glavno_jelo_m2: '',
        salata_m2: '',
      }
    }
    // Paginacija za tablicu
    const pagination = ref({
      rowsPerPage: 10,
    })

    const isFutureDate = (date) => {
      const today = new Date().toISOString().slice(0, 10)
      return date >= today
    }

    const fetchMenus = async () => {
      try {
        const response = await fetch('https://backend-hospital-n9to.onrender.com/menu/history')
        if (!response.ok) {
          throw new Error(`Greška pri dohvaćanju menija: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()

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

        menus.value = Object.values(groupedMenus)
      } catch (error) {
        console.error(error.message)
        alert('Greška pri dohvaćanju menija: ' + error.message)
      }
    }

    const addMenuDialog = ref(false)
    const addMenu = async () => {
      try {
        const existingMenu = menus.value.find((menu) => menu.Datum_marende === form.value.date)

        if (existingMenu) {
          alert('Meni za taj datum već postoji.')
          form.value = {
            date: new Date().toISOString().slice(0, 10),
            juha_m1: '',
            glavno_jelo_m1: '',
            salata_m1: '',
            juha_m2: '',
            glavno_jelo_m2: '',
            salata_m2: '',
          }
          return
        }

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

          form.value = {
            date: new Date().toISOString().slice(0, 10),
            juha_m1: '',
            glavno_jelo_m1: '',
            salata_m1: '',
            juha_m2: '',
            glavno_jelo_m2: '',
            salata_m2: '',
          }
          addMenuDialog.value = false
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
    const onDialogCancel = () => {
      // optional, do something useful
      //   if (preventReset.value === true) {
      //     return
      //   }

      // this is only for demo purposes so
      // user does not get annoyed when playing
      // with the "Prevent closing" example
      console.log('+++ Hiding dialog; form was NOT reset')
      form.value = {
        date: new Date().toISOString().slice(0, 10),
        juha_m1: '',
        glavno_jelo_m1: '',
        salata_m1: '',
        juha_m2: '',
        glavno_jelo_m2: '',
        salata_m2: '',
      }
    }
    const openDialog = () => {
      console.log('openDialog pozvan')
      addMenuDialog.value = true
      console.log('addMenuDialog.value', addMenuDialog.value)
    }
    const editingCell = ref({ rowId: null, col: null })

    // Mapa za praćenje promjena
    const changesMap = ref({})

    // Funkcija za dvoklik na ćeliju
    function onCellDblClick(row, column) {
      console.log('onCellDblClick pozvan', row, column)
      if (['Datum_marende', 'username', 'ID_kuhara', 'actions'].includes(column.name)) {
        console.log('Polje nije dozvoljeno za uređivanje')
        return
      }
      editingCell.value = { rowId: row.Datum_marende, col: column.name }
      console.log('editingCell.value nakon dvoklika', editingCell.value)
    }

    // Funkcija za unos u ćeliju
    function onCellInput(row, column, event) {
      console.log('onCellInput pozvan', row, column, event)
      // let newVal = event.target.value || event.target.innerText; // Uklonjeno
      let newVal = row[column.field] // Dohvati vrijednost izravno iz reda
      console.log('newVal', newVal)

      if (!changesMap.value[row.Datum_marende]) {
        changesMap.value[row.Datum_marende] = { ...row }
      }

      changesMap.value[row.Datum_marende][column.field] = newVal
      console.log('changesMap.value nakon unosa', changesMap.value)
    }

    // Funkcija za prekid uređivanja
    function cancelEdit() {
      console.log('cancelEdit pozvan')
      editingCell.value = {}
      console.log('editingCell.value nakon cancelEdit', editingCell.value)
    }

    // Funkcija za potvrdu ažuriranja
    async function confirmUpdate() {
      console.log('confirmUpdate pozvan')
      if (!Object.keys(changesMap.value).length) {
        alert('Nema promjena za ažurirati.')
        return
      }

      if (!confirm('Jeste li sigurni za ažuriranje?')) return

      let successCount = 0
      let failCount = 0

      console.log('changesMap.value prije slanja', changesMap.value)

      for (const rowId in changesMap.value) {
        const updatedRow = { ...changesMap.value[rowId] }
        const field = editingCell.value.col
        // Pripremi podatke za slanje
        const payload = {
          Datum_marende: updatedRow.Datum_marende,
          [field]: updatedRow[field], // Šalji samo promijenjeno polje
        }
        console.log('payload prije slanja', payload)
        const url = `https://backend-hospital-n9to.onrender.com/menu/fresh`

        try {
          const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (response.ok) {
            successCount++
            const index = menus.value.findIndex((r) => r.Datum_marende === rowId)
            if (index !== -1) {
              menus.value[index] = {
                ...menus.value[index],
                ...updatedRow,
              }
            }
          } else {
            failCount++
            const errMsg = await response.json()
            alert(`Greška kod datuma ${rowId}: ${errMsg.message}`)
          }
        } catch (err) {
          failCount++
          alert(`Neuspješno slanje za datum ${rowId}: ${err.message}`)
        }
      }

      // Osvježi podatke nakon svih pokušaja ažuriranja
      await fetchMenus()

      alert(`Uspješno ažurirano: ${successCount}, Neuspješno: ${failCount}.`)
      changesMap.value = {}
      editingCell.value = {}
      console.log('changesMap.value nakon ažuriranja', changesMap.value)
      console.log('editingCell.value nakon ažuriranja', editingCell.value)
    }

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

    onMounted(() => {
      fetchMenus()
    })

    return {
      form,
      menus,
      columns,
      pagination,
      addMenu,
      deleteMenu,
      isFutureDate,
      editingCell,
      changesMap,
      onCellDblClick,
      onCellInput,
      cancelEdit,
      confirmUpdate,
      addMenuDialog,
      openDialog,
      onDialogCancel,
      closeDialog,
    }
  },
}
</script>

<style scoped>
.q-card {
  margin-bottom: 20px;
}
</style>
