"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateCandidateInput = void 0;
var ValidationError_1 = require("./errors/ValidationError");
var LIMITS = {
    firstName: 100,
    lastName: 100,
    email: 254,
    phone: 32,
    address: 2000,
    education: 10000,
    workExperience: 10000,
};
/** Practical email validation (RFC-style subset). */
var EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
function asTrimmedString(value, field) {
    if (value === undefined || value === null) {
        throw new ValidationError_1.ValidationError('Validation failed.', [{ field: field, message: 'Value is required.' }]);
    }
    if (typeof value !== 'string') {
        throw new ValidationError_1.ValidationError('Validation failed.', [{ field: field, message: 'Must be a string.' }]);
    }
    return value.trim();
}
function optionalNormalizedText(value, field, maxLen) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    if (typeof value !== 'string') {
        throw new ValidationError_1.ValidationError('Validation failed.', [{ field: field, message: 'Must be a string.' }]);
    }
    var s = value.trim();
    if (!s) {
        return null;
    }
    if (s.length > maxLen) {
        throw new ValidationError_1.ValidationError('Validation failed.', [
            { field: field, message: "Must not exceed ".concat(maxLen, " characters.") },
        ]);
    }
    return s;
}
function normalizePhoneDigits(value) {
    return value.replace(/[\s().-]/g, '');
}
/** E.164-style: optional leading +, 8–15 digits, first digit country code not 0. */
function isE164Compatible(normalized) {
    if (!normalized.startsWith('+')) {
        return /^[1-9]\d{7,14}$/.test(normalized);
    }
    var digits = normalized.slice(1);
    return /^[1-9]\d{7,14}$/.test(digits);
}
function validateCreateCandidateInput(raw) {
    if (raw === null || typeof raw !== 'object') {
        throw new ValidationError_1.ValidationError('Validation failed.', [{ field: 'body', message: 'Expected form fields object.' }]);
    }
    var body = raw;
    var details = [];
    var firstName = '';
    var lastName = '';
    var email = '';
    try {
        firstName = asTrimmedString(body.firstName, 'firstName');
    }
    catch (e) {
        if (e instanceof ValidationError_1.ValidationError && e.details) {
            details.push.apply(details, e.details);
        }
    }
    try {
        lastName = asTrimmedString(body.lastName, 'lastName');
    }
    catch (e) {
        if (e instanceof ValidationError_1.ValidationError && e.details) {
            details.push.apply(details, e.details);
        }
    }
    try {
        email = asTrimmedString(body.email, 'email');
    }
    catch (e) {
        if (e instanceof ValidationError_1.ValidationError && e.details) {
            details.push.apply(details, e.details);
        }
    }
    if (!firstName) {
        details.push({ field: 'firstName', message: 'First name is required.' });
    }
    else if (firstName.length > LIMITS.firstName) {
        details.push({ field: 'firstName', message: "Must not exceed ".concat(LIMITS.firstName, " characters.") });
    }
    if (!lastName) {
        details.push({ field: 'lastName', message: 'Last name is required.' });
    }
    else if (lastName.length > LIMITS.lastName) {
        details.push({ field: 'lastName', message: "Must not exceed ".concat(LIMITS.lastName, " characters.") });
    }
    if (!email) {
        details.push({ field: 'email', message: 'Email is required.' });
    }
    else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
        details.push({ field: 'email', message: 'Invalid email format.' });
    }
    var phoneRaw = optionalNormalizedText(body.phone, 'phone', LIMITS.phone);
    var phone = phoneRaw;
    if (phoneRaw) {
        var normalized = normalizePhoneDigits(phoneRaw);
        if (!isE164Compatible(normalized)) {
            details.push({
                field: 'phone',
                message: 'Phone must use an international format (E.164-compatible).',
            });
            phone = null;
        }
        else {
            phone = normalized;
        }
    }
    var address = optionalNormalizedText(body.address, 'address', LIMITS.address);
    var education = optionalNormalizedText(body.education, 'education', LIMITS.education);
    var workExperience = optionalNormalizedText(body.workExperience, 'workExperience', LIMITS.workExperience);
    if (details.length > 0) {
        throw new ValidationError_1.ValidationError('One or more fields are invalid.', details);
    }
    return {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        address: address,
        education: education,
        workExperience: workExperience,
    };
}
exports.validateCreateCandidateInput = validateCreateCandidateInput;
