"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const trade_1 = require("../../controllers/trade");
const router = (0, express_1.Router)();
router
    .route("/")
    .post(auth_1.authenticate, trade_1.InitiateTrade)
    .get(auth_1.authenticate, (0, auth_1.authorize)("admin"), trade_1.viewAllTrades);
router.route("/:sellerId").get(auth_1.authenticate, trade_1.viewTrades);
router
    .route("/:tradeId")
    .patch(auth_1.authenticate, (0, auth_1.authorize)("admin"), trade_1.updateTradeStatus);
exports.default = router;
