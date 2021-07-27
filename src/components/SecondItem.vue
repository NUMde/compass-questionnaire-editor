<template>
  <q-card flat class="my-card">
    <q-card-section>
      <div class="row justify-between">
        <div class="text-h6">{{ secondaryItemSelected.text }}</div>
        <div class="text-h6">
          <q-icon name="restore" size="26px" />
          {{ secondaryItemSelected.linkId }}
        </div>
      </div>
    </q-card-section>
    <q-separator />

    <q-card-section
      v-for="item in secondaryItemSelected.item"
      :key="item.linkId"
    >
      <div class="row justify-between">
        <div class="text-subtitle2 text-weight-bold">
          <q-icon name="list" size="26px" style="margin-right: 15px" />{{
            item.text
          }}
        </div>
        <div class="text-subtitle2">
          <q-icon name="restore" size="26px" />
          {{ item.linkId }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: mapState({
    secondaryItemSelected: (state) => state.secondaryItemSelected,
  }),
};
</script>
