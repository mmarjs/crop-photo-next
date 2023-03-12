import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import { HttpResultType } from "../util/web/http-client";
import Optional from "../util/Optional";

export default class TenantIdToUserIdToRole {
  private tenantId: string;
  private userId: string;
  private role: string;

  constructor(tenantId: string, userId: string, role: string) {
    this.tenantId = tenantId;
    this.userId = userId;
    this.role = role;
  }

  getTenantId() {
    return this.tenantId;
  }

  getUserId() {
    return this.userId;
  }

  getRole() {
    return this.role;
  }

  setTenantId(tenant_id: string) {
    return (this.tenantId = tenant_id);
  }

  setUserId(user_id: string) {
    return (this.userId = user_id);
  }

  setRole(role: string) {
    return (this.role = role);
  }

  static deserializer(): HttpResponseDeserializer<TenantIdToUserIdToRole> {
    return new (class implements HttpResponseDeserializer<TenantIdToUserIdToRole> {
      deserialize(data: HttpResultType): Optional<TenantIdToUserIdToRole> {
        if (data) {
          let tenantId: string = data.data["tenant_id"];
          let userId: string = data.data["user_id"];
          let role: string = data.data["role"];
          if (tenantId && userId) return Optional.of(new TenantIdToUserIdToRole(tenantId, userId, role));
        }
        return Optional.empty();
      }
    })();
  }
}
