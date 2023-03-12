import {DEFAULT_ARRAY_JOIN_DELIMITER, FILE_NAME_DELIMITER} from "./Constants";

import {PropertyUtil} from "./PropertyUtil";
import {ArrayUtil} from "./ArrayUtil";

/**
 * Utility class to hold all types of string related functionality.
 * Created by Sarthak on 3/1/2021.
 */
export class StringUtil {
  static FORMAT_REGEX: RegExp = new RegExp("{-?[0-9]+}", "g");
  static NUMBERS_AND_ALPHABETS_REGEX: RegExp = new RegExp("[^a-zA-Z0-9_]");

  /**
   *
   * @param str string to be converted
   * @returns camel case string
   */
  static toCamelCase(str: string): string {
    if (StringUtil.isNotEmpty(str) && str.length > 0) {
      let strLowerCase = str.toLowerCase();
      let firstChar = strLowerCase[0];
      return StringUtil.joinTwoStrings(firstChar.toUpperCase(), strLowerCase.substr(1));
    } else {
      return str;
    }
  }

  static getLastSubPath(path: string, separator: string): string {
    let index = path.lastIndexOf(separator);
    if (index == path.length - 1) {
      path = path.substring(0, index);
      index = path.lastIndexOf(separator);
    }
    return (index < 0 ? path : path.substring(index + 1));
  }

  /**
   *
   * @param fileName file name to get extension of
   * @returns
   */
  static getFileExtension(fileName: string): string {
    if (this.isNotEmpty(fileName)) {
      const lastIndex = fileName ? fileName.lastIndexOf(FILE_NAME_DELIMITER) : -1;
      return lastIndex >= 0 ? fileName.substring(lastIndex + 1) : "";
    } else {
      return "";
    }
  }

  /**
   *
   * @param fileName
   * @returns
   */
  static getFileNameWithoutExtension(fileName: string): string {
    if (StringUtil.isNotEmpty(fileName)) {
      let lastIndex = fileName ? fileName.lastIndexOf(FILE_NAME_DELIMITER) : -1;
      return lastIndex >= 0 ? fileName.substring(0, lastIndex + 1) : fileName;
    } else {
      return fileName;
    }
  }
  /**
   * return true is a valid string.
   * @param str
   * @param checkContentAlso {optional}
   * @returns {boolean}
   */
  static isNotEmpty(str: string, checkContentAlso: boolean = false): boolean {
    return !StringUtil.isEmpty(str, checkContentAlso);
  }

  /**
   * returns true is not a valid string.
   * @param str
   * @param checkContentAlso {optional}
   * @returns {boolean}
   */
  static isEmpty(str: string, checkContentAlso = false): boolean {
    return (
      PropertyUtil.isNull(str) ||
      !PropertyUtil.isStringType(str) ||
      str === "" ||
      (checkContentAlso && str.trim() === "")
    );
  }

  /**
   *
   * @param str
   * @param params
   * @returns
   */
  static format(str: string, params: any): string {
    return str.replace(StringUtil.FORMAT_REGEX, function (item) {
      var intVal = parseInt(item.substring(1, item.length - 1));
      var replace;
      if (intVal >= 0) {
        replace = params[intVal];
      } else if (intVal === -1) {
        replace = "{";
      } else if (intVal === -2) {
        replace = "}";
      } else {
        replace = "";
      }
      return replace;
    });
  }

  /**
   *
   * @param str1
   * @param str2
   * @returns
   */
  static startsWith(str1: string, str2: string): boolean {
    if (StringUtil.isNotEmpty(str1) && StringUtil.isNotEmpty(str2)) return str1.startsWith(str2);
    else return false;
  }

  /**
   * returns parsed positive int value for the string
   * @param str
   * @param dafaultVal
   * @returns {number}
   */
  static toPositiveNumber(str: string, dafaultVal: number | null = null): number | null {
    let numVal = StringUtil.toInt(str);
    return numVal && numVal > 0 ? numVal : dafaultVal;
  }

