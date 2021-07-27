import { questionTypesIcons, questionTypes, answerType } from "./constants.js";
import { v4 as uuidv4 } from "uuid";
const edtiorTools = {
  currentQuestionNodeByID: {},
  currentQuestionNodeByLinkId: {},
  getIndexItem(internalIDToBeRemove, arrayQuestions) {
    let indexOfItemtoBeRemoved = 1;
    arrayQuestions.forEach((element, index) => {
      if (element.__internalID === internalIDToBeRemove) {
        indexOfItemtoBeRemoved = index;
      }
    });
    return indexOfItemtoBeRemoved;
  },
  getInternalIDFromEhandler(e) {
    return e.currentTarget.id.split("_").length > 1
      ? e.currentTarget.id.split("_")[1]
      : e.currentTarget.id;
  },
  isPreviousQuestion(e) {
    //if with prefix _ means that id has been dragged before the item question
    return e.currentTarget.id.split("_").length == 2 ? true : false;
  },
  assingNewItemInternalIDs(item) {
    if (item.item) {
      let idCount = 0;
      item.item.forEach((element) => {
        idCount++;
        element.__linkId = item.__linkId + "." + idCount;
        if (element.item) {
          this.assingNewItemInternalIDs(element);
        }
      });
    }
  },
  assingNewItemIDs(item) {
    if (item.item) {
      let idCount = 0;
      item.item.forEach((element) => {
        if (element.__active) {
          idCount++;
          element.linkId = item.linkId + "." + idCount;
        } else {
          element.linkId = "";
        }
        if (element.item) {
          this.assingNewItemIDs(element);
        }
      });
    }
  },
  regenerateInternalIDs(item) {
    let idCount = 0;
    item.forEach((element) => {
      idCount++;
      element.__linkId = idCount + "";
      if (element.item) {
        this.assingNewItemInternalIDs(element);
      }
    });
  },
  regenerateLinkIds(item) {
    let idCount = 0;
    item.forEach((element) => {
      if (element.__active) {
        idCount++;
        element.linkId = idCount + "";
      } else {
        element.linkId = "";
      }
      if (element.item) {
        this.assingNewItemIDs(element);
      }
    });
  },
  disableItem(item, toggleValue) {
    if (item.item) {
      item.item.forEach((element) => {
        element.__active = toggleValue;
        this.disableItem(element, toggleValue);
      });
    }
    item.disabled = toggleValue ? false : true;
    item.__active = toggleValue;
  },
  getArraySource(internalId, rootItem) {
    const getParentArrayItem = {
      parentArrayItem: [],
      getArray(internalId, currentNode) {
        let currentItemFounded = currentNode.find(
          (element) => element.__internalID === internalId
        );
        if (currentItemFounded) {
          this.parentArrayItem = currentNode;
          return;
        }
        if (this.parentArrayItem.length === 0) {
          //if not parent array Founded iterate
          currentNode.forEach((element) => {
            if (element.item) {
              this.getArray(internalId, element.item);
            }
          });
        }
      },
    };

    getParentArrayItem.getArray(internalId, rootItem);
    return getParentArrayItem.parentArrayItem;
  },

  getQuestionNodeByID(internalId, rootItem = []) {
    rootItem.forEach((element) => {
      if (element.item) {
        this.getQuestionNodeByID(internalId, element.item);
      }
      if (element.__internalID === internalId) {
        this.currentQuestionNodeByID = element;
      }
    });
  },
  getCurrentQuestionNodeByID(internalId, rootItem = []) {
    this.currentQuestionNodeByID = {};
    this.getQuestionNodeByID(internalId, rootItem);
    return this.currentQuestionNodeByID;
  },

  getQuestionNodeByLinkId(linkId, rootItem = []) {
    rootItem.forEach((element) => {
      if (element.item) {
        this.getQuestionNodeByLinkId(linkId, element.item);
      }
      if (element.linkId === linkId) {
        this.currentQuestionNodeByLinkId = element;
      }
    });
  },
  getCurrentQuestionNodeByLinkId(linkId, rootItem = []) {
    this.currentQuestionNodeByLinkId = {};
    this.getQuestionNodeByLinkId(linkId, rootItem);
    return this.currentQuestionNodeByLinkId;
  },

  disableEntireItemQuestion(id, rootItem) {
    let oItemQuestionTodisabled = this.getCurrentQuestionNodeByID(id, rootItem);
    //console.log("disable Entire Item Question:", oItemQuestionTodisabled);

    if (Object.entries(oItemQuestionTodisabled).length === 0) {
      return;
    }
    if (oItemQuestionTodisabled.disabled) {
      return;
    }
    if (oItemQuestionTodisabled.item) {
      oItemQuestionTodisabled.item.forEach((element) => {
        this.disableItem(element, oItemQuestionTodisabled.__active);
      });
    } else {
      this.disableItem(
        oItemQuestionTodisabled,
        oItemQuestionTodisabled.__active
      );
    }
    if (id === oItemQuestionTodisabled.__internalID) {
      oItemQuestionTodisabled.disabled = false;
    }
  },
  getTypeQuestionIcon(type) {
    let icon = this.questionTypesIcons.find((item) => {
      return item.name === type;
    });
    return icon;
  },
  getNewAnswerValueCoding(answer, arrayAnswers = []) {
    const id = arrayAnswers.length + 1;
    const { text } = answer;
    const answerOption = {};
    const newAnswer = {};
    newAnswer.display = text;
    newAnswer.system = "";
    newAnswer.code = "";
    answerOption.__id = id;
    answerOption.__type = "coding";
    answerOption.__icon = this.answerType.choice.icon;
    answerOption.__newAnswer = true;
    answerOption.valueCoding = newAnswer;
    return answerOption;
  },
  getNewAnswerValueString(answer, arrayAnswers = []) {
    const id = arrayAnswers.length + 1;
    const { text, type } = answer;
    const answerOption = {};
    answerOption.__id = id;
    answerOption.__type = type;
    answerOption.__icon = this.answerType.open_choice.icon;
    answerOption.__newAnswer = true;
    answerOption.valueString = text;
    return answerOption;
  },
  //typeQuestion-> group /string / choice / boolean /date /open-choice
  // integer/decimal
  getTypeObjQuestion(typeQuestion) {
    const questionTypeIcon = this.getTypeQuestionIcon(typeQuestion);
    const item = {
      text: "",
      __icon: questionTypeIcon.icon,
      __active: true,
      disabled: false,
      __newQuestion: true,
    };
    item.type = typeQuestion;
    item.definition = uuidv4();
    item.__internalID = `${uuidv4()}-${Date.now()}`;
    if (
      questionTypeIcon.name === this.questionTypes.choice ||
      questionTypeIcon.name === this.questionTypes.openChoice
    ) {
      item.answerOption = [];
      item.__OldAnswerValueSet = item.answerValueSet = "";
      item.__answerValueSetCheck = false;
    }
    return item;
  },
  getIndexAnswer(internalIDToBeRemove, arrayAnswers) {
    let indexOfItemtoBeRemoved = 1;
    arrayAnswers.forEach((element, index) => {
      if (element.__id === internalIDToBeRemove) {
        indexOfItemtoBeRemoved = index;
      }
    });
    return indexOfItemtoBeRemoved;
  },
  getNextID(currentID) {
    const acurrentID = currentID.split(".");
    const nextID = 1 + +acurrentID.slice(-1)[0];
    acurrentID.pop();
    acurrentID.push(nextID);
    return acurrentID.join(".");
  },
  getNumbersMaxOfLevels(item) {
    const getLevelNum = {
      level: 1,
      currentLevel: 1,
      getDeepLevel(item) {
        item.forEach((element) => {
          if (element.item) {
            if (element.item.length > 0) {
              this.currentLevel++;
            }
            if (this.currentLevel >= this.level) {
              this.level = this.currentLevel;
            }
            //console.log("level :", this.level);
            //console.log("currentLevel :", this.currentLevel);
            //console.log("linkId :", element.linkId);
            this.getDeepLevel(element.item);
            this.currentLevel = 1;
          }
        });
      },
    };
    getLevelNum.getDeepLevel(item);
    return getLevelNum.level;
  },
  setConditionDependence(item = [], rootItem = []) {
    const that = this;
    item.forEach((item) => {
      if (item.item) {
        this.setConditionDependence(item.item, rootItem);
      }
      if (item.enableWhen) {
        item.enableWhen.forEach((element) => {
          let itemToAppendCondintion = that.getItemNodeByInternalID(
            element.question,
            rootItem
          );
          if (itemToAppendCondintion) {
            if (!itemToAppendCondintion.__dependeceCondition) {
              itemToAppendCondintion.__dependeceCondition = {
                __icon: "account_tree",
                __questions: [],
              };
            }
            let keysEnableWhen = Object.keys(element);
            let condition = {};
            for (const key in keysEnableWhen) {
              condition[`__${keysEnableWhen[key]}`] =
                element[keysEnableWhen[key]];
            }
            condition.__linkId = item.linkId;
            condition.__text = item.text;
            itemToAppendCondintion.__dependeceCondition.__questions.push(
              condition
            );
          }
        });
      }
    });
  },
  getItemNodeByInternalID(linkId, item = []) {
    let itemSearched;

    let searchNodebyLinkId = function (linkId, item) {
      item.forEach((element) => {
        if (element.item) {
          searchNodebyLinkId(linkId, element.item);
        }
        if (element.linkId === linkId) {
          itemSearched = element;
        }
      });
    };

    searchNodebyLinkId(linkId, item);

    return itemSearched;
  },
  removeCondionDependece(item = []) {
    item.forEach((item) => {
      if (item.item) {
        this.removeCondionDependece(item.item);
      }
      if (item.__dependeceCondition) {
        delete item.__dependeceCondition;
      }
    });
  },
};

edtiorTools.questionTypesIcons = questionTypesIcons;
edtiorTools.questionTypes = questionTypes;
edtiorTools.answerType = answerType;

export { edtiorTools };
