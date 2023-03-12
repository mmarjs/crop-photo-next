import React from "react";
import Enzyme, { shallow, mount } from "enzyme";
import CropFooter from "../../../../ui-components/components/smart-crop-config/crop-footer";

describe("Component CropFooter", () => {
  let component;
  beforeEach(() => {
    component = shallow(<CropFooter />);
  });

  it("CropFooter Compoennt should exist", () => {
    expect(component.length).toBe(1);
  });
});
