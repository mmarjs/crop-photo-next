import { Button } from "../../components/button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckboxOptionType } from "antd/lib/checkbox/Group";
import { Row } from "antd";
import { useIntercom } from "react-use-intercom";
import Form from "antd/lib/form";
import Checkbox from "antd/lib/checkbox";
import AddCustomModal from "./AddCustomModal";
import DeleteIcon from "../../../../public/images/delete.svg";
import styles from "./select-format.module.scss";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { toast } from "../../components/toast";
import { useLatestCustomSize, useSelectedSize } from "../../smart-crop-components/jotai";

type SelectFormatProps = {
  onShowAddCustom: (show: boolean) => void;
  smartCrop?: boolean;
};

export default function SelectFormat({ onShowAddCustom, smartCrop = false }: SelectFormatProps) {
  const [customFormats, setCustomFormats] = useState<CheckboxOptionType[]>([]);
  // const [latestCustomSize, setLatestCustomSize] = useState<CheckboxOptionType>();
  const [latestCustomSize, setLatestCustomSize] = useLatestCustomSize();
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [localCustomSizes, setLocalCustomSizes] = useLocalStorage<CheckboxOptionType[]>("custom_sizes", []);
  const { showArticle } = useIntercom();
  const { t } = useTranslation();
  const [selectedSizes, setSelectedSizes] = useSelectedSize();

  useEffect(() => {
    if (!!localCustomSizes && localCustomSizes?.length > 0) {
      setCustomFormats(localCustomSizes);
    }
  }, []);

  function handleSaveSize(width: number, height: number) {
    const customSize = `${width}x${height}`;
    const newCustomSizes = [...customFormats, { label: customSize, value: customSize }];
    const isNotExist = !customFormats?.find(cf => cf.value === customSize);
    if (isNotExist) {
      setCustomFormats(newCustomSizes);
      setLocalCustomSizes(newCustomSizes);
      setSelectedSizes([...selectedSizes, customSize]);
      setLatestCustomSize([...latestCustomSize, customSize]);
      setShowAddCustom(false);
      onShowAddCustom(false);
    } else {
      toast(t("upload.add_custom_size.errors.custom_size_exists"), "error");
    }
  }

  function handleDelete(newFormats: CheckboxOptionType[]) {
    setCustomFormats(newFormats);
    setLocalCustomSizes(newFormats);
  }

  return (
    <div className={styles.selectFormatContainer}>
      <div className={styles.label}>
        {smartCrop ? t("upload.select_format.title") : t("upload.select_format.custom_formats")}
        {/* <Help
          className={styles.helpIcon}
          width={16}
          viewBox="0 0 18 16"
          onClick={() => {
            showArticle(6123039);
          }}
        /> */}
      </div>
      <div className={styles.origAndCustomContainer}>
        {smartCrop && (
          <Form.Item name="original" valuePropName="checked" noStyle>
            <Checkbox className={styles.formatCheckbox}>{t("media.original")}</Checkbox>
          </Form.Item>
        )}
        {customFormats?.length > 0 ? (
          <Row className={styles.customFormatList}>
            <Form.Item initialValue={latestCustomSize} name="customFormats">
              <Checkbox.Group style={{ display: "flex", flexDirection: "column" }}>
                {customFormats.map((f: CheckboxOptionType, index: number) => {
                  return (
                    <CustomFormatCheckBox key={index} f={f} customFormats={customFormats} onDelete={handleDelete} />
                  );
                })}
              </Checkbox.Group>
            </Form.Item>
          </Row>
        ) : null}
        <Button
          type="text"
          label={t("media.add_custom")}
          onClick={() => {
            setShowAddCustom(true);
            onShowAddCustom(true);
          }}
          style={{
            marginTop: customFormats?.length > 0 ? 8 : 24
          }}
          className={styles.addCustomBtn}
        />
      </div>

      <AddCustomModal
        visible={showAddCustom}
        onCancel={() => {
          setShowAddCustom(false);
          onShowAddCustom(false);
        }}
        onSaveSize={handleSaveSize}
      />
    </div>
  );
}

interface CustomFormatCheckBoxProps {
  f: CheckboxOptionType;
  onDelete: (formats: CheckboxOptionType[]) => void;
  customFormats: CheckboxOptionType[];
}

function CustomFormatCheckBox({ f, onDelete, customFormats }: CustomFormatCheckBoxProps) {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <Row onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={styles.CustomFormatGroup}>
      {" "}
      <Checkbox value={f.value}>{f.label}</Checkbox>{" "}
      {hover ? (
        <Button
          size="sm"
          icon={<DeleteIcon />}
          onClick={() => {
            const filteredCustomSize = [...customFormats].filter(c => c.value !== f.value);
            onDelete(filteredCustomSize);
          }}
        />
      ) : null}
    </Row>
  );
}
