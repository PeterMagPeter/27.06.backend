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
exports.deleteUser = exports.putUser = exports.postUser = exports.getUser = exports.getAllUsers = void 0;
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user/all`;
        const request = { credentials: "include" };
        const response = yield fetch(url, request);
        return yield response.json();
    });
}
exports.getAllUsers = getAllUsers;
function getUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user/${userId}`;
        const request = { credentials: "include" };
        const response = yield fetch(url, request);
        return yield response.json();
    });
}
exports.getUser = getUser;
function postUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user`;
        const request = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(Object.assign({}, user)),
        };
        const response = yield fetch(url, request);
        return yield response.json();
    });
}
exports.postUser = postUser;
function putUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user/${user.id}`;
        const request = {
            method: "PUT",
            headers: {
                "Content Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(Object.assign({}, user)),
        };
        const response = yield fetch(url, request);
        return yield response.json();
    });
}
exports.putUser = putUser;
function deleteUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user/${userId}`;
        const request = {
            method: "DELETE",
            headers: {
                "Content Type": "application/json",
            },
            credentials: "include",
        };
        yield fetch(url, request);
    });
}
exports.deleteUser = deleteUser;
//# sourceMappingURL=userAPI.js.map