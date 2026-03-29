"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRoleForNewUser = resolveRoleForNewUser;
const client_1 = require("@prisma/client");
function resolveRoleForNewUser(login) {
    if (login === 'admin') {
        return client_1.UserRole.admin;
    }
    if (login === 'Никита') {
        return client_1.UserRole.nikita;
    }
    return client_1.UserRole.survivor;
}
//# sourceMappingURL=role-from-login.js.map