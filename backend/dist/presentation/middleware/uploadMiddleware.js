"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCvUploadMiddleware = void 0;
var path_1 = __importDefault(require("path"));
var multer_1 = __importDefault(require("multer"));
var UnsupportedMediaTypeError_1 = require("../../application/errors/UnsupportedMediaTypeError");
var ALLOWED_MIME = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
function allowedExtension(originalName) {
    var ext = path_1.default.extname(originalName).toLowerCase();
    return ext === '.pdf' || ext === '.docx';
}
function createCvUploadMiddleware() {
    var overrideRaw = process.env.CV_MAX_UPLOAD_BYTES;
    var limitBytes;
    if (overrideRaw !== undefined && overrideRaw !== '') {
        var parsed = Number.parseInt(overrideRaw, 10);
        limitBytes = Number.isFinite(parsed) && parsed > 0 ? parsed : 5 * 1024 * 1024;
    }
    else {
        var maxMb = Number.parseFloat(process.env.CV_MAX_SIZE_MB || '5');
        limitBytes = (Number.isFinite(maxMb) && maxMb > 0 ? maxMb : 5) * 1024 * 1024;
    }
    var upload = (0, multer_1.default)({
        storage: multer_1.default.memoryStorage(),
        limits: { fileSize: limitBytes },
        fileFilter: function (_req, file, cb) {
            if (!ALLOWED_MIME.has(file.mimetype) || !allowedExtension(file.originalname)) {
                cb(new UnsupportedMediaTypeError_1.UnsupportedMediaTypeError());
                return;
            }
            cb(null, true);
        },
    });
    return upload.single('cvFile');
}
exports.createCvUploadMiddleware = createCvUploadMiddleware;
