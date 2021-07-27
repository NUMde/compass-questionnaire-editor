<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      :limits="limitsSpliter"
      style="height: 79vh"
    >
      <template v-slot:before>
        <div>
          <q-tree
            :nodes="item"
            node-key="__internalID"
            selected-color="primary"
            v-model:selected.sync="selected"
            default-expand-all
            q-tree
            children-key="item"
          >
            <template v-slot:default-header="prop">
              <div
                class="col items-center justify-between"
                style="width: 100%"
                :disable="prop.node.disabled"
              >
                <div
                  class="row items-center justify-between"
                  style="width: 100%; height: 6px"
                  @dragover="onDragOver"
                  @dragleave="onDragLeave"
                  @drop="onDrop"
                  :id="'_' + prop.node.__internalID"
                ></div>
                <div
                  class="row items-center justify-between"
                  style="width: 100%"
                  @dragover="onDragOver"
                  @dragleave="onDragLeave"
                  @drop="onDrop"
                  @dragstart="onDragStart"
                  :id="prop.node.__internalID"
                  draggable="true"
                >
                  <div
                    class="row items-center"
                    style="max-width: 230px; min-width: 90px"
                  >
                    <q-icon
                      :name="prop.node.__icon"
                      size="20px"
                      class="q-mr-sm text-grey-8"
                      ><q-tooltip>
                        {{ prop.node.type }}
                      </q-tooltip></q-icon
                    >
                    <div class="col-8 ellipsis q-body-1 text-weight-bold">
                      {{ prop.node.text }}
                    </div>
                  </div>

                  <div
                    class="row items-center justify-end"
                    style="width: 150px"
                  >
                    <!-- reverse original text question  -->
                    <div style="width: 30px">
                      <q-btn
                        :disable="!prop.node.__active"
                        flat
                        round
                        size="xs"
                        icon="history"
                        class="q-mr-sm text-grey-8"
                        v-if="
                          prop.node.text !== prop.node.__oldText &&
                          !prop.node.__newQuestion
                        "
                        @click="prop.node.text = prop.node.__oldText"
                        ><q-tooltip>
                          {{ $t("views.editor.reverseText") }}
                        </q-tooltip></q-btn
                      >
                    </div>
                    <!-- enable/disable question  -->
                    <div v-if="!prop.node.disabled">
                      <q-toggle
                        size="xs"
                        v-model="prop.node.__active"
                        :disable="prop.node.disabled"
                        @click="onToggle(prop.node.__internalID)"
                        ><q-tooltip>
                          {{
                            prop.node.__active
                              ? $t("views.editor.disableItem")
                              : $t("views.editor.enableItem")
                          }}
                        </q-tooltip></q-toggle
                      >
                    </div>
                    <div class="q-body-1">
                      <q-icon
                        name="drag_indicator"
                        size="20px"
                        class="q-mr-sm text-grey-5"
                        ><q-tooltip>
                          {{ $t("views.editor.dragItem") }}
                        </q-tooltip></q-icon
                      >
                    </div>
                  </div>
                </div>
                <div
                  class="
                    row
                    items-center
                    justify-between
                    text-caption text-grey-8
                    non-selectable
                  "
                  style="width: 100%"
                >
                  <span
                    >{{ prop.node.type }}:{{ prop.node.linkId
                    }}<q-tooltip>
                      {{ $t("components.linkId") }}
                    </q-tooltip></span
                  >
                </div>
              </div>
            </template>
          </q-tree>

          <!-- Button new question first Item  -->
          <div
            v-if="
              selectedItem === undefined ||
              Object.keys(selectedItem).length === 0 ||
              (selectedItem &&
                selectedItem.__active &&
                selectedItem?.__icon === 'article')
            "
          >
            <q-page-sticky position="bottom-left" :offset="[18, 18]">
              <q-fab
                v-model="fabLeft"
                vertical-actions-align="left"
                color="primary"
                push
                icon="keyboard_arrow_up"
                direction="up"
                padding="none xl"
                :label="$t('views.editor.addItem')"
              >
                <q-fab-action
                  v-for="questionTypeIcon in questionTypesIcons"
                  :key="questionTypeIcon.name"
                  label-position="right"
                  color="primary"
                  @click="onAddQuestion(questionTypeIcon)"
                  :icon="questionTypeIcon.icon"
                  :label="questionTypeIcon.label"
                />
              </q-fab>
            </q-page-sticky>
          </div>
        </div>
      </template>

      <!-- Edtion question selected  -->
      <template v-slot:after>
        <q-tab-panels v-model="selected">
          <q-tab-panel :name="selected">
            <div>
              <!--  back Las selected Item -->
              <q-btn
                color="primary"
                v-if="lastSelected"
                icon="arrow_back"
                @click="onBackLastSelectedItem"
                :label="$t('views.editor.backLastItem')"
              />
            </div>
            <div
              class="
                row
                items-center
                justify-between
                text-caption text-grey-8
                non-selectable
              "
              style="width: 100%"
            >
              <span>{{ selectedItem.type }}</span>
            </div>
            <div
              class="row items-center justify-between text-bold text-h5 q-mb-md"
            >
              <!-- Question text -->
              <q-input
                autogrow
                v-model="selectedItem.text"
                class="col-10"
                input-class="text-h5 text-bold"
                :disable="!selectedItem.__active"
                :error="!selectedItem.text"
                :label="
                  selectedItem.text !== selectedItem.__oldText &&
                  !selectedItem.__newQuestion
                    ? `${$t('views.editor.originalText')}: ${
                        selectedItem.__oldText
                      }`
                    : ''
                "
                ><template v-slot:error>
                  {{ $t("components.fieldEmpty") }}
                </template></q-input
              >
              <!-- Show Depedence Condition -->
              <q-btn
                flat
                round
                color="primary"
                icon="device_hub"
                @click="alert = true"
                v-if="selectedItem.__dependeceCondition"
                ><q-tooltip>
                  {{ $t("views.editor.conditionFulfilled") }}
                </q-tooltip></q-btn
              >
              <!-- Question linkId text -->
              <span class="text-grey-6"
                >{{ selectedItem.linkId
                }}<q-tooltip> {{ $t("components.linkId") }} </q-tooltip></span
              >
              <!-- UUID -->
              <q-input
                :disable="!selectedItem.__active"
                v-model="selectedItem.definition"
                :label="$t('views.editor.UUID')"
                dense
                class="col-6"
              >
                <template v-slot:after>
                  <q-btn
                    :disable="!selectedItem.__active"
                    dense
                    flat
                    icon="autorenew"
                    @click="newUUID"
                    >{{ $t("views.editor.newUUID")
                    }}<q-tooltip>
                      {{ $t("views.editor.regenerateUUID") }}
                    </q-tooltip></q-btn
                  >
                </template>
              </q-input>
            </div>
            <!-- AnswerValueSet -->
            <div
              class="row"
              v-if="
                selectedItem.__icon === 'toc' || //choice
                selectedItem.__icon === 'horizontal_split' //open-choice
              "
            >
              <q-checkbox
                :label="
                  selectedItem.__answerValueSetCheck
                    ? ''
                    : $t('views.editor.AnswerValueSet')
                "
                v-model="selectedItem.__answerValueSetCheck"
                :disable="!selectedItem.__active"
                @click="answerValeSet()"
              ></q-checkbox
              ><q-input
                v-if="selectedItem.__answerValueSetCheck"
                :label="$t('views.editor.AnswerValueSet')"
                class="col-5"
                dense
                v-model="selectedItem.answerValueSet"
                :disable="!selectedItem.__active"
                :error="
                  selectedItem.__active && selectedItem.answerValueSet === ''
                "
                ><template v-slot:error>
                  {{ $t("components.fieldEmpty") }}
                </template></q-input
              >
            </div>
            <!-- Answers/Conditions -->
            <q-list padding bordered>
              <!-- Answers -->
              <q-expansion-item
                v-if="
                  !selectedItem.__answerValueSetCheck &&
                  (selectedItem.__icon === 'toc' || //choice
                    selectedItem.__icon === 'horizontal_split') //open-choice
                "
                :disable="!selectedItem.__active"
                expand-separator
                icon="question_answer"
                :label="$t('views.editor.answers')"
              >
                <q-separator />
                <q-card>
                  <!-- Multiple asnwers -->
                  <div
                    v-if="
                      selectedItem.__icon === 'toc' || //choice
                      selectedItem.__icon === 'horizontal_split' //open-choice
                    "
                  >
                    <div class="q-pa-md" style="width: 100%">
                      <q-list dense v-if="!selectedItem.__answerValueSetCheck"
                        ><q-item
                          v-for="answerOption in selectedItem.answerOption"
                          :key="answerOption"
                        >
                          <!-- Open Choice and Choice-->
                          <q-item-section v-if="answerOption">
                            <!-- coding input answer -->
                            <div
                              class="row"
                              v-if="answerOption.__type === 'coding'"
                            >
                              <q-input
                                class="col-12"
                                autogrow
                                v-model="answerOption.valueCoding.display"
                                :disable="!selectedItem.__active"
                                :error="!answerOption.valueCoding.display"
                                :label="
                                  answerOption.valueCoding.display !==
                                    answerOption.valueCoding.__oldDisplay &&
                                  !answerOption.__newAnswer
                                    ? `${$t('views.editor.originalText')}: ${
                                        answerOption.valueCoding.__oldDisplay
                                      }`
                                    : ''
                                "
                                ><template v-slot:error>
                                  {{ $t("components.fieldEmpty") }} </template
                                ><template v-slot:prepend>
                                  <q-icon :name="answerOption.__icon" />
                                </template>
                                <!-- reverse original text answer  -->
                                <q-btn
                                  flat
                                  round
                                  icon="history"
                                  :disable="!selectedItem.__active"
                                  class="q-mr-sm text-grey-8"
                                  v-if="
                                    answerOption?.valueCoding?.display !==
                                      answerOption?.valueCoding?.__oldDisplay &&
                                    !answerOption?.__newAnswer
                                  "
                                  @click="
                                    answerOption.valueCoding.display =
                                      answerOption.valueCoding.__oldDisplay
                                  "
                                  ><q-tooltip>
                                    {{ $t("components.reverseAnswer") }}
                                  </q-tooltip></q-btn
                                >
                              </q-input>
                            </div>
                            <!-- integer input answer -->
                            <div
                              class="row"
                              v-if="answerOption.__type === 'integer'"
                            >
                              <q-input
                                class="col-12"
                                @keypress="onlyNumber"
                                autogrow
                                v-model="answerOption.valueInteger"
                                :disable="!selectedItem.__active"
                                :label="
                                  answerOption.valueInteger !==
                                    answerOption.__oldValueInteger &&
                                  !answerOption.__newAnswer
                                    ? `${$t('views.editor.originalText')}: ${
                                        answerOption.__oldValueInteger
                                      }`
                                    : ''
                                "
                                ><template v-slot:prepend>
                                  <q-icon :name="answerOption.__icon" />
                                </template>
                                <!-- reverse original text answer  -->
                                <q-btn
                                  flat
                                  round
                                  icon="history"
                                  :disable="!selectedItem.__active"
                                  class="q-mr-sm text-grey-8"
                                  v-if="
                                    answerOption.valueInteger !==
                                      answerOption.__oldValueInteger &&
                                    !answerOption.__newAnswer
                                  "
                                  @click="
                                    answerOption.valueInteger =
                                      answerOption.__oldValueInteger
                                  "
                                  ><q-tooltip>
                                    {{ $t("components.reverseAnswer") }}
                                  </q-tooltip></q-btn
                                >
                              </q-input>
                            </div>

                            <!-- date input answer -->
                            <div
                              class="row"
                              v-if="answerOption.__type === 'date'"
                            >
                              <q-input
                                type="date"
                                class="col-12"
                                v-model="answerOption.valueDate"
                                :disable="!selectedItem.__active"
                                :label="
                                  answerOption.valueDate !==
                                    answerOption.__oldValueDate &&
                                  !answerOption.__newAnswer
                                    ? `${$t('views.editor.originalText')}: ${
                                        answerOption.__oldValueDate
                                      }`
                                    : ''
                                "
                                ><template v-slot:prepend>
                                  <q-icon :name="answerOption.__icon" />
                                </template>
                                <!-- reverse original text answer  -->
                                <q-btn
                                  flat
                                  round
                                  icon="history"
                                  :disable="!selectedItem.__active"
                                  class="q-mr-sm text-grey-8"
                                  v-if="
                                    answerOption.valueDate !==
                                      answerOption.__oldValueDate &&
                                    !answerOption.__newAnswer
                                  "
                                  @click="
                                    answerOption.valueDate =
                                      answerOption.__oldValueDate
                                  "
                                  ><q-tooltip>
                                    {{ $t("components.reverseAnswer") }}
                                  </q-tooltip></q-btn
                                >
                              </q-input>
                            </div>

                            <!-- string input answer -->
                            <div
                              class="row"
                              v-if="answerOption.__type === 'string'"
                            >
                              <q-input
                                class="col-12"
                                autogrow
                                v-model="answerOption.valueString"
                                :disable="!selectedItem.__active"
                                :label="
                                  answerOption.valueString !==
                                    answerOption.__oldValueString &&
                                  !answerOption.__newAnswer
                                    ? `${$t('views.editor.originalText')}: ${
                                        answerOption.__oldValueString
                                      }`
                                    : ''
                                "
                                ><template v-slot:prepend>
                                  <q-icon :name="answerOption.__icon" />
                                </template>
                                <!-- reverse original text answer  -->
                                <q-btn
                                  flat
                                  round
                                  icon="history"
                                  :disable="!selectedItem.__active"
                                  class="q-mr-sm text-grey-8"
                                  v-if="
                                    answerOption.valueString !==
                                      answerOption.__oldValueString &&
                                    !answerOption.__newAnswer
                                  "
                                  @click="
                                    answerOption.valueString =
                                      answerOption.__oldValueString
                                  "
                                  ><q-tooltip>
                                    {{ $t("components.reverseAnswer") }}
                                  </q-tooltip></q-btn
                                >
                              </q-input>
                            </div>
                          </q-item-section>
                          <q-item-section top side class="justify-center">
                            <div class="row items-center">
                              <!--  If answer Item is Coding Display Code and System input-->
                              <div
                                class="row"
                                v-if="answerOption.__type === 'coding'"
                              >
                                <q-input
                                  :disable="!selectedItem.__active"
                                  :label="$t('views.editor.code')"
                                  outlined
                                  dense
                                  class="col-5"
                                  v-model="answerOption.valueCoding.code"
                                ></q-input
                                ><q-input
                                  :disable="!selectedItem.__active"
                                  :label="$t('views.editor.system')"
                                  outlined
                                  dense
                                  class="col-5"
                                  v-model="answerOption.valueCoding.system"
                                ></q-input>
                              </div>
                              <div class="text-grey-8">
                                <!-- Remove answer  -->
                                <q-btn
                                  flat
                                  round
                                  color="grey-6"
                                  icon="highlight_off"
                                  :disable="!selectedItem.__active"
                                  @click="onRemoveAnswer(answerOption)"
                                  ><q-tooltip>
                                    {{ $t("components.remove") }}
                                  </q-tooltip></q-btn
                                >
                              </div>
                            </div>
                          </q-item-section>
                        </q-item></q-list
                      >

                      <!--  button add new Answer -->
                      <q-page-sticky
                        position="bottom-right"
                        :offset="[18, 35]"
                        v-if="selectedItem.__active"
                      >
                        <q-fab
                          padding="none xl"
                          fab
                          icon="add"
                          :label="$t('views.editor.addAnswer')"
                          direction="left"
                          color="primary"
                          v-if="!selectedItem.__answerValueSetCheck"
                        >
                          <q-fab-action
                            v-for="answerType in answerTypeButton"
                            :key="answerType.name"
                            color="primary"
                            :icon="answerType.icon"
                            :label="answerType.label"
                            @click="onClickAddAnswer(answerType)"
                          />
                        </q-fab>
                      </q-page-sticky>
                    </div>
                  </div>
                </q-card>
              </q-expansion-item>
              <!-- Item Condition -->
              <q-expansion-item
                :disable="!selectedItem.__active"
                expand-separator
                icon="account_tree"
                :label="$t('views.editor.itemConditions')"
                default-opened
              >
                <q-separator />
                <q-card>
                  <q-list
                    dense
                    bordered
                    padding
                    class="rounded-borders"
                    v-for="(enableWhen, index) in selectedItem.enableWhen"
                    :key="enableWhen"
                  >
                    <q-item-section>
                      <q-card-section>
                        <div class="row">
                          <div class="col-1">
                            <!-- Go to question Item  -->
                            <q-btn
                              :disable="!selectedItem.__active"
                              v-if="enableWhen.question !== ''"
                              flat
                              color="primary"
                              icon="subdirectory_arrow_left"
                              @click="onGotoItem(enableWhen.question)"
                              ><q-tooltip>
                                {{ $t("views.editor.navigateToItem") }}
                              </q-tooltip></q-btn
                            >
                          </div>

                          <q-input
                            :disable="!selectedItem.__active"
                            :label="`${$t('views.editor.question')}: ${
                              enableWhen.type
                            }`"
                            dense
                            v-model="enableWhen.question"
                            @click="onShowQuestionsItems(enableWhen)"
                          >
                          </q-input>
                          <q-select
                            :disable="!selectedItem.__active"
                            class="col-2"
                            v-model="enableWhen.operator"
                            :options="[
                              'exists',
                              '=',
                              '!=',
                              '>',
                              '<',
                              '>=',
                              '<=',
                            ]"
                            :label="$t('views.editor.operator')"
                            dense
                          />
                          <!-- enableWhen boolean -->
                          <q-select
                            v-if="
                              enableWhen.type === 'boolean' ||
                              enableWhen.operator === 'exists'
                            "
                            :disable="!selectedItem.__active"
                            class="col-4"
                            v-model="enableWhen.answer"
                            :options="['true', 'false']"
                            :label="$t('views.editor.operator')"
                            dense
                          />
                          <!-- enableWhen integer -->
                          <q-input
                            v-else-if="enableWhen.type === 'integer'"
                            @keypress="onlyNumber"
                            :disable="!selectedItem.__active"
                            :label="$t('views.editor.answer')"
                            class="col-4"
                            v-model="enableWhen.answer"
                            :type="enableWhen.type"
                            dense
                          />
                          <!-- enableWhen decimal -->
                          <q-input
                            v-else-if="enableWhen.type === 'decimal'"
                            :disable="!selectedItem.__active"
                            @keypress="onlyNumberDec"
                            :label="$t('views.editor.answer')"
                            class="col-4"
                            v-model="enableWhen.answer"
                            type="number"
                            dense
                          />
                          <q-input
                            v-else
                            :disable="!selectedItem.__active"
                            :label="$t('views.editor.answer')"
                            class="col-4"
                            v-model="enableWhen.answer"
                            :type="enableWhen.type"
                            dense
                          />
                          <!--  remove item enable when -->
                          <q-btn
                            :disable="!selectedItem.__active"
                            flat
                            color="grey-6"
                            icon="highlight_off"
                            @click="onRemoveCondition(index)"
                          >
                            <q-tooltip>
                              {{ $t("components.remove") }}
                            </q-tooltip>
                          </q-btn>
                        </div>
                        <!-- add new Condition -->
                      </q-card-section>
                    </q-item-section>
                  </q-list>
                  <q-page-sticky position="bottom-right" :offset="[18, 10]">
                    <q-btn
                      padding="none xl"
                      v-if="selectedItem.__active"
                      fab
                      icon="add"
                      color="primary"
                      :label="$t('views.editor.addNewCondition')"
                      @click="onAddCondition"
                    />
                  </q-page-sticky>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
    <!-- Alert condition -->
    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div class="text-h6"></div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div
            v-for="(question, index) in selectedItem.__dependeceCondition
              .__questions"
            :key="index"
          >
            <div class="q-pb-sm">
              <span class="text-red q-pr-xs">{{ question.__linkId }}</span
              >{{ question.__text }}
            </div>
            <div class="text-bold q-pb-sm">
              {{ $t("views.editor.enableWhenCondition") }}
            </div>
            <div class="row">
              <div class="q-pr-xs">{{ index + 1 }}</div>
              <div class="column" style="width: 250px">
                <div class="row justify-between">
                  <div>{{ $t("views.editor.question") }}:</div>
                  <div>{{ question.__question }}</div>
                </div>
                <div class="row justify-between">
                  <div>{{ $t("views.editor.operator") }}:</div>
                  <div>{{ question.__operator }}</div>
                </div>
                <div class="row justify-between">
                  <div>
                    {{ $t("views.editor.answer") }}{{ question.__type }}:
                  </div>
                  <div>{{ question.__answer }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Condition Item Dialog -->
    <q-dialog v-model="layout"
      ><cx-enable-When
        :internalID="selected"
        v-on:choiceQuestion="onSelectedQuestionsAnswer"
        v-on:question="onSelectedQuestion"
      ></cx-enable-When
    ></q-dialog>
  </div>
</template>
<script>
import {
  questionTypesIcons,
  questionTypes,
  answerType,
  answerTypeButton,
  COLORS,
} from "../utils/constants.js";
import { useQuasar } from "quasar";
import { ref } from "vue";
import { edtiorTools } from "../utils/editor.js";
import { mapGetters } from "vuex";
import { v4 as uuidv4 } from "uuid";
import cxEnableWhen from "../components/cxEnableWhen.vue";
export default {
  components: {
    cxEnableWhen,
  },
  setup() {
    const $q = useQuasar();
    return {
      triggerNegative() {
        $q.notify({
          type: "negative",
          message: this.$t("views.editor.questionDontexist"),
        });
      },
      layout: ref(false),
      alert: ref(false),
      itemsAnwers: ref(""),
      edtiorTools,
      questionTypesIcons,
      questionTypes,
      answerType,
      COLORS,
      uuidv4,
      answerTypeButton,
    };
  },
  created() {
    this.questionaireGUI = this.getQuestionnaireImportedJSON;
    this.item = this.questionaireGUI.item;
  },
  data() {
    return {
      fabLeft: true,
      splitterModel: 35,
      selected: null,
      selectedItem: {},
      item: [],
      questionaireGUI: {},
      enableWhenItem: {},
      lastSelected: null,
      lastSelectedItem: {},
      limitsSpliter: [35, 100],
    };
  },
  methods: {
    onBackLastSelectedItem() {
      if (this.lastSelected) {
        this.selectedItem = this.lastSelectedItem;
        this.selected = this.lastSelected;
        this.lastSelectedItem = {};
        this.lastSelected = null;
      }
    },
    onGotoItem($event) {
      if ($event === null || $event === "") {
        //no value Item to go
        return;
      }
      const itemSelected = this.edtiorTools.getCurrentQuestionNodeByLinkId(
        $event,
        this.item
      );
      if (Object.keys(itemSelected).length > 0) {
        this.lastSelected = this.selected;
        this.lastSelectedItem = this.selectedItem;

        this.selectedItem = itemSelected;
        this.selected = itemSelected.__internalID;
      } else {
        this.triggerNegative();
      }
    },
    onlyNumberDec($event) {
      //console.log($event.keyCode); //keyCodes value
      let keyCode = $event.keyCode ? $event.keyCode : $event.which;
      if ((keyCode < 48 || keyCode > 57) && keyCode !== 46 && keyCode !== 44) {
        // 46 is dot
        $event.preventDefault();
      }
    },
    onlyNumber($event) {
      //console.log($event.keyCode); //keyCodes value
      let keyCode = $event.keyCode ? $event.keyCode : $event.which;
      if (keyCode < 48 || keyCode > 57) {
        $event.preventDefault();
      }
    },
    onSelectedQuestionsAnswer(e) {
      this.enableWhenItem.question = e.linkId;
      this.enableWhenItem.answer = e.valueCoding.code;
      this.enableWhenItem.display = e.valueCoding.display;
      this.enableWhenItem.system = e.valueCoding.system;
      this.enableWhenItem.type = e.type;
      this.layout = false;
    },
    onSelectedQuestion(e) {
      this.enableWhenItem.question = e.linkId;
      this.enableWhenItem.answer = "";
      this.enableWhenItem.type = e.type;
      this.layout = false;
    },
    onAddCondition() {
      if (this.selectedItem.enableWhen === undefined) {
        this.selectedItem.enableWhen = [];
      }
      this.selectedItem.enableWhen.push({
        question: "",
        operator: "",
        answer: "",
        type: "",
      });
    },
    onRemoveCondition(index) {
      this.selectedItem.enableWhen.splice(index, 1);
    },
    onShowQuestionsItems(enableWhen) {
      this.enableWhenItem = enableWhen;
      //console.log(enableWhen);
      this.layout = true;
    },
    answerValeSet() {
      if (this.selectedItem.__answerValueSetCheck) {
        this.selectedItem.answerOption = [];
      }
      if (!this.selectedItem.__answerValueSetCheck) {
        this.selectedItem.answerValueSet = "";
      }
    },
    newUUID() {
      this.selectedItem.definition = uuidv4();
    },
    onDragStart(e) {
      e.dataTransfer.setData("text", e.target.id);
    },
    onDragOver(e) {
      e.preventDefault();
      e.currentTarget.style.backgroundColor = this.COLORS.itemDragOver;
    },
    onDragLeave(e) {
      e.preventDefault();
      e.currentTarget.style.backgroundColor = "";
    },
    onDrop(e) {
      /*console.log(
        "----------------------------------------------------------------"
      ); */
      e.preventDefault();
      e.currentTarget.style.backgroundColor = "";
      e.currentTarget.style.cursor = "default";
      const draggedId = e.dataTransfer.getData("text");

      //console.log("Id of Ele dragstart: ", draggedId);

      const itemSource = this.edtiorTools.getCurrentQuestionNodeByID(
        draggedId,
        this.item
      );

      /*console.log("itemSource: ", itemSource); */

      if (Object.keys(itemSource).length === 0) {
        //No valid source Item
        return;
      }

      const internalIDTarget = this.edtiorTools.getInternalIDFromEhandler(e);

      /*console.log("Id of Ele Target: ", internalIDTarget); */

      if (draggedId === internalIDTarget) return; //No allow drag it in same Item

      const itemTarget = this.edtiorTools.getCurrentQuestionNodeByID(
        internalIDTarget,
        this.item
      );

      /*console.log("itemTarget to Be dragged: ", itemTarget); */

      if (itemTarget.linkId === "" || itemSource.linkId === "") {
        return;
      }

      //check if source Item Is the parent for target-> Not Allow
      const itemNodeChild = this.edtiorTools.getCurrentQuestionNodeByID(
        itemTarget.__internalID,
        itemSource.item
      );
      if (Object.keys(itemNodeChild).length > 0) {
        return;
      }

      if (Object.keys(itemTarget).length === 0) {
        //No valid target Item
        return;
      }

      if (!itemTarget.__active && !this.edtiorTools.isPreviousQuestion(e)) {
        return; //No allow  drag it in items inactives
      }

      if (
        itemTarget.__icon !== "article" &&
        !this.edtiorTools.isPreviousQuestion(e)
      ) {
        return; //only question can be drag in group questions
      }

      const aitemParentSource = this.edtiorTools.getArraySource(
        draggedId,
        this.item
      );

      /*console.log("Array item Parent Source: ", aitemParentSource); */

      const itemToBeMoved = this.edtiorTools.getCurrentQuestionNodeByID(
        draggedId,
        this.item
      );

      if (itemToBeMoved.item) {
        //no allow more than 5 levels of items, nested Items
        let numLevel = this.edtiorTools.getNumbersMaxOfLevels(
          itemToBeMoved.item
        );
        numLevel++; //count parent
        let totalOfLevelts = itemTarget.linkId.split(".").length + numLevel;
        if (totalOfLevelts > 5) {
          return;
        }
      }

      if (
        itemTarget.linkId.split(".").length >= 4 &&
        itemToBeMoved.__icon === "article"
      ) {
        return; //no allow more than 5 levels of items
      }

      const aitemParentTarget = this.edtiorTools.getArraySource(
        internalIDTarget,
        this.item
      );

      /*console.log("Array item Parent Target: ", aitemParentTarget); */

      const indexOfItemtoBeInsert = this.edtiorTools.getIndexItem(
        internalIDTarget,
        aitemParentTarget
      );

      /*console.log("index Of Item to Be Insert: ", indexOfItemtoBeInsert); */

      let indexOfItemtoBeRemoved = this.edtiorTools.getIndexItem(
        draggedId,
        aitemParentSource
      );

      /*console.log("index Of Item to Be Removed: ", indexOfItemtoBeRemoved); */

      //Insert Inside Group Item: at the end
      if (e.currentTarget.id.split("_").length === 1) {
        if (!itemTarget.item) {
          itemTarget.item = [];
        }
        itemTarget.item.push(itemToBeMoved);
      } else {
        //Insert before Item
        aitemParentTarget.splice(indexOfItemtoBeInsert, 0, itemToBeMoved);

        if (aitemParentSource === aitemParentTarget) {
          if (indexOfItemtoBeInsert < indexOfItemtoBeRemoved) {
            indexOfItemtoBeRemoved++;
          }
        }
      }
      aitemParentSource.splice(indexOfItemtoBeRemoved, 1);
      this.edtiorTools.regenerateLinkIds(this.item);
      this.edtiorTools.regenerateInternalIDs(this.item);
    },
    onToggle(id) {
      this.edtiorTools.disableEntireItemQuestion(id, this.item);
      this.edtiorTools.regenerateLinkIds(this.item);
    },
    onAddQuestion(e) {
      //No Add Question on Items disabled
      if (this.selectedItem) {
        if (this.selectedItem.__active === false) {
          return;
        }
      }
      //No allow add question more than 5 levels
      if (
        this.selectedItem?.linkId?.split(".").length >= 4 &&
        e.name === this.questionTypes.group
      )
        return;
      const item = this.edtiorTools.getTypeObjQuestion(e.name);
      item.text = this.$t("views.editor.newQuestion");
      if (this.selected !== null) {
        //only add questions in items type group
        if (this.selectedItem.__icon !== "article") return;
        if (this.selectedItem.item) {
          const lastItem = this.selectedItem.item.slice(-1)[0];
          item.__linkId = this.edtiorTools.getNextID(lastItem.__linkId);
          item.linkId = this.edtiorTools.getNextID(lastItem.linkId);
        } else {
          this.selectedItem.item = [];
          item.__linkId = this.selected + "." + 1;
          item.linkId = item.__linkId;
        }
        this.selectedItem.item.push(item);
      } else {
        item.__linkId = this.item.length + 1 + "";
        this.item.push(item);
      }
      this.edtiorTools.regenerateLinkIds(this.item);
    },
    onClickAddAnswerOpenChiose(e) {
      //only choise answer are allowed to open-choise questions
      let answerOption = {};
      if (e.type == "choice") {
        answerOption = this.edtiorTools.getNewAnswerValueCoding(
          { text: "", type: e.type },
          this.selectedItem.answerOption
        );
      }
      if (e.type == "open-choice") {
        answerOption = this.edtiorTools.getNewAnswerValueString(
          { text: "Answer", type: e.type },
          this.selectedItem.answerOption
        );
      }
      if (!this.selectedItem.answerOption) {
        this.selectedItem.answerOption = [];
      }
      this.selectedItem.answerOption.push(answerOption);
    },
    onClickAddAnswer(e) {
      const that = this;
      let newItemAnswer;

      if (!this.selectedItem.answerOption) {
        this.selectedItem.answerOption = [];
      }

      if (e.name === "coding") {
        newItemAnswer = this.edtiorTools.getNewAnswerValueCoding(
          { text: "", type: that.selectedItem.type },
          this.selectedItem.answerOption
        );
      } else {
        newItemAnswer = {
          __icon: e.icon,
          __id: that.selectedItem.answerOption.length,
          __newAnswer: true,
          __type: e.name,
        };
      }
      if (e.name === "integer") {
        newItemAnswer.valueInteger = "";
      }
      if (e.name === "date") {
        newItemAnswer.valueDate = "";
      }
      if (e.name === "string") {
        newItemAnswer.valueString = "";
      }

      this.selectedItem.answerOption.push(newItemAnswer);
    },
    onRemoveAnswer(e) {
      const indexOfItemtoBeRemoved = this.edtiorTools.getIndexAnswer(
        e.__id,
        this.selectedItem.answerOption
      );
      this.selectedItem.answerOption.splice(indexOfItemtoBeRemoved, 1);
    },
  },
  computed: {
    ...mapGetters(["getQuestionnaireImportedJSON"]),
    aAddAnswerButtonOptions: function () {
      const that = this;
      let optionsAnswers = [];
      if (this.answerType.open_choice.name === this.selectedItem.type) {
        optionsAnswers = [
          {
            text: that.$t("views.editor.optionsAnswers.open"),
            __icon: that.answerType.open_choice.icon,
            type: that.answerType.open_choice.name,
          },
          {
            text: that.$t("views.editor.optionsAnswers.choice"),
            __icon: that.answerType.choice.icon,
            type: that.answerType.choice.name,
          },
        ];
      }
      return optionsAnswers;
    },
    answerTypeField: function () {
      let type = "";
      if (this.selectedItem.type === "date") {
        type = "date";
      }
      if (
        this.selectedItem.type === "decimal" ||
        this.selectedItem.type === "integer"
      ) {
        type = "number";
      }
      return type;
    },
  },
  watch: {
    selected(val) {

      this.edtiorTools.removeCondionDependece(this.item);
      this.edtiorTools.setConditionDependence(this.item,this.item);
      if (val === null) {
        this.selectedItem = this.item.item;
        return;
      }
      this.selectedItem = this.edtiorTools.getCurrentQuestionNodeByID(
        val,
        this.item
      );
    },
    lastSelected(val) {
      if (val) {
        this.limitsSpliter = [0, 100];
        this.splitterModel = 0;
      } else {
        this.limitsSpliter = [35, 100];
        this.splitterModel = 35;
      }
    },
  },
};
</script>
