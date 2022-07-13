<template>
  <div class="row justify-center">
    <div class="col-6">
      <q-input
        v-if="$route.name !== 'Import'"
        v-model="version"
        :label="$t('components.navigationBar.version')"
      />
      <q-list class="rounded-borders">
        <q-expansion-item
          :label="$t('components.navigationBar.metadataItems.identifier')"
          v-model="expanded"
        >
          <q-separator />
          <q-card>
            <!-- Btn Add Identifier -->
            <div class="row">
              <q-btn
                class="q-ma-sm"
                outline
                color="primary"
                size="sm"
                @click="addId"
              >
                <q-icon left name="add" />
                <div>
                  {{ $t("views.tabs.metadata.addNewId") }}
                </div></q-btn
              >
            </div>
            <!-- identifier -->
            <q-list
              dense
              bordered
              padding
              class="rounded-borders"
              v-for="(id, index) in identifier"
              :key="id"
            >
              <!-- Btn Remove Identifier -->
              <div class="row justify-end">
                <q-btn
                  class="q-ma-sm"
                  unelevated
                  color="negative"
                  size="sm"
                  @click="removeID(index)"
                >
                  <q-icon left name="add" />
                  <div>
                    {{ $t("views.tabs.metadata.removeId") }}
                  </div></q-btn
                >
              </div>
              <q-item-section>
                <q-card-section>
                  <div class="row">
                    <div class="col-3">
                      <!-- use -->
                      <q-input
                        v-model="id.use"
                        dense
                        class="q-mr-sm"
                        :label="$t('views.tabs.metadata.use')"
                      />
                    </div>
                    <div class="col-3">
                      <!-- system -->
                      <q-input
                        v-model="id.system"
                        dense
                        class="q-mr-sm"
                        :label="$t('views.tabs.metadata.system')"
                      />
                    </div>
                    <div class="col-3">
                      <!-- value -->
                      <q-input
                        v-model="id.value"
                        dense
                        class="q-mr-sm"
                        :label="$t('views.tabs.metadata.value')"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="row q-my-sm text-weight-medium">
                      {{ $t("views.tabs.metadata.type.type") }}
                    </div>
                  </div>
                  <q-card flat bordered class="my-card">
                    <q-card-section>
                      <div class="text-subtitle2 text-deep-orange q-my-md">
                        {{ $t("views.tabs.metadata.type.coding.coding") }}
                      </div>
                      <q-separator />
                      <div class="row">
                        <div class="col-3">
                          <!-- system -->
                          <q-input
                            v-model="id.type.coding.system"
                            dense
                            class="q-mr-sm"
                            :label="
                              $t('views.tabs.metadata.type.coding.system')
                            "
                          />
                        </div>
                        <div class="col-2">
                          <!-- version -->
                          <q-input
                            v-model="id.type.coding.version"
                            dense
                            class="q-mr-sm"
                            :label="
                              $t('views.tabs.metadata.type.coding.version')
                            "
                          />
                        </div>
                        <div class="col-2">
                          <!-- code -->
                          <q-input
                            v-model="id.type.coding.code"
                            dense
                            class="q-mr-sm"
                            :label="$t('views.tabs.metadata.type.coding.code')"
                          />
                        </div>
                        <div class="col-3">
                          <!-- display -->
                          <q-input
                            v-model="id.type.coding.display"
                            dense
                            class="q-mr-sm"
                            :label="
                              $t('views.tabs.metadata.type.coding.display')
                            "
                          />
                        </div>
                        <div class="col-2">
                          <!-- userSelected -->
                          <div class="q-gutter-sm">
                            <q-checkbox
                              left-label
                              v-model="id.type.coding.userSelected"
                              :label="
                                $t(
                                  'views.tabs.metadata.type.coding.userSelected'
                                )
                              "
                            />
                          </div>
                        </div>
                      </div>
                      <div class="text-subtitle2 text-deep-orange q-my-md">
                        {{ $t("views.tabs.metadata.type.text") }}
                      </div>
                      <q-separator />
                      <div class="row">
                        <div class="col-3">
                          <!-- system -->
                          <q-input
                            v-model="id.type.text"
                            dense
                            class="q-mr-sm"
                            :label="$t('views.tabs.metadata.type.text')"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                  <div class="row q-my-sm text-weight-medium">
                    {{ $t("views.tabs.metadata.period.period") }}
                  </div>
                  <div class="row">
                    <div class="col-3">
                      <!-- start -->
                      <q-input
                        v-model="id.period.start"
                        dense
                        type="date"
                        stack-label
                        class="q-mr-sm"
                        :label="$t('views.tabs.metadata.period.start')"
                      />
                    </div>
                    <div class="col-3">
                      <!-- end -->
                      <q-input
                        v-model="id.period.end"
                        dense
                        type="date"
                        stack-label
                        class="q-mr-sm"
                        :label="$t('views.tabs.metadata.period.end')"
                      />
                    </div>
                  </div> </q-card-section
              ></q-item-section>
            </q-list>
          </q-card>
        </q-expansion-item>
      </q-list>
      <q-input
        v-if="$route.name !== 'Import'"
        v-model="URL"
        :label="$t('components.navigationBar.metadataItems.URL')"
      />
      <q-input
        v-if="$route.name !== 'Import'"
        v-model="name"
        :label="$t('components.navigationBar.metadataItems.name')"
      />
      <q-input
        v-if="$route.name !== 'Import'"
        v-model="status"
        :label="$t('components.navigationBar.metadataItems.status')"
      />
      <q-input
        v-if="$route.name !== 'Import'"
        type="date"
        class="col-12"
        stack-label
        v-model="date"
        :label="$t('components.navigationBar.metadataItems.date')"
      />
      <q-input
        v-if="$route.name !== 'Import'"
        type="date"
        class="col-12"
        stack-label
        v-model="approvalDate"
        :label="$t('components.navigationBar.metadataItems.approvalDate')"
      />
      <q-input
        v-if="$route.name !== 'Import'"
        type="date"
        class="col-12"
        stack-label
        v-model="lastReviewDate"
        :label="$t('components.navigationBar.metadataItems.lastReviewDate')"
      />
      <q-input
        v-if="$route.name !== 'Import'"
        v-model="title"
        :label="$t('components.navigationBar.metadataItems.title')"
      />
       <q-item tag="label" v-ripple v-if="$route.name !== 'Import'">
        <q-item-section>
          <q-item-label>{{$t('components.navigationBar.metadataItems.experimental')}}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle color="red" v-model="experimental"/>
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { ref } from "vue";

