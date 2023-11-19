import mongoose from "mongoose";

const monthlyMealSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

const monthlyMealModel = new mongoose.model("MonthlyMeal", monthlyMealSchema);

export default monthlyMealModel;
