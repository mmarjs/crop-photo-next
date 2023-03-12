import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { SmartCropInProgress } from "../smartcrop-in-progress";
import { SmartCropSummary } from "../smartcrop-summary";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface RightPanelProps extends PropsFromRedux {
  automationId: string;
}

const SmartCropRightPanel = ({ currentView, automationId }: RightPanelProps) => {
  return (
    <>
      {currentView === "smartcrop" && <SmartCropInProgress automationId={automationId} />}
      {currentView === "summary" && <SmartCropSummary automationId={automationId} />}
    </>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  currentView: state.smartcrop.currentView
});

const connector = connect(mapStateToProps);

export default connector(SmartCropRightPanel);
