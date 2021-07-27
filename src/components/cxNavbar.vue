<template>
  <q-toolbar>
    <q-img src="@/assets/logo.png" width="120px" class="toolbar_logo" />
    <!-- version -->
    <q-input
      v-if="$route.name !== 'Import'"
      v-model="version"
      :label="$t('components.navigationBar.version')"
    />
    <q-toolbar-title class="text-center">{{
      getNameofQuestionnaire
    }}</q-toolbar-title>
    <q-btn
      icon="upload_file"
      flat
      stack
      no-caps
      v-if="$route.name !== 'Import'"
      @click="importing"
      >{{ $t("components.navigationBar.ImportJSONBtn") }}</q-btn
    >
    <q-btn
      v-if="$route.name !== 'Import'"
      icon="download_file"
      flat
      stack
      no-caps
      @click="exporting"
      >{{ $t("components.navigationBar.ExportJSONBtn") }}</q-btn
    >
  </q-toolbar>

  <!-- alert of leaving the screen -->

  <q-dialog v-model="alertWantToLeaveScreen">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          <q-icon name="warning" class="text-red" style="font-size: 2rem" />
          {{ $t("components.navigationBar.warningLeaveDialog.title") }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ $t("components.navigationBar.warningLeaveDialog.instructions") }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="$t('components.navigationBar.warningLeaveDialog.cancel')"
          color="primary"
          v-close-popup
        />
        <q-btn
          flat
          :label="$t('components.navigationBar.warningLeaveDialog.continue')"
          color="primary"
          v-close-popup
          @click="continueLeavingEditionScreen"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- alert of If someting happend the screen -->

  <q-dialog v-model="alertError">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          <q-icon name="warning" class="text-amber" style="font-size: 2rem" />
          {{ $t("messagesErrors.warning") }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ messageError }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="$t('components.navigationBar.warningLeaveDialog.continue')"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="alert">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          <q-icon
            name="check_circle"
            class="text-green"
            style="font-size: 2rem"
          />
          {{ $t("export.successfully") }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import { ref } from "vue";
import { mapGetters, mapMutations } from "vuex";
import { useQuasar } from "quasar";
import FileSaver from "file-saver";
import { exportJsonQuestionnaire } from "../utils/exportJson";
export default {
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
  },
  data() {
    return {
      questionaireGUI: {},
      messageError: "",
    };
  },
  setup() {
    const $q = useQuasar();
    return {
      exportJsonQuestionnaire,
      showLoading() {
        $q.loading.show();
      },
      hideLoading() {
        $q.loading.hide();
      },
      alertWantToLeaveScreen: ref(false),
      alertError: ref(false),
      alert: ref(false),
      FileSaver,
      useQuasar,
    };
  },
  created() {
    this.questionaireGUI = this.getQuestionnaireImportedJSON
      ? this.getQuestionnaireImportedJSON
      : {};
  },
  methods: {
    ...mapMutations(["resetQuestionnaire", "updateVersion"]),
    importing: function () {
      this.alertWantToLeaveScreen = true;
    },
    continueLeavingEditionScreen: function () {
      this.resetQuestionnaire();
      this.$router.push("Import");
      //resetear los objetos de las preguntas
    },
    async exporting() {
      try {
        this.showLoading();
        const objToExport = this.getQuestionnaireImportedJSON;
        if (this.version !== "") {
          this.getQuestionnaireImportedJSON.version = this.version;
        } else {
          delete this.getQuestionnaireImportedJSON.version;
        }
        const objFinalToExport = JSON.stringify(
          this.exportJsonQuestionnaire.getExportObject(objToExport)
        );
        var blob = new Blob([objFinalToExport], {
          type: "application/json;charset=utf-8",
        });
        const opts = {
          suggestedName: this.getNameofQuestionnaire,
          types: [
            {
              description: "JSON",
              accept: { "application/json": [".json"] },
            },
          ],
        };
        
        const newHandle = await window.showSaveFilePicker(opts);

        const writableStream = await newHandle.createWritable();
        // write our file
        await writableStream.write(blob);

        // close the file and write the contents to disk.
        await writableStream.close();
        this.hideLoading();
        this.alert = true;
      } catch (e) {
        if (e.message !== "The user aborted a request.") {
          this.messageError = this.$t("messagesErrors.fileNoExported");
          this.alertError = true;
          this.FileSaver.saveAs(blob, `${this.getNameofQuestionnaire}.json`);
        }
        this.hideLoading();
      }
    },
  },
};
</script>
<style scoped>
.toolbar_logo {
  margin: 15px;
}
</style>
