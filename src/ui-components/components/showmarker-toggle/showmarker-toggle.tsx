import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { toggleShowmarkerStatus } from "../../../redux/actions/smartcropActions";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { ToggleBtn } from "../toggle-button";

const defaultProps = {
  className: "",
  showMarker: false,
  toggleStatus: () => {}
};

const ShowMarkerToggle = ({ showMarker, toggleStatus, className } = defaultProps) => {
  return <ToggleBtn text="Show marker" checked={showMarker} toggleCheck={toggleStatus} className={className} />;
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  showMarker: state.smartcrop.showMarker
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  toggleStatus: () => dispatch(toggleShowmarkerStatus())
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowMarkerToggle);
