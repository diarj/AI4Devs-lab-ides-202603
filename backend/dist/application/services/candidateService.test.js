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
Object.defineProperty(exports, "__esModule", { value: true });
var ForbiddenError_1 = require("../errors/ForbiddenError");
var candidateService_1 = require("./candidateService");
var documentStorageService_1 = require("../../infrastructure/storage/documentStorageService");
function buildPrismaMock() {
    return {
        user: { findUnique: jest.fn() },
        candidate: { create: jest.fn(), delete: jest.fn() },
        candidateDocument: { create: jest.fn(), findFirst: jest.fn() },
    };
}
describe('createCandidateForRecruiter', function () {
    var actor = { id: 1, role: 'recruiter' };
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('should throw when recruiter user does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
        var prismaMock, storage, deps;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prismaMock = buildPrismaMock();
                    prismaMock.user.findUnique.mockResolvedValue(null);
                    storage = new documentStorageService_1.LocalDocumentStorageService(require('os').tmpdir());
                    deps = {
                        prismaClient: prismaMock,
                        storage: storage,
                    };
                    return [4 /*yield*/, expect((0, candidateService_1.createCandidateForRecruiter)({ firstName: 'A', lastName: 'B', email: 'a@b.com' }, actor, undefined, deps)).rejects.toBeInstanceOf(ForbiddenError_1.ForbiddenError)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should create candidate without CV', function () { return __awaiter(void 0, void 0, void 0, function () {
        var prismaMock, createdAt, storage, deps, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prismaMock = buildPrismaMock();
                    prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'r@x.com', name: null });
                    createdAt = new Date('2026-04-28T21:00:00.000Z');
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
                    storage = new documentStorageService_1.LocalDocumentStorageService(require('os').tmpdir());
                    deps = {
                        prismaClient: prismaMock,
                        storage: storage,
                    };
                    return [4 /*yield*/, (0, candidateService_1.createCandidateForRecruiter)({ firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' }, actor, undefined, deps)];
                case 1:
                    result = _a.sent();
                    expect(result.id).toBe('cand-1');
                    expect(result.cv).toBeNull();
                    expect(prismaMock.candidateDocument.create).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should roll back candidate when CV upload fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var prismaMock, createdAt, storage, deps, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prismaMock = buildPrismaMock();
                    prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'r@x.com', name: null });
                    createdAt = new Date('2026-04-28T21:00:00.000Z');
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
                    storage = new documentStorageService_1.LocalDocumentStorageService(require('os').tmpdir());
                    jest.spyOn(storage, 'uploadCv').mockRejectedValue(new Error('disk full'));
                    deps = {
                        prismaClient: prismaMock,
                        storage: storage,
                    };
                    file = {
                        buffer: Buffer.from('%PDF'),
                        originalname: 'cv.pdf',
                        mimetype: 'application/pdf',
                        size: 4,
                    };
                    return [4 /*yield*/, expect((0, candidateService_1.createCandidateForRecruiter)({ firstName: 'Ana', lastName: 'Lopez', email: 'ana@example.com' }, actor, file, deps)).rejects.toThrow('disk full')];
                case 1:
                    _a.sent();
                    expect(prismaMock.candidate.delete).toHaveBeenCalledWith({ where: { id: 'cand-1' } });
                    return [2 /*return*/];
            }
        });
    }); });
});
