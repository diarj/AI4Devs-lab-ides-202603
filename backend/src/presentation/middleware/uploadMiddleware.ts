import path from 'path';
import multer from 'multer';
import type { RequestHandler } from 'express';
import { UnsupportedMediaTypeError } from '../../application/errors/UnsupportedMediaTypeError';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function allowedExtension(originalName: string): boolean {
  const ext = path.extname(originalName).toLowerCase();
  return ext === '.pdf' || ext === '.docx';
}

export function createCvUploadMiddleware(): RequestHandler {
  const overrideRaw = process.env.CV_MAX_UPLOAD_BYTES;
  let limitBytes: number;
  if (overrideRaw !== undefined && overrideRaw !== '') {
    const parsed = Number.parseInt(overrideRaw, 10);
    limitBytes = Number.isFinite(parsed) && parsed > 0 ? parsed : 5 * 1024 * 1024;
  } else {
    const maxMb = Number.parseFloat(process.env.CV_MAX_SIZE_MB || '5');
    limitBytes = (Number.isFinite(maxMb) && maxMb > 0 ? maxMb : 5) * 1024 * 1024;
  }

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: limitBytes },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME.has(file.mimetype) || !allowedExtension(file.originalname)) {
        cb(new UnsupportedMediaTypeError());
        return;
      }
      cb(null, true);
    },
  });

  return upload.single('cvFile');
}
