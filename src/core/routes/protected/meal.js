import express from "express";
import { mealController } from "../../controllers/index.js";
import { isAdmin } from "../../utils/index.js";

const router = express.Router();

router.post("/me", mealController.bookYourMeal);
router.post("/multiple", mealController.bookMultipleMeals);
router.delete("/me/delete", mealController.cancelMeal);
router.get("/me/counts", mealController.getCountsOfUser);
router.post("/date/count", mealController.getAllCountOfDate);
router.get("/week/count", isAdmin(mealController.getLastFiveCounts));
router.get("/month/count", isAdmin(mealController.getMonthlyCounts));
router.get(
  "/today/not_counted",
  isAdmin(mealController.getTodayNotCountedUsers)
);
router.delete("/cancel", isAdmin(mealController.cancelAllMealsOfDate));

export default router;