export default {
  setup() {
    return {
      expanded: ref(true),
    };
  },
  computed: {
    ...mapGetters([
      "getNameofQuestionnaire",
      "getQuestionnaireImportedJSON",
      "getVersionQuestionnaire",
    ]),
    version: {
      get() {
        return this.$store.state.questionnaireImported.version;
      },
      set(value) {
        this.$store.commit("setVersion", value);
      },
    },
    identifier: {
      get() {
        return this.$store.state.questionnaireImported.identifier;
      },
      set(value) {
        this.$store.commit("setIdentifier", value);
      },
    },
    URL: {
      get() {
        return this.$store.state.questionnaireImported.url;
      },
      set(value) {
        this.$store.commit("setURL", value);
      },
    },
    name: {
      get() {
        return this.$store.state.questionnaireImported.name;
      },
      set(value) {
        this.$store.commit("setName", value);
      },
    },
    title: {
      get() {
        return this.$store.state.questionnaireImported.title;
      },
      set(value) {
        this.$store.commit("setTitle", value);
      },
    },
    status: {
      get() {
        return this.$store.state.questionnaireImported.status;
      },
      set(value) {
        this.$store.commit("setStatus", value);
      },
    },
    publisher: {
      get() {
        return this.$store.state.questionnaireImported.publisher;
      },
      set(value) {
        this.$store.commit("setPublisher", value);
      },
    },
    date: {
      get() {
        return this.$store.state.questionnaireImported.date;
      },
      set(value) {
        this.$store.commit("setDate", value);
      },
    },
    approvalDate: {
      get() {
        return this.$store.state.questionnaireImported.approvalDate;
      },
      set(value) {
        this.$store.commit("setApprovalDate", value);
      },
    },
    lastReviewDate: {
      get() {
        return this.$store.state.questionnaireImported.lastReviewDate;
      },
      set(value) {
        this.$store.commit("setLastReviewDate", value);
      },
    },
    experimental: {
      get() {
        return this.$store.state.questionnaireImported.experimental;
      },
      set(value) {
        this.$store.commit("setExperimental", value);
      },
    },
  },
  methods: {
    addId() {
      let newID = {
        use: "",
        system: "",
        value: "",
        period: {
          start: "",
          end: "",
        },
        type: {
          coding: {
            system: "",
            version: "",
            code: "",
            display: "",
            userSelected: false,
          },
          text: "",
        },
      };
      this.$store.state.questionnaireImported.identifier.push(newID);
    },
    removeID(indexID) {
      this.$store.state.questionnaireImported.identifier.splice(indexID, 1);
    },
  },
};
</script>
