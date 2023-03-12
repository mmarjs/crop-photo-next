import _ from "lodash";

export default class MyEnv {
  public static readonly DEV: boolean = _.eq(process.env.NODE_ENV, "development");
  public static readonly PROD: boolean = _.eq(process.env.NODE_ENV, "production");
  public static readonly TEST: boolean = _.eq(process.env.NODE_ENV, "test");
  public static readonly DEV_OR_TEST: boolean = MyEnv.DEV || MyEnv.TEST;
}
