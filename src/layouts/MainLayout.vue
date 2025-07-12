<template>
  <q-layout view="lHh Lpr lFf" style="background-color: #ffffe0">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Thalassoteraphia menu </q-toolbar-title>
        <div>v{{ version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>
        <EssentialLink
          v-for="route in routesList"
          :key="route.title"
          v-bind="route"
          :close-drawer="closeDrawer"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page-container>
        <div class="q-pa-md text-center" style="font-size: 1.1rem; color: #333">
          Dobrodošli u aplikaciju Thalassotherapia menu! Pregledajte ponudu jelovnika za
          zaposlenike.
        </div>

        <router-view />
      </q-page-container>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

const version = '1.0'

const routesList = computed(() => [
  {
    title: 'Admin',
    caption: 'prijava za admina',
    icon: 'manage_accounts',
    route: '/login',
  },
  {
    title: 'Kuhar',
    caption: 'prijava za kuhara',
    icon: 'bakery_dining',
    route: '/login_chef',
  },
  {
    title: 'Medicinsko osoblje',
    caption: 'prijave za medicinske sestre/tehničare',
    icon: 'health_and_safety',
    route: '/login_nurse',
  },
  {
    title: 'Pregled jelovnika',
    caption: 'Pregledajate jelovnik za današnji dan ',
    icon: 'lunch_dining',
    route: '/menu_page',
  },
])

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function closeDrawer() {
  leftDrawerOpen.value = false
}
</script>
