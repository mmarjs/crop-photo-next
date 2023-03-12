import { createStore } from "redux";
import { createWrapper } from "next-redux-wrapper";
import rootReducer from "./reducers";
import { devToolsEnhancer } from "@redux-devtools/extension";

const makeStore = () => createStore(rootReducer, devToolsEnhancer());

export const wrapper = createWrapper(makeStore, { debug: true });
