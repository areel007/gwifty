import { Router } from "express";
import auth from "./auth/index";
import user from "./user/index";

const router = Router();

router.use("/auth", auth);
router.use("/user", user);

export default router;
