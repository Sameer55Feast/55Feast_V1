import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const SECRET = process.env.SECRET;
const JWT_EXPIRY = 2592000;
const USER_POOL_URL = "https://apricot-cuttlefish-hose.cyclic.app/user";
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const PORT = process.env.PORT;
const RESET_PASSWORD_URL = process.env.RESET_PASSWORD_URL;

export default {
  RESET_PASSWORD_URL,
  MONGO_URI,
  SECRET,
  JWT_EXPIRY,
  USER_POOL_URL,
  EMAIL_API_KEY,
  SENDER_EMAIL,
  PORT,
};
