<template>
  <q-item v-if="route" clickable @click="navigate">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
  <q-item v-else clickable tag="a" target="_blank" :href="link">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { defineProps } from 'vue' // Ispravno importanje iz vue
import { useRouter } from 'vue-router' // Importiranje routera

const props = defineProps({
  title: { type: String, required: true },
  caption: { type: String, default: '' },
  link: { type: String, default: '' },
  route: { type: String, required: true },
  icon: { type: String, default: '' },
})

const router = useRouter()

function navigate() {
  console.log('Navigating to:', props.route)
  if (props.route) {
    router.push(props.route)
  } else {
    console.log('No route defined')
  }
}
</script>
