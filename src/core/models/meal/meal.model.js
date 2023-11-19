import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    bookedDates: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const mealModel = new mongoose.model("Meal", mealSchema);

export default mealModel;
