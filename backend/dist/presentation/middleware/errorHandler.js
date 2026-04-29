"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var multer_1 = __importDefault(require("multer"));
var AppError_1 = require("../../application/errors/AppError");
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        next(err);
        return;
    }
    if (err instanceof AppError_1.AppError) {
        res.status(err.status).json({
            success: false,
            error: __assign({ code: err.code, message: err.message }, (err.details && err.details.length > 0 ? { details: err.details } : {})),
        });
        return;
    }
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({
                success: false,
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: 'File exceeds maximum allowed size.',
                },
            });
            return;
        }
    }
    // Avoid logging candidate payloads; keep diagnostics minimal.
    var message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Unhandled error:', message);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred. Please try again.',
        },
    });
}
exports.errorHandler = errorHandler;
