"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../../controllers/user");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.route("/get-users").get(auth_1.authenticate, (0, auth_1.authorize)("admin"), user_1.getUsers);
router
    .route("/:id")
    .get(auth_1.authenticate, (0, auth_1.authorize)("USER", "ADMIN"), user_1.getUser)
    .delete(auth_1.authenticate, user_1.deleteUser);
exports.default = router;
