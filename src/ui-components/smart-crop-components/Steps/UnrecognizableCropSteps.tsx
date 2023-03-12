import { Form, FormInstance, Progress } from "antd";
import { FC } from "react";
import { DropzoneRootProps } from "react-dropzone";
import AdvancedSettings from "../../components/Advanced-settings";
import BackgroundColor from "../../components/background-color";
import CropMarker from "../../components/Crop-marker";
import RemoveBackground from "../../components/remove-background";
import ReviewSettings from "../../components/review-settings";
import SizeOutput from "../../components/size-output";
import UploadCustomBg from "../../components/upload-custom-bg";
import SelectFormat from "../../smart-crop/select-format";
import { useSelectedSize } from "../jotai";

export const Step1: FC = () => (
  <>
    <CropMarker />
    <AdvancedSettings />
  </>
);

interface Step2Props {
  removeBackground: boolean;
}

export const Step2: FC<Step2Props> = ({ removeBackground }) => (
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

interface Step3Props {
  form: FormInstance<any>;
  onFieldChange: (values: any, allValues: any) => void;
  isSmartCrop?: boolean;
  onShowAddCustom: (show: boolean) => void;
}

export const Step3: FC<Step3Props> = ({ form, onFieldChange, onShowAddCustom, isSmartCrop = false }) => {
  const [selectedSizes] = useSelectedSize();
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

interface Step4Props {
  stepsLength: number;
  onEditCropmarker: () => void;
  onEditBgSettings: () => void;
  onEditOutputSizes: () => void;
}

export const Step4: FC<Step4Props> = ({ stepsLength, onEditBgSettings, onEditCropmarker, onEditOutputSizes }) => (
  <ReviewSettings
    steppersLength={stepsLength - 1}
    onEditCropMarker={onEditCropmarker}
    onEditBgSettings={onEditBgSettings}
    onEditOutputSizes={onEditOutputSizes}
  />
);
