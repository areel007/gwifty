import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import {
  InitiateTrade,
  updateTradeStatus,
  viewAllTrades,
  viewTrades,
} from "../../controllers/trade";

const router = Router();

router
  .route("/")
  .post(authenticate, InitiateTrade)
  .get(authenticate, authorize("admin"), viewAllTrades);
router.route("/:sellerId").get(authenticate, viewTrades);

router
  .route("/:tradeId")
  .patch(authenticate, authorize("admin"), updateTradeStatus);

export default router;
