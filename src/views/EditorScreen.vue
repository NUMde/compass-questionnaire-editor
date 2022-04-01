<template>
  <q-tabs
    v-model="tab"
    dense
    class="text-grey"
    active-color="primary"
    indicator-color="primary"
    align="justify"
    narrow-indicator
  >
    <q-tab name="editor" :label="$t('views.tabsTitles.ediorQRE')" />
    <q-tab name="metadata" :label="$t('views.tabsTitles.metadata')" />
    <q-tab name="settings" :label="$t('views.tabsTitles.settings')" />
  </q-tabs>

  <q-separator />

  <q-tab-panels v-model="tab" animated>
    <q-tab-panel name="editor">
      <cx-editor-items />
    </q-tab-panel>

    <q-tab-panel name="metadata">
      <cx-metadata />
    </q-tab-panel>

    <q-tab-panel name="settings">
      <cx-settings />
    </q-tab-panel>
  </q-tab-panels>
</template>
<script>
import cxEditorItems from "../components/cxEditorItems.vue";
import cxMetadata from "../components/cxMetadata.vue";
import cxSettings from "../components/cxSettings.vue";
import { ref } from "vue";

export default {
  components: {
    cxEditorItems,
    cxMetadata,
    cxSettings,
  },
  setup() {
    return {
      tab: ref("editor"),
    };
  },
  created() {},
  data() {
    return {};
  },
};
</script>
