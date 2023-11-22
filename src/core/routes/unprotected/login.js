import express from "express";
import { loginController, userController } from "../../controllers/index.js";

const router = express.Router();

router.post("/", loginController);
router.post("/forgot-password", userController.forgotPassword);
router.post("/update-password/:userId/:token", userController.updatePassword);

export default router;
