<template>
  <q-layout view="hHh LpP lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Meni</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page padding>
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
            class="styled-table"
          >
            <template v-slot:body-cell="props">
              <q-td
                :props="props"
                @dblclick="onCellDblClick(props.row, props.col)"
                style="cursor: pointer"
              >
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
          </q-table>
        </q-card-section>

        <q-card-actions class="q-pa-md row items-center justify-between">
          <q-btn color="primary" label="Natrag" to="admin_history_menu" />
          <q-btn color="primary" label="Ispiši PDF" @click="printPDF" />
        </q-card-actions>
      </q-card>
    </q-page>
  </q-layout>
</template>

<script>
import { ref, onMounted } from 'vue'
import html2pdf from 'html2pdf.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
// dayjs.tz.setDefault('Europe/Zagreb') // Remove default timezone to avoid shifting
dayjs.tz.setDefault('Europe/Zagreb')

export default {
  setup() {
    const loggedInUser = ref('')
    const userID = ref('')
    const API_URL = `${window.location.protocol}//${window.location.hostname}:3000`
    const menus = ref([])
    const editingCell = ref({ rowId: null, col: null })

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
      { name: 'username', label: 'Korisnik', field: 'username', align: 'left', sortable: true },
    ]

    const pagination = ref({ rowsPerPage: 10 })

    const printPDF = () => {
      let tableHTML = `
        <h2 style="text-align: center; margin-bottom: 20px">Plan menija</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              ${columns
                .filter((col) => col.name !== 'actions')
                .map(
                  (col) => `<th style="border: 1px solid black; padding: 8px;">${col.label}</th>`,
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${menus.value
              .map(
                (menu) => `
              <tr>
                ${columns
                  .filter((col) => col.name !== 'actions')
                  .map(
                    (col) =>
                      `<td style="border: 1px solid black; padding: 8px;">${menu[col.field] || ''}</td>`,
                  )
                  .join('')}
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      `
      const element = document.createElement('div')
      element.id = 'printable-menu'
      element.innerHTML = tableHTML
      document.body.appendChild(element)

      html2pdf()
        .set({
          margin: 10,
          filename: 'plan_menija.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(element)
        .save()
        .then(() => {
          document.body.removeChild(element)
        })
    }

    const fetchMenus = async () => {
      try {
        const response = await fetch(`${API_URL}/menu/history/noActive`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error(`Greška pri dohvaćanju menija: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()

        const groupedMenus = data.reduce((acc, menu) => {
          const date = dayjs.utc(menu.Datum).tz('Europe/Zagreb').format('YYYY-MM-DD') //ključno z apravno formatiranje datuma
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
          }

          return acc
        }, {})

        menus.value = Object.values(groupedMenus)
      } catch (error) {
        console.error(error.message)
        alert('Greška pri dohvaćanju menija: ' + error.message)
      }
    }

    const onCellDblClick = (row, col) => {
      editingCell.value = { rowId: row.Datum_marende, col: col.name }
    }

    const onCellInput = (row, col, newValue) => {
      row[col.field] = newValue
      editingCell.value = { rowId: null, col: null }
    }

    const loadUserData = () => {
      loggedInUser.value = localStorage.getItem('loggedInUser') || ''
      userID.value = localStorage.getItem('userID') || ''
    }

    onMounted(() => {
      loadUserData() // Load user data on component mount
      fetchMenus()
    })

    return {
      loggedInUser,
      userID,
      menus,
      columns,
      pagination,
      editingCell,
      printPDF,
      onCellDblClick,
      onCellInput,
    }
  },
}
</script>
<style scoped>
.styled-table {
  width: 100%;
  border-collapse: collapse;
}

.styled-table th,
.styled-table td {
  border: 1px solid #ddd; /* Light gray border */
  padding: 8px;
  text-align: left;
}

.styled-table th {
  background-color: #f2f2f2; /* Light gray background for header */
  font-weight: bold;
}
</style>
