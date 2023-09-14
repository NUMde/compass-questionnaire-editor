import i18n from "../i18n";
import { answerType, questionType } from "./constants.js";
import { v4 as uuidv4 } from "uuid";

/* Error Exceptions obj */
function QuestionnaireValidationException(message) {
  this.message = message;
  this.name = "QuestionnaireValidationException";
}

QuestionnaireValidationException.prototype.toString = function () {
  return `${this.name}: "${this.message}"`;
};

function FHIRValidationException(message) {
  this.message = message;
  this.name = "FHIRValidationException";
}

FHIRValidationException.prototype.toString = function () {
  return `${this.name}: "${this.message}"`;
};

function GeneralJSONValidationException(message) {
  this.message = message;
  this.name = "GeneralJSONValidationException";
}

GeneralJSONValidationException.prototype.toString = function () {
  return `${this.name}: "${this.message}"`;
};

/* Function Validations */

const questionnaireSpecific = {};

const FHIRValidations = {
  errorMessages: [],
  questionnaire: {},
  validateFHIRResourceItems(JSONFHIRQuestionnaire) {
    this.errorMessages = [];
    this.questionnaire = this.getSortItems(JSONFHIRQuestionnaire);
    this.statusNode(this.questionnaire);
    this.identifier(this.questionnaire);
    this.itemsNode(this.questionnaire.item);
  },
  setConditionDependence(item = []) {
    item.forEach((item) => {
      if (item.item) {
        this.setConditionDependence(item.item);
      }
      if (item.enableWhen) {
        item.enableWhen.forEach((element) => {
          let itemToAppendCondition = this.getItemNodeByInternalID(
            element.question,
            this.questionnaire.item,
          );
          if (itemToAppendCondition) {
            if (!itemToAppendCondition.__dependeceCondition) {
              itemToAppendCondition.__dependeceCondition = {
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
            itemToAppendCondition.__dependeceCondition.__questions.push(
              condition,
            );
          }
        });
      }
    });
  },
  getItemNodeByInternalID(linkId, item = []) {
    let itemSearched;

    let searchNodeByLinkId = function (linkId, item) {
      item.forEach((element) => {
        if (element.item) {
          searchNodeByLinkId(linkId, element.item);
        }
        if (element.linkId === linkId) {
          itemSearched = element;
        }
      });
    };

    searchNodeByLinkId(linkId, item);

    return itemSearched;
  },
  sortByProperty(property) {
    return function (a, b) {
      if (
        parseInt(a[property].split(".")[a[property].split(".").length - 1]) >
        parseInt(b[property].split(".")[b[property].split(".").length - 1])
      )
        return 1;
      else if (
        parseInt(a[property].split(".")[a[property].split(".").length - 1]) <
        parseInt(b[property].split(".")[b[property].split(".").length - 1])
      )
        return -1;

      return 0;
    };
  },
  sortItems(item) {
    item.sort(this.sortByProperty("linkId"));
    item.forEach((element) => {
      if (element.item) {
        this.sortItems(element.item);
      }
    });
  },
  getSortItems(jsonFile) {
    if (!jsonFile.item) return;
    this.sortItems(jsonFile.item);
    return jsonFile;
  },
  validateItem(item) {
    this.addPropertiesNeededtoGUIItemNode(item);
    //Validate if missing required fields of the Item
    this.itemNodeRequiredFields(item);

    //Error if there is more than 6 levels
    if (item.linkId.split(".").length > 5) {
      this.errorMessages.push(
        this.i18n.global.t("messagesErrors.FHIRValidations.moreThan5Levels", {
          linkId: item.linkId,
        }),
      );
    }

    //Error no follow the linkId logic stucture
    if (item.linkId !== item.__linkId && item.linkId !== "") {
      let message = `${this.i18n.global.t(
        "messagesErrors.FHIRValidations.linkId",
        {
          text: item.text,
          linkId: item.linkId,
          internalId: item.__linkId,
        },
      )}`;
      throw new FHIRValidationException(message);
      /* this.errorMessages.push(
        this.i18n.global.t("messagesErrors.FHIRValidations.linkId", {
          linkId: item.linkId,
          internalId: item.__linkId,
        })
      ); */
    }

    //format Answer
    if (item.answerOption) {
      let idCountAnswer = 0;
      item.answerOption.forEach((answerOpt) => {
        idCountAnswer++;
        answerOpt.__id = idCountAnswer;
        /*         if (answerOpt.valueString !== undefined) {
          answerOpt.__type = "open-choice";
          answerOpt.__icon = "input";
          answerOpt.__oldValueString = answerOpt.valueString;
        } */
        if (answerOpt.valueCoding) {
          answerOpt.__type = "coding";
          answerOpt.__icon = "radio_button_unchecked";
          answerOpt.valueCoding.__oldDisplay = answerOpt.valueCoding.display;
          if (answerOpt.valueCoding.code === undefined) {
            answerOpt.valueCoding.code = "";
          }
          if (answerOpt.valueCoding.display === undefined) {
            answerOpt.valueCoding.display = "";
          }
          if (answerOpt.valueCoding.system === undefined) {
            answerOpt.valueCoding.system = "";
          }
        }
        if (answerOpt.valueInteger) {
          answerOpt.__icon = "pin";
          answerOpt.__type = "integer";
          answerOpt.__oldValueInteger = answerOpt.valueInteger;
        }
        if (answerOpt.valueDate) {
          answerOpt.__icon = "event";
          answerOpt.__type = "date";
          answerOpt.__oldValueDate = answerOpt.valueDate;
        }
        if (answerOpt.valueString) {
          answerOpt.__icon = "text_fields";
          answerOpt.__type = "string";
          answerOpt.__oldValueString = answerOpt.valueString;
        }
      });
    }

    //AnswerValueSet
    if (item.answerOption && item.answerValueSet) {
      this.errorMessages.push(
        this.i18n.global.t(
          "messagesErrors.FHIRValidations.answerOptionAndValueSetNoAllow",
          {
            linkId: item.linkId,
          },
        ),
      );
    }
    if (item.answerValueSet) {
      item.__OldAnswerValueSet = item.answerValueSet;
      item.__answerValueSetCheck = true;
    } else {
      item.__OldAnswerValueSet = item.answerValueSet = "";
      item.__answerValueSetCheck = false;
    }

    //UUI
    if (!item.definition) {
      item.definition = uuidv4();
      item.__newDefinition = true;
    } else {
      item.__newDefinition = false;
    }
  },
  validateItems(item) {
    if (item.item) {
      let idCount = 0;
      const that = this;
      item.item.forEach((element) => {
        idCount++;
        element.__internalID = `${uuidv4()}-${Date.now()}`;
        element.__linkId = item.linkId + "." + idCount;
        that.validateItem(element);
        //deep inside no more that 5 levels
        if (element.item && element.__linkId.split(".").length <= 6) {
          that.validateItems(element);
        }
      });
    }
  },
  itemNodeRequiredFields(item) {
    //Error if missing required fields of the Item
    if (!item.linkId) {
      this.errorMessages.push(
        this.i18n.global.t("messagesErrors.FHIRValidations.nodeMissing", {
          node: "linkId",
          item: item,
        }),
      );
    }

    if (!item.type) {
      this.errorMessages.push(
        this.i18n.global.t("messagesErrors.FHIRValidations.nodeMissing", {
          node: "type",
          item: item,
        }),
      );
    }

    if (
      item.type !== "group" &&
      item.type !== "string" &&
      item.type !== "choice" &&
      item.type !== "boolean" &&
      item.type !== "date" &&
      item.type !== "open-choice" &&
      item.type !== "integer" &&
      item.type !== "decimal" &&
      item.type !== "display"
    ) {
      this.errorMessages.push(
        this.i18n.global.t(
          "messagesErrors.FHIRValidations.typeNodeNoValAllow",
          {
            linkId: item.linkId,
            type: item.type,
          },
        ),
      );
    }
    if (item.enableWhen) {
      this.validateEnableWhen(item);
    }

    if (item.type === "integer") {
      item.extension = item.extension || [];
      let extensionSet = [
        {
          url: "http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue",
          targetIdx: 0,
          type: "Integer",
        },
        {
          url: "http://hl7.org/fhir/StructureDefinition/minValue",
          targetIdx: 1,
          type: "Integer",
        },
        {
          url: "https://num-compass.science/fhir/StructureDefinition/LowRangeLabel",
          targetIdx: 2,
          type: "String",
        },
        {
          url: "http://hl7.org/fhir/StructureDefinition/maxValue",
          targetIdx: 3,
          type: "Integer",
        },
        {
          url: "https://num-compass.science/fhir/StructureDefinition/HighRangeLabel",
          targetIdx: 4,
          type: "String",
        },
      ];

      for (let { url, targetIdx, type } of extensionSet) {
        let index = item.extension.findIndex((e) => e.url === url);
        if (index === -1) {
          item.extension.splice(targetIdx, 0, {
            url,
            ["value" + type]: type === "String" ? "" : null,
          });
        } else {
          let element = item.extension[index];
          item.extension.splice(index, 1);
          item.extension.splice(targetIdx, 0, element);
        }
      }
    }
  },
  addPropertiesNeededtoGUIItemNode(item) {
    item.__active = true;
    item.disabled = false;
    item.__oldText = item.text;
    item.__icon =
      item.type === "open-choice"
        ? this.questionType.open_choice.icon
        : this.questionType[item.type].icon;
  },
  itemsNode(item = []) {
    let idCount = 0;
    item.forEach((element) => {
      idCount++;
      //assign ID Item internal
      element.__internalID = `${uuidv4()}-${Date.now()}`;

      element.__linkId = idCount + "";
      this.validateItem(element);
      if (element.item) {
        this.validateItems(element);
      }
    });
  },
  validateEnableWhen(item) {
    const that = this;
    item.enableWhen.forEach((element) => {
      if (!element.question) {
        that.errorMessages.push(
          that.i18n.global.t("messagesErrors.FHIRValidations.nodeMissingItem", {
            node: "enableWhen.question",
            linkId: item.linkId,
          }),
        );
      }
      if (!element.operator) {
        that.errorMessages.push(
          that.i18n.global.t("messagesErrors.FHIRValidations.nodeMissingItem", {
            node: "enableWhen.operator",
            linkId: item.linkId,
          }),
        );
      }
      //missing  answer
      if (
        element.answerDecimal === undefined &&
        element.answerInteger === undefined &&
        element.answerCoding === undefined && //openChoice || choice
        element.answerDate === undefined &&
        element.answerBoolean === undefined &&
        element.answerString === undefined
      ) {
        that.errorMessages.push(
          that.i18n.global.t("messagesErrors.FHIRValidations.nodeMissingItem", {
            node: "enableWhen.answer[x]",
            linkId: item.linkId,
          }),
        );
      }

      if (element.answerDecimal) {
        element.answer = element.answerDecimal;
        element.type = "decimal";
      }
      if (element.answerInteger) {
        element.answer = element.answerIntegerl;
        element.type = "integer";
      }
      if (element.answerCoding) {
        element.answer = element.answerCoding.code;
        element.type = "choice";
        element.display = element.answerCoding.display;
        element.system = element.answerCoding.system;
      }
      if (element.answerDate) {
        element.answer = element.answerDate;
        element.type = "date";
      }
      if (element.answerBoolean !== undefined) {
        element.answer = element.answerBoolean ? "true" : "false";
        element.type = "boolean";
      }
      if (element.answerString) {
        element.answer = element.answerString;
        element.type = "string";
      }
    });
  },
  statusNode(FHIRobj) {
    if (!FHIRobj.status) {
      this.errorMessages.push(
        this.i18n.global.t("messagesErrors.FHIRValidations.nodeMissing", {
          node: "status",
        }),
      );
    }
    if (
      FHIRobj.status !== "draft" &&
      FHIRobj.status !== "active" &&
      FHIRobj.status !== "retired" &&
      FHIRobj.status !== "unknown"
    ) {
      this.errorMessages.push(
        this.i18n.global.t("messagesErrors.FHIRValidations.posiblesValues", {
          currentValue: FHIRobj.status,
          node: "status",
        }),
      );
    }
  },
  identifier(FHIRobj) {
    if (FHIRobj?.identifier?.length > 0) {
      FHIRobj.identifier.forEach((id) => {
        id.use = id.use === undefined ? "" : id.use;
        id.system = id.system === undefined ? "" : id.system;
        id.value = id.value === undefined ? "" : id.value;
        id.period =
          id.period === undefined ? { start: "", end: "" } : id.period;
        id.type =
          id.type === undefined
            ? {
                coding: {
                  system: "",
                  version: "",
                  code: "",
                  display: "",
                  userSelected: false,
                },
                text: "",
              }
            : id.type;
      });
    } else {
      FHIRobj.identifier = [];
    }
  },
  resourceType(FHIRobj) {
    if (!FHIRobj.resourceType) {
      return this.i18n.global.t("messagesErrors.FHIRValidations.nodeMissing", {
        node: "resourceType",
      });
    }
    if (FHIRobj.resourceType !== "Questionnaire") {
      return this.i18n.global.t(
        "messagesErrors.FHIRValidations.resourceImportedNoAllow",
        { resource: FHIRobj.resourceType },
      );
    }
  },
};

const generalValidations = {
  //Validata that is a right JSON Structure
  JSONValid(jsonFileString = "") {
    if (typeof jsonFileString !== "string") {
      return false;
    }
    try {
      JSON.parse(jsonFileString);
    } catch (error) {
      let message = `${this.i18n.global.t(
        "messagesErrors.GeneralJSONValidations.NoJSONFILEStructure",
      )}
      ${error.message}`;
      throw new GeneralJSONValidationException(message);
    }
  },
};

const importJsonQuestionnaire = {
  getValidateJSON(jsonFile) {
    this.generalValidations.JSONValid(jsonFile);
  },
  getValidateFHIRResource(jsonFile) {
    this.FHIRValidations.validateFHIRResourceItems(jsonFile);
    return this.FHIRValidations.errorMessages;
  },
  getQuestionnaireGUI() {
    return this.FHIRValidations.questionnaire;
  },
};

importJsonQuestionnaire.questionnaireSpecific = questionnaireSpecific;
importJsonQuestionnaire.FHIRValidations = FHIRValidations;
importJsonQuestionnaire.generalValidations = generalValidations;
importJsonQuestionnaire.i18n = i18n;
generalValidations.i18n = i18n;
FHIRValidations.i18n = i18n;
FHIRValidations.answerType = answerType;
FHIRValidations.questionType = questionType;

export { importJsonQuestionnaire };