  /**
   * returns parsed negative int value for the string
   * @param str
   * @param dafaultVal
   * @returns {number}
   */
  static toNegativeNumber(str: string, dafaultVal: number | null = null): number | null {
    let numVal = StringUtil.toInt(str);
    return numVal && numVal < 0 ? numVal : dafaultVal;
  }

  /**
   * returns parsed non negative int value for the string
   * @param str
   * @param dafaultVal
   * @returns {number}
   */
  static toNonNegativeNumber(str: string, dafaultVal: number | null = null): number | null {
    let numVal = StringUtil.toInt(str);
    return numVal !== null && numVal >= 0 ? numVal : dafaultVal;
  }

  /**
   * returns parsed int value for the string
   * @param str
   * @param defaultVal
   * @returns {number}
   */
  static toInt(str: string, defaultVal: number | null = null): number | null {
    if (str) str = str.trim();

    if (StringUtil.isEmpty(str)) return defaultVal;

    try {
      let numValue = parseInt(str);
      if (!isNaN(numValue)) return numValue;
      else return defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  /**
   * returns parsed float value for the string
   * @param str
   * @param defaultVal
   * @returns
   */
  static toFloat(str: string, defaultVal: number | null = null): number | null {
    return StringUtil.toInt(str, defaultVal);
  }

  /**
   *
   * @param str
   * @param defaultVal
   * @returns {boolean}
   */
  static toBool(str: string, defaultVal: boolean = false): boolean {
    if (str) str = str.trim();

    if (StringUtil.isEmpty(str)) return defaultVal;

    try {
      let lowerCaseStr = str.toLowerCase();
      return lowerCaseStr === "true" || lowerCaseStr === "yes" || lowerCaseStr === "1";
    } catch (e) {
      return defaultVal;
    }
  }

  /**
   *
   * @param str
   * @param regexStr
   * @returns {boolean}
   */
  static matches(str: string, regexStr: string): boolean {
    if (StringUtil.isNotEmpty(str) && PropertyUtil.isNotNull(regexStr)) {
      return new RegExp(regexStr).test(str);
    } else {
      return false;
    }
  }

  /**
   *
   * @param str
   * @param regexStr
   * @returns {Array.<String>}
   */
  static getGroupsFromRegex(str: string, regexStr: string): Array<string> {
    let regexParts: Array<string> = [];
    if (StringUtil.matches(str, regexStr)) {
      let strParts = str.split(regexStr);
      if (PropertyUtil.isNotNull(strParts)) {
        strParts.every((strVal: string) => {
          if (PropertyUtil.isNotNull(strVal)) {
            strVal = strVal.trim();
            if (StringUtil.isNotEmpty(strVal)) regexParts.push(strVal);
          }
        });
      }
    }
    return regexParts;
  }

  /**
   * compares two string and returns a relative integer.
   * @param str1
   * @param str2
   * @returns {number}
   */
  static compare(str1: string, str2: string): number {
    if (StringUtil.isNotEmpty(str1) && StringUtil.isNotEmpty(str2)) {
      return str1.localeCompare(str2);
    } else {
      return 0;
    }
  }

  /**
   * compares two string without any case-sensitivity and returns a relative integer.
   * @param str1
   * @param str2
   * @returns {number}
   */
  static comparei(str1: string, str2: string): number {
    if (StringUtil.isNotEmpty(str1) && StringUtil.isNotEmpty(str2)) {
      return StringUtil.compare(str1.toLowerCase(), str2.toLowerCase());
    } else {
      return 0;
    }
  }

  /**
   * escapes any single or double quote character present in string parameter for extend script.
   * @param str
   * @returns {String}
   */
  static escapeQuotesInStringParameter(str: string): string {
    if (StringUtil.isNotEmpty(str)) {
      if (str.indexOf('"') >= 0) return str.replace(/"/g, '\\"');
      else if (str.indexOf("'") >= 0) return str.replace(/'/, "\\'");
    }
    return str;
  }

  /**
   *
   * @param str1
   * @param str2
   * @param delimiter
   */
  static joinTwoStrings(str1: string, str2: string, delimiter = ""): string {
    if (StringUtil.isNotEmpty(str1) && StringUtil.isNotEmpty(str2)) {
      if (PropertyUtil.isNotNull(delimiter)) return str1 + delimiter + str2;
      else return str1 + str2;
    } else {
      if (StringUtil.isNotEmpty(str1)) return str1;
      else if (StringUtil.isNotEmpty(str2)) return str2;
      else return "";
    }
  }

  /**
   *
   * @param strArr
   * @param delimiter
   */
  static joinStrArray(strArr: Array<string>, delimiter: string = DEFAULT_ARRAY_JOIN_DELIMITER): string | null {
    if (ArrayUtil.isNotEmpty(strArr) && PropertyUtil.isNotNull(delimiter)) {
      return strArr.join(delimiter);
    } else {
      return null;
    }
  }

  /**
   *
   * @param strArr
   * @returns
   */
  static joinMultipleStrings(...strArr: Array<string>): string | null {
    return StringUtil.joinStrArray(strArr);
  }

  /**
   *
   * @param str1
   * @param str2
   * @param defaultValue
   * @returns {boolean}
   */
  static contains(str1: string, str2: string, defaultValue: boolean = false): boolean {
    if (StringUtil.isNotEmpty(str1, true) && StringUtil.isNotEmpty(str2, true)) {
      return str1.trim().toLowerCase().indexOf(str2.trim().toLowerCase()) > -1;
    } else {
      return defaultValue;
    }
  }

  /**
   *
   * @param str1
   * @param str2
   * @param defaultValue
   * @returns
   */
  static containsAsWord(str1: string, str2: string, defaultValue: boolean = false): boolean {
    if (StringUtil.isNotEmpty(str1, true) && StringUtil.isNotEmpty(str2, true)) {
      const str1Arr = str1.trim().replace(/\s+/g, " ").split(" ");
      return StringUtil.containsInArray(str1Arr, str2);
    } else {
      return defaultValue;
    }
  }

  /**
   *
   * @param strArr
   * @param matchStr
   * @param defaultValue
   * @returns
   */
  static containsInArray(strArr: Array<string>, matchStr: string, defaultValue: boolean = false): boolean {
    if (StringUtil.isNotEmpty(matchStr, true) && ArrayUtil.isNotEmpty(strArr, true)) {
      const element = strArr.find(a => StringUtil.contains(matchStr, a));
      return !!element;
    } else {
      return defaultValue;
    }
  }

  /**
   *
   * @param str1
   * @param str2
   * @returns {boolean}
   */
  static equalsIgnoreCase(str1: string, str2: string): boolean {
    if (
      StringUtil.isNotEmpty(str1) &&
      PropertyUtil.isStringType(str1) &&
      StringUtil.isNotEmpty(str2) &&
      PropertyUtil.isStringType(str2)
    ) {
      return str1.toLowerCase() === str2.toLowerCase();
    } else {
      return false;
    }
  }

  /**
   *
   * @param str
   * @param delimiter
   * @param joiningDelimiter
   */
  static getLabelFromEnumValue(str: string, delimiter: string = "_", joiningDelimiter: string = " "): string | null {
    if (StringUtil.contains(str, delimiter)) {
      let strParts: Array<string> = str.split(delimiter);
      for (let i = 0; i < strParts.length; i++) {
        strParts[i] = StringUtil.toCamelCase(strParts[i]);
      }
      return StringUtil.joinStrArray(strParts, joiningDelimiter);
    }
    return StringUtil.toCamelCase(str);
  }

  /**
   *
   * @private
   */
  public static S3_SAFE_CHARS = /[\\{^}%`\]>\[~<#|&$@=;:+ ,?/]+/ig;

  static sanitizeForS3(str: string, replacement: string): string {
    if (str) {
      return str.replaceAll(this.S3_SAFE_CHARS, replacement);
    }
    return str;
  }


}
