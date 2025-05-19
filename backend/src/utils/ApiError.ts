class ApiError extends Error {
  public statusCode: number;
  public data: any;
  public success: boolean;
  public errors: string[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: string[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      success: this.success,
      errors: this.errors,
      ...(process.env.NODE_ENV === "development"
        ? { stack: this.stack }
        : undefined),
    };
  }
}

export default ApiError;
