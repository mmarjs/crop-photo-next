import { HttpResultType } from "./http-client";
import Optional from "../Optional";

export default interface HttpResponseDeserializer<Type> {
  deserialize(data: HttpResultType): Optional<Type>;
}
