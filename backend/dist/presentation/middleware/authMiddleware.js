"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRecruiter = void 0;
var ForbiddenError_1 = require("../../application/errors/ForbiddenError");
function requireRecruiter(req, res, next) {
    var role = req.header('x-user-role');
    var userIdHeader = req.header('x-user-id');
    if (role !== 'recruiter' || !userIdHeader) {
        next(new ForbiddenError_1.ForbiddenError('Recruiter authentication required.'));
        return;
    }
    var id = Number.parseInt(userIdHeader, 10);
    if (Number.isNaN(id) || id < 1) {
        next(new ForbiddenError_1.ForbiddenError('Invalid user identifier.'));
        return;
    }
    req.authUser = { id: id, role: 'recruiter' };
    next();
}
exports.requireRecruiter = requireRecruiter;
