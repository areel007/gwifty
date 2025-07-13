import { Router } from "express";
import auth from "./auth/index";
import user from "./user/index";
import giftCard from "./gift_card/index";
import trade from "./trade/index";

const router = Router();

router.use("/auth", auth);
router.use("/user", user);
router.use("/gift-card", giftCard);
router.use("/trades", trade);

export default router;
