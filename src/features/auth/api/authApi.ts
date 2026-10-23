import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toId, toRole, type BackendRole } from "@/api/mappers"
import { ApiError } from "@/api/types"
import { authAccounts, businessOwners, customers, type AuthAccount } from "@/fixtures"
import type { Role } from "@/types"
import type {
  BusinessLoginInput,
  BusinessRegisterInput,
} from "@/features/auth/schemas/businessAuthSchemas"
import type {
  CustomerLoginInput,
  CustomerRegisterInput,
} from "@/features/auth/schemas/customerAuthSchemas"

export type AuthSession = {
  token: string
  role: Role
  actorId: string
  businessId?: string
}

type AuthResponse = {
  token: string
  role: BackendRole
  actorId: number
  businessId: number | null
}

function toAuthSession(response: AuthResponse): AuthSession {
  return {
    token: response.token,
    role: toRole(response.role),
    actorId: toId(response.actorId),
    businessId: response.businessId === null ? undefined : toId(response.businessId),
  }
}

function invalidCredentialsError(path: string): ApiError {
  return new ApiError({
    timestamp: new Date().toISOString(),
    status: 401,
    error: "Unauthorized",
    message: "errors.invalidCredentials",
    path,
  })
}

function emailTakenError(path: string): ApiError {
  return new ApiError({
    timestamp: new Date().toISOString(),
    status: 409,
    error: "Conflict",
    message: "errors.emailTaken",
    path,
  })
}

function toSession(account: AuthAccount): AuthSession {
  return {
    token: `fixture-token-${account.actorId}`,
    role: account.role,
    actorId: account.actorId,
    businessId: account.role === "business_owner" ? account.businessId || undefined : undefined,
  }
}

function emailExists(email: string) {
  return authAccounts.some((account) => account.email.toLowerCase() === email.toLowerCase())
}

export const authApi = {
  customerLogin: async (input: CustomerLoginInput): Promise<AuthSession> => {
    if (USE_FIXTURES) {
      const account = authAccounts.find(
        (candidate) =>
          candidate.role === "customer" &&
          candidate.email.toLowerCase() === input.email.toLowerCase() &&
          candidate.password === input.password,
      )
      if (!account) throw invalidCredentialsError(endpoints.auth.customerLogin())
      return toSession(account)
    }
    return toAuthSession(await apiClient.post<AuthResponse>(endpoints.auth.customerLogin(), input))
  },

  customerRegister: async (input: CustomerRegisterInput): Promise<AuthSession> => {
    if (USE_FIXTURES) {
      if (emailExists(input.email)) throw emailTakenError(endpoints.auth.customerRegister())
      const actorId = `cust-${Date.now()}`
      const account: AuthAccount = {
        role: "customer",
        email: input.email,
        password: input.password,
        actorId,
      }
      authAccounts.push(account)
      customers.push({ id: actorId, name: input.name, email: input.email })
      return toSession(account)
    }
    return toAuthSession(
      await apiClient.post<AuthResponse>(endpoints.auth.customerRegister(), input),
    )
  },

  businessLogin: async (input: BusinessLoginInput): Promise<AuthSession> => {
    if (USE_FIXTURES) {
      const account = authAccounts.find(
        (candidate) =>
          candidate.role === "business_owner" &&
          candidate.email.toLowerCase() === input.email.toLowerCase() &&
          candidate.password === input.password,
      )
      if (!account) throw invalidCredentialsError(endpoints.auth.businessLogin())
      return toSession(account)
    }
    return toAuthSession(await apiClient.post<AuthResponse>(endpoints.auth.businessLogin(), input))
  },

  businessRegister: async (input: BusinessRegisterInput): Promise<AuthSession> => {
    if (USE_FIXTURES) {
      if (emailExists(input.email)) throw emailTakenError(endpoints.auth.businessRegister())
      const actorId = `owner-${Date.now()}`
      const account: AuthAccount = {
        role: "business_owner",
        email: input.email,
        password: input.password,
        actorId,
        businessId: "",
      }
      authAccounts.push(account)
      businessOwners.push({ id: actorId, businessId: "", name: input.name, email: input.email })
      return toSession(account)
    }
    return toAuthSession(
      await apiClient.post<AuthResponse>(endpoints.auth.businessRegister(), input),
    )
  },
}
