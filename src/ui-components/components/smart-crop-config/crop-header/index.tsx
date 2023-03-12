import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { HOME_PAGE, redirectToPath } from "../../../../lib/navigation/routes";
import { resetSmartCropConfig } from "../../../../redux/actions/smartcropActions";
import { Button } from "../../button";

import styles from "./crop-header.module.scss";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface CropHeaderProps extends PropsFromRedux {
  onSaveClick: any;
  isConfigComplete: boolean;
  isLoading: boolean;
}

const CropHeader = ({ onSaveClick, isConfigComplete, isLoading }: CropHeaderProps) => {
  const router = useRouter();
  return (
    <div className={styles.headerWrapper}>
      <Button
        onClick={() => {
          redirectToPath(HOME_PAGE, router, window);
        }}
        type="text"
        icon={<Image src="/images/cross.svg" width={10} height={10} />}
      />

      <div className={styles.headerTitle}>Configuration</div>

      <Button
        type="primary"
        label="Next"
        className={styles.BtnDone}
        onClick={onSaveClick}
        disabled={!isConfigComplete || isLoading}
        loading={isLoading}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  resetSmartCropConfig: () => {
    console.log("reset");
    dispatch(resetSmartCropConfig());
  }
});

const connector = connect(null, mapDispatchToProps);

export default connector(CropHeader);
