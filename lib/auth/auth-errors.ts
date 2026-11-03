export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 401 | 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}