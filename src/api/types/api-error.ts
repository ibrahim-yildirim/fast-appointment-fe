export type FieldError = {
  field: string
  message: string
}

export type ApiErrorBody = {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: FieldError[]
}

export class ApiError extends Error {
  status: number
  error: string
  path: string
  fieldErrors?: FieldError[]

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.name = "ApiError"
    this.status = body.status
    this.error = body.error
    this.path = body.path
    this.fieldErrors = body.fieldErrors
  }
}
