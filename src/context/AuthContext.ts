import { createContext } from "react";
import { IAuthContext } from "./IAuthContext";

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default AuthContext;
