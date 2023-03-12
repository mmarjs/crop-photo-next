export class GenericResponse {
  private success: boolean;
  private error: string;
  private data: any;

  constructor(success = false, data = null, error = "") {
    this.success = success;
    this.error = error;
    this.data = data;
  }

  getSuccess() {
    return this.success;
  }

  getData() {
    return this.data;
  }

  getError() {
    return this.error;
  }

  setSuccess(success: boolean) {
    return (this.success = success);
  }

  setData(data: any) {
    return (this.data = data);
  }

  setError(error: string) {
    return (this.error = error);
  }
}
