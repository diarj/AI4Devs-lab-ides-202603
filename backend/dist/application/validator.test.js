"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validator_1 = require("./validator");
var ValidationError_1 = require("./errors/ValidationError");
describe('validateCreateCandidateInput', function () {
    it('should accept valid required fields only', function () {
        var result = (0, validator_1.validateCreateCandidateInput)({
            firstName: ' Ana ',
            lastName: ' Lopez ',
            email: 'ana.lopez@example.com',
        });
        expect(result).toEqual({
            firstName: 'Ana',
            lastName: 'Lopez',
            email: 'ana.lopez@example.com',
            phone: null,
            address: null,
            education: null,
            workExperience: null,
        });
    });
    it('should reject missing required fields with field details', function () {
        var _a, _b;
        expect(function () { return (0, validator_1.validateCreateCandidateInput)({}); }).toThrow(ValidationError_1.ValidationError);
        try {
            (0, validator_1.validateCreateCandidateInput)({});
        }
        catch (e) {
            expect(e).toBeInstanceOf(ValidationError_1.ValidationError);
            var ve = e;
            var fields = (_b = (_a = ve.details) === null || _a === void 0 ? void 0 : _a.map(function (d) { return d.field; })) !== null && _b !== void 0 ? _b : [];
            expect(fields).toEqual(expect.arrayContaining(['email', 'firstName', 'lastName']));
        }
    });
    it('should reject invalid email format', function () {
        expect(function () {
            return (0, validator_1.validateCreateCandidateInput)({
                firstName: 'Ana',
                lastName: 'Lopez',
                email: 'not-an-email',
            });
        }).toThrow(ValidationError_1.ValidationError);
    });
    it('should reject invalid phone format', function () {
        expect(function () {
            return (0, validator_1.validateCreateCandidateInput)({
                firstName: 'Ana',
                lastName: 'Lopez',
                email: 'ana@example.com',
                phone: 'abc',
            });
        }).toThrow(ValidationError_1.ValidationError);
    });
    it('should accept E.164-compatible phone', function () {
        var result = (0, validator_1.validateCreateCandidateInput)({
            firstName: 'Ana',
            lastName: 'Lopez',
            email: 'ana@example.com',
            phone: '+1 415 555 0100',
        });
        expect(result.phone).toBe('+14155550100');
    });
});
