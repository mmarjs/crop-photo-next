import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useIntercom } from "react-use-intercom";
import { HelpIconDark } from "../../assets";
import { Button } from "../../components/button";
import { DIRECTION } from "../jotai/atomTypes";
import { useCropSideAtom } from "../jotai/customFaceCrop/atomStore";
import styles from "./crop-side.module.scss";

type CropSideType = {
  label: string;
  value: string;
};

const cropSideOptions: CropSideType[] = [
  {
    label: "configuration.left_panel.crop_side.top",
    value: DIRECTION.TOP
  },
  {
    label: "configuration.left_panel.crop_side.right",
    value: DIRECTION.RIGHT
  },
  {
    label: "configuration.left_panel.crop_side.bottom",
    value: DIRECTION.BOTTOM
  },
  {
    label: "configuration.left_panel.crop_side.left",
    value: DIRECTION.LEFT
  }
];

const CropSides: FC = () => {
  const [cropSide, setCropSide] = useCropSideAtom();
  const { t } = useTranslation();
  const { showArticle } = useIntercom();
  return (
    <div className="m-3">
      <div className={styles.label}>
        {t("configuration.left_panel.crop_side.label")}
        <HelpIconDark
          className={styles.cropSideHelpIcon}
          width={16}
          viewBox="0 0 18 16"
          onClick={() => {
            showArticle(6119443);
          }}
        />
      </div>
      <div className={styles.cropSideButtonWrapper}>
        {cropSideOptions.map((option: CropSideType, i: number) => (
          <Button
            key={"CROP_SIDE" + i}
            className={
              cropSide === option.value
                ? `${styles.buttonSelected} ${styles.buttonClass}`
                : `${styles.buttonClass} ${styles.buttonUnselected}`
            }
            onClick={() => setCropSide(option.value)}
            type={"default"}
          >
            {t(option.label)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CropSides;
