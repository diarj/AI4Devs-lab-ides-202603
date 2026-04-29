import { Router } from 'express';
import { requireRecruiter } from '../presentation/middleware/authMiddleware';
import { createCvUploadMiddleware } from '../presentation/middleware/uploadMiddleware';
import { getCandidateCv, postCandidate } from '../presentation/controllers/candidateController';

const router = Router();

router.post('/', requireRecruiter, (req, res, next) => {
  createCvUploadMiddleware()(req, res, next);
}, postCandidate);
router.get('/:id/cv', requireRecruiter, getCandidateCv);

export default router;
