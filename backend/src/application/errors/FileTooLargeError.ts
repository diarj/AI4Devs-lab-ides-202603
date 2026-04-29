import { AppError } from './AppError';

export class FileTooLargeError extends AppError {
  readonly status = 413;
  readonly code = 'FILE_TOO_LARGE';

  constructor(message = 'File exceeds maximum allowed size.') {
    super(message);
  }
}
