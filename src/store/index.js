import { createStore } from "vuex";

const store = createStore({
  state: {
    questionnaire: {},
    questionnaireImported: {},
    secondaryItemSelected: {},
    fileImported: {},
  },
  mutations: {
    setVersion(state, payload) {
      state.questionnaireImported.version = payload;
    },
    setSecondItemSelected(state, payload = {}) {
      state.secondaryItemSelected = payload;
    },
    setQuestionnaireImportedJSON(state, payload = {}) {
      state.questionnaireImported = payload;
    },
    setFileImported(state, payload = {}) {
      state.fileImported = payload;
    },
    resetQuestionnaire(state) {
      state.questionnaire = {};
      state.questionnaireImported = {};
      state.secondaryItemSelected = {};
      state.fileImported = {};
    },
  },
  actions: {
    async uploadJSONQuestionnaire({ commit }, payload) {
      await commit("setQuestionnaireImportedJSON", payload);
    },
  },
  modules: {},
  getters: {
    getMainItem(state) {
      return state.questionnaire.item;
    },
    getQuestionnaireImportedJSON(state) {
      if (!state.questionnaireImported) {
        state.questionnaireImported = {
          resourceType: "Questionnaire",
          item: [],
        };
      }
      if(!state.questionnaireImported.item){
        state.questionnaireImported.item = [];
      }
      return state.questionnaireImported;
    },
    getVersionQuestionnaire(state) {
      if (state.questionnaireImported.version === undefined) {
        state.questionnaireImported.version = "";
      }
      return state.questionnaireImported.version;
    },
    getFileImported(state) {
      return state.fileImported;
    },
    getNameofQuestionnaire(state) {
      if (state?.fileImported?.name)
        return state.fileImported.name.split(".json")[0];
      else return "";
    },
  },
});

export default store;
