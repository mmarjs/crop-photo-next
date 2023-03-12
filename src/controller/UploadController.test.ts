import "@testing-library/jest-dom";
import { UploadController } from "./UploadController";
import { UploadReporterAdapter } from "./UploadReporter";
import _ from "lodash";

function createSampleFile(fileName: string) {
  return new File(["I am random"], fileName, { type: "text/html" });
}

describe("Upload controller tests", () => {
  let uploadController = new UploadController(new UploadReporterAdapter());

  beforeEach(() => {
    //restore all mocked functions every before each test
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
    uploadController.reset();
  });

  it("upload only accepted files", () => {
    const startUploadSpy = jest.spyOn(uploadController, "start");
    expect(uploadController.getTotal()).toBe(0);
    startUploadSpy.mockImplementation(_.noop);
    const file1 = createSampleFile("file-name-1.jpeg");
    const file2 = createSampleFile("file-name-2.jpeg");
    const file3 = createSampleFile("file-name-2.txt");
    uploadController.onFilesDrop([file1, file2, file3]);
    expect(uploadController.getTotal()).toBe(2);
  });

  it("upload files from folder", () => {
    const startUploadSpy = jest.spyOn(uploadController, "start");
    expect(uploadController.getTotal()).toBe(0);
    startUploadSpy.mockImplementation(_.noop);
    //create images
    const file1 = createSampleFile("file-name-1.jpeg");
    const file2 = createSampleFile("file-name-2.jpeg");
    const file3 = createSampleFile("file-name-2.png");

    uploadController.onFilesDrop([file1, file2, file3]);
    expect(uploadController.getTotal()).toBe(3);
  });

  it("delete all method call must call cancelUploads method.", () => {
    let cancelUploads = jest.spyOn(uploadController, "cancelUploads");
    uploadController.delete([], true, []);
    expect(cancelUploads.mock.calls.length).toBe(1);
  });

  it("delete all with exclude items.", () => {
    let startMethodSpy = jest.spyOn(uploadController, "start");
    let deleteMethodSpy = jest.spyOn(uploadController, "delete");
    startMethodSpy.mockImplementation(_.noop);
    const file1 = createSampleFile("file-name-1.jpeg");
    const file2 = createSampleFile("file-name-2.jpeg");
    uploadController.onFilesDrop([file1, file2]);

    //At this time queue length must be 2.
    expect(uploadController.getTotal()).toBe(2);
    let uiId = uploadController
      .getFiles()
      .filter(i => i.getName() === file2.name)[0]
      .getUiId();

    //Delete all with excluding one item.
    uploadController.delete([], true, [uiId]);

    //Now, length must be 1;
    expect(uploadController.getTotal()).toBe(1);

    //When item is removed, delete event must be called.
    expect(deleteMethodSpy.mock.calls.length).toBe(1);

    //Delete all with no excludes.
    uploadController.delete([], true, []);

    //Now, length must be 0;
    expect(uploadController.getTotal()).toBe(0);

    //When item is removed, delete event must be called 2nd time.
    expect(deleteMethodSpy.mock.calls.length).toBe(2);
  });
});
