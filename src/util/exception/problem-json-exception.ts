import ProblemJson from "../web/problem-json";
import {t} from "i18next";

class ProblemJsonException extends Error {
  private readonly _problemJson: ProblemJson;

  constructor(problemJson: ProblemJson) {
    super(problemJson.detail);
    this.message = problemJson.detail;
    this.name = problemJson.type;
    this._problemJson = problemJson;
  }

  get problemJson(): ProblemJson {
    return this._problemJson;
  }

  toString() {
    return this.problemJson.detail;
  }
}

export function mapErrorFromProblemJson(error: ProblemJsonException) {
  // @ts-ignore
  let problemJson: ProblemJson = error.problemJson;
  if (problemJson) {
    if (problemJson.detail) {
      return problemJson.detail;
    } else if (problemJson.title) {
      return t(problemJson.title)
    } else if (problemJson.type) {
      return t(problemJson.type.split("/").filter(v=>v.length>0).join("."));
    }
  }
  return error.message;
}

export { ProblemJsonException };
