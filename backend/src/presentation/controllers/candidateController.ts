import fs from 'fs';
import type { NextFunction, Request, Response } from 'express';
import {
  createCandidateForRecruiter,
  getCvDownloadDescriptor,
} from '../../application/services/candidateService';
import { NotFoundError } from '../../application/errors/NotFoundError';

export async function postCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const result = await createCandidateForRecruiter(body, req.authUser!, req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCandidateCv(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const descriptor = await getCvDownloadDescriptor(id);
    try {
      await fs.promises.access(descriptor.absolutePath, fs.constants.R_OK);
    } catch {
      next(new NotFoundError('File could not be read.'));
      return;
    }
    res.setHeader('Content-Type', descriptor.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(descriptor.fileName)}`);

    const stream = fs.createReadStream(descriptor.absolutePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'File could not be read.' },
        });
      }
    });
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}
