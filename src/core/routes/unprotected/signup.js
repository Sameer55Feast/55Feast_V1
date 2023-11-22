import express from "express";
import { signupController } from "../../controllers/index.js";

const router = express.Router();

router.post("/", signupController);

export default router;
