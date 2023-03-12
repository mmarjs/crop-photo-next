export class Logger {
  private className: string;

  constructor(className: string) {
    this.className = className;
  }

  public log(obj: any): void {
    if (obj) {
      let logMsg =
        this.className + " : " + new Date().toDateString() + " : " + (typeof obj == "string") ? obj : obj.toString();
      console.log(logMsg);
    }
  }
}
