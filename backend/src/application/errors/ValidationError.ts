import type { FieldErrorDetail } from './AppError';
import { AppError } from './AppError';

export class ValidationError extends AppError {
  readonly status = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string, details?: FieldErrorDetail[]) {
    super(message, details);
  }
}
