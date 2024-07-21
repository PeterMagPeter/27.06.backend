"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors"); // needs to be imported before routers and other stuff!
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerConfig_1 = __importDefault(require("./swaggerConfig"));
// Import of login router
const login_1 = require("./routes/login");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const configCORS_1 = require("./configCORS");
const user_1 = require("./routes/user");
const guest_1 = require("./routes/guest");
const verification_1 = require("./routes/verification");
const app = (0, express_1.default)();
(0, configCORS_1.configureCORS)(app);
// Middleware:
app.use('*', express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.default)); // Swagger setup
app.use("/api/login", login_1.loginRouter);
app.use("/api/user", user_1.userRouter);
app.use("/api/guest", guest_1.guestRouter);
app.use("/api/verification", verification_1.verificationRouter);
exports.default = app;
//# sourceMappingURL=app.js.map