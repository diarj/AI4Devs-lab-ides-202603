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
exports.getCvDownloadDescriptor = exports.createCandidateForRecruiter = exports.createCandidateServiceDeps = void 0;
var validator_1 = require("../validator");
var ForbiddenError_1 = require("../errors/ForbiddenError");
var NotFoundError_1 = require("../errors/NotFoundError");
var prismaClient_1 = require("../../infrastructure/prismaClient");
var prismaCandidateRepository_1 = require("../../infrastructure/repositories/prismaCandidateRepository");
var prismaCandidateDocumentRepository_1 = require("../../infrastructure/repositories/prismaCandidateDocumentRepository");
var documentStorageService_1 = require("../../infrastructure/storage/documentStorageService");
function buildCvUrl(candidateId) {
    var base = (process.env.APP_BASE_URL || 'http://localhost:3010').replace(/\/$/, '');
    return "".concat(base, "/api/candidates/").concat(candidateId, "/cv");
}
function mapSuccess(candidate, cv) {
    return {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        address: candidate.address,
        education: candidate.education,
        workExperience: candidate.workExperience,
        cv: cv,
        createdAt: candidate.createdAt.toISOString(),
    };
}
function createCandidateServiceDeps() {
    return {
        prismaClient: prismaClient_1.prisma,
        storage: (0, documentStorageService_1.createLocalDocumentStorageFromEnv)(),
    };
}
exports.createCandidateServiceDeps = createCandidateServiceDeps;
function createCandidateForRecruiter(rawBody, actor, file, deps) {
    if (deps === void 0) { deps = createCandidateServiceDeps(); }
    return __awaiter(this, void 0, void 0, function () {
        var input, recruiter, candRepo, docRepo, candidateRow, storageKey, uploaded, err_1, docRow, cv;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = (0, validator_1.validateCreateCandidateInput)(rawBody);
                    return [4 /*yield*/, deps.prismaClient.user.findUnique({ where: { id: actor.id } })];
                case 1:
                    recruiter = _a.sent();
                    if (!recruiter) {
                        throw new ForbiddenError_1.ForbiddenError('Recruiter account not found.');
                    }
                    candRepo = new prismaCandidateRepository_1.PrismaCandidateRepository(deps.prismaClient);
                    docRepo = new prismaCandidateDocumentRepository_1.PrismaCandidateDocumentRepository(deps.prismaClient);
                    return [4 /*yield*/, candRepo.create(__assign(__assign({}, input), { createdByUserId: actor.id }))];
                case 2:
                    candidateRow = _a.sent();
                    if (!file) {
                        return [2 /*return*/, mapSuccess(candidateRow, null)];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 10]);
                    return [4 /*yield*/, deps.storage.uploadCv({
                            candidateId: candidateRow.id,
                            buffer: file.buffer,
                            originalName: file.originalname,
                        })];
                case 4:
                    uploaded = _a.sent();
                    storageKey = uploaded.storageKey;
                    return [4 /*yield*/, docRepo.create({
                            candidateId: candidateRow.id,
                            fileName: file.originalname,
                            mimeType: file.mimetype,
                            fileSize: file.size,
                            storageKey: uploaded.storageKey,
                        })];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 6:
                    err_1 = _a.sent();
                    if (!storageKey) return [3 /*break*/, 8];
                    return [4 /*yield*/, deps.storage.deleteByStorageKey(storageKey).catch(function () { return undefined; })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [4 /*yield*/, candRepo.deleteById(candidateRow.id).catch(function () { return undefined; })];
                case 9:
                    _a.sent();
                    throw err_1;
                case 10: return [4 /*yield*/, docRepo.findCvByCandidateId(candidateRow.id)];
                case 11:
                    docRow = _a.sent();
                    cv = docRow
                        ? {
                            fileName: docRow.fileName,
                            mimeType: docRow.mimeType,
                            size: docRow.fileSize,
                            url: buildCvUrl(candidateRow.id),
                        }
                        : null;
                    return [2 /*return*/, mapSuccess(candidateRow, cv)];
            }
        });
    });
}
exports.createCandidateForRecruiter = createCandidateForRecruiter;
function getCvDownloadDescriptor(candidateId, deps) {
    if (deps === void 0) { deps = createCandidateServiceDeps(); }
    return __awaiter(this, void 0, void 0, function () {
        var docRepo, candidate, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRepo = new prismaCandidateDocumentRepository_1.PrismaCandidateDocumentRepository(deps.prismaClient);
                    return [4 /*yield*/, deps.prismaClient.candidate.findUnique({ where: { id: candidateId } })];
                case 1:
                    candidate = _a.sent();
                    if (!candidate) {
                        throw new NotFoundError_1.NotFoundError('Candidate not found.');
                    }
                    return [4 /*yield*/, docRepo.findCvByCandidateId(candidateId)];
                case 2:
                    doc = _a.sent();
                    if (!doc) {
                        throw new NotFoundError_1.NotFoundError('CV not found for this candidate.');
                    }
                    return [2 /*return*/, {
                            absolutePath: deps.storage.resolveAbsolutePath(doc.storageKey),
                            mimeType: doc.mimeType,
                            fileName: doc.fileName,
                        }];
            }
        });
    });
}
exports.getCvDownloadDescriptor = getCvDownloadDescriptor;
