"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedMediaTypeError = void 0;
var AppError_1 = require("./AppError");
var UnsupportedMediaTypeError = /** @class */ (function (_super) {
    __extends(UnsupportedMediaTypeError, _super);
    function UnsupportedMediaTypeError(message) {
        if (message === void 0) { message = 'Only PDF and DOCX files are allowed.'; }
        var _this = _super.call(this, message) || this;
        _this.status = 415;
        _this.code = 'UNSUPPORTED_MEDIA_TYPE';
        return _this;
    }
    return UnsupportedMediaTypeError;
}(AppError_1.AppError));
exports.UnsupportedMediaTypeError = UnsupportedMediaTypeError;
