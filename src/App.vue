<template>
  <q-layout view="hHh LpR lfr">
    <q-header class="text-black bg-white">
      <cx-navbar></cx-navbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";
import cxNavbar from "./components/cxNavbar.vue";
export default {
  name: "LayoutDefault",

  components: {
    cxNavbar,
  },

  setup() {
    return {
      leftDrawerOpen: ref(false),
    };
  },
};
</script>
