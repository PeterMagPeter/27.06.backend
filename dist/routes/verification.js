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
const mongodb_1 = require("mongodb");
exports.verificationRouter = express_1.default.Router();
/**
 * @swagger
 * /api/verify/{_id}:
 *   get:
 *     summary: Validate email address and activate user account
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *           format: mongoId
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: Your account has been activated successfully!
 *       400:
 *         description: Failed to activate your account or validation errors
 *       500:
 *         description: Internal server error
 */
exports.verificationRouter.get('/:_id', (0, express_validator_1.param)("_id").isMongoId(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const id = new mongodb_1.ObjectId((_a = req.params) === null || _a === void 0 ? void 0 : _a._id);
    console.log("params.id " + id);
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
exports.default = exports.verificationRouter;
//# sourceMappingURL=verification.js.map