export type FieldErrorDetail = { field: string; message: string };

export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;
  readonly details?: FieldErrorDetail[];

  constructor(message: string, details?: FieldErrorDetail[]) {
    super(message);
    this.name = new.target.name;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
