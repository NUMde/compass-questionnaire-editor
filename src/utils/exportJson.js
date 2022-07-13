import i18n from "../i18n";
const exportJsonQuestionnaire = {
  getExportObject(jsonObject) {
    let cloneObject = this.getObjectExportCopy(jsonObject);
    const objWithoutItemsDisabled =
      this.getObjectWithouItemsDisables(cloneObject);
    const finalObj = this.clearMetadatafields(objWithoutItemsDisabled);
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

      if (element.extensions) {

        var i = element.extensions.length;
        while (i-- ) {
          if ((!element.extensions[i].valueInteger || element.extensions[i].valueInteger === null) && (!element.extensions[i].valueString || element.extensions[i].valueString === "")) {
            element.extensions.splice(i, 1);
          }
        }

        if (element.extensions.length === 0) {
          delete element.extensions;
        }
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
          if (
            element.type === "choice" ||
            element.type === "open-choice" ||
            element.type === "coding"
          ) {
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
  clearMetadatafields(jsonObject) {
    //Version
    if (jsonObject.version === "") {
      delete jsonObject.version;
    }
    //URL
    if (jsonObject.url === "") {
      delete jsonObject.url;
    }
    //Name
    if (jsonObject.name === "") {
      delete jsonObject.name;
    }
    //Status
    if (jsonObject.status === "") {
      delete jsonObject.status;
    }
    //publisher
    if (jsonObject.publisher === "") {
      delete jsonObject.publisher;
    }
    //title
    if (jsonObject.title === "") {
      delete jsonObject.title;
    }
    //approvalDate
    if (jsonObject.date === null) {
      delete jsonObject.date;
    }
    //approvalDate
    if (jsonObject.approvalDate === null) {
      delete jsonObject.approvalDate;
    }
    //lastReviewDate
    if (jsonObject.lastReviewDate === null) {
      delete jsonObject.lastReviewDate;
    }
    //experimental
    if (jsonObject.experimental === null) {
      delete jsonObject.experimental;
    }
    //Identifier
    if (jsonObject?.identifier?.length > 0) {
      let clearedId = [];
      jsonObject?.identifier.forEach((identifier) => {
        let removeUserSelected = true;
        identifier?.use === "" ? delete identifier.use : "";
        identifier?.system === "" ? delete identifier.system : "";
        identifier?.value === "" ? delete identifier.value : "";
        identifier?.period?.start === "" ? delete identifier.period.start : "";
        identifier?.period?.end === "" ? delete identifier.period.end : "";
        Object.values(identifier?.period).length === 0
          ? delete identifier.period
          : "";
        identifier?.type?.coding?.system === ""
          ? delete identifier.type.coding.system
          : (removeUserSelected = false);
        identifier?.type?.coding?.version === ""
          ? delete identifier.type.coding.version
          : (removeUserSelected = false);
        identifier?.type?.coding?.code === ""
          ? delete identifier.type.coding.code
          : (removeUserSelected = false);
        identifier?.type?.coding?.display === ""
          ? delete identifier.type.coding.display
          : (removeUserSelected = false);
        removeUserSelected === true
          ? delete identifier.type.coding.userSelected
          : "";
        identifier?.type?.text === "" ? delete identifier.type.text : "";
        Object.values(identifier?.type?.coding).length === 0
          ? delete identifier.type.coding
          : "";
        Object.values(identifier?.type).length === 0
          ? delete identifier.type
          : "";
        Object.values(identifier).length > 0 ? clearedId.push(identifier) : "";
      });
      jsonObject.identifier = clearedId;
    }
    if (jsonObject?.identifier?.length === 0) {
      delete jsonObject.identifier;
    }
    return jsonObject;
  },
};

exportJsonQuestionnaire.i18n = i18n;
export { exportJsonQuestionnaire };
