// export const Step1 = () => {};

import { Form, FormInstance } from "antd";
import { FC } from "react";
import BackgroundColor from "../../components/background-color";
import RemoveBackground from "../../components/remove-background";
import ReviewSettings from "../../components/review-settings";
import SizeOutput from "../../components/size-output";
import UploadCustomBg from "../../components/upload-custom-bg";
import SelectFormat from "../../smart-crop/select-format";
import { useSelectedSize } from "../jotai";

interface Step1Props {
  removeBackground: boolean;
}
export const Step1: FC<Step1Props> = ({ removeBackground }) => (
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

interface Step2Props {
  form: FormInstance<any>;
  onFieldChange: (values: any, allValues: any) => void;
  isSmartCrop?: boolean;
  onShowAddCustom: (show: boolean) => void;
}
export const Step2: FC<Step2Props> = ({ form, onFieldChange, onShowAddCustom, isSmartCrop }) => {
  const [selectedSizeAtom, setSelectedSizeAtom] = useSelectedSize();
  const customSizes = [...selectedSizeAtom.filter(size => size !== "Original")];
  return (
    <>
      <Form
        form={form}
        onFieldsChange={onFieldChange}
        initialValues={{
          original: selectedSizeAtom?.indexOf("Original") !== -1,
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

interface Step3Props {
  stepsLength: number;
  onEditCropmarker: () => void;
  onEditBgSettings: () => void;
  onEditOutputSizes: () => void;
}
export const Step3: FC<Step3Props> = ({ stepsLength, onEditBgSettings, onEditCropmarker, onEditOutputSizes }) => (
  <ReviewSettings
    steppersLength={stepsLength - 1}
    onEditCropMarker={onEditCropmarker}
    onEditBgSettings={onEditBgSettings}
    onEditOutputSizes={onEditOutputSizes}
  />
);
