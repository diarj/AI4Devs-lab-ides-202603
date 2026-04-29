"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
var express_1 = __importDefault(require("express"));
var candidateRoutes_1 = __importDefault(require("./routes/candidateRoutes"));
var errorHandler_1 = require("./presentation/middleware/errorHandler");
function createApp() {
    var app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/', function (_req, res) {
        res.type('text/plain').send('Welcome to LTI API');
    });
    app.use('/api/candidates', candidateRoutes_1.default);
    app.use(errorHandler_1.errorHandler);
    return app;
}
exports.createApp = createApp;
