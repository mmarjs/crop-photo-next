import { Form, FormInstance } from "antd";
import { FC } from "react";
import AdvancedSettings from "../../components/Advanced-settings";
import BackgroundColor from "../../components/background-color";
import CropMarker from "../../components/Crop-marker";
import RemoveBackground from "../../components/remove-background";
import ReviewSettings from "../../components/review-settings";
import SizeOutput from "../../components/size-output/SizeOutput";
import UploadCustomBg from "../../components/upload-custom-bg";
import SelectFormat from "../../smart-crop/select-format";
import CropSides from "../CropSides";
import CropTypes from "../CropTypes";
import { useRemoveBackground, useSelectedSize } from "../jotai";
import { CROP_TYPES } from "../jotai/atomTypes";
import { useCropTypeAtom } from "../jotai/customFaceCrop/atomStore";

export const Step1: FC = () => <CropTypes />;

export const Step2: FC = () => {
  const [cropType] = useCropTypeAtom();
  return (
    <>
      <CropMarker />
      <div style={{ marginBottom: "2rem" }}>{cropType === CROP_TYPES.CROP_FROM ? <CropSides /> : null}</div>
      <AdvancedSettings />
    </>
  );
};

export const Step3 = () => {
  const [removeBackground] = useRemoveBackground();
  return (
    <>
      <RemoveBackground />
      {removeBackground && (
        <>
          <BackgroundColor />
          <UploadCustomBg />
        </>
      )}
    </>
  );
};

interface Step4Props {
  form: FormInstance<any>;
  onFieldChange: (values: any, allValues: any) => void;
  isSmartCrop?: boolean;
  onShowAddCustom: (show: boolean) => void;
}
export const Step4: FC<Step4Props> = ({ form, onFieldChange, onShowAddCustom, isSmartCrop }) => {
  const [selectedSizes, setSelectedSizes] = useSelectedSize();
  const customSizes = [...selectedSizes.filter(size => size !== "Original")];
  return (
    <>
      <Form
        form={form}
        onFieldsChange={onFieldChange}
        initialValues={{
          original: selectedSizes.indexOf("Original") !== -1,
          customFormats: customSizes
        }}
        id="custom-format-form"
        autoComplete="off"
      >
        <SizeOutput />
        <SelectFormat onShowAddCustom={onShowAddCustom} smartCrop={isSmartCrop} />
      </Form>
    </>
  );
};

interface Step5Props {
  stepsLength: number;
  onEditCropmarker: () => void;
  onEditBgSettings: () => void;
  onEditOutputSizes: () => void;
}
export const Step5: FC<Step5Props> = ({ stepsLength, onEditBgSettings, onEditCropmarker, onEditOutputSizes }) => (
  <ReviewSettings
    steppersLength={stepsLength - 1}
    onEditCropMarker={onEditCropmarker}
    onEditBgSettings={onEditBgSettings}
    onEditOutputSizes={onEditOutputSizes}
  />
);
