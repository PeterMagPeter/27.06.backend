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
Object.defineProperty(exports, "__esModule", { value: true });
exports.postLogin = postLogin;
exports.getLogin = getLogin;
exports.deleteLogin = deleteLogin;
function postLogin(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${process.env.REACT_APP_API_SERVER_URL}/api/login`;
        console.log("email: " + email + "pw: " + password);
        const request = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                email: email,
                password: password
            }),
        };
        const response = yield fetch(url, request);
        return yield response.json();
    });
}
function getLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${process.env.REACT_APP_API_SERVER_URL}/api/login`;
        const request = { credentials: "include" };
        const response = yield fetch(url, request);
        return yield response.json();
    });
}
function deleteLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${process.env.REACT_APP_API_SERVER_URL}/api/login`;
        const request = {
            methode: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        };
        yield fetch(url, request);
    });
}
//# sourceMappingURL=loginAPI.js.map