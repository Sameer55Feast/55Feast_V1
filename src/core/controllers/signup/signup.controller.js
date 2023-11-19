import { userModel } from "../../models";
import bcrypt from "bcryptjs";
import {
  onError,
  onSuccess,
  sendResponse,
  messageResponse,
  globalCatch,
} from "../../utils";
import config from "../../../../config";
import axios from "axios";

const signupController = async (request, response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      gender,
      phone,
      location,
      photo,
    } = request.body;
    const options = {
      method: "GET",
      url: `${config.USER_POOL_URL}?email=${email}`,
      headers: { "Content-Type": "application/json" },
      validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 404;
      },
    };
    const verifyEmail = await axios.request(options);
    if (verifyEmail.status === 404) {
      return sendResponse(
        onError(404, messageResponse.INVALID_EMAIL),
        response
      );
    }
    const user = await userModel.findOne({ email });
    if (user) {
      return sendResponse(onError(409, messageResponse.EMAIL_EXIST), response);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      firstName,
      lastName,
      gender,
      email,
      password: hashedPassword,
      location,
      phone,
      photo,
    });
    await newUser.save();
    const new_options = {
      method: "POST",
      url: `${config.USER_POOL_URL}/joined/true`,
      headers: { "Content-Type": "application/json" },
      data: { email },
    };
    const userJoined = await axios.request(new_options);
    return sendResponse(
      onSuccess(201, messageResponse.CREATED_SUCCESS, newUser),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

export default signupController;
