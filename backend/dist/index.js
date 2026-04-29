"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
var app_1 = require("./app");
dotenv_1.default.config();
exports.app = (0, app_1.createApp)();
var port = Number.parseInt(process.env.PORT || '3010', 10);
if (process.env.NODE_ENV !== 'test') {
    exports.app.listen(port, function () {
        console.log("Server is running at http://localhost:".concat(port));
    });
}
