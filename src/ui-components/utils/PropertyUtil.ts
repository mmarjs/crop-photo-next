import { PropType } from "../enums";
import { NULL_VALUE } from "./Constants";
import { StringUtil } from "./StringUtil";

/**
 * Static utility class for all types of data types's utility functions.
 * Created by Sarthak on 3/1/2021.
 */
export class PropertyUtil {
  /**
   *
   * @param obj1
   * @param obj2
   * @param prop
   * @returns
   */
  static comparePropOfObjects(obj1: any, obj2: any, prop: string): boolean {
    if ((PropertyUtil.isNotNull(obj1) && PropertyUtil.isNotNull(obj2), PropertyUtil.isNotNull(prop))) {
      return obj1[prop] === obj2[prop];
    }
    return false;
  }

  /**
   *
   * @param value
   * @param defaultValue
   */
  static toInt(value: any, defaultValue: number | null = null): number | null {
    if (PropertyUtil.isNotNull(value)) {
      if (PropertyUtil.isStringType(value)) return StringUtil.toInt(value);
      else if (PropertyUtil.isNumberType(value)) return value;
      else return defaultValue;
    }
    return defaultValue;
  }

  /**
   *
   * @param value
   * @param defaultValue
   * @returns {boolean}
   */
  static toBool(value: any, defaultValue: boolean = false): boolean {
    if (PropertyUtil.isNotNull(value)) {
      if (PropertyUtil.isStringType(value)) return StringUtil.toBool(value);
      else if (PropertyUtil.isBooleanType(value)) return value === true;
      else if (PropertyUtil.isNumberType(value)) return value === 1;
      else return defaultValue;
    }
    return defaultValue;
  }

  /**
   *
   * @param value
   * @returns {boolean}
   */
  static isNull(value: any): boolean {
    return value === null || value === undefined;
  }

  /**
   *
   * @param value
   * @returns {boolean}
   */
  static isNotNull(value: any): boolean {
    return !PropertyUtil.isNull(value);
  }

  /**
   *
   * @param value
   * @returns {boolean}
   */
  static isNumberType(value: any): boolean {
    return PropertyUtil.isNotNull(value) && typeof value === "number";
  }

  /**
   *
   * @param value
   * @returns {boolean}
   */
  static isStringType(value: string): boolean {
    return PropertyUtil.isNotNull(value) && typeof value === "string";
  }

  /**
   *
   * @param value
   * @returns {boolean}
   */
  static isBooleanType(value: any): boolean {
    return PropertyUtil.isNotNull(value) && typeof value === "boolean";
  }

  /**
   *
   * @param value
   * @returns {boolean}
   */
  static isArrayType(value: any): boolean {
    return PropertyUtil.isNotNull(value) && (value.constructor === Array || value instanceof Array);
  }

  /**
   *
   * @param value
   * @returns {boolean}
   */
  static isObjectType(value: any): boolean {
    return PropertyUtil.isNotNull(value) && typeof value === "object";
  }

  /**
   *
   * @param value
   * @returns {boolean}
   */
  static isFunctionType(value: any): boolean {
    return PropertyUtil.isNotNull(value) && typeof value === "function";
  }

  /**
   *
   * @param obj
   */
  static getPropType(obj: any): PropType {
    let propType: PropType;
    if (PropertyUtil.isNull(obj)) {
      propType = PropType.ANY;
    }
    if (PropertyUtil.isObjectType(obj)) {
      propType = PropType.OBJECT;
    } else if (PropertyUtil.isNumberType(obj)) {
      propType = PropType.NUMBER;
    } else if (PropertyUtil.isBooleanType(obj)) {
      propType = PropType.BOOLEAN;
    } else if (PropertyUtil.isFunctionType(obj)) {
      propType = PropType.FUNCTION;
    } else if (PropertyUtil.isStringType(obj)) {
      propType = PropType.STRING;
    } else if (PropertyUtil.isArrayType(obj)) {
      propType = PropType.ARRAY;
    } else {
      propType = PropType.ANY;
    }

    return propType;
  }

  /**
   *
   * @param obj
   * @returns
   */
  static toString(obj: Object): string {
    return PropertyUtil.toJsonString(obj);
  }

  /**
   *
   * @param obj
   * @returns
   */
  static toJsonString(obj: Object): string {
    return PropertyUtil.isNotNull(obj) ? JSON.stringify(obj) : "{}";
  }

  /**
   *
   * @param o
   * @returns
   */
  static isNode(o: any): boolean {
    return typeof Node === "object"
      ? o instanceof Node
      : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
  }

  /**
   * returns true if it is a DOM element
   * @param o
   * @returns {boolean}
   */
  static isHtmlElement(o: any): boolean {
    return typeof HTMLElement === "object"
      ? o instanceof HTMLElement
      : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
  }

  /**
   *
   * @param domElement
   * @returns
   */
  static isHtmlSelectElement(domElement: any): boolean {
    return PropertyUtil.isHtmlElement(domElement) && domElement instanceof HTMLSelectElement;
  }

  /**
   *
   * @param domElement
   * @returns
   */
  static isHtmlInputElement(domElement: any): boolean {
    return PropertyUtil.isHtmlElement(domElement) && domElement instanceof HTMLInputElement;
  }

  static convertIntoPercentage(value: number, maxValue: number): number {
    return PropertyUtil.isNumberType(value) && PropertyUtil.isNumberType(maxValue) ? (value / maxValue) * 100 : value;
  }
}
