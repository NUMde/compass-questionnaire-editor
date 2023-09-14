<template>
  <q-layout view="Lhh lpR fff" container class="bg-white">
    <q-page-container>
      <q-page padding>
        <q-splitter
          v-model="splitterModel"
          style="height: 87vh"
          :limits="[30, 100]"
          horizontal
        >
          <template v-slot:before>
            <q-toolbar class="bg-primary text-white shadow-2">
              <q-toolbar-title>{{
                $t("views.editor.questions")
              }}</q-toolbar-title>
            </q-toolbar>
            <div class="q-pa-md">
              <q-tree
                :nodes="item"
                node-key="__internalID"
                selected-color="primary"
                v-model:selected="selected"
                children-key="item"
              >
                <template v-slot:default-header="prop">
                  <div class="row justify-between" style="width: 100%">
                    <div class="row">
                      <q-icon
                        :name="prop.node.__icon"
                        size="20px"
                        class="q-mr-sm text-grey-8"
                        ><q-tooltip>
                          {{ prop.node.type }}
                        </q-tooltip></q-icon
                      >
                      <div class="text-bold q-pr-sm">
                        {{ prop.node.linkId }}
                        <q-tooltip> {{ $t("components.linkId") }} </q-tooltip>
                      </div>
                      <div class="q-body-1">
                        {{ prop.node.text }}
                      </div>
                    </div>
                  </div>
                </template>
              </q-tree>
            </div>
          </template>
          <template v-slot:after>
            <q-toolbar
              v-if="selectedItem"
              class="bg-primary text-white shadow-2"
            >
              <q-toolbar-title>{{
                $t("views.editor.answerSelected")
              }}</q-toolbar-title>
            </q-toolbar>
            <div class="q-pa-md" v-if="selected">
              <div class="text-h5 text-bold q-mb-md">
                {{ selectedItem.text }}
                <div class="text-caption">{{ selectedItem.type }}</div>
                <div class="text-subtitle1" v-if="selectedItem.answerValueSet">
                  {{ $t("views.editor.AnswerValueSet") }}:
                  <span class="text-italic q-mb-md">
                    {{ selectedItem.answerValueSet }}
                  </span>
                </div>
              </div>

              <div
                v-if="
                  selectedItem.type === 'choice' ||
                  selectedItem.type === 'open-choice'
                "
              >
                <q-toolbar
                  class="text-primary"
                  bordered
                  separator
                  v-if="selectedItem.answerOption"
                >
                  <q-toolbar-title>{{
                    $t("views.editor.AnswerOptions")
                  }}</q-toolbar-title>
                </q-toolbar>
                <q-list bordered separator v-if="selectedItem.answerOption"
                  ><q-item
                    @dblclick="
                      onSelectAnswer({
                        ...answerOption,
                        linkId: selectedItem.linkId,
                        type: selectedItem.type,
                      })
                    "
                    v-for="answerOption in selectedItem.answerOption"
                    :key="answerOption"
                  >
                    <!--Coding Answer type -->
                    <q-item-section v-if="answerOption.__type === 'coding'"
                      ><q-item-label>{{
                        answerOption.valueCoding.display
                      }}</q-item-label
                      ><q-item-label caption lines="2">{{
                        answerOption.valueCoding.system
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section
                      side
                      top
                      v-if="answerOption.__type === 'coding'"
                    >
                      <q-item-label caption>{{
                        answerOption.valueCoding.code
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section v-if="answerOption.__type === 'integer'"
                      ><q-item-label>{{
                        answerOption.valueInteger
                      }}</q-item-label>
                      <q-item-label caption lines="2">
                        valueInteger
                      </q-item-label>
                    </q-item-section>
                    <q-item-section v-if="answerOption.__type === 'date'"
                      ><q-item-label>{{ answerOption.valueDate }}</q-item-label>
                      <q-item-label caption lines="2"> valueDate </q-item-label>
                    </q-item-section>
                    <q-item-section v-if="answerOption.__type === 'string'"
                      ><q-item-label>{{
                        answerOption.valueString
                      }}</q-item-label>
                      <q-item-label caption lines="2">
                        valueString
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </template>
        </q-splitter>
      </q-page>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          fab
          icon="done"
          color="primary"
          padding="none xl"
          :label="$t('views.editor.selectAnswer')"
          @click="onSelectGECCOQuestion(selectedItem)"
        />
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>
<script>
// import { mapGetters } from "vuex";
import { ref } from "vue";
import { editorTools } from "../utils/editor.js";
import * as geccoQuestionnaire from "./../store/questionnaire.json";
import { importJsonQuestionnaire } from "@/utils/ImportJson";

export default {
  props: {},
  setup() {
    const filter = ref("de");
    return {
      splitterModel: ref(50), // start at 50%
      edtiorTools: editorTools,
      filter,
    };
  },
  data() {
    return {
      item: [],
      questionaireGUI: {},
      selected: null,
      selectedItem: {},
    };
  },
  created() {
    importJsonQuestionnaire.getValidateFHIRResource(geccoQuestionnaire); //create __internal_ids
    this.questionaireGUI = geccoQuestionnaire;
    this.item = this.questionaireGUI.item ? this.questionaireGUI.item : [];
  },
  computed: {
    // ...mapGetters(["getQuestionnaireGECCO"]),
  },
  watch: {
    selected(val) {
      if (val === null) {
        this.selectedItem = this.item;
        return;
      }
      this.selectedItem = this.edtiorTools.getCurrentQuestionNodeByID(
        val,
        this.item,
      );
    },
  },
  methods: {
    onSelectGECCOQuestion(questionSelected) {
      if (
        questionSelected.extension?.find(
          (it) =>
            it?.url ===
            "https://num-compass.science/fhir/StructureDefinition/DependentItem",
        )
      ) {
        alert(
          "This item is dependent of another item. Please import the upper item group!",
        );
        return;
      }

      this.$emit("question", questionSelected);
    },

    onSelectAnswer(answerOption) {
      this.$emit("choiceQuestion", answerOption);
    },
  },
};
</script>
