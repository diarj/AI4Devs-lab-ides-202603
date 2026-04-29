import { AppError } from './AppError';

export class UnsupportedMediaTypeError extends AppError {
  readonly status = 415;
  readonly code = 'UNSUPPORTED_MEDIA_TYPE';

  constructor(message = 'Only PDF and DOCX files are allowed.') {
    super(message);
  }
}
