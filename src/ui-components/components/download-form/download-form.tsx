import { ChangeEvent, FormEvent, MouseEvent, MouseEventHandler, useCallback, useState } from "react";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { HLayout } from "../hLayout";
import { Input } from "../input";
import { VLayout } from "../vLayout";
import styles from "./download-form.module.scss";
import IconDelete from "../../../../public/images/delete.svg";
import classNames from "classnames";

type DownloadFormProps = {
  onOK?: Function;
  onCancel?: (e: MouseEvent<HTMLElement>) => void;
  okText: string;
};

type CustomFormat = {
  width?: number;
  height?: number;
};

type CheckBoxProps = {
  checked: boolean;
  label: string;
};

const DownloadForm = ({ okText, onOK, onCancel }: DownloadFormProps) => {
  const [isDownloadOriginal, setIsDownloadOriginal] = useState(false);
  const [customFormats, setCustomFormats] = useState<CustomFormat[]>([]);
  const [socialMedia, setSocialMedia] = useState<CheckBoxProps[]>([
    { checked: false, label: "1080x1080 (Instagram)" },
    { checked: false, label: "1024x512 (Twitter)" },
    { checked: false, label: "1200x630 (Facebook)" },
    { checked: false, label: "1104x736 (LinkedIn)" },
    { checked: false, label: "600x900 (Pinterest)" }
  ]);
  const [videoPlatforms, setVideoPlatforms] = useState<CheckBoxProps[]>([
    { checked: false, label: "Youtube 2k" },
    { checked: false, label: "YouTube 1440p" },
    { checked: false, label: "YouTube 1080p" }
  ]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    !!onOK && onOK(isDownloadOriginal, customFormats, socialMedia, videoPlatforms);
  };

  const addNewFormat = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      setCustomFormats([...customFormats, {}]);
    },
    [customFormats]
  );

  const updateFormat = useCallback(
    (idx: number, key: "width" | "height", value: number) => {
      const tmpFormats = [...customFormats];
      tmpFormats[idx][key] = Number.isNaN(value) ? undefined : value;
      setCustomFormats(tmpFormats);
    },
    [customFormats]
  );

  const deleteFormat = useCallback(
    (idx: number) => {
      const tmpFormats = [...customFormats];
      tmpFormats.splice(idx, 1);
      setCustomFormats([...tmpFormats]);
    },
    [customFormats]
  );

  const updateSocialMedia = useCallback(
    (idx: number, checked: boolean) => {
      const tmpData = [...socialMedia];
      tmpData[idx].checked = checked;
      setSocialMedia([...tmpData]);
    },
    [socialMedia]
  );

  const updateVideoPlatforms = useCallback(
    (idx: number, checked: boolean) => {
      const tmpData = [...videoPlatforms];
      tmpData[idx].checked = checked;
      setVideoPlatforms([...tmpData]);
    },
    [videoPlatforms]
  );

  return (
    <form className={styles.Wrapper} onSubmit={onSubmit}>
      <VLayout noMargin={true} gap={24}>
        <VLayout noMargin={true} gap={8} noFlex={true}>
          <h5 className={styles.SelectFormatTitle}>Select format</h5>
          <Checkbox
            className={styles.CustomCheckbox}
            text="Original"
            checked={isDownloadOriginal}
            onChange={v => setIsDownloadOriginal(v.target.checked)}
            name="original"
          />
          {customFormats.map(({ width, height }, idx) => (
            <HLayout key={idx} noPadding={true} gap={8} hAlign="flex-start">
              <Input
                customizeClassName={classNames(styles.CustomInput, styles.WidthInput)}
                text={`${width ?? ""}`}
                name={`width${idx}`}
                mandatory={true}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormat(idx, "width", parseInt(e.target.value))}
              />
              <Input
                customizeClassName={classNames(styles.CustomInput, styles.HeightInput)}
                text={`${height ?? ""}`}
                name={`height${idx}`}
                mandatory={true}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateFormat(idx, "height", parseInt(e.target.value))}
              />
              <Button icon={<IconDelete />} type="text" onClick={() => deleteFormat(idx)} />
            </HLayout>
          ))}
          <a href="#" className={styles.AddCustomBtn} onClick={addNewFormat}>
            Add custom
          </a>
        </VLayout>
        <VLayout noMargin={true} gap={8} noFlex={true}>
          <h6 className={styles.SocialMediaTitle}>Social Media</h6>
          {socialMedia.map(({ checked, label }, idx) => (
            <div>
              <Checkbox
                key={idx}
                className={styles.CustomCheckbox}
                text={label}
                checked={checked}
                onChange={v => updateSocialMedia(idx, v.target.checked)}
                name={`socialmedium${idx}`}
              />
            </div>
          ))}
        </VLayout>
        <VLayout noMargin={true} gap={8} noFlex={true}>
          <h6 className={styles.SocialMediaTitle}>Video platforms</h6>
          {videoPlatforms.map(({ checked, label }, idx) => (
            <div>
              <Checkbox
                key={idx}
                className={styles.CustomCheckbox}
                text={label}
                checked={checked}
                onChange={v => updateVideoPlatforms(idx, v.target.checked)}
                name={`videoPlatform${idx}`}
              />
            </div>
          ))}
        </VLayout>
        <HLayout noPadding={true} noFlex={true} gap={16} hAlign="flex-end">
          <Button type="primary" htmlType="submit">
            {okText}
          </Button>
          <Button type="text" htmlType="button" onClick={onCancel}>
            Cancel
          </Button>
        </HLayout>
      </VLayout>
    </form>
  );
};

export default DownloadForm;
