import { Role } from "../generated/client.js";

export interface AuthenticatedRequestUser {
  id: string;
  role: Role;
}