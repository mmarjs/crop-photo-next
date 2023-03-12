import { CropTypeOption } from "./leftpanel/types";

export const DIRECTION = {
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  RIGHT: "RIGHT",
  LEFT: "LEFT"
};
export const MODE = { EDIT: "EDIT", VIEW: "VIEW", SUMMARY: "SUMMARY" };
export const CROP_TYPE = {
  CROP_FROM: "CROP_FROM",
  CROP_AROUND: "CROP_AROUND"
};

export const cardTypeOptions: CropTypeOption[] = [
  {
    img: "/images/crop-type-from.png",
    label: "configuration.left_panel.crop_type.crop_from_card.label",
    subtitle: "configuration.left_panel.crop_type.crop_from_card.subtitle",
    value: "CROP_FROM",
    bg: "./images/crop-type-bg.png"
  },
  {
    img: "./images/crop-type-around.png",
    label: "configuration.left_panel.crop_type.crop_around_card.label",
    subtitle: "configuration.left_panel.crop_type.crop_around_card.subtitle",
    value: "CROP_AROUND",
    bg: "./images/crop-type-around-bg.png"
  }
];
