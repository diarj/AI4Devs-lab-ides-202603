import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../../application/errors/ForbiddenError';
import type { AuthUser } from '../../types/auth';

export type { AuthUser };

export function requireRecruiter(req: Request, res: Response, next: NextFunction): void {
  const role = req.header('x-user-role');
  const userIdHeader = req.header('x-user-id');

  if (role !== 'recruiter' || !userIdHeader) {
    next(new ForbiddenError('Recruiter authentication required.'));
    return;
  }

  const id = Number.parseInt(userIdHeader, 10);
  if (Number.isNaN(id) || id < 1) {
    next(new ForbiddenError('Invalid user identifier.'));
    return;
  }

  req.authUser = { id, role: 'recruiter' };
  next();
}
