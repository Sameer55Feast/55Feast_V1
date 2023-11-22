import mongoose from "mongoose";
import config from "../../../config/index.js";

mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((error) => {
    console.log("Failed to connect to DB", error.message);
  });

export default mongoose;
