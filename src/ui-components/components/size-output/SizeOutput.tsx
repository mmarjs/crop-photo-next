import { useTranslation } from "react-i18next";
import styles from "./size-output.module.scss";
import { Button } from "antd";
import { Checkbox } from "../checkbox";
import Form from "antd/lib/form";
import { useIntercom } from "react-use-intercom";
import { OpenInAppHelp } from "../icon/icon.composition";
import { ARTICLE_URL_ID } from "../../../common/Enums";
import LearnMore from "../LearnMore";

const SizeOutput = () => {
  const { t } = useTranslation();
  const { showArticle } = useIntercom();
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        <div style={{ marginRight: "0.5rem" }}>{t("configuration.left_panel.size_output")}</div>
        {/* <Help
          className={styles.helpIcon}
          width={16}
          viewBox="0 0 18 16"
          onClick={() => {
            // showArticle(6101400);
          }}
        /> */}
        <OpenInAppHelp article={ARTICLE_URL_ID.SIZE_OUTPUT} />
      </div>
      <div className={styles.shortdescription}>
        {t("configuration.left_panel.size_output_desc")}
        <LearnMore article={ARTICLE_URL_ID.SIZE_OUTPUT_URL as string} />
      </div>

      <Form.Item name="original" valuePropName="checked" noStyle>
        <Checkbox className={styles.removeBg} text={t("Original")} />
      </Form.Item>
    </div>
  );
};

export default SizeOutput;
