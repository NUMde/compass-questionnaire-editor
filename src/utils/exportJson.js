import i18n from "../i18n";
const exportJsonQuestionnaire = {
  getExportObject(jsonObject) {
    let cloneObject = this.getObjectExportCopy(jsonObject);
    const finalObj = this.getObjectWithouItemsDisables(cloneObject);
    return finalObj;
  },
  getObjectWithouItemsDisables(jsonObject) {
    // To only keep items with linkId
    jsonObject.item = jsonObject.item.filter(
      (element) => element.linkId !== ""
    );

    // For items within item
    jsonObject.item.forEach((element) => {
      if (element.item) {
        this.getObjectWithouItemsDisables(element);
      }

      //convert to integer ValueInteger
      if (element.answerOption) {
        element.answerOption.forEach((element) => {
          if (element.valueInteger) {
            element.valueInteger = parseInt(element.valueInteger);
          }
        });
      }

      //answerOption and Value Set
      if (element.answerValueSet !== "") {
        delete element.answerOption;
      }
      if (element.answerOption !== undefined) {
        //answerOption has data
        if (element.answerOption.length > 0) {
          delete element.answerValueSet;
        }
        //remove if is empty
        if (element.answerOption.length === 0) {
          delete element.answerOption;
        }
      }

      //remove disable Item property
      delete element.disabled;

      //remove empty answerValueSet
      if (element.answerValueSet === "") {
        delete element.answerValueSet;
      }

      if (element.enableWhen) {
        element.enableWhen = element.enableWhen.filter((element) => {
          return (
            element.operator !== "" &&
            element.question !== "" &&
            element.answer !== ""
          );
        });
        element.enableWhen.forEach((element) => {
          if (element.type === "decimal") {
            element.answerDecimal = parseFloat(element.answer);
          }
          if (element.type === "integer") {
            element.answerInteger = parseInt(element.answer);
          }
          if (element.type === "date") {
            element.answerDate = element.answer;
          }
          if (element.type === "boolean" || element.operator === "exist") {
            element.answerBoolean = element.answer === "true" ? true : false;
          }
          if (element.type === "string") {
            element.answerString = element.answer;
          }
          if (element.type === "choice" || element.type === "open-choice") {
            element.answerCoding = {};
            element.answerCoding.code = element.answer;
            element.answerCoding.display = element.display;
            element.answerCoding.system = element.system;
          }
          delete element.system;
          delete element.display;
          delete element.answer;
          delete element.type;
        });
        if (element.enableWhen.length === 0) {
          delete element.enableWhen;
        }
      }
    });
    // Item must be deleted when empty
    if (jsonObject.item.length === 0) {
      delete jsonObject.item;
    }

    return jsonObject;
  },
  getObjectExportCopy(jsonObject) {
    var newObject = {};
    if (typeof jsonObject === "string") {
      return jsonObject;
    }
    const keys = Object.keys(jsonObject);
    for (var indexKey in keys) {
      var itemKey = keys[indexKey];
      if (!itemKey.startsWith("__")) {
        var value = jsonObject[itemKey];
        if (Array.isArray(value)) {
          value = this.getArrayExportCopy(value);
        } else if (typeof value === "object" && value !== null) {
          value = this.getObjectExportCopy(value);
        }

        newObject[itemKey] = value;
      }
    }
    return newObject;
  },
  getArrayExportCopy(array) {
    var newArray = [];
    for (var index in array) {
      newArray.push(this.getObjectExportCopy(array[index]));
    }
    return newArray;
  },
};

exportJsonQuestionnaire.i18n = i18n;
export { exportJsonQuestionnaire };
