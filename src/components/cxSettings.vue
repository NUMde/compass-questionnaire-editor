<template>
  <div class="row justify-center">
    <div class="col-6">
      <q-list bordered class="rounded-borders">
        <q-expansion-item
          expand-separator
          :label="$t('views.tabs.settings.Answers.title')"
          :expand-icon="expandIcon"
        >
          <q-card>
            <q-card-section>
              <div class="row">
                <div class="col-12">
                  <q-list>
                    <q-item tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>{{
                          $t("views.tabs.settings.Answers.AnswerValueset")
                        }}</q-item-label>
                      </q-item-section>
                      <q-item-section avatar>
                        <q-toggle color="red" v-model="answerValueset" />
                      </q-item-section>
                    </q-item>
                    <q-item tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>{{
                          $t("views.tabs.settings.Answers.OpenChoice")
                        }}</q-item-label>
                      </q-item-section>
                      <q-item-section avatar>
                        <q-toggle color="red" v-model="openChoice" />
                      </q-item-section>
                    </q-item>
                    <q-item tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>{{
                          $t("views.tabs.settings.Answers.Choice")
                        }}</q-item-label>
                      </q-item-section>
                      <q-item-section avatar>
                        <q-toggle color="red" v-model="choice" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>
<script>
import { matKeyboardArrowDown } from "@quasar/extras/material-icons";

export default {
  created() {
    this.expandIcon = matKeyboardArrowDown;
  },
  computed: {
    answerValueset: {
      get() {
        return this.$store.state.settings.answers.answersValueset;
      },
      set(value) {
        this.$store.commit("setAnswerValueSet", value);
      },
    },
    openChoice: {
      get() {
        return this.$store.state.settings.answers.openChoice;
      },
      set(value) {
        this.$store.commit("setOpenChoice", value);
      },
    },
    choice: {
      get() {
        return this.$store.state.settings.answers.choice;
      },
      set(value) {
        this.$store.commit("setChoice", value);
      },
    },
  },
};
</script>
