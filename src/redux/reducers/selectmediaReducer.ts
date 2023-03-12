import { AnyAction } from "redux";
import { UPDATE_TOTAL_FILES } from "../actions/selectmediaActions";
import { SelectMediaStruct, SelectMediaStructType } from "../structs/selectmedia";

const selectmediaReducer = (state = SelectMediaStruct, action: AnyAction): SelectMediaStructType => {
  switch (action.type) {
    case UPDATE_TOTAL_FILES:
      return {
        ...state,
        files: action.payload
      };
    default:
      return { ...state };
  }
};

export default selectmediaReducer;
