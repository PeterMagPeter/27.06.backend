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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationRouter = void 0;
const express_1 = __importDefault(require("express"));
const DBService_1 = require("../services/DBService");
const express_validator_1 = require("express-validator");
exports.verificationRouter = express_1.default.Router();
// Validate email adress and activate user account
exports.verificationRouter.get('/:id', (0, express_validator_1.param)("id").isMongoId(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
        const result = yield (0, DBService_1.activateUserAccount)(id);
        if (result) {
            res.status(200).send('Your account has been activated successfully!');
        }
        else {
            res.status(400).send('Failed to activate your account!');
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal server error.');
    }
}));
//# sourceMappingURL=verification.js.map