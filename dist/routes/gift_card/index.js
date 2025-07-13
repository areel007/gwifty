"use strict";
// import { Router } from "express";
// import { authenticate, authorize } from "../../middlewares/auth";
// import {
//   createGiftCard,
//   deleteCard,
//   getGiftCards,
//   getGiftCardsBySeller,
//   getSellerOfAGiftCard,
// } from "../../controllers/gift-card";
// import { upload } from "../../middlewares/upload";
// const router = Router();
// router
//   .route("/create")
//   .post(
//     authenticate,
//     authorize("user", "admin"),
//     upload.single("imageUrl"),
//     createGiftCard
//   );
// router.route("/all-gift-cards").get(getGiftCards);
// router
//   .route("/my-gift-cards")
//   .get(authenticate, authorize("user", "admin"), getGiftCardsBySeller);
// router
//   .route("/delete/:id")
//   .delete(authenticate, authorize("user", "admin"), deleteCard);
// router
//   .route("/get-seller-of-gift-card/:id")
//   .get(authenticate, authorize("admin"), getSellerOfAGiftCard);
// export default router;
