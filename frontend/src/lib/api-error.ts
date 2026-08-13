export class ApiError extends Error {
  status: number;
  details?: { field: string; message: string }[];

  constructor(
    message: string,
    status: number,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
