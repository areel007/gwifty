import { Router } from "express";
import { getUser, getUsers, deleteUser } from "../../controllers/user";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.route("/get-users").get(authenticate, authorize("admin"), getUsers);
router
  .route("/:id")
  .get(authenticate, authorize("USER", "ADMIN"), getUser)
  .delete(authenticate, deleteUser);

export default router;
