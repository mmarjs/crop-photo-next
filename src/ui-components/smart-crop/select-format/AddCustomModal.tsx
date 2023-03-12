import { useRef } from "react";
import Input from "antd/lib/input";
import Form from "antd/lib/form";
import { CustomModal } from "../../components/modal";
import { Button } from "../../components/button";
import { useTranslation } from "react-i18next";
import { ArrowLeftOutlined } from "@ant-design/icons";
import styles from "./select-format.module.scss";
import { OBJECT_TYPE } from "../../../common/Types";
import isNumber from "lodash/isNumber";
import { useForm } from "antd/lib/form/Form";
import isNaN from "lodash/isNaN";
import { OpenInAppHelp } from "../../components/icon/icon.composition";
import { ARTICLE_URL_ID } from "../../../common/Enums";

type AddCustomModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSaveSize: Function;
};

export default function AddCustomModal({ visible, onCancel, onSaveSize }: AddCustomModalProps) {
  const { t } = useTranslation();
  const [customModalForm] = useForm();
  const inputRef = useRef<any | null>(null);

  const handleSubmit = (values: OBJECT_TYPE) => {
    const width = Number(values.width);
    const height = Number(values.height);
    onSaveSize(width, height);
    customModalForm.setFieldsValue({
      width: "",
      height: ""
    });
  };

  const onChange = (e: React.FormEvent<HTMLInputElement>, field: string) => {
    e.preventDefault();
    const assignValue = (val: string | number) => {
      customModalForm.setFieldsValue({
        [field]: val
      });
    };
    let cleanValue: string | number = e.currentTarget.value.toString().replace(/\D/g, "");
    let num: number | string = Number(cleanValue);
    if (cleanValue === "" || num === 0) {
      assignValue("");
      customModalForm
        .validateFields()
        .then(values => {})
        .catch(err => console.log(err));
    } else {
      if (!isNaN(num) && isNumber(num)) {
        assignValue(num);
      } else {
        if (num === 0) {
          num = "";
        }
        assignValue(num);
      }
    }
  };

  return (
    <CustomModal
      visible={visible}
      noFooter
      onCancel={onCancel}
      title={
        <div className={styles.modalTitleWrapper}>
          <div className={styles.modalTitle}>{t("upload.add_custom_size.title")}</div>
          <OpenInAppHelp article={ARTICLE_URL_ID.CUSTOM_SIZE_MODAL} />
        </div>
      }
      closeIcon={<ArrowLeftOutlined />}
    >
      <Form
        requiredMark={false}
        layout="vertical"
        onFinish={handleSubmit}
        form={customModalForm}
        autoComplete="off"
        initialValues={{ width: "", height: "" }}
      >
        <div className={styles.customInputsContainer}>
          <Form.Item
            name="width"
            label={t("upload.add_custom_size.width.label")}
            rules={[{ required: true, message: t("upload.add_custom_size.errors.missing_width") }]}
          >
            <Input
              className={styles.CustomInput}
              placeholder={t("upload.add_custom_size.width.placeholder")}
              onChange={e => onChange(e, "width")}
              autoFocus
            />
          </Form.Item>
          <Form.Item
            name="height"
            label={t("upload.add_custom_size.height.label")}
            rules={[{ required: true, message: t("upload.add_custom_size.errors.missing_height") }]}
          >
            <Input
              className={styles.CustomInput}
              placeholder={t("upload.add_custom_size.height.placeholder")}
              onChange={e => onChange(e, "height")}
            />
          </Form.Item>
        </div>
        <div className={styles.AddCustomSizeActions}>
          <Button
            type="primary"
            htmlType="submit"
            label={t("upload.add_custom_size.save_size")}
            className={styles.addCustomBtn}
          />
          <Button
            type="text"
            label={t("upload.add_custom_size.cancel")}
            onClick={onCancel}
            className={styles.cancelBtn}
          />
        </div>
      </Form>
    </CustomModal>
  );
}
