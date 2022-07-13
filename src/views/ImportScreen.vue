<template>
  <q-page class="q-pa-md" style="min-height: 80vh">
    <div class="row items-center justify-center example-drag">
      <div class="upload">
        <div
          v-show="$refs.upload && $refs.upload.dropActive"
          class="drop-active"
        >
          <h4>{{ $t("views.import.dropFile") }}</h4>
        </div>

        <div
          class="column justify-start"
          style="max-height: 250px; max-width: 450px; color: #888888"
        >
          <file-upload
            post-action="/upload/post"
            :drop="true"
            v-model="files"
            ref="upload"
            put-action="/put.method"
            @input-file="inputFile"
            @input-filter="inputFilter"
          >
            <div class="column items-center">
              <q-icon name="upload_file" size="xl" />
              <h4>{{ $t("views.import.dropFile") }}</h4>
              <p>
                {{ $t("views.import.instructions") }}
              </p>
            </div>
          </file-upload>
        </div>
      </div>
    </div>
  </q-page>

  <!-- alert of If someting happend the screen -->

  <q-dialog v-model="alertError">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          <q-icon name="error" class="text-red" style="font-size: 2rem" />
          {{ $t("messagesErrors.error") }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ messageError }}
        <ul>
          <li v-for="message in messageErrorFHIR" :key="message">
            {{ message }}
          </li>
        </ul>
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
</template>

<script>
// @ is an alias to /src
import FileUpload from "vue-upload-component";
import { mapMutations, mapActions, mapGetters } from "vuex";
import { useQuasar } from "quasar";
import { importJsonQuestionnaire } from "../utils/ImportJson.js";
import { ref } from "vue";

export default {
  setup() {
    const $q = useQuasar();

    return {
      showLoading() {
        $q.loading.show();
      },
      hideLoading() {
        $q.loading.hide();
      },
      importJsonQuestionnaire,
      alertError: ref(false),
    };
  },
  components: {
    FileUpload,
  },
  data() {
    return {
      files: [],
      messageError: "",
      messageErrorFHIR: [],
    };
  },
  methods: {
    ...mapMutations(["setFileImported"]),
    ...mapActions(["uploadJSONQuestionnaire"]),
    /**
     * Has changed
     * @param  Object|undefined   newFile   Read only
     * @param  Object|undefined   oldFile   Read only
     * @return undefined
     */
    inputFile: function (newFile) {
      if (!newFile) return;
      this.messageError = "";
      this.showLoading();
      let reader = new FileReader();
      reader.readAsText(newFile.file);
      const that = this;
      reader.onload = function () {
        try {
          that.importJsonQuestionnaire.getValidateJSON(reader.result);
          that.messageErrorFHIR =
            that.importJsonQuestionnaire.getValidateFHIRResource(
              JSON.parse(reader.result),
            );
          that.hideLoading();
          if (that.messageErrorFHIR.length === 0) {
            that.setFileImported(newFile);
            that.uploadJSONQuestionnaire(
              that.importJsonQuestionnaire.getQuestionnaireGUI(),
            );
            that.$router.push("/");
          } else {
            that.alertError = true;
          }
        } catch (error) {
          that.messageError = error.message;
          that.alertError = true;
          that.hideLoading();
        }
      };

      reader.onerror = function () {
        that.messageError = reader.error;
        that.alertError = true;
        that.hideLoading();
      };
    },
    /**
     * Pretreatment
     * @param  Object|undefined   newFile   Read and write
     * @param  Object|undefined   oldFile   Read only
     * @param  Function           prevent   Prevent changing
     * @return undefined
     */
    inputFilter: function (newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        // Filter non-json file
        if (!/\.(json)$/i.test(newFile.name)) {
          this.messageError = this.$t(
            "messagesErrors.GeneralJSONValidations.fileNoJSONType",
            { nameFile: newFile.name },
          );
          this.alertError = true;
          return prevent();
        }
      }
    },
  },
  computed: {
    ...mapGetters(["getQuestionnaireImportedJSON"]),
  },
};
</script>

<style>
.example-drag {
  position: absolute;
  top: 10px;
  left: 10px;
  bottom: 10px;
  right: 10px;
  text-align: center;
  height: 100%;
}
.example-drag.draged {
  position: absolute;
  top: 10px;
  left: 10px;
  bottom: 10px;
  right: 10px;
  border: 3px dashed green;
  text-align: center;
}
.example-drag label.btn {
  margin-bottom: 0;
  margin-right: 1rem;
}
.example-drag .drop-active {
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  position: fixed;
  z-index: 9999;
  opacity: 0.6;
  text-align: center;
  background: #000;
}
.example-drag .drop-active h3 {
  margin: -0.5em 0 0;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 40px;
  color: #fff;
  padding: 0;
}
</style>
