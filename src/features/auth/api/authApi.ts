import { apiClient } from "@/api/client"
import { USE_FIXTURES } from "@/api/config"
import { endpoints } from "@/api/endpoints"
import { toAuthSession, type AuthSession, type BackendAuthResponse } from "@/api/mappers"
import { ApiError } from "@/api/types"
import { authAccounts, businessOwners, customers, type AuthAccount } from "@/fixtures"
import type {
  BusinessLoginInput,
  BusinessRegisterInput,
} from "@/features/auth/schemas/businessAuthSchemas"
import type {
  CustomerLoginInput,
  CustomerRegisterInput,
} from "@/features/auth/schemas/customerAuthSchemas"

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
    refreshToken: `fixture-refresh-${account.actorId}`,
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
    return toAuthSession(
      await apiClient.post<BackendAuthResponse>(endpoints.auth.customerLogin(), input),
    )
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
      customers.push({ id: actorId, name: input.name, phone: input.phone, email: input.email })
      return toSession(account)
    }
    return toAuthSession(
      await apiClient.post<BackendAuthResponse>(endpoints.auth.customerRegister(), input),
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
    return toAuthSession(
      await apiClient.post<BackendAuthResponse>(endpoints.auth.businessLogin(), input),
    )
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
      await apiClient.post<BackendAuthResponse>(endpoints.auth.businessRegister(), input),
    )
  },
}
