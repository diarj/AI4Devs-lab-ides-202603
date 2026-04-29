"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authMiddleware_1 = require("../presentation/middleware/authMiddleware");
var uploadMiddleware_1 = require("../presentation/middleware/uploadMiddleware");
var candidateController_1 = require("../presentation/controllers/candidateController");
var router = (0, express_1.Router)();
router.post('/', authMiddleware_1.requireRecruiter, function (req, res, next) {
    (0, uploadMiddleware_1.createCvUploadMiddleware)()(req, res, next);
}, candidateController_1.postCandidate);
router.get('/:id/cv', authMiddleware_1.requireRecruiter, candidateController_1.getCandidateCv);
exports.default = router;
