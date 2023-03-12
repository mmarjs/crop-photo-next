import { PropertyUtil } from "./PropertyUtil";
import { DEFAULT_ARRAY_JOIN_DELIMITER } from "./Constants";

/**
 * Utility class to hold all types of array related functionality.
 * Created by Sarthak on 3/1/2021.
 */
export class ArrayUtil {
  /**
   *
   * @param arr
   * @param checkContentAlso
   * @returns {boolean}
   */
  static isNotEmpty(arr: Array<any>, checkContentAlso: boolean = false): boolean {
    return !ArrayUtil.isEmpty(arr, checkContentAlso);
  }

  /**
   *
   * @param arr
   * @param checkContentAlso
   * @returns {boolean}
   */
  static isEmpty(arr: Array<any>, checkContentAlso: boolean = false): boolean {
    //Todo: do checkContent check also if it's given as true.
    return PropertyUtil.isNull(arr) || !PropertyUtil.isArrayType(arr) || arr.length <= 0;
  }

  /**
   *
   * @param arr
   * @param element
   */
  static contains(arr: Array<any>, element: any): boolean {
    if (ArrayUtil.isNotEmpty(arr) && PropertyUtil.isNotNull(element)) {
      return arr.indexOf(element) >= 0;
    } else {
      return false;
    }
  }

  /**
   *
   * @param arr
   * @param element
   */
  static remove(arr: Array<any>, element: any): boolean {
    if (ArrayUtil.isNotEmpty(arr) && PropertyUtil.isNotNull(element)) {
      if (arr.indexOf(element) >= 0) {
        arr.splice(arr.indexOf(element), 1);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   *
   * @param arr
   * @param delimiter
   * @returns {string}
   */
  static toString(arr: Array<any>, delimiter: string = DEFAULT_ARRAY_JOIN_DELIMITER): string {
    return arr.join(delimiter);
  }

  /**
   *
   * @param arr
   * @returns {string}
   */
  static toJsonString(arr: Array<any>): string {
    return ArrayUtil.isNotEmpty(arr) ? JSON.stringify(arr) : "[]";
  }

  /**
   *
   * @param array1
   * @param array2
   * @returns
   */
  static isEqual(array1: Array<any>, array2: Array<any>): boolean {
    if (ArrayUtil.isNotEmpty(array1) && ArrayUtil.isNotEmpty(array2)) {
      var isEqual =
        array1.length == array2.length &&
        array1.every(function (element, index) {
          return element === array2[index];
        });
      return isEqual;
    } else if (ArrayUtil.isEmpty(array1) && ArrayUtil.isEmpty(array2)) {
      //return true if both empty
      return true;
    } else {
      //return false if one not empty
      return false;
    }
  }

  static nullToEmpty<T>(arr: Array<T> | undefined | null): T[] {
    if (!!arr) {
      return arr;
    }
    return [];
  }
}
