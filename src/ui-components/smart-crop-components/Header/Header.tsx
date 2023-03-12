import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import Grid from "antd/lib/grid";
import styles from "./Header.module.scss";
import { Button } from "../../components/button";
import PreviewOff from "/public/images/eye-invisible.svg";
import PreviewOn from "/public/images/eye-visible.svg";
import CropImageSlider from "../crop-image-slider";
import classNames from "classnames";
import { HelpIconDark } from "../../assets";
import { OpenInAppHelp } from "../../components/icon/icon.composition";
import { ARTICLE_URL_ID } from "../../../common/Enums";

const { useBreakpoint } = Grid;

type HeaderProps = {
  previewMode?: boolean;
  setPreviewMode?: (update: SetStateAction<boolean>) => void;
  hideSlider?: boolean;
  label?: string;
};

const Header = ({ label, previewMode, setPreviewMode, hideSlider }: HeaderProps) => {
  const { t } = useTranslation();
  const screens = useBreakpoint();

  const onPreviewClick = () => {
    !!setPreviewMode && setPreviewMode(!previewMode);
  };

  return (
    <>
      <div
        className={classNames(styles.header, {
          [styles.uploadStyle]: hideSlider
        })}
      >
        {!hideSlider ? (
          <>
            <div className={styles.sampleImageText}>
              {t("configuration.left_panel.sampleImages")}
              <OpenInAppHelp article={ARTICLE_URL_ID.SAMPLE_IMAGE} />
            </div>
            <CropImageSlider />
            <Button
              onClick={onPreviewClick}
              type="default"
              label={screens.sm && screens.md && !screens.lg ? "" : "Preview Off"}
              style={{ fontSize: "14px", visibility: "hidden" }}
              icon={previewMode ? <PreviewOn /> : <PreviewOff />}
            />
          </>
        ) : (
          <h1 className={styles.sampleImageText}>{label}</h1>
        )}
      </div>
    </>
  );
};

export default Header;
