import { combineReducers } from "redux";
import billingReducer from "./billingReducer";
import selectmediaReducer from "./selectmediaReducer";
import smartcropReducer from "./smartcropReducer";

const rootReducer = combineReducers({
  smartcrop: smartcropReducer,
  selectmedia: selectmediaReducer,
  billing: billingReducer
});

export default rootReducer;
