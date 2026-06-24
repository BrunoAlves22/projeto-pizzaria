class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export { AppError };
