"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var supertest_1 = __importDefault(require("supertest"));
var path_1 = __importDefault(require("path"));
var os_1 = __importDefault(require("os"));
var app_1 = require("../app");
var prismaClient_1 = require("../infrastructure/prismaClient");
jest.mock('../infrastructure/prismaClient', function () { return ({
    prisma: {
        user: { findUnique: jest.fn() },
        candidate: { create: jest.fn(), delete: jest.fn() },
        candidateDocument: { create: jest.fn(), findFirst: jest.fn() },
    },
}); });
describe('candidateRoutes integration', function () {
    var app = (0, app_1.createApp)();
    var prismaMock = prismaClient_1.prisma;
    beforeEach(function () {
        jest.clearAllMocks();
        process.env.CV_STORAGE_PATH = path_1.default.join(os_1.default.tmpdir(), "lti-cv-integration-".concat(Date.now()));
        prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'r@test.com', name: null });
        var createdAt = new Date('2026-04-28T21:00:00.000Z');
        prismaMock.candidate.create.mockResolvedValue({
            id: 'cand-1',
            firstName: 'Ana',
            lastName: 'Lopez',
            email: 'ana@example.com',
            phone: null,
            address: null,
            education: null,
            workExperience: null,
            createdByUserId: 1,
            createdAt: createdAt,
            updatedAt: createdAt,
        });
        prismaMock.candidateDocument.findFirst.mockResolvedValue(null);
    });
    it('should return 403 when recruiter headers are missing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app)
                        .post('/api/candidates')
                        .field('firstName', 'Ana')
                        .field('lastName', 'Lopez')
                        .field('email', 'ana@example.com')];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(403);
                    expect(res.body.success).toBe(false);
                    expect(res.body.error.code).toBe('FORBIDDEN');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return 400 when validation fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app)
                        .post('/api/candidates')
                        .set('x-user-id', '1')
                        .set('x-user-role', 'recruiter')
                        .field('firstName', '')
                        .field('lastName', 'Lopez')
                        .field('email', 'bad')];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(400);
                    expect(res.body.success).toBe(false);
                    expect(res.body.error.code).toBe('VALIDATION_ERROR');
                    expect(Array.isArray(res.body.error.details)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return 201 when candidate is created without CV', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app)
                        .post('/api/candidates')
                        .set('x-user-id', '1')
                        .set('x-user-role', 'recruiter')
                        .field('firstName', 'Ana')
                        .field('lastName', 'Lopez')
                        .field('email', 'ana@example.com')];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(201);
                    expect(res.body.id).toBe('cand-1');
                    expect(res.body.cv).toBeNull();
                    expect(prismaMock.candidateDocument.create).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return 201 when candidate is created with PDF CV', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prismaMock.candidateDocument.findFirst.mockResolvedValue({
                        id: 'doc-1',
                        candidateId: 'cand-1',
                        documentType: 'CV',
                        fileName: 'cv.pdf',
                        mimeType: 'application/pdf',
                        fileSize: 4,
                        storageKey: 'candidates/cand-1/x.pdf',
                        uploadedAt: new Date(),
                    });
                    return [4 /*yield*/, (0, supertest_1.default)(app)
                            .post('/api/candidates')
                            .set('x-user-id', '1')
                            .set('x-user-role', 'recruiter')
                            .field('firstName', 'Ana')
                            .field('lastName', 'Lopez')
                            .field('email', 'ana@example.com')
                            .attach('cvFile', Buffer.from('%PDF-'), 'cv.pdf')];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(201);
                    expect(res.body.cv).not.toBeNull();
                    expect(res.body.cv.url).toContain('/api/candidates/cand-1/cv');
                    expect(prismaMock.candidateDocument.create).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return 415 for unsupported file types', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, supertest_1.default)(app)
                        .post('/api/candidates')
                        .set('x-user-id', '1')
                        .set('x-user-role', 'recruiter')
                        .field('firstName', 'Ana')
                        .field('lastName', 'Lopez')
                        .field('email', 'ana@example.com')
                        .attach('cvFile', Buffer.from('hello'), 'notes.exe')];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(415);
                    expect(res.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return 413 when file exceeds limit', function () { return __awaiter(void 0, void 0, void 0, function () {
        var previous, big, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    previous = process.env.CV_MAX_UPLOAD_BYTES;
                    process.env.CV_MAX_UPLOAD_BYTES = '64';
                    big = Buffer.alloc(128, 'x');
                    return [4 /*yield*/, (0, supertest_1.default)(app)
                            .post('/api/candidates')
                            .set('x-user-id', '1')
                            .set('x-user-role', 'recruiter')
                            .field('firstName', 'Ana')
                            .field('lastName', 'Lopez')
                            .field('email', 'ana@example.com')
                            .attach('cvFile', big, 'cv.pdf')];
                case 1:
                    res = _a.sent();
                    expect(res.status).toBe(413);
                    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
                    if (previous === undefined) {
                        delete process.env.CV_MAX_UPLOAD_BYTES;
                    }
                    else {
                        process.env.CV_MAX_UPLOAD_BYTES = previous;
                    }
                    return [2 /*return*/];
            }
        });
    }); });
});
