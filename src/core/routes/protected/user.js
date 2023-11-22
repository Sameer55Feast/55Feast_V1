import express from "express";
import { userController } from "../../controllers/index.js";
import { isAdmin } from "../../utils/index.js";
const router = express.Router();

router.get("/all", isAdmin(userController.getAllUsers));
router.get("/", isAdmin(userController.getUser));
router.post("/all/joined", userController.getJoinedUsers);
router.post("/insert", isAdmin(userController.insertUser));
router.patch("/update", isAdmin(userController.updateUserPool));
router.delete("/delete", isAdmin(userController.deleteUser));
router.post("/all/invite", isAdmin(userController.getNotJoinedUsers));
router.post("/invite", isAdmin(userController.inviteUser));
router.post("/check-password", userController.checkPassword);
router.post("/reset-password", userController.resetPassword);

export default router;
