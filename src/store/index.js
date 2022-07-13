import { createStore } from "vuex";

const store = createStore({
  state: {
    questionnaire: {},
    questionnaireImported: {},
    secondaryItemSelected: {},
    fileImported: {},
    settings: {
      answers: {
        answersValueset: false,
        openChoice: true,
        choice: true,
      },
    },
  },
  mutations: {
    //metaData
    setNameofQuestionnaireNEW(state) {
      state.fileImported.name = "New Questionnaire.json";
    },
    setVersion(state, payload) {
      state.questionnaireImported.version = payload;
    },
    setIdentifier(state, payload) {
      state.questionnaireImported.identifier = payload;
    },
    setURL(state, payload) {
      state.questionnaireImported.url = payload;
    },
    setName(state, payload) {
      state.questionnaireImported.name = payload;
    },
    setTitle(state, payload) {
      state.questionnaireImported.title = payload;
    },
    setDate(state, payload) {
      state.questionnaireImported.date = payload;
    },
    setStatus(state, payload) {
      state.questionnaireImported.status = payload;
    },
    setPublisher(state, payload) {
      state.questionnaireImported.publisher = payload;
    },
    setApprovalDate(state, payload) {
      state.questionnaireImported.approvalDate = payload;
    },
    setLastReviewDate(state, payload) {
      state.questionnaireImported.lastReviewDate = payload;
    },
    setExperimental(state, payload) {
      state.questionnaireImported.experimental = payload;
    },
    //Settings
    setAnswerValueSet(state, payload) {
      state.settings.answers.answersValueset = payload;
    },
    setOpenChoice(state, payload) {
      state.settings.answers.openChoice = payload;
    },
    setChoice(state, payload) {
      state.settings.answers.choice = payload;
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
    //Settings
    getAnswerValueSet(state) {
      return state.settings.answers.answersValueset;
    },
    getOpenChoice(state) {
      return state.settings.answers.openChoice;
    },
    getChoice(state) {
      return state.settings.answers.choice;
    },
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
      if (!state.questionnaireImported.item) {
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
