import { AppError } from './AppError';

export class ForbiddenError extends AppError {
  readonly status = 403;
  readonly code = 'FORBIDDEN';

  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
  }
}
